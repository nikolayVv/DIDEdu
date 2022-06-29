import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentage'
})
export class PercentagePipe implements PipeTransform {

  transform(value: number, maxValue: number): string {
    return ((100 * value) / maxValue).toFixed(2) + " %";
  }

}
