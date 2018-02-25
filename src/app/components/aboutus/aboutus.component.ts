import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.css']
})
export class AboutusComponent implements OnInit {
	expanded = false;
  constructor() { }

  ngOnInit() {
  }

  toggleExpand() {
  	console.log('this is working')
  	this.expanded = !this.expanded;
  }

}

