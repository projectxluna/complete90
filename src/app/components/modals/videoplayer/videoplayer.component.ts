import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { VgAPI } from 'videogular2/core';
import { DataService } from '../../../services';

declare var VTTCue;

export class Timer {
  private startAt = 0;	// Time of last start / resume. (0 if not running)
  private lapTime = 0;	// Time on the clock when last stopped in milliseconds

  constructor() {

  }

  now() {
    return (new Date()).getTime();
  }

  start() {
    this.startAt = this.startAt ? this.startAt : this.now();
  }

  stop() {
    // If running, update elapsed time otherwise keep it
    this.lapTime = this.startAt ? this.lapTime + this.now() - this.startAt : this.lapTime;
    this.startAt = 0; // Paused
  }

  reset() {
    this.lapTime = this.startAt = 0;
  }

  time() {
    return this.lapTime + (this.startAt ? this.now() - this.startAt : 0);
  }

  formatTime() {
    var h = 0, m = 0, s = 0, ms = 0;
    var newTime = '';
    var time = this.time();

    h = Math.floor(time / (60 * 60 * 1000));
    time = time % (60 * 60 * 1000);
    m = Math.floor(time / (60 * 1000));
    time = time % (60 * 1000);
    s = Math.floor(time / 1000);
    ms = time % 1000;

    newTime = this.pad(h, 2) + ':' + this.pad(m, 2) + ':' + this.pad(s, 2) + ':' + this.pad(ms, 3);
    return newTime;
  }

  pad(num, size) {
    var s = "0000" + num;
    return s.substr(s.length - size);
  }
}

@Component({
  selector: 'app-videoplayer',
  templateUrl: './videoplayer.component.html',
  styleUrls: ['./videoplayer.component.css']
})
export class VideoplayerComponent implements OnInit {
  static api: VgAPI;
  track: TextTrack;
  timer: Timer;

  session;
  sessionStats = {
    contentId: '',
    currentTime: 0, // seconds
    watchedTotal: 0, // seconds
  }

  selectedIndex;
  selectedContent;

  constructor(public bsModalRef: BsModalRef, public dataService: DataService) {
  }

  ngOnInit() {
    this.selectedContent = this.session.content[this.selectedIndex] || this.session.content[0];
    this.sessionStats.contentId = this.selectedContent.id;
    this.timer = new Timer();
  }

  playNext() {
    if (this.selectedIndex + 1 === this.session.content.length) return;

    this.stopTimer();

    this.selectedIndex++;
    this.selectedContent = this.session.content[this.selectedIndex];
    this.removeCuePoits();
    this.addCuePoints();
  }

  playPrevious() {
    if (this.selectedIndex === 0) return;
    
    this.stopTimer();

    this.selectedIndex--;
    this.selectedContent = this.session.content[this.selectedIndex];
    this.removeCuePoits();
    this.addCuePoints();
  }

  startTimer() {
    this.timer.start();
  }

  /**
   * Stops the timer and attempt to save stats
   * for current selected video
   */
  stopTimer() {
    // save user watch progress 
    this.timer.stop();
    var watched = this.timer.time();
    this.timer.reset();

    this.sessionStats.watchedTotal = watched;
    this.sessionStats.currentTime = VideoplayerComponent.api.getDefaultMedia().currentTime;
    this.sessionStats.contentId = this.selectedContent.id;

    // console.log('Watched time:', this.timer.formatTime(), 'Current time:', this.api.getDefaultMedia().currentTime);
    if (watched < 1) {
      return;
    }
    this.dataService.saveWatchedStats(this.sessionStats).subscribe(result => {
      if (!result || !result.success) {
        return;
      }
    });
  }

  /**
   * 
   * ToDo: listen for modal close then store users watched status on every video.
   */
  onPlayerReady(api: VgAPI) {
    VideoplayerComponent.api = api;

    // register media events 
    api.getDefaultMedia().subscriptions.play.subscribe(
      () => {
        // start or create the timer for this particular video if it doesnt exist already
        // console.log('***PLAY')
        this.startTimer();
      }
    );
    api.getDefaultMedia().subscriptions.ended.subscribe(
      () => {
        // we save the total watched value
        // console.log('***ENDED');
        this.stopTimer();
      }
    );
    api.getDefaultMedia().subscriptions.pause.subscribe(
      () => {
        // we pause the timer..
        // console.log('***PAUSED')
        this.stopTimer();
      }
    );
    api.getDefaultMedia().subscriptions.playing.subscribe(
      () => {
        // here we ensure that the timer is still running
        // console.log('onPlayingUpdated');
      }
    );
    api.getDefaultMedia().subscriptions.seeked.subscribe(
      () => {
        // here we want to resume our timer after seeking is completed
        // console.log('onSeeked');
        this.startTimer();
      }
    );
    api.getDefaultMedia().subscriptions.seeking.subscribe(
      () => {
        // here we want to stop our timer
        // console.log('onSeeking');
        this.stopTimer();
      }
    );
    // Create cue track
    api.addTextTrack('metadata', 'videoAnnotationTrack');
    this.track = api.textTracks[0];

    this.addCuePoints();
  }

  removeCuePoits() {
    let cues = this.track.cues;
    for (let i = cues.length - 1; i >= 0; i--) {
      this.track.removeCue(cues[i]);
    }
  }
  addCuePoints() {
    let markers = this.selectedContent.markers;
    if (!markers) return;

    markers.forEach(m => {
      let cue = new VTTCue(m.startTime, m.endTime, m.title)
      cue.onenter = this.onEnterCuePoint;
      cue.onexit = this.onExitCuePoint;
      cue.loop = m.loop;
      this.track.addCue(cue);
    });
  }

  onEnterCuePoint(textTrack) {
  }

  onExitCuePoint(textTrack) {
    let cue = textTrack.currentTarget;
    if (cue.loop) {
      VideoplayerComponent.api.seekTime(cue.startTime);
    }
  }

  close() {
    this.stopTimer();
    this.bsModalRef.hide();
  }
}
