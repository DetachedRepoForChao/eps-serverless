import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fresh'
})
export class FreshPipe implements PipeTransform {

  transform(users: any, term: any): any {
    // check if search term is undefined
    if (term === undefined) return users;
    // return updated users array
    return users.filter(function(user){
      return user.name.toLowerCase().includes(term.toLowerCase());
  })
}
}
