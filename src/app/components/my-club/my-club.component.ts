import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DataService } from '../../services';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'club',
  templateUrl: './my-club.component.html',
  styleUrls: ['./my-club.component.less']
})
export class MyClubComponent implements OnInit {

  @ViewChild('file') file;
  profile: any;
  playerProfile: any;
  coachProfile: any;
  pendingPlayerRequests: any;
  club: any;
  modalRef: BsModalRef;
  model = {
    clubName: ''
  };
  editMode: boolean = false;

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

  getProfile(cache = true) {
    this.dataService.getUserProfile(cache).subscribe(res => {
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
      } else {
        this.dataService.getSessions().subscribe(response => {
          if (response.success && response.assignments) {
            this.playerProfile.assignments = response.assignments;
          }
        });
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
    this.getProfile(false);
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
          this.getProfile(false);
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
        // this.findPendingRequest();
        this.modalRef.hide();
        window.location.reload();
      }
    });
  }

  updateClub() {
    this.loading = true;
    let club = {
      clubId: this.club._id,
      name: this.club.name
    };
    this.dataService.updateClub(club).subscribe(response => {
      this.loading = false;
      this.editMode = false;
      if (response.success) {
        console.log(response)
      }
    });
  }

  addFiles() {
    this.file.nativeElement.click();
  }

  loading: boolean = false;
  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;

    if (files && files[0]) {
      this.loading = true;
      this.dataService.uploadClubImage(files[0], this.club._id).subscribe(response => {
        try {
          window.location.reload();
        } catch (error) {
          console.log(error);
        }
        this.loading = false;
        this.editMode = false;
      });
    }
  }
}
