import { Injectable, OnInit } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';


import { Storage } from '@ionic/storage';

import { Course } from "../models/course";
import { CourseCategory } from "../models/course";

import { FullCourse } from "../models/course";
import { AuthenticationService } from "./authentication";
import { ConfigService } from "./config";

@Injectable() 
export class CourseService implements OnInit{  

    cacheGroup:string='course';
    featured: Course[] =[];
    popular: Course[] =[];
	courses: Course[] =[];
    lastCourse:any;
    fullCourses: FullCourse[] =[];
    courseCategories: CourseCategory[]=[];
    courseLocations: CourseCategory[]=[];
    courseLevels: CourseCategory[]=[];

    private observable: Observable<any>; //Tracks request in progress
    private allcoursesobservable: Observable<any>;
    private fullcourseobservable: Observable<any>;
    private featuredobservable:Observable<any>;
    private popularobservable:Observable<any>;
    
    private filterobservable: Observable<any>; //Tracks request in progress
    private catobservable: Observable<any>; //Tracks request in progress
    
    private locobservable: Observable<any>; //Tracks request in progress

    private levobservable: Observable<any>; //Tracks request in progress
    private pmprochecklevelobservable:Observable<any>;
	private baseUrl:string;

    constructor(private http:Http,
        private storage: Storage,
        private auth: AuthenticationService,
        private config:ConfigService) {
        
        this.baseUrl = this.config.baseUrl; 

    }
  	
    ngOnInit(){
        
        
    }
    

  	private extractData(response: Response) {
        let body = response.json();
        if(body){
        	let res = [];
        	for(let i=0;i<body.length;i++){
        		res.push(body[i].data);
        	}	
        	return res;
        }
        return {};
    }
    
	private handleError(error: Response) {
        console.log(error);
        return Observable.throw(error.json().error || "500 internal server error");
    }

    getAllCourses(paged:number = 1){

       
         if(this.config.trackComponents('allcourses') >= paged*this.config.settings.per_view){
            if(this.courses.length >= paged*this.config.settings.per_view){            
                return Observable.of(this.courses);
            }else{
                this.allcoursesobservable = Observable.fromPromise(this.storage.get('allcourses').then((courses) => {
                    if(courses){
                        this.courses = courses;
                    }
                }));
            }
        }else{

            let count:number=0;
            count = paged*this.config.settings.per_view - this.courses.length;
            
            if(this.allcoursesobservable) {
                return this.allcoursesobservable;
            }else{

                var courses=[];
                
                if(this.courses.length){
                    for(let i=0;i<this.courses.length;i++){
                        courses.push(this.courses[i].id);
                    }
                }
                var ec = courses.join(',');

                let params = new URLSearchParams();
                params.set('paged', paged.toString());
                params.set('existing', ec);


                this.allcoursesobservable =  this.http.get(`${this.baseUrl}courses/paged/`+paged,{search: params})
                .map(response =>{

                    this.allcoursesobservable = null;

                    if(response.status == 400) {
                      return "FAILURE";
                    } else if(response.status == 200) {
                        let rcourses = response.json();
                        if(rcourses){
                            this.courses.push(rcourses);
                            this.config.updateComponents('allcourses',this.courses.length);
                            this.storage.set('allcourses',this.courses);
                            return this.courses;
                        }
                    }
                        
                });

            }
        }

        return this.allcoursesobservable;
    }

    /*
    ALL Categories call
     */
    

    getAllCourseCategory(){
        
        let taxonomy = 'course-cat';
       

        if(this.config.trackComponents('allcoursecategories') && this.config.trackComponents('allcoursecategories') == this.courseCategories.length){
            if(this.courseCategories.length){
                return Observable.of(this.courseCategories);
            }else{
                this.catobservable = Observable.fromPromise(this.storage.get('allcoursecategories').then((cats) => {
                    if(cats){
                        this.courseCategories = cats;
                        return this.courseCategories;
                    }
                }));
            }
        }else{
            this.catobservable = this.http.get(`${this.baseUrl}course/taxonomy/?taxonomy=`+taxonomy)
            .map(response =>{
                let body = response.json();
                let res=[];
                this.catobservable = null;
                if(body){
                   this.mergeCategories(this.courseCategories,body);
                    
                    this.storage.set('allcoursecategories',this.courseCategories);
                    return this.courseCategories;
                }
                
            });
        }
        return this.catobservable; 
    }

