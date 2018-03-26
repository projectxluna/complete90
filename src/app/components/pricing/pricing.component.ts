import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {

  isYearly = true;
  playerPrice = '240.00';
  coachPrice = '300.00';
  plans = {};

  constructor(private dataService: DataService,
    private router: Router) {
    this.dataService.getClient().subscribe((res) => {
      if (res) {
        this.processPlans(res.plans);
      }
    });
  }

  ngOnInit() {
  }

  setCycle(cycle) {
    this.coachPrice = this.plans['coach-'+cycle].price || '300.0';
    this.playerPrice = this.plans['player-'+cycle].price || '240.0';
    
    this.isYearly = cycle === 'yearly';
  }

  processPlans(plans) {
    plans.forEach(f => {
      this.plans[f.id] = f;
    });
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