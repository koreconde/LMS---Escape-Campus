import { Component, Input, OnInit } from '@angular/core';
import { ConfigService } from '../../services/config';
import { CoursePage } from '../../pages/course/course';
import { WishlistService } from '../../services/wishlist';

@Component({
  selector: 'coursecard',
  templateUrl: 'coursecard.html'
})
export class Coursecard implements OnInit{

    coursePage= CoursePage;
    active:string='';
    @Input('course') course;

    constructor(
    	private wishlistService:WishlistService,private config:ConfigService) {
    }

    ngOnInit(){
    	if(this.wishlistService.checkInWishList(this.course)){
    		
    		this.active = 'active';
    	}else{
    		this.active = '';
    	}
    }

    addToWishlist(){
    	console.log('clicked -'+this.course.name);
    	if(this.active == 'active'){
    		this.wishlistService.removeFromWishList(this.course);
    		this.active='';
    	}else{
    		this.wishlistService.addToWishlist(this.course);
    		this.active='active';
    	}
    }


}
