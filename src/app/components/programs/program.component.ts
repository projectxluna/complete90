import { Component, OnInit } from '@angular/core';
declare var jQuery: any;

@Component({
  selector: 'app-training',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.css']
})
export class ProgramComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    jQuery(document).ready(function(){
      jQuery(".expand").on("click", function(){
        if(jQuery(this).hasClass("expanded")){
          jQuery(this).find("span").text("+");
          jQuery(this).removeClass("expanded");
        } else {
          jQuery(this).find("span").text("-");
          jQuery(this).addClass("expanded");
        }
        jQuery(this).next("div.desc").slideToggle();
        
      });
    });
  }

}
