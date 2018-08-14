import { Injectable} from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { CacheService } from "ionic-cache";
import { ToastController} from 'ionic-angular';

import { User } from "../models/user";
import { Profile } from "../models/user";
import { Dashboard } from "../models/user";
import { UserStats } from "../models/user";
//import { Transfer, TransferObject, FileUploadResult } from '@ionic-native/transfer';

import { ActivityService } from "./activity";
import { AuthenticationService } from "./authentication";

import { Storage } from '@ionic/storage';
import { ConfigService } from "./config";

@Injectable()
export class UserService{  
 
    instructors:User[]=[];
    user: User;
    profile: Profile;
    dashboard: Dashboard;
    userstats: UserStats;
    token:string;
    instructor:any[]=[];
    results:any[]=[];
    saved_results:any[]=[];
    res2:any;
    reviews:any[]=[];
    progress:number[]=[];
    isloggedin: boolean=false;
    //file_transfer: TransferObject = this.transfer.create();

    profileTabPaged:number[]=[];
    private observable: Observable<any>;
    private tabobservable: Observable<any>[]=[]; //Tracks request in progress
    private instructorObservable:Observable<any>; //Tracks request in progress
    private resultObservable: Observable<any>; //Tracks request in progress
    private reviewObservable: Observable<any>; //Tracks request in progress
    private quizchartObservable: Observable<any>;
    private coursechartObservable: Observable<any>;
    
    private baseUrl:string;

    constructor(private http:Http,
        private auth: AuthenticationService,
        private storage: Storage,
        private config:ConfigService,
        private toastCtrl:ToastController,
        private activityService:ActivityService,
        ) {
         
         this.baseUrl = this.config.baseUrl;

        this.token = this.auth.getAccessToken();
        if(this.token){
            this.isloggedin = true;
            this.auth.getUser().subscribe(res=>{
                this.user = res; 
            });
        }
    }


    public isUserLoggedIn(){
        console.log('Inside loggedin');
      return this.isloggedin;
    }


    

    public getUserAvatar(){

        if(this.user){ 
            console.log('gotcha');
            return Observable.of(this.user.avatar);
        }else{
            this.token = this.auth.getAccessToken();
            if(this.token){
                this.auth.getUser().subscribe(res=>{
                    this.user = res;  
                    return this.user.avatar;
                  });
            }
        }
    }


    public getProfile(user_id){

        let loadedprofile = this.config.trackComponents('profile');
        if(loadedprofile){
            return Observable.fromPromise(this.storage.get('profile').then((profile) => {
                
                this.profile=profile;
                return this.profile;
            }));
        }else{
            let opt = this.auth.getUserAuthorizationHeaders();
            this.observable =  this.http.get(`${this.baseUrl}user/profile`,opt)
                .map(response =>{
                    this.observable = null;                    
                    if(response.status == 400) {
                      return "FAILURE";
                    } else if(response.status == 200) {

                        let body = response.json();
                        if(body){ 
                            this.profile = body;
                            this.storage.set('profile',this.profile);
                            this.config.updateComponents('profile',1);
                            return body;
                        }
                    }
                });

            return this.observable;    
        }
    }


    public getProfileTab(user_id:any,key:string,force:boolean=false){
        
        let loadedtabs = this.config.trackComponents('profiletabs');

        if(loadedtabs && loadedtabs.indexOf(key) == -1 || force){

            if(this.tabobservable[key]) {
                return this.tabobservable[key];
            }else{

                this.profileTabPaged[key]=1;
                let opt = this.auth.getUserAuthorizationHeaders();
                let url = `${this.baseUrl}user/profile/?tab=`+key+`&per_page=`+this.config.settings.per_view+`&paged=`+this.profileTabPaged[key];

                this.tabobservable[key] =  this.http.get(url,opt)
                    .map(response =>{
                        this.tabobservable[key] = null;                    
                        if(response.status == 400) {
                          return "FAILURE";
                        } else if(response.status == 200) {
                            let body = response.json();
                            console.log(key);
                            if(body){ 
                                this.storage.set(key+'_'+user_id,body);
                                if(key == 'activity'){
                                    this.activityService.getActivities();
                                    
                                }
                                if(key == 'results'){
                                    this.getResults();
                                }

                                this.profile.data[key] = body;
                                
                                this.config.addToTracker('profiletabs',key);
                                return body;
                            }
                        }
                    });    
                return this.tabobservable[key];    
            }
        }else{
            
            if(this.profile && this.profile.data[key]){

                return Observable.of(this.profile.data[key]);
            }else{
                if(!this.user){
                    this.user = this.config.track.user;
                }
                return Observable.fromPromise(this.storage.get(key+'_'+this.user.id).then((profiletab) => {
                    console.log('fetching '+key+' from local');
                    this.profile.data[key] = profiletab;
                    return profiletab;
                }));
            }
        }

        
    }

