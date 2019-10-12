import { Pipe, PipeTransform } from '@angular/core';
import { async } from '@angular/core/testing';

@Pipe({
  name: 'fresh'
})
export class FreshPipe implements PipeTransform {

  transform(employees$ : any, term: string): any {
    // check if search term is undefined
    if (term === undefined) return employees$;
    // return updated users array
    return employees$.filter(function(employee){
      return employee.firstName.toLowerCase().includes(term.toLowerCase());
  })
}
}
