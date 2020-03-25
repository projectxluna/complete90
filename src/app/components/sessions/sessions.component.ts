import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService, DataService } from '../../services';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { VideoplayerComponent } from '../modals/videoplayer/videoplayer.component';
import { AddcontentToSessionComponent } from '../modals/addcontent-to-session/addcontent-to-session.component';
import { ConfirmComponent } from '../modals/confirm/confirm.component';
import * as _ from 'lodash';
import { isUndefined } from 'util';
import { empty } from 'rxjs';
declare var jQuery: any;


@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.css'],
  entryComponents: [VideoplayerComponent, AddcontentToSessionComponent]
})
export class SessionsComponent implements OnInit {
  encryptSecretKey = "abc123zyx654";
  //CryptoJS = require("crypto-js");
  @ViewChild(ModalDirective) modal: ModalDirective;


  userProfile = {
    subscription: undefined,
  };
  activeRequest = false;

  filters = {
    tags: [],
    categories: [],
    skillLevel: ['Beginner', 'Intermediate', 'Expert']
  }

  selectedFilter = {
    tag: '',
    category: '',
    skillLevel: ''
  }

  selectedExercisesCategories = {
    exercise: '',
    exerciseName: '',
    category: ''
  }

  selectedExerciseCat;

  selectExercise(exercise) {
    this.selectedExercisesCategories.exercise = exercise;
    this.selectedExercisesCategories.exerciseName = exercise.name;
    
  }
  selectExerciseCat(category) {
    this.selectedExercisesCategories.category = category.name;
    this.selectedExerciseCat = this.getSelectedExerciseCatSessions();
    console.log("Exercises: ", this.selectedExerciseCat);
  }




  // encryptData(data) {

  //   try {
  //     return this.CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptSecretKey).toString();
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // decryptData(data) {

  //   try {
  //     const bytes = this.CryptoJS.AES.decrypt(data, this.encryptSecretKey);
  //     if (bytes.toString()) {
  //       return JSON.parse(bytes.toString(this.CryptoJS.enc.Utf8));
  //     }
  //     return data;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }



  getSelectedExerciseCatSessions() {
    
      let clone = _.cloneDeep(this.sessions);
      let filtered = clone.filter(session => {
        let tag = this.selectedFilter.tag;
        let skillLevel = this.selectedFilter.skillLevel;

        let category = this.selectedFilter.category;
        let exercise = this.selectedExercisesCategories.exerciseName;
        let exerciseCat = this.selectedExercisesCategories.category;

        if(exercise) {
          if(session.exercise === exercise && session.exercisesCat.indexOf(exerciseCat) != -1 ) {

            var totalDisplaying = 0;
            session.display.forEach(function(d){
              totalDisplaying += d.length;
            });
            session.remaining = session.content.length - session.defaultView - totalDisplaying;
            console.log("S: ", session);
            return true;
          }
      
        }

          

        // if(exerciseCat) {
        //   console.log(session.exercisesCat.indexOf(exerciseCat));
        //   return session.exercisesCat.indexOf(exerciseCat) != -1;
        // }

        
      });
      return filtered;
  }

  sessions = [];
  freeSessions = [];
  customSessions = [];
  assignments = [];
  user = {
    name: '',
    subscription: undefined,
    nationality: '',
    creditCards: [],
    avatarURL: '',
    clubName: '',
  };

  playerProfile: any;
  coachProfile: any;
  adminProfile: any;

  exercisesArray = {
                "exercises": 
                [
                  {
                    "name": 'Individual',
                    "categories": [
                                    {
                                      "name": "Prehab 1",
                                      "subCategories": ["Ball Mastery", "Juggling"]
                                    },
                                    {
                                      "name": "Technical 1",
                                      "subCategories": ["Dribbling", "Wall Work"]
                                    },
                                    {
                                      "name": "Finishing 1",
                                      "subCategories": ["Core", "Juggling"]
                                    },
                                    {
                                      "name": "Strength 1",
                                      "subCategories": ["Ball Mastery", "Juggling"]
                                    },

                                  ],
                  }, 
                  {
                    "name": 'Partner',
                    "categories": [
                                    {
                                      "name": "Prehab 2",
                                      "subCategories": ["Ball Mastery", "Juggling"]
                                    },
                                    {
                                      "name": "Technical 2",
                                      "subCategories": ["Dribbling", "Wall Work"]
                                    },
                                    {
                                      "name": "Finishing 2",
                                      "subCategories": ["Core", "Juggling"]
                                    },
                                    {
                                      "name": "Strength 2",
                                      "subCategories": ["Ball Mastery", "Juggling"]
                                    },

                                  ],
                  }, 
                  {
                    "name": 'Challenge',
                    "categories": [
                                    {
                                      "name": "Prehab 3",
                                      "subCategories": ["Ball Mastery", "Juggling"]
                                    },
                                    {
                                      "name": "Technical 3",
                                      "subCategories": ["Dribbling", "Wall Work"]
                                    },
                                    {
                                      "name": "Finishing 3",
                                      "subCategories": ["Core", "Juggling"]
                                    },
                                    {
                                      "name": "Strength 3",
                                      "subCategories": ["Ball Mastery", "Juggling"]
                                    },

                                  ],
                  }, 
                ],
              };

