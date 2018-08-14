import { Injectable,OnInit } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';


import { Course } from "../models/course";
import { CourseStatus } from "../models/status";

import { AuthenticationService } from "./authentication";
import { ConfigService } from "./config";
import { UserService } from "./users";
import { ActivityService } from "./activity";
import { Storage } from '@ionic/storage';


@Injectable()
export class CourseStatusService {  

    cacheGroup:string='course_status';
    token:string;
    lastCourse: any;
    courseStatuses: CourseStatus[] =[];
    private observable: Observable<any>; //Tracks request in progress
    private statusobservable: Observable<any>;
    private quizobservable: Observable<any>;
    private retakeobservable: Observable<any>;
    private baseUrl;
    constructor(private http:Http,
        private auth: AuthenticationService,
        private storage: Storage,
        private config:ConfigService,
        private userService:UserService,
        private activityService:ActivityService) {
         
         this.baseUrl = this.config.baseUrl;
    }

    ngOnInit(){
        this.token = this.auth.getAccessToken();

        
    }

    
    getCourseStatus(status:CourseStatus){
        
        let statuses = this.config.trackComponents('course_status');

        console.log(status.course_id);
         if(typeof statuses != 'undefined' && statuses.length && statuses.indexOf(status.course_id) > -1){
            this.observable = Observable.fromPromise(this.storage.get('coursestatus_'+status.course_id+'_'+status.user_id).then(
                coursestatus=>{
                    console.log(coursestatus);
                this.courseStatuses.push(coursestatus);
                return coursestatus;
            }));
        }else{ 

            let url = `${this.baseUrl}user/coursestatus/`+status.course_id;
            let cacheKey = url;

            /*
            if(this.observable) {
                console.log('request pending');
                return this.observable;
            }else{
            */
                let k = this.courseStatuses.length;

                let coursestatus = <CourseStatus>{};
                coursestatus['course_id'] = status.course_id;
                coursestatus['user_id'] = status.user_id;
                coursestatus['progress'] = status.progress;
                coursestatus['status'] = status.status;
                let opt = this.auth.getUserAuthorizationHeaders();

                return this.http.get(url,opt)
                    .map(response =>{
                        this.observable = null;                    
                        if(response.status == 400) {
                          return "FAILURE";
                        } else if(response.status == 200) {
                            let body = response.json();
                            if(body){ 
                                coursestatus['courseitems'] = body['courseitems'];
                                coursestatus['current_unit_key'] = body['current_unit_key'];
                                this.courseStatuses.push(coursestatus);
                              
                                let temp_course_items:any=[];
                                temp_course_items = JSON.parse(JSON.stringify(coursestatus));
                                for(let i=0;i<temp_course_items.courseitems.length;i++){
                                    if(temp_course_items.courseitems[i].meta && !temp_course_items.courseitems[i].meta.access){
                                        temp_course_items.courseitems[i].content = '';
                                    }
                                }
                                this.updateCourseStatus(temp_course_items);
                                this.config.addToTracker('course_status',coursestatus.course_id);
                                return coursestatus;
                            }
                        }
                });
            //}
        }
        return this.observable;
    }

