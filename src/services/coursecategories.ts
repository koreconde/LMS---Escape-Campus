import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { CourseCategory } from "../models/coursecategory";
import { FullCourseCategory } from "../models/coursecategory";
import { Course } from "../models/course";
import { ConfigService } from "./config";

@Injectable()
export class CourseCategoryService {  

    fullcategories: FullCourseCategory[] = [];
	courseCategories: CourseCategory[] = [];

    private observable: Observable<any>; //Tracks request in progress

    private baseUrl = 'http://local.wordpress.dev/wp-json/wplms/v1/';

    constructor(
        private http:Http,
        private config:ConfigService) {
         
    }
  	
  	private extractData(response: Response) {
        let body = response.json();
        return body || {};
    }
    

    getAllCourseCategories(forceRefresh?: boolean){
        
        if (!this.courseCategories.length || forceRefresh) {
            this.http.get(`${this.baseUrl}course/category`)
            .map(this.extractData)
            .subscribe(categories => {
                this.courseCategories = this.mergeCategories(this.courseCategories,categories);
            });
        }
        return this.courseCategories;
    }
	 
    getCourseCategory(cat:CourseCategory){

        if (this.fullcategories.length){
            for(let i=0;i<this.fullcategories.length;i++){
                console.log('Finding..');
                if(this.fullcategories[i].category.term_id == cat.term_id){

                    return Observable.of(this.fullcategories[i]); //return if already cached
                }
            }
        }

       

        let k = this.fullcategories.length;

        this.observable = this.http.get(
            `${this.baseUrl}course/category/`+cat.term_id)
            .map(response => {
                
                this.observable = null;

                if(response.status == 400) {
                  return "FAILURE";
                } else if(response.status == 200) {

                    let categories = response.json();

                    let courses:Course[]=[];
                    for(let i=0;i<categories.courses.length;i++){
                        courses.push(categories.courses[i].data);
                    }

                    let cats: CourseCategory[]=[];
                    for(let i=0;i<categories.child.length;i++){
                        cats.push(categories.child);
                    }

                    let full_category = {
                        category: cat,
                        childCategories: cats,    
                        courses: courses,
                    }
                    
                    this.fullcategories.push(full_category);
                    return this.fullcategories[k];
                }
            });

          return this.observable;
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
}
