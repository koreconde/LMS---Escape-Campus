import { Injectable} from '@angular/core';


import { Storage } from '@ionic/storage';
import { ConfigService } from "./config";


@Injectable()
export class UpdatesService{  
	
	time:number;
	updates:any[]=[];
	readupdates:any[]=[];
	constructor(
		private config:ConfigService,
		private storage:Storage,
		){

	} 

	public getUpdates(){

		this.storage.get('updates').then(updates =>{
  			if(updates){
  				for(let i=0;i<updates.length;i++){
  					if(!this.matchObj(this.updates,updates[i])){
  						console.log(i);
  						this.updates.push(updates[i]);
  					}
  				}
  			}

  		});

		this.storage.get('readupdates').then(updates =>{
  			if(updates){
  				for(let i=0;i<updates.length;i++){
  					if(!this.matchObj(this.readupdates,updates[i])){
  						this.readupdates.push(updates[i]);
  					}
  				}
  			}
  		});

  		if(this.config.isLoggedIn){
  			this.storage.get('updates_'+this.config.user.id).then(updates =>{
	  			if(updates){
	  				for(let i=0;i<updates.length;i++){
	  					if(!this.matchObj(this.updates,updates[i])){
	  						this.updates.push(updates[i]);
	  					}
	  				}
	  			}
	  		});
  		}
	}
	public isRead(update:any){
		if(this.readupdates.length){
			return this.matchObj(this.readupdates,update);
		} 
		return false;
	}

	public getUnreadupdates(){
		let updates:any[]=[];

		for(let i=0;i<this.updates.length;i++){
			if(!this.readupdates.indexOf(this.updates[i])){
				updates.push(this.updates[i]);
			}	
		}
		return updates;
	}


	private markRead(update){
		if(this.readupdates.length){
			this.readupdates.push(update);
			this.storage.set('readupdates',this.readupdates);
		}else{
			this.storage.get('readupdates').then(updates =>{
	  			if(updates){
	  				for(let i=0;i<updates.length;i++){
	  					this.readupdates.push(updates[i]);
	  				}
	  			}
	  			this.readupdates.push(update);
	  			this.storage.set('readupdates',this.readupdates);
	  		});	
		}

		this.config.unread_notifications_count--;
		if(this.config.unread_notifications_count<0){this.config.unread_notifications_count=0;}

		console.log(this.readupdates);
		console.log(this.updates);
	}

	private markUnread(update){
		if(this.readupdates.length){
			let k = this.readupdates.indexOf(update);
			this.readupdates.splice(k,1);
			this.storage.set('readupdates',this.readupdates);
		}else{
			this.storage.get('readupdates').then(updates =>{
	  			if(updates){
	  				for(let i=0;i<updates.length;i++){
	  					this.readupdates.push(updates[i]);
	  				}
	  			}
	  			let k = this.readupdates.indexOf(update);
				this.readupdates.splice(k,1);
	  			this.storage.set('readupdates',this.readupdates);
	  		});	
		}
		this.config.unread_notifications_count++;
	}


	private matchObj(big:any,small:any){

		for(let i=0;i<big.length;i++){
			if(big[i].time == small.time && big[i].content == small.content){
				return true;
			}
		}
		return false;
	}
		

}