  banner = {
    isActive: false,
    timer: undefined,
    count: 0,
    sessionId: undefined,
    defaultTimeout: 1000 * 60
  };

  managerProfile = false;

  bsModalRef: BsModalRef;

  ngOnInit() {
    this.init();
  }

  init() {
    this.loadProfile();
    jQuery(document).ready(function(){
      jQuery(".purchase-sub").on("click", function(){
        jQuery(".modal-backdrop").remove();
        jQuery("body").removeClass("modal-open");
      });
    });
  }

  hasFilter() {
    return this.selectedFilter.tag != '' || this.selectedFilter.category != '' || this.selectedFilter.skillLevel != '';
  }

  clearFilter() {
    this.selectedFilter = {
      tag: '',
      category: '',
      skillLevel: ''
    }
  }

  getFilteredSessions() {
    if (this.hasFilter()) {
      let clone = _.cloneDeep(this.sessions);
      let filtered = clone.filter(session => {
        let tag = this.selectedFilter.tag;
        let skillLevel = this.selectedFilter.skillLevel;

        let category = this.selectedFilter.category;


        if (tag) {
          if (skillLevel){
            session.content = session.content.filter(f => {
              return f.tags && f.tags.indexOf(tag) != -1  && f.tags.indexOf(skillLevel) != -1;
            });
          } else {
            session.content = session.content.filter(f => {
              return f.tags && f.tags.indexOf(tag) != -1 ;
            });
          }
        } else {
          if (skillLevel){
            session.content = session.content.filter(f => {
              return f.tags && f.tags.indexOf(skillLevel) != -1 ;
            });
          }
        }
        session.chunks.length = 0;
        session.chunks = this.getChunks(session.content, 3);

        session.display.length = 0;
        session.display.push(...session.chunks);
        

        if (category) {
          return session.name === this.selectedFilter.category;
        }
        return true;
      });
      return filtered;
    }
    return this.sessions;
  }

  constructor(private dataService: DataService, private modalService: BsModalService, public authenticationService: AuthenticationService) {
    this.getFreeSessions();
    this.getSessions();

    this.dataService.getUserProfile().subscribe(res => {
      if (!res.success) {
        return;
      }
      var manager = res.user.profiles.find(profile => {
        return profile.type === 'MANAGER';
      });
      this.managerProfile = manager ? true : false;
    });
  }

  selectTag(tag) {
    // check these 
    if (tag != 'Beginner' && tag != 'Intermediate' && tag != 'Expert'){
      this.selectedFilter.tag = tag;
    }
  }

  closeBanner() {
    this.banner = {
      isActive: false,
      timer: undefined,
      count: 0,
      sessionId: undefined,
      defaultTimeout: 1000 * 60
    };
  }

  showBanner(sessionId) {
    if (this.managerProfile) {
      return; // we dont want to show the banner for maangers
    }
    this.banner.isActive = true;

    if (this.banner.sessionId !== sessionId) {
      this.banner.count = 0;
    }
    this.banner.count++;
    this.banner.sessionId = sessionId;

    if (this.banner.timer) clearTimeout(this.banner.timer);

    this.banner.timer = setTimeout(() => {
      this.closeBanner();
    }, this.banner.defaultTimeout);
  }

  editContentParam(session, content) {
    this.dataService.editContentOfSession(session.id, content).subscribe(result => {
      if (result && result.success) {
        console.log('Saved new params');
      }
    });
  }

  addContentToCustomSession(contentId, content) {
    // prompt user to select which existing session they want to add
    // this content to, or let them start a new session
    console.log(contentId, content);

    const initialState = {
      customSession: this.customSessions
    };
    this.bsModalRef = this.modalService.show(AddcontentToSessionComponent, { initialState, class: 'modal-lg' });
    this.bsModalRef.content.closeBtnName = 'Close';
    this.bsModalRef.content.onClose.subscribe(result => {
      if (result && result.type === 'new') {
        console.log(result);
        let newSession = {
          name: result.name,
          content:  {
            contentId,
            reps: result.session.reps || 0,
            sets: result.session.sets || 0,
            seconds: result.session.seconds || 0,
            minutes: result.session.minutes || 0,
          }
        };
        this.newSession(newSession);
      } else if (result && result.type === 'add') {
        // let addContent = {
        //   id: result.id,
        //   reps: result.session.reps || 0,
        //   sets: result.session.sets || 0,
        //   seconds: result.session.seconds || 0,
        //   minutes: result.session.minutes || 0,
        //   contentId: contentId
        // };
        // this.addToExistingSession(addContent).then(response => {
        //   this.getSessions();
        // }).catch(error => {
        //   console.log(error);
        // });
      }
    });
  }

