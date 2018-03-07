import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.css']
})
export class AboutusComponent implements OnInit {
  expandedQ1 = false;
  expandedQ2 = false;
  expandedQ3 = false;
  expandedQ4 = false;
  expandedQ5 = false;

  constructor() { }

  ngOnInit() {
  }


  toggleExpand(question) {
    if (question === 'q1') {
      this.expandedQ1 = !this.expandedQ1;
    } 
    else if (question == 'q2') {
      this.expandedQ2 = !this.expandedQ2;
    } 

    else if (question == 'q3') {
      this.expandedQ3 = !this.expandedQ3; 
    }

    else if (question == 'q4') {
      this.expandedQ4 = !this.expandedQ4; 
    }

    else if (question == 'q5') {
      this.expandedQ5 = !this.expandedQ5; 
    }
            
    }

}
