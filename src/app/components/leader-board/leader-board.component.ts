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

  getWeeklyRange() {
    let currentDate = new Date(); // current date of week

    let currentWeekDay = currentDate.getDay();
    let lessDays = (currentWeekDay == 0) ? 6 : currentWeekDay - 1;

    let startDate = new Date(new Date(currentDate).setDate(currentDate.getDate() - lessDays));
    startDate.setUTCHours(0, 0, 0, 0);

    let endDate = new Date(new Date(startDate).setDate(startDate.getDate() + 6));
    endDate.setUTCHours(0, 0, 0, 0);

    return {
      startDate: startDate.getTime(),
      endDate: endDate.getTime()
    };
  }

  getMonthRange() {
    let currentDate = new Date();

    let startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    startDate.setUTCHours(0, 0, 0, 0);

    let endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    endDate.setUTCHours(0, 0, 0, 0);

    return {
      startDate: startDate.getTime(),
      endDate: endDate.getTime()
    };
  }

  getAllTimeRange() {
    let startDate = new Date(0);
    startDate.setUTCHours(0, 0, 0, 0);

    let endDate = new Date();
    endDate.setUTCHours(0, 0, 0, 0);

    return {
      startDate: startDate.getTime(),
      endDate: endDate.getTime()
    };
  }

  generateTestData() {
    this.categories = [
      { 
        name: 'Weekly',
        active: true,
        filter: this.getWeeklyRange()
      },
      { 
        name: 'Monthly',
        active: false,
        filter: this.getMonthRange()
      },
      { 
        name: 'All Time',
        active: false,
        filter: this.getAllTimeRange()
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

  loading: boolean = false;

  fetchLeaderBoard(filter) {
    if (this.loading) {
      return;
    }
    this.loading = true;

    this.dataService.getLeaderBoard(filter).subscribe(response => {
      this.loading = false;
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