  newSession(session) {
    if (!session.name || !session.content) return;

    this.save(session, response => {
      this.getSessions();
      if (response && response.id) {
        this.showBanner(response.id);
      }
    });
  }

  addToExistingSession(session) {
    return new Promise((resolve, reject) => {
      this.dataService.addContentToSession(session).subscribe((response) => {
        if (!response || !response.success) {
          return reject('Custom session failed to save!');
        }
        if (response && response.id) {
          this.showBanner(response.id);
        }
        resolve(response);
      });
    });
  }

  editSession(session) {
    if (!session) return;

    let save = {
      id: session.id,
      name: session.name
    }
    this.save(save, (response) => {
      session.editMode = false;
    });
  }

  revertEdit(session) {
    if (!session) return;

    session.name = session.oldName;
    session.editMode = false;
  }

  removeFromSession(session, index) {
    if (!session || session.content.length < 1 || isUndefined(index)) return;

    const params = {
      title: 'Delete Session',
      message: 'Are you sure you want to delete this session?',
      cancelLabel: 'Back',
      confirmLabel: 'Confirm'
    };

    let confirmModal = this.modalService.show(ConfirmComponent, { initialState: params, class: 'modal-sm' });
    confirmModal.content.onClose.subscribe(result => {
      if (result.confirm) {
        if (session.content.length == 1) {
          this.deleteUserSession(session.id); //Delete session if this is the last video in it
          return;
        }

        let deleted = session.content.splice(index, 1);
        let toDelete = {
          contentId: deleted[0].id,
          sessionId: session.id
        }

        this.dataService.deleteContentFromSession(toDelete).subscribe(response => {});
      }
    });
  }

  toggleSessionDetails(session) {
    if (!session) return;
    session.expanded = !session.expanded ? true : false;
  }

  toggleSessionEdit(session) {
    if (!session) return;
    session.oldName = session.name;
    session.editMode = !session.editMode ? true : false;
    session.expanded = false;
  }

  toggleContentEdit(content) {
    if (!content) return;
    content.editMode = !content.editMode ? true : false;
  }

  save(session, cb = null) {
    this.dataService.createSession(session).subscribe((response) => {
      if (cb) {
        cb(response);
      }
      if (!response || !response.success) {
        console.error('Custom session failed to save!');
        return;
      }
    });
  }

  

  selectCategory(category) {
    this.selectedFilter.category = category;
  }

  selectSkillLevel(skillLevel) {
    this.selectedFilter.skillLevel = skillLevel;
  }

  deleteUserSession(sessionId) {
    const params = {
      title: 'Delete Session',
      message: 'Are you sure you want to delete this session?',
      cancelLabel: 'Back',
      confirmLabel: 'Confirm'
    };

    let confirmModal = this.modalService.show(ConfirmComponent, { initialState: params, class: 'modal-sm' });
    confirmModal.content.onClose.subscribe(result => {
      if (result.confirm) {
        this.dataService.deleteSessions(sessionId).subscribe((response) => {
          if (!response || !response.success) {
            // console.error('Could not delete session');
            return;
          }
          this.getSessions();
        });
      }
    });
  }

