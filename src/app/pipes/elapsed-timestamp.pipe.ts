import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'elapsedTimestamp'
})
export class ElapsedTimestampPipe implements PipeTransform {

  transform(time: any, args?: any): any {
    var h = 0, m = 0, s = 0;
    var newTime = '';
    let date = new Date(time);

    h = date.getHours();
    m = date.getMinutes();
    s = date.getSeconds();

    if (h > 0) {
      newTime += this.pad(h, 2) + ':';
    }
    newTime = this.pad(m, 2) + ':' + this.pad(s, 2);
    return newTime;
  }

  pad(num, size) {
    var s = "0000" + num;
    return s.substr(s.length - size);
  }
}
