import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthenticationService, DataService } from '../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {

  @ViewChild('dropzone') dropZone:ElementRef;
  // @ViewChild('iconList') iconListContainer:ElementRef;
  drillMakerActive = false;
  securityActive = false;
  notificationActive = false;
  paymentActive = false;

  passwordUpdated = false;
  passwordError = '';

  user = {
    name: '',
    subscription: undefined,
    nationality: '',
    creditCards: [],
    avatarURL: '',
    clubName: '',
  };
  playerProfile: any;
  coachProfile: any;
  adminProfile: any;

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
    private authenticationService: AuthenticationService,
    private router: Router) {
      this.init();
  }

  ngOnInit() {
  }

  init() {
    this.loadProfile();
    this.dataService.getWatchedStats().subscribe(result => {
      if (result && result.success) {
        this.stats.watched = this.getHumanTime(result.watchedTotal);
        this.stats.viewedTotal = result.viewedTotal;
      }
    });
    this.dataService.getSessions().subscribe((response) => {
      if (!response.success) return;
      this.sessions = [];

      this.groupContent(response.content);
    });


    

  }

  loadProfile() {
    this.dataService.getUserProfile(false).subscribe(res => {
      this.onProfileUpdated(res.user);
      //console.log("User: ", this.user.subscription.planId);
    });
  }

  isAuthenticatedToSee() {
    if(this.user.subscription != null) {
      if((this.user.subscription.planId == 'player-monthly-amateur' || this.user.subscription.planId == 'player-monthly-amateur-trial') && this.user.subscription.status == 'Active') {
        return false;
      } else {
        return true;
      }
    }
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
  //console.log(this.user.token);
    if (this.user.subscription) {
      return true;
    }
    return false;
  }

  getSubscriptionLeft() {
    if (!this.user.subscription) {
      return 0;
    }
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var firstDate = new Date(this.user.subscription.nextBillingDate);
    var secondDate = new Date();

    let daysLeft = firstDate.getTime() - secondDate.getTime();
    return (daysLeft > 0) ? Math.round( daysLeft / oneDay) : 0;
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
        this.passwordUpdated = true;

        if (result && result.success == true) {
          this.loading = false;
          this.model = {};
          setTimeout(() => {
            this.toggleSecurity();
            this.passwordUpdated = false;
          }, 2000);
          this.passwordError = 'Password Successfully Updated';
        } else {
          //'please try again. something went wrong';
          this.loading = false;
          this.passwordError = 'Failed to Update Password';
          this.model = {};
        }
      });
  }

  hidePasswordSection() {
    this.passwordUpdated = false;
  }

  onProfileUpdated(user) {
    if (user) {
      this.user = user;
      this.user.avatarURL = user.avatarURL;
      console.log(user);
      this.playerProfile = user.profiles.find(profile => {
        return profile.type === 'PLAYER';
      });
      this.coachProfile = user.profiles.find(profile => {
        return profile.type === 'MANAGER';
      });
      this.adminProfile = user.profiles.find(profile => {
        return profile.type === 'admin';
      });
    } else {
      // this.loadProfile();
    }
  }

  onSubscriptionUpdated() {
    this.loadProfile();
  }
}