    public getMoreProfileTab(user,key){
        
        if(!this.profileTabPaged[key]){
            this.profileTabPaged[key]=1;
        }

        this.profileTabPaged[key]++;

        let opt = this.auth.getUserAuthorizationHeaders();
        return this.http.get(`${this.baseUrl}user/profile/?tab=`+key+`&per_page=`+this.config.settings.per_view+`&paged=`+this.profileTabPaged[key],opt)
        .map(response =>{
            this.observable = null;                    
            if(response.status == 400) {
              return "FAILURE";
            } else if(response.status == 200) {
                let body = response.json();
                if(body){ 
                    if(body.length){
                        if(Array.isArray(this.profile.data[key])){
                            for(let i=0;i<body.length;i++){
                                //check if exists or not
                                if(!this.checkObjectExists(this.profile.data[key],body[i])){
                                    //to support show hide in my courses tab           
                                    if(key == 'courses'){
                                        body[i].show=1;
                                    }
                                    this.profile.data[key].push(body[i]);
                                }
                            }
                            this.storage.set('profile',this.profile);
                            this.storage.set(key+'_'+user.id,this.profile.data[key]);
                            console.log('Setting for Tab '+key);
                            console.log(this.profile);
                        }
                    }
                    
                    return body;
                }
            }
        });   
    }

    public updateCourseProgress(course_id:number,progress:number){
        
        if(typeof this.profile !== 'undefined' && this.profile){
            if(this.profile.data['courses'].length){
                for(let i=0;i<this.profile.data['courses'].length;i++){
                    if(this.profile.data['courses'][i].id == course_id){
                        this.profile.data['courses'][i].user_progress = progress;
                    }
                }
            }
        }
        
        this.storage.set('progress_'+course_id+'_'+this.user.id,progress);

        let opt = this.auth.getUserAuthorizationHeaders();

        this.http.post(`${this.baseUrl}updatecourse/progress`,{'course_id':course_id,'progress':progress},opt);  
    }

    public getAllInstructors(){

        if(this.instructors && this.config.trackComponents('allinstructors') == this.instructors.length && this.instructors.length > 0){
            if(this.instructors.length){
                return Observable.of(this.instructors);
            }else{
                return Observable.fromPromise(this.storage.get('instructors').then((instructors) => {
                    this.instructors = instructors;
                    return this.instructors;
                }));
            }
        }else{
           

            this.observable =  this.http.get(`${this.baseUrl}instructors/`)
                .map(response =>{
                    this.observable = null;                    
                    if(response.status == 400) {
                      return "FAILURE";
                    } else if(response.status == 200) {
                        let body = response.json();
                        if(body){ 
                            this.instructors = body;
                            this.storage.set('instructors',this.instructors);
                            this.config.updateComponents('allinstructors',this.instructors.length);
                            return body;
                        }
                    }
                });

            return this.observable;    
        }
    }

    public getInstructor(instructor_id:number){
        let allu = this.config.trackComponents('instructors');

        if(allu.indexOf(instructor_id) != -1){

            if(this.instructor.length && this.instructor[instructor_id]){
                return Observable.of(this.instructor[instructor_id]);
            }else{
                this.instructorObservable = Observable.fromPromise(this.storage.get('instructor_'+instructor_id).then((instructor) => {
                    this.instructor[instructor_id] = instructor;
                    return instructor;
                }));
            }

        }else{
            if(this.instructorObservable) {
                console.log('request pending');
                return this.instructorObservable;
            }else{

                this.instructorObservable =  this.http.get(`${this.baseUrl}instructors/`+instructor_id)
                    .map(response =>{
                        this.observable = null;                    
                        if(response.status == 400) {
                          return "FAILURE";
                        } else if(response.status == 200) { 

                            let body = response.json();
                            console.log(body);
                            if(body){ 
                                this.instructor[instructor_id] = body;
                                this.storage.set('instructor_'+instructor_id,this.instructor[instructor_id]);
                                this.config.addToTracker('instructors',instructor_id);
                                return body;
                            }
                        }
                    });
            }
        }
        return this.instructorObservable;    
    }

