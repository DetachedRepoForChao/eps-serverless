import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pointItem'
})
export class PointItemPipe implements PipeTransform {

  transform(pointItems: any, term: string): any {
    // check if search term is undefined
    if (term === undefined) { return pointItems; }
    // return updated pointItems array
    return pointItems.filter(function(item) {
      return item.name.toLowerCase().includes(term.toLowerCase()) ||
        item.amount.toString().toLowerCase().includes(term.toLowerCase());
    });
  }

}
