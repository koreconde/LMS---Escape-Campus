import { Component, OnInit } from '@angular/core';
import { FormGroup,FormControl, Validators } from '@angular/forms';
import { NavController,NavParams,ViewController,LoadingController } from 'ionic-angular';

import { ConfigService } from '../../services/config';
import { UserService } from '../../services/users';
 
@Component({
  selector: 'page-reviewcourse',
  templateUrl: 'reviewcourse.html',
})

export class ReviewCoursePage implements OnInit{
 	
	message:string='';
 	course:any;
  reviewForm: FormGroup;
 	review:{
 		'title':null,
 		'rating':1,
 		'review':null,
 	};
    constructor(
      private viewCtrl: ViewController,
      private navCtrl: NavController, 
      private navParams: NavParams,
      private userService: UserService,
      private config:ConfigService,
      private loadingCtrl:LoadingController){

        
    }
 	
    ngOnInit() {

 		this.course = this.navParams.get('course');
 		this.initializeForm();
 		console.log('inside');
 		console.log(this.course);
 		this.userService.getReview(this.course.id).subscribe(res=>{
 			if(res && 'title' in res ){
 				console.log('fetching');
 				this.review = res;
 				this.reviewForm.setValue({
				  	'title': this.review.title,
		    		'rating': this.review.rating,
		    		'review': this.review.review
				});	
 			}
 			
 		});
    }
    
    private initializeForm(){
    	this.reviewForm = new FormGroup({
    		'title': new FormControl(null,Validators.required),
    		'rating': new FormControl(5,Validators.required),
    		'review': new FormControl(null,Validators.required),
    	});
    } 

    onSubmit(){
      let loading = this.loadingCtrl.create({
                content: '<img src="assets/images/bubbles.svg">',
                duration: 15000,
                spinner:'hide',
                showBackdrop:true,

            });
            loading.present();
    	this.userService.postReview(this.course.id,this.reviewForm.value).subscribe(res=>{
    		console.log(res);
    		this.message = res.message;
        loading.dismiss();
    		if(res.status){
    			
    		}
    	});

      setTimeout(function(){
        if(this.viewCtrl){
          this.viewCtrl.dismiss();
        }
      },3000);
    }

    onClose(){
        if(this.viewCtrl){
          this.viewCtrl.dismiss();
        }
    }

}
