import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.less']
})
export class ProfileComponent implements OnInit {

  profile;
  playerProfile;
  coachProfile;
  @Output() profileUpdated = new EventEmitter<boolean>();
  @ViewChild('file') file;

  editMode: boolean;
  loading: boolean;

  constructor(private dataService: DataService) {
    this.loadProfile();
  }

  loadProfile() {
    this.dataService.getUserProfile().subscribe(res => {
      if (!res.success) {
        return;
      }
      this.profile = res.user;
      console.log("Profile: ", this.profile);
      this.playerProfile = res.user.profiles.find(profile => {
        return profile.type === 'PLAYER';
      });
      this.coachProfile = res.user.profiles.find(profile => {
        return profile.type === 'MANAGER';
      });
    });
  }
  

  isAuthenticatedToSee() {
    if(this.profile.subscription != null) {
      if((this.profile.subscription.planId == 'player-monthly-amateur' || this.profile.subscription.planId == 'player-monthly-amateur-trial') && this.profile.subscription.status == 'Active') {
        return false;
      } else {
        return true;
      }
    }
  }



  ngOnInit() {
  }

  getUrl(url) {
    let field = "url('" + url + "')";
    return field;
  }

  addFiles() {
    this.file.nativeElement.click();
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  updateProfile() {
    this.loading = true;
    let profile = {
      name: this.profile.name,
      nationality: this.profile.nationality,
      playerProfile: this.playerProfile,
      coachProfile: this.coachProfile
    };
    this.dataService.updateUserProfile(profile).subscribe(response => {
      this.loading = false;
      this.editMode = false;
      if (response.success) {
        console.log(response)
        this.profileUpdated.emit(response.user);
      }
    });
  }

  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;

    if (files && files[0]) {
      this.loading = true;
      this.dataService.uploadProfileImage(files[0]).subscribe(response => {
        this.loading = false;
        if (response.success) {
          this.loadProfile();
          this.profileUpdated.emit(response.user);
        }
      });
    }
  }
}
