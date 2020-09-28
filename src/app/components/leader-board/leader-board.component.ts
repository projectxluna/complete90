import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
declare var jQuery: any;

@Component({
  selector: 'leader-board',
  templateUrl: './leader-board.component.html',
  styleUrls: ['./leader-board.component.less']
})
export class LeaderBoardComponent implements OnInit {

  categories: any = [];
  players: any = [];

  constructor(private dataService: DataService) {
    this.generateTestData();
    this.fetchLeaderBoard(this.categories[0]);
  }

  ngOnInit() {
    setTimeout(function(){
      jQuery(document).find(".blurred_content .tab-content").attr("style", "filter: blur(5px);");
    },100);
  }

  generateTestData() {
    this.categories = [
      { 
        name: 'Weekly',
        type: 'weekly',
        active: true,
      },
      { 
        name: 'Monthly',
        type: 'monthly',
        active: false,
      },
      { 
        name: 'All Time',
        type: 'alltime',
        active: false,
      },
      { 
        name: 'My Club',
        type: 'myclub',
        active: false,
      },
    ];
  }

  fetchLeaderBoard(category) {
    this.dataService.getLeaderBoard(category.type).subscribe(response => {
      this.players.length = 0;
      this.players = response.leaderboard || [];
    });
  }

  changeTab(category) {
    if (!category) return;
    category.active = !category.active;
    this.fetchLeaderBoard(category);
  }
}
