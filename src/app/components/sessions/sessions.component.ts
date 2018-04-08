import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.css']
})
export class SessionsComponent implements OnInit {

  constructor(private dataService: DataService) {
    dataService.getSessions().subscribe((response) => {
      if (response.success) {
        console.log(response.sessions);
      }
    });
  }

  ngOnInit() {
  }

}