    public getResult(result:any){
        console.log(result);
        let saved_results = this.config.trackComponents('saved_results');

        if(saved_results && Array.isArray(saved_results) && saved_results.indexOf(result.quiz) > -1){
            this.resultObservable =  Observable.fromPromise(this.storage.get('saved_results_'+this.config.user.id).then(res=>{
                
                if(res){
                    for(let i=0;i<res.length;i++){
                        if(res[i].id == result.quiz){
                          return res[i].body;
                        }
                    }
                    
                }
            }));
        }else{
            let opt = this.auth.getUserAuthorizationHeaders();

            this.resultObservable =  this.http.get(`${this.baseUrl}user/profile/?tab=result&activity_id=`+result.activity_id,opt)
                .map(response =>{
                    this.observable = null;                    
                    if(response.status == 400) {
                      return "FAILURE";
                    } else if(response.status == 200) {
                        let body = response.json();
                        console.log(body);
                        if(body.length >= 1){ 
                            this.saved_results.push({'id':result.quiz,'body':body});
                            this.config.addToTracker('saved_results',result.quiz);
                            this.storage.set('saved_results_'+this.config.user.id,this.saved_results);
                            return body;
                        }else{
                            return {'error':this.config.get_translation('open_results_on_site')};
                        }
                    }
                });
        }

        return this.resultObservable; 
    }
    /*
    REVIEWS
     */
    public getReview(course_id:number){

        if(!this.user){
            this.user = this.config.track.user;
        }
                                    
        let flag = true;
        if(this.reviews.length){
            flag = false; //wait for API call
            for(let i=0;i<this.reviews.length;i++){
                if(this.reviews[i].id == course_id){
                    return Observable.of(this.reviews[i].review);
                }
            }
            flag = true;
        }

        if(flag){
            let myreviews = this.config.trackComponents('reviews');
            if(myreviews.indexOf(course_id) > -1){ //if found in storage
               
                return Observable.fromPromise(this.storage.get('review_'+course_id+'_'+this.user.id).then((review) => {
                        this.reviews.push({'id':course_id,'review':review});
                        return review;
                    }));
            }else{
                if(this.reviewObservable) {
                    return this.reviewObservable;
                }else{
                    let opt = this.auth.getUserAuthorizationHeaders();
                   
                    this.reviewObservable =  this.http.get(`${this.baseUrl}user/getreview/`+course_id,opt)
                        .map(response =>{
                            this.reviewObservable = null;                    
                            if(response.status == 400) {
                              return "FAILURE";
                            } else if(response.status == 200) {
                                
                                let body = response.json();
                                if(body){ 
                                    this.reviews.push({'id':course_id,'review':body});
                                    this.config.addToTracker('reviews',course_id);

                                    this.storage.set('review_'+course_id+'_'+this.user.id,body);
                                    return body;
                                }
                            }
                        });
                }
            }
        }
        return this.reviewObservable;  
    }

    public postReview(course_id:number,review:any){

        let opt = this.auth.getUserAuthorizationHeaders();
        if(!this.user){
            this.user = this.config.track.user;
        }
        return this.http.post(`${this.baseUrl}updatecourse/addreview`,
            {
                'course_id':course_id,
                'title':review.title,
                'rating':review.rating,
                'review':review.review},opt)
            .map(response =>{
                if(response.status == 400) {
                  return {'message':this.config.get_translation('failed')};
                } else if(response.status == 200) {
                    let body = response.json();
                    
                    this.storage.set('review_'+course_id+'_'+this.user.id,body);
                    return body;
                    
                }
            });  
    }

    public getResults(){
        this.storage.get('saved_results_'+this.config.user.id).then(res=>{
            if(res){
                this.saved_results = res;
            }
        });
    }

    public addResult(result:any){
        
        let flag = 1;
        if(this.saved_results.length){
            for(let i=0;i<this.saved_results.length;i++){
                if(result.id == this.saved_results[i].id){
                    flag=0;
                }
            }
        }
        if(flag && !result.meta){
            
            this.saved_results.push(result);
            this.storage.set('saved_results_'+this.config.user.id,this.saved_results);
                
        }
        
        //Send to API and record activity id
    }

    getUser(){
        return this.auth.getUser();
    }

    addCourse(course:any){
         let opt = this.auth.getUserAuthorizationHeaders();

        return this.http.post(`${this.baseUrl}user/subscribe`,{
            'course_id':course.id,
        },opt)
        .map(response =>{
            if(response.status == 400) {
              return {'message':this.config.get_translation('failed')};
            } else if(response.status == 200) {
                if(this.profile){
                    if('data' in this.profile){
                        delete this.profile.data['courses'];
                    }
                }

                let body = response.json();
                return body;
                
            }
        });
    }
    /*
    Quiz API
     */
    
    quizStarted(quiz_id:number){
        let opt = this.auth.getUserAuthorizationHeaders();

        return this.http.post(`${this.baseUrl}user/quiz/start`,{
            'quiz_id':quiz_id,
        },opt)
    }
    quizFinished(quiz:any){
        let opt = this.auth.getUserAuthorizationHeaders();

        return this.http.post(`${this.baseUrl}user/quiz/finish`,{
            'quiz':quiz,
        },opt)
    }

