import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service'

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
    this.fetchLeaderBoard(this.categories[0].filter);
  }

  ngOnInit() {
  }

  generateTestData() {
    this.categories = [
      { 
        name: 'Weekly',
        active: true,
        filter: {
          timestamp: 1000 * 60 * 60 * 24 * 7,
        }
      },
      { 
        name: 'Monthly',
        active: false,
        filter: {
          timestamp: 1000 * 60 * 60 * 24 * 30,
        }
      },
      { 
        name: 'All Time',
        active: false,
        filter: {
          timestamp: 0,
        }
      },
      { 
        name: 'My Club',
        active: false,
        filter: {
          club: true
        }
      },
    ];
  }

  fetchLeaderBoard(filter) {
    this.dataService.getLeaderBoard(filter.timestamp, filter.club).subscribe(response => {
      this.players.length = 0;
      this.players = response.leaderboard || [];
      this.players.sort((a, b) => {
        return b.watchedTotal - a.watchedTotal;
      })
    });
  }

  changeTab(category) {
    if (!category) return;
    category.active = !category.active;
    this.fetchLeaderBoard(category.filter);
  }
}
