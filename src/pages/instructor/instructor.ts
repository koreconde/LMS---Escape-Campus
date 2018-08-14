import { Component, OnInit,ViewChild } from '@angular/core';
import { NavController, NavParams,ViewController, Slides } from 'ionic-angular';


import { CoursePage } from '../course/course';
import { DirectoryPage } from '../directory/directory';

import { ConfigService } from '../../services/config';
import { CourseService } from '../../services/course';
import { UserService } from '../../services/users';


@Component({
  selector: 'page-instructor',
  templateUrl: 'instructor.html',
})
export class InstructorPage implements OnInit{

	instructortabs:any;
	instructor:any;
	fullinstructor:any={
		'bio':'',
		'about':[],
		'social':[],
		'courses':[]
	};
  directoryPage=DirectoryPage;
	coursePage:CoursePage;
	
	@ViewChild('InstructorTabs') instructorTabs: Slides;
	@ViewChild('InstructorSlides') instructorSlides: Slides;
  	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
		private viewCtrl: ViewController,
		private config:ConfigService,
		private courseService:CourseService,
		private userService:UserService,
		){

		}

  	ngOnInit(){
  		console.log(this.instructor);
  		this.instructor = this.navParams.data;
  		this.instructortabs = [
  			{'key':'profile','label':this.config.get_translation('profile')},
  			{'key':'about','label':this.config.get_translation('about')},
  			{'key':'courses','label':this.config.get_translation('courses')}
		];

  		if(typeof this.instructor.id !== 'undefined'){
  			this.userService.getInstructor(this.instructor.id).subscribe(res=>{
	            console.log(res);
	            this.fullinstructor = res;
	        }); 	
  		}
  		
  		//Fetch instructor profile
  	}

  	ionViewDidLoad() {
    	console.log('ionViewDidLoad Instructor');
  	}

  	onClose(){
  		this.viewCtrl.dismiss();
  	}

  	selectedTab(index){
      	this.instructorSlides.slideTo(index, 500);
  	}

  	onTabChanged() {
      	let index = this.instructorTabs.getActiveIndex();
      	this.instructorSlides.slideTo(index, 500);
  	}


  	onSlideChanged() {
      	let index = this.instructorSlides.getActiveIndex();
      	this.instructorTabs.slideTo(index,500);
  	}
}
