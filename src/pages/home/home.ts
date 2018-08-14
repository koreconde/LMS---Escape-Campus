import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController } from 'ionic-angular';

//import {StatusBar} from 'ionic-native';
import { StatusBar } from '@ionic-native/status-bar';
import { Content } from 'ionic-angular';

import { ProfilePage } from '../profile/profile';
import { SearchPage } from '../search/search';

import { DirectoryPage } from '../directory/directory';
import { CoursePage } from '../course/course';

import { CourseService } from '../../services/course';
import { ConfigService } from '../../services/config';
import { WalletService } from '../../services/wallet';

import { WishlistService } from '../../services/wishlist';

import { UserService } from '../../services/users';

import { User } from '../../models/user';
import { Course } from '../../models/course';
import { CourseCategory } from '../../models/course';

import { FixedScrollHeader } from '../../components/fixed-scroll-header/fixed-scroll-header';
import { Coursecard } from '../../components/coursecard/coursecard';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnInit{
	
	isLoggedIn: boolean = false;
	user: User;
	featured: Course[] = [];
	popular: Course[] = [];
	categories: CourseCategory[] = [];
	categoryPage = DirectoryPage;
	profilePage=ProfilePage;
	coursePage= CoursePage;
	
	constructor(public navCtrl: NavController,
		private courseService: CourseService, 
		private modalCtrl: ModalController,
		public loadingController: LoadingController,
		public userService:UserService,
		private config:ConfigService,
		private wishlistService:WishlistService,
		private walletService:WalletService ) {
		
	}

	ngOnInit() {
		console.log('waiting to be loaded');

		let loading = this.loadingController.create({
            content: '<img src="assets/images/bubbles.svg">',
            duration: 15000,//this.config.get_translation('loadingresults'),
            spinner:'hide',
            showBackdrop:true,

        });

        loading.present();

		this.config.isLoading().then(res=>{
			if(res){
				this.config.track = res;
			}

			this.courseService.getFeaturedCourses().subscribe(featured =>{
				if(featured){
					this.featured = featured;
				}
			});

			this.courseService.getPopularCourses().subscribe(popular =>{
				if(popular){
					this.popular = popular;
				}
				loading.dismiss();
			});

			this.courseService.getAllCourseCategory().subscribe(cats =>{
				if(cats){
					this.categories = cats;
				}
			});
			
		});
    	this.wishlistService.getWishList();
	}

	openSearch(){
		let modal = this.modalCtrl.create(SearchPage);
    	modal.present();
	}

}