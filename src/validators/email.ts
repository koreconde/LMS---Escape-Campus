import { FormControl } from '@angular/forms';

import { AuthenticationService } from '../services/authentication';

export class EmailValidator {
   
  static auth: AuthenticationService;
  constructor(public auth:AuthenticationService){
    EmailValidator.auth = auth;
  }

  static checkEmail(control: FormControl): any {
 
    return new Promise(resolve => {

      EmailValidator.auth.checkEmailAvailability(control.value).then((answer) => {
        
        
        if(answer['status'] == false) {
          resolve({
            "emailTaken": true
          });
        }
        else {
          resolve(null);
        }

      }, (error) => {
        console.log("server problem");
        resolve({
            "ServerUnavailable": true
        });
      });

    });
  }
 
}

