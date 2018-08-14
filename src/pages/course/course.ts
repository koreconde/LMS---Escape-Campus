import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController,ToastController,LoadingController,AlertController, Platform, Slides } from 'ionic-angular';


import { ProfilePage } from '../profile/profile';
import { SearchPage } from '../search/search';

import { CourseService } from '../../services/course';
import { FullCourse } from '../../models/course';
import { Course } from '../../models/course';

import { InAppBrowser } from '@ionic-native/in-app-browser';

import { Storage } from '@ionic/storage';
import { ConfigService } from '../../services/config';
import { UserService } from '../../services/users';
import { CourseStatusPage } from '../course-status/course-status';

import { WalletService } from '../../services/wallet';

import { LazyImgComponent }   from '../components/lazy-img/lazy-img';
import { LazyLoadDirective }   from '../directives/lazy-load.directive';
import { ImgcacheService } from "../services/imageCache";

import { SafeHtmlPipe } from "../../pipes/orderby";

@Component({
  selector: 'page-course',
  templateUrl: 'course.html'
})
export class CoursePage implements OnInit{

    isLoggedIn:false;
    message:string;
    fullCourse: FullCourse;
    course:Course;
    user: any;
    activateBuyPopup:boolean=false;
    browser: any;
    myCourse:boolean=false;
    myCoursestatus:number=0;
    coursetabs: string[]=[];
    courseStatusPage = CourseStatusPage;

    @ViewChild('CourseTabs') courseTabs: Slides;
    @ViewChild('CourseSlides') courseSlides: Slides;

    public coursePriceSelected:any=[];

    public indicator = null;

    constructor(public navCtrl: NavController, 
      public navParams: NavParams,
      public modalCtrl:ModalController,
      private courseService: CourseService,
      public platform: Platform,
      private config:ConfigService,
      public userService:UserService,
      private storage:Storage,
      private toastCtrl:ToastController,
      private loadingCtrl:LoadingController,
      private iab:InAppBrowser,
      private walletService: WalletService,
      private alertCtrl: AlertController){}

      ngOnInit(){      
        
          this.course = this.navParams.data;

          if('message' in this.navParams.data){
            this.message = this.navParams.get('message');
          }
          this.getCourse(this.course);
      }

      getCourse(course,force:boolean=false){
         let loading = this.loadingCtrl.create({
            content: '<img src="assets/images/bubbles.svg">',
            duration: 15000,//this.config.get_translation('loadingresults'),
            spinner:'hide',
            showBackdrop:true,

        });

          //Get Wallet -> 
            
            if(this.config.isLoggedIn){
              this.walletService.getWallet(true).subscribe(res=>{
                console.log(res);
              });
            }

        loading.present();

          this.courseService.getFullCourse(course,force).subscribe(res=>{

              this.fullCourse = res;
              if(this.fullCourse.course.user_status){
                this.myCourse=true;
                this.myCoursestatus=this.fullCourse.course.user_status;
              }
              loading.dismiss();
              for(var k in this.fullCourse){
                  if(k != 'course' && k != 'purchase_link'){this.coursetabs.push(k);}
              }
          });

          if(this.config.isLoggedIn){
            this.storage.get('courses_'+this.config.user.id).then(courses=>{
              console.log(courses);
              if(courses){
                if(Array.isArray(courses)){
                  for(let i=0;i<courses.length;i++){
                      if(courses[i].id == course.id){
                          this.myCourse=true;
                          this.myCoursestatus=courses[i].user_status;
                      }
                  }
                }
              }
            });
          }
      }

      showPricing(fullCourse){
        console.log(fullCourse.course.price_html);
        if(fullCourse){
          this.activateBuyPopup = true;
        }
        
      }

      closePp(){
        this.activateBuyPopup = false;
      }

      showExtras(pricing){
        if(pricing.extras){
          pricing.extras.open =!pricing.extras.open;
        }

        return pricing;
      }

