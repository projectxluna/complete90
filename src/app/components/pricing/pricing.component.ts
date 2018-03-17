import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';

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

  constructor(private dataService: DataService) {
    this.dataService.getClient().subscribe((res) => {
      if (res) {
        this.processPlans(res.plans);
      }
    });
  }

  ngOnInit() {
  }

  setCycle(cycle) {
    if (cycle && cycle === 'yearly') {
      this.coachPrice = this.plans['coach-yearly'].price || '300.0';
      this.playerPrice = this.plans['player-yearly'].price || '240.0';

      this.isYearly = true;
    } else if (cycle && cycle === 'monthly') {
      this.coachPrice = this.plans['coach-monthly'].price || '34.99';
      this.playerPrice = this.plans['player-monthly'].price || '29.99';

      this.isYearly = false;
    }
  }

  processPlans(plans) {
    plans.forEach(f => {
      this.plans[f.id] = f;
    });
  }
}
