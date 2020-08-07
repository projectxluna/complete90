import { Component, OnInit, TemplateRef } from '@angular/core';
import { DataService } from '../../services';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'create-assignments',
  templateUrl: './create-assignments.component.html',
  styleUrls: ['./create-assignments.component.less']
})
export class CreateAssignmentsComponent implements OnInit {

  plans: any[];
  teams: any;
  players: any = [];

  modalRef: BsModalRef;
  modal = {
    page: 1,
    plan: null,
    selectedType: null,
    selectedTeam: null,
    selectedPlayer: null,
    startDate: new Date(),
    endDate: new Date()
  }

  constructor(private dataService: DataService, private modalService: BsModalService) {
    this.init();
  }
  init() {
    this.getSavedSessions();
    this.getTeams();
    this.modalService.onHidden.subscribe(() => {
      this.modal.page = 1;
      this.modal.plan = null;
      this.modal.selectedType = null;
      this.modal.selectedTeam = null;
      this.modal.selectedPlayer = null;
      this.modal.startDate = new Date()
      this.modal.endDate = new Date()
    });
    this.modal.endDate.setDate(new Date().getDate() + 4);
  }

  ngOnInit() {
  }

  getSavedSessions() {
    this.dataService.getSessions().subscribe(response => {
      const {plans, content} = response;
      this.plans = plans;
    });
  }

  closeModal() {
    this.modalRef.hide();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  setType(type) {
    this.modal.selectedType = type;
    this.modal.page = 2;
  }

  getTeams() {
    return new Promise((resolve, reject) => {
      this.dataService.getTeams().subscribe(res => {
        if (!res || !res.success) {
          return resolve();
        }
        this.teams = res.teams;
        this.players.length = 0;
        this.teams.forEach(team => {
          this.dataService.getPlayers(team._id).subscribe(res => {
            this.players.push(...res.players);
            resolve();
          });
        });
      });
    });
  }

  selectPlayer(player) {
    if (this.modal.selectedPlayer) {
      this.modal.selectedPlayer.active = !this.modal.selectedPlayer.active;
    }
    player.active = !player.active;
    this.modal.selectedPlayer = player;
  }

  continueToPage3() {
    if (!this.modal.selectedPlayer && !this.modal.selectedTeam) {
      return;
    }
    this.modal.page = 3;
  }

  selectTeam(team) {
      if (this.modal.selectedTeam) {
        this.modal.selectedTeam.active = !this.modal.selectedTeam.active;
      }
      team.active = !team.active;
      this.modal.selectedTeam = team;
  }

  done() {
    this.closeModal();
    this.init();
  }

  selectPlan(plan, template) {
    this.modal.plan = plan;
    this.getTeams().then(() => {
      this.openModal(template);
    });
  }

  reportRequestActive = false;
  selectedPlan;
  getReport(plan, template) {
    if (this.reportRequestActive) {
      return;
    }
    this.selectedPlan = plan;
    this.reportRequestActive = true;
    this.dataService.getAssignments(plan.id).subscribe(res => {
      plan.assignments = res.assignments;
      console.log(res);
      this.openModal(template);
      this.reportRequestActive = false;
    });
  }

  createAssignment() {
    let payload = {
      planId: this.modal.plan.id,
      startDate: this.modal.startDate.getTime(),
      endDate: this.modal.endDate.getTime(),
      forTeams: [this.modal.selectedTeam ? this.modal.selectedTeam._id : null],
      forPlayers: [this.modal.selectedPlayer ? this.modal.selectedPlayer.id : null]
    }
    this.dataService.createAssignment(payload).subscribe(res => {
      if (res.success) {
        this.modal.page = 4;
        setTimeout(() => {
          this.closeModal();
          this.init();
        }, 3000);
      }
    });
  }
}
