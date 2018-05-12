import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { VideoplayerComponent } from '../modals/videoplayer/videoplayer.component';
import { AddcontentToSessionComponent } from '../modals/addcontent-to-session/addcontent-to-session.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.css'],
  entryComponents: [VideoplayerComponent, AddcontentToSessionComponent]
})
export class SessionsComponent implements OnInit {

  @ViewChild(ModalDirective) modal: ModalDirective;

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

  sessions = [];
  customSessions = [];

  banner = {
    isActive: false,
    timer: undefined,
    count: 0,
    sessionId: undefined,
    defaultTimeout: 1000 * 60
  };


  bsModalRef: BsModalRef;

  ngOnInit() {
  }

  constructor(private dataService: DataService, private modalService: BsModalService) {
      this.getFreeSessions();
      this.getSessions();
  }

  selectTag(tag) {
    this.selectedFilter.tag = tag;
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
    this.banner.isActive = true;
    this.banner.sessionId = sessionId;

    if (this.banner.sessionId !== sessionId) {
      this.banner.count = 0;
    } else {
      this.banner.count++;
    }

    if (this.banner.timer) clearTimeout(this.banner.timer);

    this.banner.timer = setTimeout(() => {
      this.closeBanner();
    }, this.banner.defaultTimeout);
  }

  addContentToCustomSession(contentId) {
    // prompt user to select which existing session they want to add
    // this content to, or let them start a new session
    const initialState = {
      customSession: this.customSessions
    };
    this.bsModalRef = this.modalService.show(AddcontentToSessionComponent, { initialState, class: 'modal-lg' });
    this.bsModalRef.content.closeBtnName = 'Close';
    this.bsModalRef.content.onClose.subscribe(result => {
      if (result && result.type === 'new') {
        this.newSession(result.name, contentId);
      } else if (result && result.type === 'add') {
        this.addToExistingSession(result.id, contentId);
      }
    });
  }

  newSession(name, contentId) {
    if (!name || !contentId) return;

    let newSession = {
      name: name,
      content: [contentId]
    }

    this.save(newSession);
  }

  addToExistingSession(id, contentId) {
    if (!id) return;

    let existing = this.customSessions.find((session) => {
      return session.id === id;
    });

    let f = _.cloneDeep(existing);
    let arr = [];

    f.content.forEach(e => {
      arr.push(e.id);
    });
    if (arr.indexOf(contentId) === -1) {
      arr.push(contentId);
      f.content = arr;
      this.save(f);
    }
  }

  save(session) {
    this.dataService.saveSessions(session).subscribe((response) => {
      if (!response || !response.success) {
        console.error('Custom session failed to save!');
        return;
      }
      this.showBanner(response.id);
      this.getSessions();
    });
  }

  selectCategory(category) {
    this.selectedFilter.category = category;
  }

  selectSkillLevel(skillLevel) {
    this.selectedFilter.skillLevel = skillLevel;
  }

  deleteUserSession(sessionId) {
    console.log('deleting custom session', sessionId);
    this.dataService.deleteSessions(sessionId).subscribe((response) => {
      if (!response || !response.success) {
        console.error('Could not delete session');
        return;
      }
      this.getSessions();
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
      return self.indexOf(value) === index;
    });

    this.filters.categories = categories.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });
  }

  getSessions(cache: boolean = false) {
    this.dataService.getSessions(cache).subscribe((response) => {
      if (!response.success) return;
      //this.sessions = [];
      this.customSessions = [];

      this.collectTagsAndCategories(response.content);
      this.groupContent(response.content);
      this.customSessions.push(...response.plans);
    });
  }

  getFreeSessions() {
    this.dataService.getFreeSessions().subscribe((response) => {
      if (!response.success) return;
      this.collectTagsAndCategories(response.content);
      this.groupContent(response.content);
    });
  }

  groupContent(contentList) {
    let sessions = {};

    for (let content of contentList) {
      if (sessions[content.group]) {
        sessions[content.group].push(content);
      } else {
        sessions[content.group] = [content];
      }
    }
    for (var session in sessions) {
      if (!sessions.hasOwnProperty(session)) continue;

      var content = sessions[session];
      this.sessions.push({
        name: session,
        content: content
      });
    }
    console.log(this.sessions)
  }

  startSessionById(sessionId) {
    this.closeBanner();
    let session = this.customSessions.find((session) => {
      return session.id === sessionId;
    });
    this.startSession(session);
  }

  startSession(session) {
    this.openModalWithComponent(session);
  }

  openModalWithComponent(session, selectedIndex: number = 0) {
    const initialState = {
      session,
      selectedIndex
    };
    this.bsModalRef = this.modalService.show(VideoplayerComponent, { initialState, class: 'modal-lg' });
    this.bsModalRef.content.closeBtnName = 'Close';
  }
}