      purchaseCourse(){

        console.log('Clocked');

        if(this.config.isLoggedIn){
          
          console.log('YAY ! ='+this.fullCourse.course.price);
          if(this.fullCourse.course.price == 0){
            console.log('YAY !')
            this.storage.remove('courses_'+this.config.user.id);
            this.storage.remove('fullcourse_'+this.course.id);
            this.config.removeFromTracker('courses',this.course.id);
            this.config.removeFromTracker('profiletabs','courses');


            this.userService.addCourse(this.course).subscribe(res=>{
              let toast = this.toastCtrl.create({
                  message: res.message,
                  duration: 1000,
                  position: 'bottom'
              });

              if(res.status){  
                  toast.onDidDismiss(() => {
                      this.getCourse(this.course,true);
                      this.config.updateComponents('profile',0);
                  });
              }
              
              toast.present();
            });
          }
          
        }

        if(this.fullCourse.course.price != 0){

          console.log(this.fullCourse.course.price.length);
          if(this.fullCourse.course.price && this.fullCourse.course.price.length){
            
          }
        
          this.platform.ready().then(() => { 
          console.log(this.fullCourse);       
            if(this.fullCourse.purchase_link){

              this.browser = this.iab.create(this.fullCourse.purchase_link, "_blank","location=no"); //, "

              this.browser.show();
              this.browser.insertCSS({ code: "header,footer{display:none;}" });
              if(this.config.isLoggedIn){
                this.browser.executeScript({ code: "jQuery(document).ready(function(){ jQuery('#billing_email').val("+this.config.user.email+");jQuery('#billing_first_name').val("+this.config.user.name+"); });" });  
              }
              this.browser.on('loadstart').subscribe((event) => {
               
                if(event.url.indexOf('?key=wc_order_') !== -1){
                  let matches = event.url.match('.+/([0-9]+)/.+');
                  this.browser.close();
                  this.getCourse(this.course,true);
                  this.config.updateComponents('profile',0);
                  //get order id
                  //let order_id = matches[1];
                  
                }
              });
              this.browser.on('exit').subscribe((event) => {
                this.browser.close();
              });
            }
          });
        }

        console.log(this.fullCourse.course['price']+' res = '+ (this.fullCourse['price'] == 0 )+' && '+ this.config.isLoggedIn);
        
        if(this.fullCourse.course.price == 0 && !this.config.isLoggedIn){
          let toast = this.toastCtrl.create({
                  message: this.config.get_translation('register_account'),
                  duration: 1000,
                  position: 'bottom'
              });
          toast.present();
              
        }
           
      }

    
      selectedTab(index){
          this.courseSlides.slideTo(index, 500);
      }

      onTabChanged() {
          let index = this.courseTabs.getActiveIndex();
          this.courseSlides.slideTo(index, 500);
      }

      onSlideChanged() {
          let index = this.courseSlides.getActiveIndex();
          this.courseTabs.slideTo(index,500);
      }

      openProfile(){
        let modal = this.modalCtrl.create(ProfilePage,{'isLoggedIn':this.isLoggedIn,'User':this.user});
        modal.present();
      }

      openSearch(){
          let modal = this.modalCtrl.create(SearchPage);
          modal.present();
      }

      show_course_status(){
        if(this.myCoursestatus == 1){
            return this.config.get_translation('start_course');
        }
        if(this.myCoursestatus == 2){
            return this.config.get_translation('continue_course');
        }
        if(this.myCoursestatus == 3){
            return this.config.get_translation('evaluation_course');
        }
        if(this.myCoursestatus == 4){
            return this.config.get_translation('completed_course');
        }
      }

      buyCourse(pricing,FullCourse){
        console.log('Swiped');
        this.coursePriceSelected.push(pricing);

        //FREE COURSE
        if(this.config.isLoggedIn && this.fullCourse.course.price === 0){
            console.log('YAY !')
            this.storage.remove('courses_'+this.config.user.id);
            this.storage.remove('fullcourse_'+this.course.id);
            this.config.removeFromTracker('courses',this.course.id);
            this.config.removeFromTracker('profiletabs','courses');


            this.userService.addCourse(this.course).subscribe(res=>{
              let toast = this.toastCtrl.create({
                  message: res.message,
                  duration: 1000,
                  position: 'bottom'
              });

              if(res.status){  
                  toast.onDidDismiss(() => {
                      this.getCourse(this.course,true);
                      this.config.updateComponents('profile',0);
                  });
              }
              
              toast.present();
            });
        }else if(this.fullCourse.course.price == 0 && !this.config.isLoggedIn){
          let toast = this.toastCtrl.create({
                  message: this.config.get_translation('register_account'),
                  duration: 1000,
                  position: 'bottom'
              });
          toast.present();
              
        }else{

          console.log(pricing);
          console.log(this.config.settings);
          let title:string = '';
          let subTitle:string = '';
          
          // NON FREE COURSES

          let buttons:any=[];
          

          if(this.config.settings.inappbrowser_purchases && this.config.settings.wallet){
            buttons = [
                {
                  text: this.config.get_translation('cancel'),
                  role: 'cancel',
                  handler: () => {
                    console.log('Cancel clicked');
                  }
                },
                {
                  text: this.config.get_translation('buy_from_site'),
                  handler: () => {
                    this.buyFromSite(pricing);
                  }
                },
                {
                  text: this.config.get_translation('pay')+' '+pricing.value,
                  handler: () => {
                    this.handleWalletPayment(pricing);
                  }
                }
              ];
              title = this.config.get_translation('buy');
              subTitle = this.config.get_translation('use_wallet');
          }else if(this.config.settings.wallet && !this.config.settings.inappbrowser_purchases){
            buttons = [
                {
                  text: this.config.get_translation('cancel'),
                  role: 'cancel',
                  handler: () => {
                    console.log('Cancel clicked');
                  }
                },
                {
                  text: this.config.get_translation('pay')+' '+pricing.value,
                  handler: () => {
                    this.handleWalletPayment(pricing);
                  }
                }
              ];
              title = this.config.get_translation('pay_from_wallet');
              subTitle = this.config.get_translation('use_wallet');
          }else if(!this.config.settings.wallet && this.config.settings.inappbrowser_purchases){
            buttons = [
                {
                  text: this.config.get_translation('cancel'),
                  role: 'cancel',
                  handler: () => {
                    console.log('Cancel clicked');
                  }
                },
                {
                  text: this.config.get_translation('buy_from_site'),
                  handler: () => {
                    this.buyFromSite(pricing);
                  }
                },
              ];
              title = this.config.get_translation('buy');
          }else{
             buttons = [
                {
                  text: this.config.get_translation('cancel'),
                  role: 'cancel',
                  handler: () => {
                    console.log('Cancel clicked');
                  }
                }
               
              ];
              title = this.config.get_translation('buy');
          }
      
          let alert = this.alertCtrl.create({
              title: title,
              subTitle:subTitle,
              buttons: buttons
          });
          alert.present();
        }
      }
        