  collectTagsAndCategories(contentList) {
    let tags = this.filters.tags;
    let categories = this.filters.categories;

    for (let content of contentList) {
      categories.push(content.group);
      if (content.tags) tags.push(...content.tags);
    }

    this.filters.tags = tags.filter(function (value, index, self) {
      // check this
      if (value != 'Beginner' && value != 'Intermediate' && value != 'Expert'){
       return self.indexOf(value) === index;
      }
    });

    this.filters.categories = categories.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });
  }

  getSessions(cache: boolean = false) {
    this.assignments.length = 0;

    this.dataService.getSessions(cache).subscribe((response) => {
      console.log(response);
      if (!response.success) return;
      this.sessions = [];
      this.customSessions = [];
      this.assignments = response.assignments;
      this.collectTagsAndCategories(response.content);
      this.groupContent(response.content, this.sessions);
      this.customSessions.push(...response.plans);
      console.log("Custom Sessions", this.customSessions);
    });
  }

  getFreeSessions() {
    this.dataService.getFreeSessions().subscribe((response) => {
      if (!response.success) return;

      this.freeSessions = [];
      //this.collectTagsAndCategories(response.content);
      this.groupContent(response.content, this.freeSessions);
      this.freeSessions.forEach(function(session){
        var totalDisplaying = 0;
        session.display.forEach(function(d){
          totalDisplaying += d.length;
        });
        session.remaining = session.content.length - session.defaultView - totalDisplaying;

        // session.content.forEach(function(s){
        //   s.link = this.encryptData(s.link);
        // });

      });
      console.log("Free Sessions", this.freeSessions);;
    });
  }

  groupContent(contentList, fill) {
    let sessions = {};

    for (let content of contentList) {
      if (sessions[content.group]) {
        sessions[content.group].exercise = content.exercise;
        sessions[content.group].exercisesCat = content.exercisesCat;
        sessions[content.group].content.push(content);
        sessions[content.group].defaultView = content.defaultView ? content.defaultView : 3
      } else {
        sessions[content.group] = {
          exercise: content.exercise,
          exercisesCat: content.exercisesCat,
          content: [content],
          defaultView: content.defaultView ? content.defaultView : 3
        }
      }
    }

    for (var session in sessions) {
      if (!sessions.hasOwnProperty(session)) continue;

      var exercise = sessions[session].exercise;
      var exercisesCat = sessions[session].exercisesCat;
      var contents = sessions[session];
      var chunks = this.getChunks(contents.content, 3);
      var defaultView = contents.defaultView ;

      fill.push({
        name: session,
        exercise: exercise,
        exercisesCat: exercisesCat,
        display: [],
        content: contents.content,
        defaultView: defaultView,
        chunks: chunks || []
      });
    }
  }

  showMore(session) {
    if (session && session.chunks.length > 0) {
      session.display.push(session.chunks.shift());

      if (session.display.length == 1 && session.chunks.length > 0) {
        session.display.push(session.chunks.shift());
      }
    }
    session.remaining -= session.defaultView;
    session.remaining = session.remaining < 0 ? 0 : session.remaining;
    console.log(session);
  }

  showLess(session) {
    if (session && session.display) {
      while (session.display.length) {
        session.chunks.unshift(session.display.pop());
      }
    }
    var totalDisplaying = 0;
    session.display.forEach(function(d){
      totalDisplaying += d.length;
    });
    session.remaining = session.content.length - session.defaultView - totalDisplaying;
  }

  getChunks(arr, len) {
    if (arr && arr.length > 0) {
      var chunks = [],
            i = 0,
            n = arr.length;

        while (i < n) {
          chunks.push(arr.slice(i, i += len));
        }

        return chunks;
    }
  }

  startSessionById(sessionId) {
    this.closeBanner();
    let session = this.customSessions.find((session) => {
      return session.id === sessionId;
    });
    this.startSession(session);
  }

  startSession(session, index = 0) {
    this.openModalWithComponent(session, index, true);
  }

  openModalWithContent(session, contentId) {
    let index;
    session.content.find((element, i) => {
      if (element.id == contentId) {
        index = i;
      }
    });
    this.openModalWithComponent(session, index)
  }

  openAssignmentModal(assignment) {
    const initialState = {
      session: assignment.plan,
      selectedIndex: 0,
      userCreated: true,
      assignmentId: assignment._id
    };
    this.bsModalRef = this.modalService.show(VideoplayerComponent, { initialState, class: 'modal-lg' });
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  openModalWithComponent(session, selectedIndex: number = 0, userCreated = false) {
    const initialState = {
      session,
      selectedIndex,
      userCreated
    };
    this.bsModalRef = this.modalService.show(VideoplayerComponent, { initialState, class: 'modal-lg' });
    this.bsModalRef.content.closeBtnName = 'Close';
  }


  loadProfile() {
    this.dataService.getUserProfile(false).subscribe(res => {
      console.log("User: ", res.user);
      this.onProfileUpdated(res.user);
    });
  }
  hasSubscription() {
    if (this.user.subscription) {
      return true;
    }
    return false;
  }
getSubscriptionLeft() {
    if (!this.user.subscription) {
      return 0;
    }
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var firstDate = new Date(this.user.subscription.nextBillingDate);
    var secondDate = new Date();

    let daysLeft = firstDate.getTime() - secondDate.getTime();
    return (daysLeft > 0) ? Math.round( daysLeft / oneDay) : 0;
  }
onProfileUpdated(user) {
    if (user) {
      this.user = user;
      this.user.avatarURL = user.avatarURL;
      this.playerProfile = user.profiles.find(profile => {
        return profile.type === 'PLAYER';
      });
      this.coachProfile = user.profiles.find(profile => {
        return profile.type === 'MANAGER';
      });
      this.adminProfile = user.profiles.find(profile => {
        return profile.type === 'admin';
      });
    } else {
      // this.loadProfile();
    }
  }

  onSubscriptionUpdated() {
    this.loadProfile();
  }


  isLoggedIn() {
    if (!this.authenticationService.token) {
      return false;
    } else {
      return true;
    }
  }


}
