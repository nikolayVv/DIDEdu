import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'htmlNewLine'
})
export class HtmlNewLinePipe implements PipeTransform {

  transform(value: string): string {
    return value.replace(/\n/g, '<br>');
  }

}
