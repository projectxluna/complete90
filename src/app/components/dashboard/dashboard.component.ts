import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthenticationService, DataService } from '../../services';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  @ViewChild('dropzone') dropZone:ElementRef;
  // @ViewChild('iconList') iconListContainer:ElementRef;
  @ViewChild('file') file;

  securityActive = false;
  notificationActive = false;
  paymentActive = false;
  profile = {
    name: '',
    coach: false,
    subscription: undefined,
    creditCards: [],
    avatarURL: '',
    companyName: '',
    teamName: '',

    height: '',
    position: '',
    foot: ''
  };

  selectedField;
  drillLayout = {
    _full: "assets/fullFld.png",
    _half: "assets/halfFld.png",
    _18yard: "assets/18yardFld.png",
    _empty: "assets/emptyFld.png"
  };

  stats = {
    watched: '',
    viewedTotal: 0
  }
  model: any = {};
  loading: boolean = false;
  editMode = false;


  layout = [];
  sessions = [];
  draggable = [
    {
      name: "cone",
      img: "assets/pylon-icon.png"
    },
    {
      name: "player",
      img: "assets/player-icon.png"
    },
    {
      name: "ball",
      img: "assets/sb-icon.png"
    },
    {
      name: "line",
      img: "assets/line-icon.png"
    },
    {
      name: "line",
      img: "assets/line2-icon.png"
    }
  ];

  iconList = {
    isVisible: false,
    positionX: 0,
    positionY: 0,
  }

  getPosition(el) {
    var xPos = 0;
    var yPos = 0;

    while (el) {
      if (el.tagName == "BODY") {
        // deal with browser quirks with body/window/document and page scroll
        var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
        var yScroll = el.scrollTop || document.documentElement.scrollTop;

        xPos += (el.offsetLeft - xScroll + el.clientLeft);
        yPos += (el.offsetTop - yScroll + el.clientTop);
      } else {
        // for all other non-BODY elements
        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
      }

      el = el.offsetParent;
    }
    return {
      x: xPos,
      y: yPos
    };
  }

  toggleIconList(event) {
    // console.log('toggle', event)
    this.iconList.isVisible = !this.iconList.isVisible;

    if (this.iconList.isVisible) {
      // let iconContainer = this.iconListContainer.nativeElement.getBoundingClientRect();
      // @ViewChild('iconList') iconListContainer:ElementRef;
      // let dropzone = this.dropZone.nativeElement.getBoundingClientRect();

      // console.log('iconsContainer', event)

      var parentPosition = this.getPosition(event.currentTarget);

      let x = event.clientX - parentPosition.x;
      let y = event.clientY - parentPosition.y;

      this.iconList.positionX = x;
      this.iconList.positionY = y;
    }
  }

  copyIconToPosition(icon) {
    this.layout.push({
      url: icon.img,
      x: this.iconList.positionX,
      y: this.iconList.positionY,
    })
  }

  getUrl(url) {
    let field = "url('" + url + "')";
    return field;
  }

  dragEnd(event, item) {
    // console.log('Element was dragged', event);
    // console.log('item', item);
    let rect = this.dropZone.nativeElement.getBoundingClientRect();
    // console.log('dropZone', JSON.stringify(rect))

    let position = this.getPosition(this.dropZone.nativeElement);

    let newX = item.x + event.x;
    let newY = item.y + event.y;
    let notOutBounds = this.isCoordinateWithinRectangle(newX, newY, rect);
    // console.log('offset', position);
    // console.log('New X:', newX, ', New Y:', newY);
    // console.log('out of bounds', notOutBounds)
    if (item && notOutBounds) {
      item.x = newX;
      item.y = newY;
    }
  }

  isCoordinateWithinRectangle(
    clientX: number,
    clientY: number,
    rect
  ): boolean {
    return (
      clientX+64 >= rect.left &&
      clientX+64 <= rect.right &&
      (clientY+64)*2 >= rect.top &&
      (clientY*2)-75 <= rect.bottom
    );
  }

  constructor(private dataService: DataService,
    private authenticationService: AuthenticationService) {
    dataService.getUserProfile(false).subscribe(user => {
      this.userProfileCallback(user.profile);
    });
    dataService.getWatchedStats().subscribe(result => {
      if (result && result.success) {
        this.stats.watched = this.getHumanTime(result.watchedTotal);
        this.stats.viewedTotal = result.viewedTotal;
      }
    });
    dataService.getSessions().subscribe((response) => {
      if (!response.success) return;
      this.sessions = [];

      this.groupContent(response.content);
    });
  }

  ngOnInit() {
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
      if (content.length > 0) {
        this.sessions.push(content[0]);
      }
    }
    if (this.sessions.length > 3) {
      this.sessions = this.sessions.slice(2);
    }
  }

  getHumanTime(time) {
    let h = Math.floor(time / (60 * 60 * 1000));
    time = time % (60 * 60 * 1000);
    let m = Math.floor(time / (60 * 1000));
    time = time % (60 * 1000);
    let s = Math.floor(time / 1000);

    if (h) return h + ' Hours';
    if (m) return m + ' Minutes';

    return s + ' Seconds';
  }

  hasSubscription() {
    if (this.profile.subscription) {
      return true;
    }
    return false;
  }

  getSubscriptionLeft() {
    if (!this.profile.subscription) {
      return 0;
    }
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var firstDate = new Date(this.profile.subscription.nextBillingDate);
    var secondDate = new Date();

    return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
  }

  toggleSecurity() {
    this.securityActive = !this.securityActive;
  }

  togglePayment() {
    this.paymentActive = !this.paymentActive;
  }

  toggleNotification() {
    this.notificationActive = !this.notificationActive;
  }

  updatePassword() {
    if (!this.model.oldPassword || !this.model.newPassword || !this.model.verifyPassword) {
      // 'make sure all required fields are completed!';
      return;
    }
    this.loading = true;

    this.authenticationService.changePassword(this.model.oldPassword, this.model.newPassword, this.model.verifyPassword)
      .subscribe(result => {
        if (result && result.success == true) {
          this.loading = false;
          this.model = {};
        } else {
          //'please try again. something went wrong';
          this.loading = false;
          this.model = {};
        }
      });
  }

  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;

    if (files && files[0]) {
      this.dataService.uploadProfileImage(files[0]).subscribe(response => {
        if (response.success) {
          this.userProfileCallback(response.profile);
        }
      });
    }
  }

  addFiles() {
    this.file.nativeElement.click();
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  updateProfile() {
    let foot = this.profile.foot;
    let position = this.profile.position;
    let height = this.profile.height;
    let companyname = this.profile.companyName;
    let teamName = this.profile.teamName;

    this.loading = true;
    let profile = {
      foot,
      position,
      height,
      companyname,
      teamName
    }
    this.dataService.updateUserProfile(profile).subscribe(response => {
      this.loading = false;
      this.editMode = false;
      if (response.success) {
        this.userProfileCallback(response.profile);
      }
    });
  }

  userProfileCallback(profile) {
    this.profile = profile;
  }
}