    /*
    All Course Locations
     */
    getAllCourseLocations(){
       
        let taxonomy = 'location';

        if(this.config.trackComponents('allcourselocations') && this.config.trackComponents('allcourselocations') == this.courseLocations.length ){
            if(this.courseLocations.length){
                return Observable.of(this.courseLocations);
            }else{
                this.locobservable = Observable.fromPromise(this.storage.get('allcourselocations').then((cats) => {
                    if(cats){
                        this.courseLocations = cats;
                        return this.courseLocations;
                    }
                }));
            }
        }else{
            this.locobservable = this.http.get(`${this.baseUrl}course/taxonomy/?taxonomy=`+taxonomy)
            .map(response =>{
                let body = response.json();
                let res=[];
                this.locobservable = null;
                if(body){
                    this.mergeCategories(this.courseLocations,body);
                    
                    this.storage.set('allcourselocations',this.courseLocations);
                    return this.courseLocations;
                }
                
            });
        }
        return this.locobservable; 
    }

    /*
    All Course Levels
     */
    getAllCourseLevels(forceRefresh?: boolean){
        
       
        let taxonomy = 'level';

        if(this.config.trackComponents('allcourselevels') && this.config.trackComponents('allcourselevels') == this.courseLevels.length){
            if(this.courseLevels.length){
                return Observable.of(this.courseLevels);
            }else{
                this.levobservable = Observable.fromPromise(this.storage.get('allcourselevels').then((cats) => {
                    if(cats){
                        this.courseLevels = cats;
                        return this.courseLevels;
                    }
                }));
            }
        }else{
            this.levobservable = this.http.get(`${this.baseUrl}course/taxonomy/?taxonomy=`+taxonomy)
            .map(response =>{
                console.log(response);
                let body = response.json();
                let res=[];
                this.levobservable = null;
                if(body){
                    this.mergeCategories(this.courseLevels,body);
                    
                    this.storage.set('allcourselevels',this.courseLevels);
                    return this.courseLevels;
                }
                
            });
        }
        return this.levobservable;
    }


    getLastCourse(){
        console.log("GET");
        return this.lastCourse;
    }


    /*
    Full course call
     */


