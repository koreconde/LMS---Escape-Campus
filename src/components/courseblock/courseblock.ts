import { Component, Input, OnInit,AfterViewInit, ViewChild,ElementRef } from '@angular/core';
import { ConfigService } from '../../services/config';
import { CoursePage } from '../../pages/course/course';
import { WishlistService } from '../../services/wishlist';
@Component({
  selector: 'courseblock',
  templateUrl: 'courseblock.html'
})
export class Courseblock implements OnInit,AfterViewInit{

    coursePage= CoursePage;
    active:string='';
    style:any={};
    @Input('course') course;

    @ViewChild('featured') featured: ElementRef;
    constructor(private wishlistService:WishlistService,private config:ConfigService) {
    	
    }

    ngOnInit(){
    	if(this.wishlistService.checkInWishList(this.course)){
    		this.active = 'active';
    	}else{
    		this.active = '';
    	}
    }

    addToWishlist(){
    	if(this.active == 'active'){
    		this.wishlistService.removeFromWishList(this.course);
    		this.active='';
    	}else{
    		this.wishlistService.addToWishlist(this.course);
    		this.active='active';
    	}
    }

    ngAfterViewInit() {

        if(window.screen.width < 500){
            var height = this.featured.nativeElement.offsetHeight+10;
            this.style = {
                'height':height+'px',
                'width':'auto'
            };
        }
    }
}
