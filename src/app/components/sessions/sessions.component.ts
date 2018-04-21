import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { VideoplayerComponent } from '../modals/videoplayer/videoplayer.component';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.css'],
  entryComponents: [VideoplayerComponent]
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

  customSession = [
    {
      id: 'fe71e181-13ca-4725-80ce-6840df169e6a',
      name: 'FOOTWORK SESSION',
      content: ['contentId', 'contentId']
    }
  ];

  bsModalRef: BsModalRef;

  constructor(private dataService: DataService,
    private modalService: BsModalService) {
    // get free content
    dataService.getFreeSessions().subscribe((response) => {
      if (!response.success) return;
      this.collectTagsAndCategories(response.content);
      this.groupContent(response.content);
    });

    dataService.getSessions().subscribe((response) => {
      if (!response.success) return;
      this.collectTagsAndCategories(response.content)
      this.groupContent(response.content);
    });
  }

  selectTag(tag) {
    this.selectedFilter.tag = tag;
  }

  addContentToCustomSession(contentId) {
    console.log('adding video to session', contentId);
    // prompt user to select which existing session they want to add
    // this content to, or let them start a new session
  }

  selectCategory(category) {
    this.selectedFilter.category = category;
  }

  selectSkillLevel(skillLevel) {
    this.selectedFilter.skillLevel = skillLevel;
  }

  ngOnInit() {
  }
  
  deleteUserSession(sessionId) {
    console.log('deleting custom session', sessionId);
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
  }

  openModalWithComponent(session, selectedIndex) {
    const initialState = {
      session,
      selectedIndex
    };
    this.bsModalRef = this.modalService.show(VideoplayerComponent, { initialState, class: 'modal-lg' });
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  handler(type: string, $event: ModalDirective) {
    // add event handling here. probably want to get back watched stats 
  }

}
