import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { Platform } from 'ionic-angular';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { DatePipe } from '@angular/common';

import { Activity } from "../models/activity";
import { ActivityMeta } from "../models/activity";

import { AuthenticationService } from "./authentication";
import { ConfigService } from "./config";

import { Storage } from '@ionic/storage';


@Injectable()
export class ActivityService{  

	public user:any;
	public baseUrl:string;
	public token:string;
    public activity:any={};
	public activities:Activity[]=[];
    private lastpushed:number=0;
	private observable: Observable<any>; //Tracks request in progress

	constructor(
    	private http:Http,
    	private platform : Platform,
      	private storage: Storage,
      	private auth:AuthenticationService,
      	private config:ConfigService) {

		this.baseUrl = this.config.baseUrl; 
        if(this.config.isLoggedIn){
            this.storage.get('activity_'+this.config.user.id).then(ac=>{
                this.activities = ac;
            });
        }
	}


    addActivity(activity:any){
        
        this.activity['user_id']=activity['user_id'];
        this.activity['component'] = 'course';
        this.activity['type'] = activity['type'];
        this.activity['action'] = this.config.get_translation(activity['action']);
        if(!('content' in activity)){
            this.activity['content'] = this.config.get_translation(activity['action']+'_content');    
        }else{
            this.activity['content'] = activity.content;
        }
        

        this.activity.date_recorded = new Date().getTime();

        this.activities.push(this.activity);

        this.storage.set('activity_'+activity['user_id'],this.activities);
        
        if((this.lastpushed + this.config.settings.per_view < this.activities.length)){
            //time to push

            let opt = this.auth.getUserAuthorizationHeaders();
            let newactivities:any=[];
            for(let i=this.lastpushed;i<this.config.settings.per_view;i++){
                newactivities.push(this.activities)
            }
            let url = `${this.baseUrl}user/activity`;
            this.http.post(url,newactivities,opt).subscribe(res=>{
                this.lastpushed = this.activities.length;
                this.storage.set('recorded_activity_count_'+activity['user_id'],this.lastpushed);
            });
        }
    }

	getActivities(){
  
        return this.storage.get('activity_'+this.config.user.id);
    }

}
