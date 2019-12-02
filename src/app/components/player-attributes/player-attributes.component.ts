import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../../services';

@Component({
  selector: 'player-attributes',
  templateUrl: './player-attributes.component.html',
  styleUrls: ['./player-attributes.component.less']
})
export class PlayerAttributesComponent implements OnInit {

  team: any;
  clubId: any;

  individualAttributes: {
    overallRating: null,
    categories: [
      {
        name: 'Dribbling',
        value: number
      },
      {
        name: 'Control',
        value: number
      },
      {
        name: 'Passing',
        value: number
      },
      {
        name: 'Speed',
        value: number
      },
      {
        name: 'Strength',
        value: number
      },
      {
        name: 'Finishing',
        value: number
      }
    ]
  };

  clubAttributes: {
    overallRating: null,
    categories: [
      {
        name: 'Dribbling',
        value: number
      },
      {
        name: 'Control',
        value: number
      },
      {
        name: 'Passing',
        value: number
      },
      {
        name: 'Speed',
        value: number
      },
      {
        name: 'Strength',
        value: number
      },
      {
        name: 'Finishing',
        value: number
      }
    ]
  };

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
    dataService.getUserProfile().subscribe(res =>{
      if(!res || !res.success){
       console.log("error getting user profile"); 
      } else {
        this.clubId = res.club;
      }
    });
    if(this.clubId){
      console.log("getting average team attributes");
      dataService.getAverageTeamAttributes(this.clubId).subscribe(res => {
        if (!res || !res.success) return;
        let att = res.attributes;
  
        att.forEach(at => {
          let found = this.clubAttributes.categories.find(a => {
            return a.name === at.tag;
          });
          if (!found) return;
          found.value = (at.score/10) * 100;
          console.log(found.value);
        });
        console.log("got team attributes");
      }).then(function (){
        console.log("getting individual attributes");
        dataService.getPlayerAttributes().subscribe(res => {
          if (!res || !res.success) return;
          let att = res.attributes;
  
          att.forEach(at => {
            let found = this.individualAttributes.categories.find(a => {
              return a.name === at.tag;
            });
            if (!found) return;
            found.value = (at.score/10) * 100;
            console.log(found.value);
          });
          console.log("got individual attributes");
        })
      }).then(function (){
        this.individualAttributes.forEach(att => {
          let clubAtt = this.clubAttributes.categories.find(a => {
            return a.name === att.name;
          });

          let found = this.attributes.categories.find(a => {
            return a.name === att.name;
          });

          found.value = (att.value/clubAtt.value) * 100;
          console.log(found.value);

        });
      });

    } else {
      console.log("getting fallback individual attributes");
      dataService.getPlayerAttributes().subscribe(res => {
        if (!res || !res.success) return;
        let att = res.attributes;
  
        att.forEach(at => {
          let found = this.attributes.categories.find(a => {
            return a.name === at.tag;
          });
          if (!found) return;
          found.value = (at.score/10) * 100;
          console.log(found.value);
        });
      });
  
    }
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


