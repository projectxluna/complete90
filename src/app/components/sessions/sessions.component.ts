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
  bsModalRef: BsModalRef;

  constructor(private dataService: DataService,
    private modalService: BsModalService) {
    // get free content
    dataService.getFreeSessions().subscribe((response) => {
      if (!response.success) return;
      this.collectTagsAndCategories(response.content);
      this.sessions.push(...response.content);
    });

    dataService.getSessions().subscribe((response) => {
      if (!response.success) return;
      this.collectTagsAndCategories(response.content)
      this.sessions.push(...response.content);
    });
  }

  selectTag(tag) {
    this.selectedFilter.tag = tag;
  }

  selectCategory(category) {
    this.selectedFilter.category = category;
  }

  selectSkillLevel(skillLevel) {
    this.selectedFilter.skillLevel = skillLevel;
  }

  ngOnInit() {
  }

  collectTagsAndCategories(sessions) {
    let tags = this.filters.tags;
    for (let session of sessions) {
      this.filters.categories.push(session.name);

      for (let content of session.content) {
        if (content.tags) tags.push(...content.tags);
      }
    }

    this.filters.tags = tags.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });
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
