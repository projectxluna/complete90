import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-proAccount',
  templateUrl: './proAccount.component.html',
  styleUrls: ['./proAccount.component.css']
})
export class ProAccountComponent implements OnInit {

  isYearly = true;
  playerPrice;
  coachPrice;
  plans = {};
  isCoach = false;
  constructor(private dataService: DataService,
    private router: Router) {
    this.dataService.getClient().subscribe((res) => {
      if (res) {
        this.processPlans(res.plans);
        this.setCycle('monthly');
      }
    });
    this.dataService.getUserProfile().subscribe(me => {
      if (me && me.user && me.user.profiles) {
        this.hasCoachProfile(me.user.profiles);
      }
    });
  }

  hasCoachProfile(profiles) {
    let profile = profiles.find(profile => {
      return profile.type === 'MANAGER';
    });
    this.isCoach = profile ? true : false;
  }

  ngOnInit() {
  }

  setCycle(cycle) {
    this.coachPrice = this.plans['coach-'+cycle].price;
    this.playerPrice = this.plans['player-'+cycle].price;
    
    this.isYearly = cycle === 'yearly';
  }

  processPlans(plans) {
    plans.forEach(f => {
      this.plans[f.id] = f;
    });
    this.setCycle('yearly');
  }

  selectPlan(type) {
    let id = '';

    if (type && type === 'player' && this.isYearly) {
      id = 'player-yearly'
    } else if (type && type === 'coach' && this.isYearly) {
      id = 'coach-yearly';
    } else if (type && type === 'player' && !this.isYearly) {
      id = 'player-monthly';
    } else if (type && type === 'coach' && !this.isYearly) {
      id = 'coach-monthly';
    }

    this.router.navigate(['/paynow'], { queryParams: { id: id }});
  }
}
