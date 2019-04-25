import { Component, OnInit, TemplateRef } from '@angular/core';
import { DataService } from '../../services';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

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
      this.selectTeam(this.teams[0]);
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

  generateTestData() {
    this.teams = [
      { 
        name: 'Team 1',
        active: true,
        players: [
          {
            name: 'ANTHONY JONES',
            position: 'GK',
            photoUrl: '',
            jersey: 10,
            rating: 60,
          },
          { name: 'MICHAEL BRADLEY', position: 'LM'},
          { name: 'ANTHONY JONES', position: 'LB'},
          { name: 'ANTHONY JONES', position: 'CM'},
          { name: 'Sadiq Awosanmi', position: 'GK'},
          { name: 'Sadiq Awosanmi', position: 'F'},
          { name: 'Sadiq Awosanmi', position: 'F'},
        ]
      },
      { 
        name: 'Team 2',
        players: [
          { name: 'ANTHONY JONES', position: 'LB'},
          { name: 'ANTHONY JONES', position: 'CM'},
          { name: 'Sadiq Awosanmi', position: 'GK'},
          { name: 'Sadiq Awosanmi', position: 'F'},
        ]
      }
    ];
  }
}
