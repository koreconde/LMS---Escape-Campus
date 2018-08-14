import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ModalController,LoadingController } from 'ionic-angular';

import { User } from '../../models/user';

import { ProfilePage } from '../profile/profile';
import { SearchPage } from '../search/search';


import { InstructorPage } from '../instructor/instructor';

import { ConfigService } from '../../services/config';
import { UserService } from '../../services/users';

@Component({
  selector: 'page-instructors',
  templateUrl: 'instructors.html'
})
export class InstructorsPage implements OnInit{

	instructorPage=InstructorPage;
	profilePage=ProfilePage;
	title:string;
  	subtitle:string;
  	no_instructors:string;
  	instructors:any[]=[];
	noMoreInstructorsAvailable:boolean=true;


	isLoggedIn: boolean = false;
	userdata:any;
	user: User;
	
		

  	constructor(public navCtrl: NavController, 
  		public navParams: NavParams,
  		public config:ConfigService,
  		private userService:UserService,
  		private modalCtrl:ModalController,
      private loadingCtrl:LoadingController) {

  	}

  	

  	ngOnInit(){

      let loading = this.loadingCtrl.create({
            content: '<img src="assets/images/bubbles.svg">',
            duration: 15000,//this.config.get_translation('loadingresults'),
            spinner:'hide',
            showBackdrop:true,

        });

      loading.present();

      this.userService.getAllInstructors().subscribe(res=>{
          console.log(res);
          this.instructors = res;
          loading.dismiss();
      }); 

  		this.title = this.config.get_translation('instructors_page_title');
  		this.subtitle = this.config.get_translation('instructors_page_description');
  		this.no_instructors = this.config.get_translation('no_instructors');
  		

      if(this.config.isLoggedIn){
        this.userdata={'isLoggedIn':this.config.isLoggedIn,'User':this.config.user};
      }
  	}

  	doInfinite(){

  	}
  	ionViewDidLoad() {
    	console.log('ionViewDidLoad InstructorsPage');
  	}

  	openSearch(){
		let modal = this.modalCtrl.create(SearchPage);
    	modal.present();

	}

}
