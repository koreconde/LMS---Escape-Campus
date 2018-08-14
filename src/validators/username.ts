import { FormControl } from '@angular/forms';
 
import { AuthenticationService } from '../services/authentication';

export class UsernameValidator {
   
  static auth: AuthenticationService;
  constructor(public auth:AuthenticationService){
    UsernameValidator.auth = auth;
  }

  static checkUserName(control: FormControl): any {
 
    return new Promise(resolve => {

      UsernameValidator.auth.checkUsernameAvailability(control.value).then((answer) => {
      
      
        if(answer['status'] == false) {
          resolve({
            "usernameTaken": true
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