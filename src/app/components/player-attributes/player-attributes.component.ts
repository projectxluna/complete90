import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../../services';

@Component({
  selector: 'player-attributes',
  templateUrl: './player-attributes.component.html',
  styleUrls: ['./player-attributes.component.less']
})
export class PlayerAttributesComponent implements OnInit {

  @Input() attributes = {
    overallRating: null,
    categories: [
      {
        name: 'Dribbling',
        value: 0
      },
      {
        name: 'Control',
        value: 0
      },
      {
        name: 'Passing',
        value: 0
      },
      {
        name: 'Speed',
        value: 0
      },
      {
        name: 'Strength',
        value: 0
      },
      {
        name: 'Finishing',
        value: 0
      }
    ]
  }
  constructor(dataService: DataService) {
    dataService.getPlayerAttributes().subscribe(res => {
      if (!res || !res.success) return;
      let att = res.attributes;

      att.forEach(at => {
        let found = this.attributes.categories.find(a => {
          return a.name === at.tag;
        });
        if (!found) return;
        found.value = (at.score/10) * 100;
      });

    });
  }

  ngOnInit() {
  }

  getType(item) {
    if (!item) {
      return 'info'
    }
    if (item.value < 30) {
      return 'warning'
    } else if (item.value >= 30 && item.value < 60) {
      return 'info'
    } else {
      return 'success'
    }
  }
}
