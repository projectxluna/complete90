import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';
declare var jQuery: any;

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {

  isYearly = false;
  playerPrice;
  coachPrice;
  plans = {};
  isCoach = false;
  planType = 'pro';
  isTrial = '';
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
    jQuery(document).ready(function(){
      jQuery('.owl-carousel-summer').owlCarousel({
        responsiveClass:true,
        margin:10,
        responsive:{
            0:{
                items:3,
                nav:true
            },
            600:{
                items:3,
                nav:false
            },
            1000:{
                items:3,
                nav:true,
                loop:false
            }
        }
      });

      jQuery('.owl-carousel-testimoniels').owlCarousel({
        responsiveClass:true,
        margin:10,
        responsive:{
            0:{
                items:1,
                nav:true
            },
            600:{
                items:1,
                nav:false
            },
            1000:{
                items:2,
                nav:true,
                loop:false
            }
        }
      });
    });
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
    this.setCycle('monthly');
  }

  setTrial(plan) {
    this.planType = plan;
    this.isTrial = '-trial';
  }

  onChange(t) {
    console.log(this.planType);
  }

  selectPlan(type) {
    let id = '';

    if (type && type === 'player' && this.isYearly) {
      id = 'player-yearly'
    } else if (type && type === 'coach' && this.isYearly) {
      id = 'coach-yearly';
    } else if (type && type === 'player' && !this.isYearly) {
      id = 'player-monthly-' + this.planType + this.isTrial;
    } else if (type && type === 'coach' && !this.isYearly) {
      id = 'coach-monthly-' + this.planType + this.isTrial;
    }

    this.router.navigate(['/paynow'], { queryParams: { id: id }});
  }
}
