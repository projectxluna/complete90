import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.css']
})
export class AboutusComponent implements OnInit {
  expandedQ1 = false;
  expandedQ2 = false;
  constructor() { }

  ngOnInit() {
  }

  toggleExpand(question) {
    if (question === 'q1') {
      this.expandedQ1 = !this.expandedQ1;
    } else {
      this.expandedQ2 = !this.expandedQ2;
    }
  }
}