    getCourseStatusItem(status:CourseStatus,index:number){
        
        let statusitems = this.config.trackComponents('statusitems');

        var flag = false;

        if(typeof statusitems != 'undefined' && statusitems.length && statusitems.indexOf(status.courseitems[index].id) > -1){
            
            
                
            if(this.courseStatuses.length && ("course_id" in status)){
                console.log('found in live status');

                for(let i=0;i<this.courseStatuses.length;i++){
                    if(this.courseStatuses[i].course_id == status.course_id && 
                        this.courseStatuses[i].user_id == status.user_id && ((this.courseStatuses[i].courseitems[index].content && this.courseStatuses[i].courseitems[index].content.length) || (this.courseStatuses[i].courseitems[index].meta.iframes && this.courseStatuses[i].courseitems[index].meta.iframes.length) || (this.courseStatuses[i].courseitems[index].meta.video && this.courseStatuses[i].courseitems[index].meta.video.length) ) && this.courseStatuses[i].courseitems[index].meta.access){
                        return Observable.of(this.courseStatuses[i]); //return if already cached
                    }
                }
                flag = true;
            }

            if(flag){
                this.statusobservable = Observable.fromPromise(this.storage.get('coursestatus_'+status.course_id+'_'+status.user_id).then((coursestatus) => {
                    console.log(coursestatus);
                    if(coursestatus){
                        if((coursestatus.courseitems[index].content.length || (coursestatus.courseitems[index].meta.iframes && coursestatus.courseitems[index].meta.iframes.length) || (coursestatus.courseitems[index].meta.video && coursestatus.courseitems[index].meta.video.length) ) && coursestatus.courseitems[index].meta.access){
                           
                            this.courseStatuses.push(coursestatus);
                            return coursestatus;
                        }else{
                            //Contingency fix
                            this.config.removeFromTracker('statusitems',status.courseitems[index].id);
                        }
                    }
                    
                }));
            };
            
        }else{
            console.log('making http call');
            let url = `${this.baseUrl}user/coursestatus/`+status.course_id+`/item/`+status.courseitems[index].id;
            //let cacheKey = url;

            

                let k = this.courseStatuses.length;

                let coursestatus = <CourseStatus>{};
                coursestatus['course_id'] = status.course_id;
                coursestatus['user_id'] = status.user_id;
                coursestatus['progress'] = status.progress;
                coursestatus['courseitems'] = status.courseitems;
                coursestatus['status'] = status.status;
                
                let opt = this.auth.getUserAuthorizationHeaders();

                this.statusobservable =  this.http.get(url,opt)
                    .map(response =>{
                        this.statusobservable = null;                    
                        if(response.status == 400) {
                          return "FAILURE";
                        } else if(response.status == 200) {
                            let body = response.json();
                            if(body && (body['content'] || body['meta']['iframes'] || body['meta']['video'])){ 

                                coursestatus.courseitems[index].content = body['content'];
                                coursestatus.courseitems[index].meta = body['meta'];

                                

                                //Update Stored value in RunTime only when Access enabled
                                if(coursestatus.courseitems[index].meta.access){
                                    console.log('store');
                                    //Update Course status in the Course service.
                                    this.activityService.addActivity({
                                      'user_id':coursestatus.user_id,
                                      'type':'unit_complete',
                                      'action':'unit_complete',
                                      'item_id':coursestatus.course_id,
                                      'secondary_item_id':coursestatus.courseitems[index].id,
                                    });
                                    coursestatus.courseitems[index].status=1;
                                    this.updateCourseStatus(coursestatus);
                                    this.config.addToTracker('statusitems',coursestatus.courseitems[index].id);    
                                    //Async Post call to update course progress.
                                    this.http.post(`${this.baseUrl}updatecourse/progress/`,{'course':coursestatus.course_id,'progress':coursestatus.progress},opt);
                                }
                               
                                return coursestatus;
                            }
                        }
                });
           // }
        }
        return this.statusobservable;
    }


    saveQuiz(quiz:any,user:any){
        this.storage.set('saved_quiz_'+user.id+'_'+quiz.id,quiz);
    }

    submitQuiz(status:any,index:any){ 


        console.log('sengin http request');
        let opt = this.auth.getUserAuthorizationHeaders();
        console.log(status.courseitems[index]);

        let url = `${this.baseUrl}user/submitresult/`;
        console.log(url);
        this.http.post(url,
            {'quiz_id':status.courseitems[index].id,
            'course_id':status.course_id,
            'results':status.courseitems[index].meta.questions},
            opt)
        .subscribe(res=>{
            console.log(res);
            this.activityService.addActivity({
              'user_id':status.user_id,
              'type':'save_quiz',
              'action':'save_quiz',
              'item_id':status.course_id,
              'secondary_item_id':status.courseitems[index].id,
            });
            this.userService.addResult(status.courseitems[index]);
        });

        this.storage.get('dashboardCharts_Quiz_'+this.config.user.id).then(res=>{
            if(!res){
                res = {'labels':[],'data':[]};
            }
            res.labels.push(status.courseitems[index].title);
            res.data.push(status.courseitems[index].marks)
            this.storage.set('dashboardCharts_Quiz_'+this.config.user.id,res);
        });
    }

