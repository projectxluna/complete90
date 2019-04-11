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
    this.fetchLeaderBoard();
  }

  ngOnInit() {
  }

  generateTestData() {
    this.categories = [
      { 
        name: 'Weekly',
        active: true,
        filter: 86400 * 7
      },
      { 
        name: 'Monthly',
        active: false,
        filter: 86400 * 31
      },
      { 
        name: 'All Time',
        active: false,
        filter: 0
      },
      { 
        name: 'My Club',
        active: false,
      },
    ];
  }

  fetchLeaderBoard(timestamp = undefined) {
    if (!timestamp) timestamp = 86400 * 7; // Default to last 7 days

    this.dataService.getLeaderBoard(timestamp).subscribe(response => {
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