    /*
    Profile Pic
     */
    
     public async saveUserProfilePic(file_uri:any): Promise<void> {

        this.config.user.avatar = file_uri;
        /*
        let opt = this.auth.getUserAuthorizationHeaders();
        opt['fileKey']= 'file';
        opt['fileName']= file_uri.split('/').pop();
        opt['mimeType']= 'image/jpeg';
        let result = await this.file_transfer.upload(
            encodeURI(file_uri),
            encodeURI(`${this.baseUrl}user/profile/image`),
            opt,
            false
        );*/
        //this.on_success(result);

    }
    /*
        Edit profile field data
    */
    public editProfileField(field:any,go:any){

        if(go){
            //Merge filed data
            this.storage.get('profile_'+this.config.user.id).then(res=>{
                if(res){
                    for(let i=0;i<res.length;i++){
                        if(res[i] && res[i].fields){
                            if(res[i].fields.length){
                                for(let k=0;k<res[i].fields.length;k++){
                                    if(res[i].fields[k].id == field.id){
                                        res[i].fields[k] = field;
                                    }
                                }
                            }
                        }
                    }
                    this.storage.set('profile_'+this.config.user.id,res);
                }
            });
           
            let opt = this.auth.getUserAuthorizationHeaders();
            this.http.post(`${this.baseUrl}user/profile/fields`,{
            'field':field,
            },opt).subscribe(res=>{
                res = res.json();
                if(res){
                    let toast = this.toastCtrl.create({
                        message: res['message'],
                        duration: 1000,
                        position: 'bottom'
                    });
                
                  toast.present();
                }
                

            });
        }
        
        

    }

    /*
    CHARTS
     */
    
    public getCourseChart(){

        //let chart = {'labels':[],'data':[]};


        let charts = this.config.trackComponents('dashboardCharts');
        if(charts.indexOf('course') > -1){ //if found in storage
           
            return Observable.fromPromise(this.storage.get('dashboardCharts_Course_'+this.config.user.id).then((charts) => {
                    return charts;
            }));
        }else{
            if(this.coursechartObservable) {
                return this.coursechartObservable;
            }else{
                let opt = this.auth.getUserAuthorizationHeaders();
                
                this.coursechartObservable =  this.http.get(`${this.baseUrl}user/chart/course`,opt)
                    .map(response =>{
                        this.coursechartObservable = null;                    
                        if(response.status == 400) {
                          return "FAILURE";
                        } else if(response.status == 200) {
                            
                            let body = response.json();
                            if(body){ 
                                this.config.addToTracker('dashboardCharts','course');
                                this.storage.set('dashboardCharts_Course_'+this.config.user.id,body);
                                return body;
                            }
                        }
                    });

                return this.coursechartObservable;    
            }
        }
        
    }

    public getQuizChart(){
        //let chart = {'labels':[],'data':[]};


        let charts = this.config.trackComponents('dashboardCharts');
        if(charts.indexOf('quiz') > -1){ //if found in storage
           
            return Observable.fromPromise(this.storage.get('dashboardCharts_Quiz_'+this.config.user.id).then((charts) => {
                    return charts;
            }));
        }else{
            if(this.quizchartObservable) {
                return this.quizchartObservable;
            }else{
                let opt = this.auth.getUserAuthorizationHeaders();
                
                this.quizchartObservable =  this.http.get(`${this.baseUrl}user/chart/quiz`,opt)
                    .map(response =>{
                        this.quizchartObservable = null;                    
                        if(response.status == 400) {
                          return "FAILURE";
                        } else if(response.status == 200) {
                            
                            let body = response.json();
                            if(body){ 
                                this.config.addToTracker('dashboardCharts','quiz');
                                this.storage.set('dashboardCharts_Quiz_'+this.config.user.id,body);
                                return body;
                            }
                        }
                    });

                return this.quizchartObservable;    
            }
        }
    }

    public contact(val:any){
        console.log('inside');
        console.log(val);
        return this.http.post(`${this.config.baseUrl}contact/`,
            {
                'client_id':this.config.settings.client_id,
                'state':this.config.settings.state,
                'contact':val})
            .map(response =>{
                if(response.status == 400) {
                  return {'message':this.config.get_translation('failed')};
                } else if(response.status == 200) {
                    return response.json();
                }
            }); 
    }

    checkObjectExists(main,value){
        let exists = false;
        for (var i=0; i<main.length; i++) { //iterate through each object in an array
             if (JSON.stringify(main[i]) === JSON.stringify(value) ) {
                     exists =  true;
                     break;
              }
        }
        return exists;
    }
}