    retakeQuizService(status:CourseStatus,index:number){
        console.log('in retakeQuizService');
        console.log(status);
        if(status && status.courseitems && status.courseitems[index].id && status.courseitems[index].type=='quiz'){
            console.log('making http call');

            let url2 = `${this.baseUrl}user/coursestatus/`+status.course_id+`/retake_quiz/`+status.courseitems[index].id;
            
            
            let opt = this.auth.getUserAuthorizationHeaders();

            return this.retakeobservable =  this.http.get(url2,opt)
                .map(response =>{
                    if(response.status == 400) {
                      return "FAILURE";
                    } else if(response.status == 200) {
                        let body = response.json();
                        /*body = {
                            status:
                            message:
                            retakes:
                        }*/
                        console.log(body);
                        if(body){ 
                            /*this.config.addToTracker('statusitems',status.courseitems[index].id);    
                            //Async Post call to update course progress.
                            this.http.post(`${this.baseUrl}updatecourse/progress/`,{'course':status.course_id,'progress':coursestatus.progress},opt);*/
                            return body;
                        }
                    }
            });
        }
       
    }

    updateCourseStatus(coursestatus){
        console.log('22222');
        console.log(coursestatus);
        if(this.courseStatuses.length){
                for(let i=0;i<this.courseStatuses.length;i++){
                    if(this.courseStatuses[i].course_id == coursestatus.course_id && 
                        this.courseStatuses[i].user_id == coursestatus.user_id ){
                        this.courseStatuses[i].progress=coursestatus.progress;
                }
            }
        }
        this.storage.get('coursestatus_'+coursestatus.course_id+'_'+coursestatus.user_id).then(cs=>{
            if(cs){
                cs.progress = coursestatus.progress;
                for(let i=0;i< cs.courseitems.length;i++){
                    if(cs.courseitems[i].id == coursestatus.courseitems[i].id){
                        if(coursestatus.courseitems[i].meta.access && (coursestatus.courseitems[i].content.length > 6 || (coursestatus.courseitems[i].meta.iframes && coursestatus.courseitems[i].meta.iframes.length) || (coursestatus.courseitems[i].meta.video && coursestatus.courseitems[i].meta.video.length) )){
                            console.log('this should not be');
                            cs.courseitems[i]=coursestatus.courseitems[i];
                        }
                    }
                }
                this.storage.set('coursestatus_'+coursestatus.course_id+'_'+coursestatus.user_id,cs);
            }else{
                this.storage.set('coursestatus_'+coursestatus.course_id+'_'+coursestatus.user_id,coursestatus);
            }
        });
    }
    
    finishCourse(coursestatus){

        if(this.courseStatuses.length){
                for(let i=0;i<this.courseStatuses.length;i++){
                    if(this.courseStatuses[i].course_id == coursestatus.course_id && 
                        this.courseStatuses[i].user_id == coursestatus.user_id ){
                        this.courseStatuses[i]=coursestatus;
                }
            }
        }
        this.storage.set('coursestatus_'+coursestatus.course_id+'_'+coursestatus.user_id,coursestatus);
        this.activityService.addActivity({
          'user_id':coursestatus.user_id,
          'type':'submit_course',
          'action':'submit_course',
          'item_id':coursestatus.course_id,
        });

        let opt = this.auth.getUserAuthorizationHeaders();
        this.storage.remove('profile_'+coursestatus.user_id);

        return this.http.post(`${this.baseUrl}user/finishcourse/`,coursestatus,opt).map(response=>{
            if(response){
                if(response.status == 200) {
                    let body = response.json();
                    return body;
                }
            }
        });
    }


    markUnitComplete(coursestatus:any,unit:any){

        this.activityService.addActivity({
            'user_id':coursestatus.user_id,
            'primary_id':coursestatus.course_id,
            'secondary_item_id':unit.id,
            'type':'unit_complete',
            'action':'unit_completed',
            'content':'unit_completed',

        });
        this.updateCourseStatus(coursestatus);

        if('profile' in this.userService){
            
            if(this.userService.profile.data){
               
                if(Array.isArray(this.userService.profile.data['courses'])){
                   
                    for(let k=0;k<this.userService.profile.data['courses'].length;k++){
                        if( this.userService.profile.data['courses'][k].id == coursestatus.course_id){

                            this.userService.profile.data['courses'][k].user_progress = coursestatus.progress;
                        }
                    }
                }
            }
        }
    }
}