    getFullCourse(course:any,force:boolean=false){

        
        let allc = this.config.trackComponents('courses');
        if(Array.isArray(allc) && allc.indexOf(course.id) != -1 && !force){
            let flag =1;
            if(Array.isArray(this.fullCourses)){
                if(this.fullCourses.length){
                    for(let i=0;i<this.fullCourses.length;i++){
                        if(this.fullCourses[i].course.id == course.id){
                            flag=0;
                            return Observable.of(this.fullCourses[i]); //return if already cached
                        }
                    }    
                }
            }

            if(flag){
                console.log('Storage Full course');
                this.fullcourseobservable = Observable.fromPromise(this.storage.get('fullcourse_'+course.id).then((fullcourse) => {
                    
                    if(fullcourse){
                        
                        this.fullCourses.push(fullcourse);
                        return fullcourse;
                    }
                    
                }));
            }

        }else{
            let k = 0;
            if(this.fullCourses){
                let k = this.fullCourses.length;
            }
            let fullCourse = <FullCourse>{};
            if(this.config.isLoggedIn){
                let opt = this.auth.getUserAuthorizationHeaders();
                this.fullcourseobservable =  this.http.get(`${this.baseUrl}course/`+course.id,opt).map(response =>{

                    this.fullcourseobservable = null;

                    if(response.status == 400) {
                      return "FAILURE";
                    } else if(response.status == 200) {

                        let body = response.json();
                        if(body){
                            let res = [];
                            for(let i=0;i<body.length;i++){
                                res.push(body[i].data);
                            }    
                            if(res){
                                console.log(res[0]);
                                fullCourse = res[0];
                                console.log('############');
                                /*
                                Object.keys(res[0]).forEach(function (key) {
                                    if(key == 'course'){
                                        fullCourse['course'] = body[key];
                                    }else if(key == 'curriculum'){
                                        fullCourse['curriculum']=body[key];
                                    }else if(key == 'description'){
                                        fullCourse['description']=body[key];
                                    }else if(key == 'reviews'){
                                        fullCourse['reviews']=body[key];
                                    }else if(key == 'purchase_link'){
                                        fullCourse['purchase_link']=body[key];
                                    }else if(key == 'instructors'){
                                        fullCourse['instructors']=body[key];
                                    }
                                });*/
                                console.log('setting full course in storage');
                                this.storage.set('fullcourse_'+course.id,fullCourse);
                                this.config.addToTracker('courses',course.id);
                                this.fullCourses.push(fullCourse);
                                return fullCourse;
                            }
                        }
                    }
                    
                });
            }else{
                this.fullcourseobservable =  this.http.get(`${this.baseUrl}course/`+course.id)
                .map(response =>{

                    this.fullcourseobservable = null;

                    if(response.status == 400) {
                      return "FAILURE";
                    } else if(response.status == 200) {

                        let body = response.json();
                        if(body){
                            let res = [];
                            for(let i=0;i<body.length;i++){
                                res.push(body[i].data);
                            }    
                            if(res){
                                console.log(res[0]);
                                fullCourse = res[0];
                                console.log('############');
                                /*
                                Object.keys(res[0]).forEach(function (key) {
                                    if(key == 'course'){
                                        fullCourse['course'] = body[key];
                                    }else if(key == 'curriculum'){
                                        fullCourse['curriculum']=body[key];
                                    }else if(key == 'description'){
                                        fullCourse['description']=body[key];
                                    }else if(key == 'reviews'){
                                        fullCourse['reviews']=body[key];
                                    }else if(key == 'purchase_link'){
                                        fullCourse['purchase_link']=body[key];
                                    }else if(key == 'instructors'){
                                        fullCourse['instructors']=body[key];
                                    }
                                });*/
                                console.log('setting full course in storage');
                                this.storage.set('fullcourse_'+course.id,fullCourse);
                                this.config.addToTracker('courses',course.id);
                                this.fullCourses.push(fullCourse);
                                return fullCourse;
                            }
                        }
                    }
                    
                });
            }
        }

        return this.fullcourseobservable;
    }

    /*
    POPULAR COURSES
     */

    getPopularCourses(){
        
        if(this.config.trackComponents('popular')  && this.config.trackComponents('popular') == this.popular.length){
            if(this.popular.length){
                return Observable.of(this.popular);
            }else{
                this.popularobservable = Observable.fromPromise(this.storage.get('popular').then((popular) => {
                    if(popular){
                        this.popular = popular;
                        return this.popular;
                    }
                }));
            }
        }else{
            this.popularobservable = this.http.get(`${this.baseUrl}course/popular`+'?per_view='+this.config.settings.per_view)
            .map(response =>{
                let body = response.json();
                this.popularobservable = null;
                if(body){
                    let courses = [];
                    for(let i=0;i<body.length;i++){
                        courses.push(body[i].data);
                    }
                    this.courses = this.mergeCourses(this.courses,courses);
                    this.popular = this.mergeCourses(this.popular,courses);
                    this.storage.set('popular',this.popular);
                    this.config.updateComponents('popular',1);
                    return this.popular;
                }
            });
        }

        return this.popularobservable; 
    }
    /*
    FEATURED COURSES
    */

    getFeaturedCourses(){
        
        console.log('Shall track featured = '+this.config.trackComponents('featured'));
        if(this.config.trackComponents('featured')  && this.config.trackComponents('featured') == this.featured.length){
            
            if(this.featured.length){
                return Observable.of(this.featured);
            }else{
                this.featuredobservable = Observable.fromPromise(
                    this.storage.get('featured').then((featured) => {
                    if(featured){
                        this.featured = featured;
                        return this.featured;
                    }
                }));
            }
        }else{
            this.featuredobservable = this.http.get(`${this.baseUrl}course/featured?per_view=`+this.config.settings.per_view)
            .map(response =>{
                let body = response.json();
                if(body){
                    let courses = [];
                    for(let i=0;i<body.length;i++){
                        courses.push(body[i].data);
                    }
                    console.log('#7');
                    this.courses = this.mergeCourses(this.courses,courses);
                    this.featured = this.mergeCourses(this.featured,courses);
                    this.storage.set('featured',this.featured);
                    this.config.updateComponents('featured',1);
                    return this.featured;
                }
            });
        }
        return this.featuredobservable;

    }
    

