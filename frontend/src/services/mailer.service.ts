import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from './../environments/environment';

@Injectable({
   providedIn: 'root'
})
export class MailerService {

   url = environment.api_lsmailsender;

   constructor(private http: HttpClient, private router: Router) {
   }

   send(data): Promise<any> {
      return this.http.post(this.url, JSON.stringify(data)).toPromise()
      .then( r => {
         return r;
      }).catch( error => { console.log(error); });
   }
}
