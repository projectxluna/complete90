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
        jQuery(this).closest("div").find(".rate").slideToggle();
      });
    });
  }

}