    filterItems(selectFilters:any){
       
        let url = `${this.baseUrl}course/filters?filter=`+encodeURI(JSON.stringify(selectFilters)+'&per_view='+this.config.settings.per_view);
        let cacheKey = url;
        console.log(url);
        let items:any[]=[];

        
        if(this.config.trackComponents('allcourses') == this.courses.length && this.courses.length > 0){

            if(selectFilters.search.length && this.courses.length){
                items = this.courses.filter((course) => {
                    let Items = course.name.toLowerCase().indexOf(selectFilters.search.toLowerCase()) > -1;
                    return Items;
                });
            }else{
                this.filterobservable = Observable.fromPromise(
                    this.storage.get(cacheKey).then((items) => {
                    if(items){
                        return items;
                    }
                }));
            }
        }else{

            if(items.length < this.config.settings.per_view){
                if(this.filterobservable) {
                    return this.filterobservable;
                }else{
                    
                    
                    this.filterobservable =  this.http.get(url)
                    .map(response =>{

                        this.filterobservable = null;

                        console.log(response);
                        if(response.status == 400) {
                          return "FAILURE";
                        } else if(response.status == 200) {

                            let body = response.json();
                            if(body){
                                for(let k=0;k<body.length;k++){
                                    items.push(body[k].data);
                                }
                                this.storage.set(cacheKey,items);
                                return items;
                            }
                        }
                    });
                }
            }
        }

        return this.filterobservable;
    }

    public mergeCourses(coursesA: Course[],coursesB: any){

        for(let i=0;i<coursesB.length;i++){
            var flag = 1;
            for(let j=0;j<coursesA.length;j++){
                if(coursesB[i].id == coursesA[j].id){
                    flag= 0;
                }
            }
            if(flag){
                coursesA.push(coursesB[i]);
            }
        }
        return coursesA;
    }

	
    private getIndexByKeyValue(arraytosearch, key, valuetosearch) {
 
        for (var i = 0; i < arraytosearch.length; i++) {
            if (arraytosearch[i][key] == valuetosearch) {
                return i;
            }
        }
        return null;
    }

    private  copyobject(srcObj:any, destObj:any) {
        for (var key in destObj) {
            console.log(' - '+key);
            if(destObj.hasOwnProperty(key) && srcObj.hasOwnProperty(key)) {
                destObj[key] = srcObj[key];
            }
        }
        return destObj;
    }

    mergeCategories(catsA: CourseCategory[],catsB: CourseCategory[]){
      for(let i=0;i<catsB.length;i++){
            var flag = 1;
            for(let j=0;j<catsA.length;j++){
                if(catsB[i].term_id == catsA[j].term_id){
                    flag= 0;
                }
            }
            if(flag){
                catsA.push(catsB[i]);
            }
        }
        return catsA;
    }

    //for pmpro call"
    checkAndAssignPmproLevel(pricing,fullcourse){
        
        let opt = this.auth.getUserAuthorizationHeaders();
        return this.pmprochecklevelobservable =  this.http.get(`${this.baseUrl}user/course/pmprochecklevel/`+fullcourse.course.id+`/level/`+pricing.id,opt).map(response =>{

            this.pmprochecklevelobservable = null;

            if(response.status == 400) {
              return "FAILURE";
            } else if(response.status == 200) {

                let body = response.json();
                if(body){
                    return body;
                }
            }
        });

    }
}

/*
sudo apt-get install lamp-server^
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get update
sudo apt-get install mongodb-org
sudo apt-get install php-pear php5-dev
sudo apt-get install libsasl2-dev
sudo pecl install mongo
sudo apt-get install php5-curl
apt-get install php5-mcrypt
php –ini (to find the ini file)
sudo nano /etc/php5/apache2/php.ini (add extension=mongo.so & extension=mcrypt.so)
sudo service apache2 restart
 */
