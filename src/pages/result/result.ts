import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';

import { UserService } from '../../services/users';
import { ConfigService } from '../../services/config';
import 'rxjs/util/isNumeric';


@Component({ 
  selector: 'page-result',
  templateUrl: 'result.html',
})
export class ResultPage implements OnInit{

	result:any;
	fullresult:any[]=[];
  localresult:boolean=false;
  site_result:boolean=false;
  	constructor(
  		public navCtrl: NavController, 
  		public navParams: NavParams,
  		public config:ConfigService,
  		public userService:UserService,
      private loadingCtrl:LoadingController,
  		) {

  	}

  	ngOnInit(){

      let loading = this.loadingCtrl.create({
                      content: '<img src="assets/images/bubbles.svg">',
                      spinner:'hide',
                      showBackdrop:true,
                    });
      loading.present();
  		this.result = this.navParams.data;
      console.log(this.navParams.data);
      if('meta' in this.result && Array.isArray(this.result.meta.questions)){
        this.localresult = true;
        loading.dismiss();
        console.log(this.result.meta.questions);
      }else{
        console.log(this.result);
        this.userService.getResult(this.result).subscribe(site_fullresult=>{
          console.log('Full result');
          console.log(site_fullresult);
          if(site_fullresult){
            this.fullresult = site_fullresult;
            this.site_result = true;
            loading.dismiss();
          }
        });
      }
  	}


}
