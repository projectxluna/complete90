import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.css']
})
export class SessionsComponent implements OnInit {

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

  sessions = {
  }

  constructor(private dataService: DataService) {
    dataService.getSessions().subscribe((response) => {
      if (response.success) {
        this.sessions = response.sessions;

        let tags = [];
        for (let session of response.content.sessions) {
          this.filters.categories.push(session.name);

          for (let content of session.content) {
            if (content.tags) tags.push(...content.tags);
          }
        }

        this.filters.tags = tags.filter(function (value, index, self) {
          return self.indexOf(value) === index;
        });
      }
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

}
