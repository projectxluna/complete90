import { Component, OnInit, TemplateRef } from '@angular/core';
import { DataService } from '../../services';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmComponent } from '../modals/confirm/confirm.component';

@Component({
  selector: 'team-roaster',
  templateUrl: './team-roaster.component.html',
  styleUrls: ['./team-roaster.component.less']
})
export class TeamRoasterComponent implements OnInit {

  teams: any[];
  modalRef: BsModalRef;
  model = {
    teamName: '',
    team: undefined
  };

  reportModal = {
    player: undefined,
    report: undefined,
    tabs: [
      {name: 'Individual', active: true, id: 'player'},
      {name: 'Team', active: false, id: 'team'}
    ]
  };
  teamModal = {
    team: undefined
  };
  playerModal = {
    player: undefined
  };
  usersWithoutTeam: any;
  page = 1;
  selectedUser: any;

  constructor(private dataService: DataService,
    private modalService: BsModalService) {
    // this.generateTestData();
    this.getTeams();
    this.getUsersWithoutTeam();
  }

  ngOnInit() {
  }

  getTeams() {
    this.dataService.getTeams().subscribe(res => {
      if (!res || !res.success) {
        return;
      }
      this.teams = res.teams;
      if (this.teams.length) {
        this.selectTeam(this.teams[0]);
      }
    });
  }

  getUsersWithoutTeam() {
    this.dataService.getUsersWithoutTeam().subscribe(res => {
      console.log("Team: ", res);
      if (!res || !res.success) {
        return;
      }
      this.usersWithoutTeam = res.users;
    });
  }

  closeModal() {
    this.modalRef.hide();
    this.resetReportModal();
  }

  openTeamAssignemntModal(template: TemplateRef<any>) {
    this.getUsersWithoutTeam();
    this.openModal(template);
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  createTeam() {
    if (!this.model.teamName) {
      return;
    }
    this.dataService.createTeam(this.model.teamName).subscribe(res => {
      this.getTeams();
      this.closeModal();
    });
  }

  selectUser(user) {
    if (this.selectedUser) {
      this.selectedUser.active = false;
    }
    user.active = true;

    this.selectedUser = user;
  }

  deselectUser() {
    if (this.selectedUser) {
      this.selectedUser.active = false;
    }
  }

  selectTeam(team) {
    if (!team) {
      return;
    }
    team.active = true
    if (team.players) return;

    this.dataService.getPlayers(team._id).subscribe(res => {
      team.players = res.players.map(player => {
        let fullName = player.name.split(' ');
        player.firstName = fullName[0] || '';
        player.lastName = fullName[1] || '';
        player.shortName = fullName[0] + ' ' + (fullName[1] || '').substr(0, 1);
        return player;
      });
    });
  }

  resetReportModal() {
    this.reportModal = {
      player: undefined,
      report: undefined,
      tabs: [
        {name: 'Individual', active: true, id: 'player'},
        {name: 'Team', active: false, id: 'team'}
      ]
    };
  }

  addUserToTeam() {
    if (!this.selectedUser || !this.model.team) {
      return;
    }
    this.dataService.joinTeam(this.model.team._id, this.selectedUser.id).subscribe(res => {
      this.selectedUser = undefined;
      this.model = {
        teamName: '',
        team: undefined
      };
      this.getUsersWithoutTeam();
      this.getTeams();
      this.closeModal();
    });
  }

  openPlayerReportModal(player, template) {
    this.reportModal.player = player;
    this.openModal(template)
    this.dataService.getPlayerReport(player.id).subscribe(response => {
      this.reportModal.report = response.stats;
    })
  }

  editPlayer(player, template) {
    this.playerModal.player = player;
    this.openModal(template);
  }

  updatePlayer() {
    if (!this.playerModal.player) {
      return;
    }
    const params = {
      title: 'Remove from Team',
      message: 'Are you sure you want to remove player from team?',
      cancelLabel: 'Back',
      confirmLabel: 'Confirm'
    };

    let confirmModal = this.modalService.show(ConfirmComponent, { initialState: params });
    confirmModal.content.onClose.subscribe(result => {
      if (result.confirm) {
        this.dataService.removeFromTeam(this.playerModal.player.id).subscribe(res => {
          this.getTeams();
          this.closeModal();
        });
      }
    });
  }

  deletePlayerFromClub() {
    if (!this.playerModal.player) {
      return;
    }
    const params = {
      title: 'Remove from Club',
      message: 'Are you sure you want to remove player from club?',
      cancelLabel: 'Back',
      confirmLabel: 'Confirm'
    };

    let confirmModal = this.modalService.show(ConfirmComponent, { initialState: params });
    confirmModal.content.onClose.subscribe(result => {
      if (result.confirm) {
        this.dataService.removeFromClub(this.playerModal.player.id).subscribe(res => {
          this.getTeams();
          this.closeModal();
        });
      }
    });
  }

  editTeam(team, template) {
    this.teamModal.team = team;
    this.openModal(template);
  }

  updateTeam() {
    if (!this.teamModal.team) {
      return;
    }
    let team = {
      name: this.teamModal.team.name,
      id: this.teamModal.team._id
    };
    this.dataService.updateTeam(team).subscribe(res => {
      this.getTeams();
      this.closeModal();
    });
  }

  deleteTeam() {
    if (!this.teamModal.team) {
      return;
    }
    const params = {
      title: 'Delete Team',
      message: 'Are you sure you want to delete this team?',
      cancelLabel: 'Back',
      confirmLabel: 'Confirm'
    };

    let confirmModal = this.modalService.show(ConfirmComponent, { initialState: params });
    confirmModal.content.onClose.subscribe(result => {
      if (result.confirm) {
        this.dataService.deleteTeam(this.teamModal.team._id).subscribe(res => {
          this.closeModal();
          this.getUsersWithoutTeam();
          this.getTeams();
        });
      }
    });
  }
}
