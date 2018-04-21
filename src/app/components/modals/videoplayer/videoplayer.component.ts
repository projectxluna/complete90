import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-videoplayer',
  templateUrl: './videoplayer.component.html',
  styleUrls: ['./videoplayer.component.css']
})
export class VideoplayerComponent implements OnInit {

  constructor(public bsModalRef: BsModalRef) { 
  }
  session;
  selectedIndex;
  selectedContent;

  ngOnInit() {
    console.log('opened modal with session', this.session);
    this.selectedContent = this.session.content[this.selectedIndex] || this.session.content[0];
  }

  playNext() {
    if (this.selectedIndex+1 === this.session.content.length) {
      console.log('at the end of the playlist');
      return;
    }
    this.selectedIndex ++;
    this.selectedContent = this.session.content[this.selectedIndex];
  }

  playPrevious() {
    if (this.selectedIndex === 0) {
      console.log('no older videos to play');
      return;
    }
    this.selectedIndex --;
    this.selectedContent = this.session.content[this.selectedIndex];
  }

}
