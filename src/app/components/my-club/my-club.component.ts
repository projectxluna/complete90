import { Component, OnInit, TemplateRef } from '@angular/core';
import { DataService } from '../../services';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'club',
  templateUrl: './my-club.component.html',
  styleUrls: ['./my-club.component.less']
})
export class MyClubComponent implements OnInit {

  profile: any;
  playerProfile: any;
  coachProfile: any;
  pendingPlayerRequests: any;
  club: any;
  modalRef: BsModalRef;
  model = {
    clubName: ''
  };

  error = '';
  page = 1;
  clubs: any;
  selectedClub: any;

  constructor(
    private dataService: DataService,
    private modalService: BsModalService) {
    this.getProfile();
  }

  ngOnInit() {
  }

  getProfile() {
    this.dataService.getUserProfile().subscribe(res => {
      if (!res || !res.success) {
        return;
      }
      this.profile = res.user;
      if (res.club) {
        this.club = res.club;
      }
      this.playerProfile = res.user.profiles.find(profile => {
        return profile.type === 'PLAYER';
      });
      this.coachProfile = res.user.profiles.find(profile => {
        return profile.type === 'MANAGER';
      });
      if (this.coachProfile) {
        this.findPendingRequest();
      }
    });
  }

  findPendingRequest() {
    this.dataService.findPendingClubRequest().subscribe(users => {
      this.pendingPlayerRequests = users.pendingUsers;
    });
  }

  closeModal() {
    this.modalRef.hide();
    this.page = 1;
    this.model.clubName = '';
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  findClub() {
    if (!this.model.clubName) {
      this.error = 'club name is required';
      return;
    }
    this.dataService.findClubByName(this.model.clubName).subscribe(res => {
      if (res.clubs.length) {
        this.page = 2;
        this.clubs = res.clubs;
      }
    });
  }

  confirmRequest() {
    let club = this.clubs.find(club => {
      return club.active;
    });
    if (!club) {
      this.error = 'Please select a club to continue';
      return;
    }
    this.dataService.requestClubAccess(club._id).subscribe(res => {
      if (res.success) {
        this.page = 3;
        setTimeout(() => {
          this.page = 1;
          this.model.clubName = '';
          this.modalRef.hide();
        }, 3000);
      }
    });
  }

  addToClub(player) {
    if (!player) {
      return;
    }
    this.dataService.addPlayerToClub(player.id).subscribe(response => {
      if (response.success) {
        setTimeout(() => {
          this.findPendingRequest();
          this.modalRef.hide();
        }, 3000);
      }
    });
  }
}
