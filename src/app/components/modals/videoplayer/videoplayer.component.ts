import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { VgAPI } from 'videogular2/core';
import { DataService } from '../../../services';

declare var VTTCue;

export class Timer {
  private startAt = 0; // Time of last start / resume. (0 if not running)
  private lapTime = 0; // Time on the clock when last stopped in milliseconds

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

    if (h > 0) {
      newTime += this.pad(h, 2) + ':';
    }
    newTime = this.pad(m, 2) + ':' + this.pad(s, 2);
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
  styleUrls: ['./videoplayer.component.less']
})
export class VideoplayerComponent implements OnInit {
  api: VgAPI;
  track: TextTrack;
  timer: Timer;
  longTimer: Timer;
  mediaLength = 0;
  autoLoop: boolean = true;
  userCreated;
  session;
  sessionStats = {
    contentId: '',
    currentTime: 0, // seconds
    watchedTotal: 0, // seconds
    contentLength: 0
  }

  selectedIndex;
  selectedContent;
  assignmentId;
  originalVolume: any;

  interval: any;

  constructor(public bsModalRef: BsModalRef, public dataService: DataService) {
  }

  ngOnInit() {
    this.selectedContent = this.session.content[this.selectedIndex] || this.session.content[0];
    this.sessionStats.contentId = this.selectedContent.id;
    this.timer = new Timer();
    this.longTimer = new Timer();
  }

  timerText = '00:00'
  updateTimeText() {
    let t = this.longTimer.formatTime();
    if (t) {
      this.timerText = t;
    }
    return this.timerText
  }

  formatTime(time) {
    var h = 0, m = 0, s = 0;
    var newTime = '';

    h = Math.floor(time / (60 * 60 * 1000));
    time = time % (60 * 60 * 1000);
    m = Math.floor(time / (60 * 1000));
    time = time % (60 * 1000);
    s = Math.floor(time / 1000);

    if (h > 0) {
      newTime += this.pad(h, 2) + ':';
    }
    newTime += this.pad(m, 2) + ':' + this.pad(s, 2);
    return newTime;
  }

  pad(num, size) {
    var s = "0000" + num;
    return s.substr(s.length - size);
  }

  getTime() {
    return this.formatTime((this.selectedContent.reps || 1 + this.selectedContent.sets || 1) * this.mediaLength * 1000)
  }

  playNext() {
    if (this.selectedIndex + 1 === this.session.content.length) return;


    if (this.cuePointTimeout) {
      clearTimeout(this.cuePointTimeout);
    }

    this.stopTimer();
    this.longTimer.reset();

    this.timerText = '00:00'

    this.selectedIndex++;
    this.selectedContent = this.session.content[this.selectedIndex];
    this.removeCuePoits();
    this.addCuePoints();
    this.originalVolume = undefined;
    this.mediaLength = this.api.getMasterMedia().duration;
  }

  playPrevious() {
    if (this.selectedIndex === 0) return;

    if (this.cuePointTimeout) {
      clearTimeout(this.cuePointTimeout);
    }
    this.stopTimer();
    this.longTimer.reset();

    this.timerText = '00:00'

    this.selectedIndex--;
    this.selectedContent = this.session.content[this.selectedIndex];
    this.removeCuePoits();
    this.addCuePoints();
    this.originalVolume = undefined;
    this.mediaLength = this.api.getMasterMedia().duration;
  }

  startTimer() {
    this.timer.start();
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      this.updateTimeText();
    }, 1000);
  }

  /**
   * Stops the timer and attempt to save stats
   * for current selected video
   */
  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    // save user watch progress 
    this.timer.stop();
    var watched = this.timer.time();
    this.timer.reset();


    this.sessionStats.watchedTotal = watched;
    this.sessionStats.currentTime = this.api.getDefaultMedia().currentTime;
    this.sessionStats.contentId = this.selectedContent.id;
    this.sessionStats.contentLength = this.api.getDefaultMedia().duration;
    // console.log('Watched time:', this.timer.formatTime(), 'Current time:', this.api.getDefaultMedia().currentTime);
    if (watched < 1) {
      return;
    }
    let payload = {
      contentStats: this.sessionStats,
      assignmentId: this.assignmentId ? this.assignmentId : null
    };
    this.dataService.saveWatchedStats(payload).subscribe(result => {
      if (!result || !result.success) {
        return;
      }
    });
  }

  onPlayerReady(api: VgAPI) {
    this.api = api;

    this.mediaLength = api.getMasterMedia().duration;
    // register media events 
    this.api.getDefaultMedia().subscriptions.play.subscribe(
      () => {
        this.startTimer();
        this.longTimer.start();
      }
    );
    this.api.getDefaultMedia().subscriptions.ended.subscribe(
      () => {
        this.stopTimer();
      }
    );
    this.api.getDefaultMedia().subscriptions.pause.subscribe(
      () => {
        this.stopTimer();
        this.longTimer.stop();
      }
    );
    this.api.getDefaultMedia().subscriptions.seeked.subscribe(
      () => {
        this.startTimer();
      }
    );
    this.api.getDefaultMedia().subscriptions.seeking.subscribe(
      () => {
        this.stopTimer();
      }
    );

      if (this.userCreated) {
        // Create cue track
        this.api.addTextTrack('metadata');
        this.track = this.api.textTracks[0];

        this.addCuePoints();
      }
    // setTimeout(() => {
    // }, 1000);
  }

  removeCuePoits() {
    if (!this.userCreated) return;

    let cues = this.track.cues;
    for (let i = cues.length - 1; i >= 0; i--) {
      this.track.removeCue(cues[i]);
    }
  }
  addCuePoints() {
    if (!this.userCreated) return;

    let markers = this.selectedContent.markers;
    if (!markers) return;

    for (let m of markers) {
      let cue = new VTTCue(m.startTime, m.endTime, m.title)
      cue.onexit = (textTrack) => this.onExitCuePoint(textTrack);
      cue.loop = m.loop;
      cue.cid = this.selectedContent.id;
      this.track.addCue(cue);
    }
  }

  cuePointTimeout = null;
  onExitCuePoint(textTrack) {
    let cue = textTrack.currentTarget;

    if (cue.cid !== this.selectedContent.id) {
      return console.log('Not the same cid');
    }
    if (cue.loop && this.autoLoop) {
      // Using a timeout here to keep things from breaking on IOS
      this.cuePointTimeout = setTimeout(() => {
        this.api.seekTime(cue.startTime);
        if (!this.originalVolume) this.originalVolume = this.api.volume; // save the old volume
        // turn off music here
        // This does not work on IOS
        this.api.volume = 0;
      }, 1000);
    } else {
      // Restore old volume here
      if (this.originalVolume) this.api.volume = this.originalVolume;
    }
  }

  close() {
    this.stopTimer();
    this.bsModalRef.hide();
  }
}
