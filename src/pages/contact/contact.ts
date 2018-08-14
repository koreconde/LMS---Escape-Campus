import { Component } from '@angular/core';
import { ToastController, ModalController} from 'ionic-angular';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';

import { ConfigService } from '../../services/config';
import { UserService } from '../../services/users';

import { ProfilePage } from '../profile/profile';
import { SearchPage } from '../search/search';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

	contact:FormGroup;
	profilePage=ProfilePage;
	userdata:any;
    constructor(public config: ConfigService,
    	private formBuilder: FormBuilder,
    	private toastCtrl:ToastController,
    	private modalCtrl:ModalController, 
    	private userService:UserService) {

    	////Validators.pattern(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)
    	///
    	this.contact = formBuilder.group({
        	name: ['', Validators.required],
        	email: ['', Validators.required],
        	message: ['', Validators.required],
		});

		if(this.config.isLoggedIn){
            this.userdata={'isLoggedIn':this.config.isLoggedIn,'User':this.config.user};    
        }
    }

    logForm(){
	    console.log(this.contact.value);
	    this.userService.contact(this.contact.value).subscribe(res=>{
	    	if(res){
	    		let toast = this.toastCtrl.create({
	                message: res.message,
	                duration: 1000,
	                position: 'bottom'
	            });
	            
	            toast.present();
	    	}	
	    });
	}

	openSearch(){
        let modal = this.modalCtrl.create(SearchPage);
        modal.present();
    }
}