      buyFromSite(pricing){
          this.platform.ready().then(() => { 
          console.log(this.fullCourse);
          if(pricing.source == 'pmpro_membership'){

            if(!this.config.isLoggedIn){
              let toast = this.toastCtrl.create({
                  message: this.config.get_translation('register_account'),
                  duration: 1000,
                  position: 'bottom'
              });
              toast.present();
              return;
            }

            let loading = this.loadingCtrl.create({
                content: '<img src="assets/images/bubbles.svg">',
                duration: 20000,//this.config.get_translation('loadingresults'),
                spinner:'hide',
                showBackdrop:true,

            });

            loading.present();
            this.courseService.checkAndAssignPmproLevel(pricing,this.fullCourse).subscribe(res=>{
              
              if(res.status){
                this.activateBuyPopup = false;
                this.storage.remove('courses_'+this.config.user.id);
                this.storage.remove('fullcourse_'+this.course.id);
                this.config.removeFromTracker('courses',this.course.id);
                this.config.removeFromTracker('profiletabs','courses');


                this.userService.addCourse(this.course).subscribe(res=>{
                  let toast = this.toastCtrl.create({
                      message: res.message,
                      duration: 3500,
                      position: 'bottom'
                  });
                  loading.dismiss();
                  if(res.status){  
                      toast.onDidDismiss(() => {
                          this.getCourse(this.course,true);
                          this.config.updateComponents('profile',0);
                      });
                  }
                  
                  toast.present();
                });
              }else{
                loading.dismiss();
                let toast = this.toastCtrl.create({
                  message: res.message,
                  duration: 3500,
                  position: 'bottom',
                });

                toast.present(); 
              }
              
            });
            return;
          }

          if(pricing.link){

            this.browser = this.iab.create(pricing.link, "_blank","location=no"); //, "

            this.browser.show();
            this.browser.insertCSS({ code: "header,footer{display:none;}" });
            if(this.config.isLoggedIn){
              this.browser.executeScript({ code: "jQuery(document).ready(function(){ jQuery('#billing_email').val("+this.config.user.email+");jQuery('#billing_first_name').val("+this.config.user.name+"); });" });  
            }
            this.browser.on('loadstart').subscribe((event) => {
              
              if(pricing.source == 'woocommerce' && event.url.indexOf('?key=wc_order_') !== -1){
                let matches = event.url.match('.+/([0-9]+)/.+');
                this.browser.close();
                this.getCourse(this.course,true);
                this.config.updateComponents('profile',0);
                //get order id
                //let order_id = matches[1];
                
              }
            });
            this.browser.on('exit').subscribe((event) => {
              this.browser.close();
            });
          }
        });
      }

      handleWalletPayment(pricing){
          if(this.config.isLoggedIn){
              console.log(this.walletService.wallet);
              
              if(this.walletService.wallet.amount >= pricing.value){

                  this.walletService.walletPayment({'amount':pricing.value,'type':'debit','extras':{'pricing':pricing,'course':this.fullCourse}})
                  .subscribe((res:any)=>{
                          if(res){
                              let toast = this.toastCtrl.create({
                                message: res.message,
                                duration: 1000,
                                position: 'bottom',
                              });

                              toast.present();   
                              if(res.status){
                                  toast.onDidDismiss(()=>{
                                      this.getCourse(this.course,true);
                                      this.config.updateComponents('profile',0);       
                                  });
                              }
                          }
                      }
                  );
                  
              }else{
                  let toast = this.toastCtrl.create({
                    message: this.config.get_translation('insufficient_funds'),
                    duration: 1000,
                    position: 'bottom',
                  });

                  toast.present();
              }
              
          }else{

              let toast = this.toastCtrl.create({
                    message: this.config.get_translation('login_to_buy'),
                    duration: 1000,
                    position: 'bottom',
                  });

                toast.present();
                toast.onDidDismiss(()=>{
                    this.navCtrl.setRoot(ProfilePage,{});       
                });  
              
          }
      }

      isSwipedPrice(pricing){
          if(this.coursePriceSelected.indexOf(pricing) !== -1){
              return true;
          }
          return false;
      }
}
