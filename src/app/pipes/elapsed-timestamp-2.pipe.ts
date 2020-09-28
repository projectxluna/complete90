import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'elapsedTimestampHumanReadable'
})
export class ElapsedTimestampPipe2 implements PipeTransform {

  transform(millisec: number, args?: any): any {
    var seconds = (millisec / 1000);

    var minutes = (millisec / (1000 * 60));

    var hours = (millisec / (1000 * 60 * 60));

    var days = (millisec / (1000 * 60 * 60 * 24));

    if (seconds < 60) {
      return seconds.toFixed(1) + " Sec";
    } else if (minutes < 60) {
      return minutes.toFixed(1) + " Min";
    } else if (hours < 24) {
      return hours.toFixed(1) + " Hrs";
    } else {
      return days.toFixed(1) + " Days"
    }
  }
}
