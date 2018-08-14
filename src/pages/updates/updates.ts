import { Component, OnInit } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { ConfigService } from '../../services/config';
import { UpdatesService } from '../../services/updates';
import { OrderPipe } from '../../pipes/orderby';
@Component({
  selector: 'page-updates',
  templateUrl: 'updates.html',
})
export class UpdatesPage implements OnInit {


  	constructor(
  		private config:ConfigService,
  		private viewCtrl:ViewController,
  		private updatesService:UpdatesService,
  		) {}

  	ngOnInit(){
  		this.updatesService.getUpdates();
  	}

  	onClose(){
  		this.viewCtrl.dismiss();
  	}
  	
  	gettimediff(time:number){
  		return ((Math.floor(new Date().getTime() / 1000)) - time);
  	}

    doRefresh(refresher:any){
      this.config.getTracker();
      this.updatesService.getUpdates();
      setTimeout(function(){
        refresher.complete();
      },1000);
    }
}
