import { Component, OnInit, ViewChild } from '@angular/core';
import { Content,NavController,ViewController,LoadingController, ToastController,ActionSheetController,AlertController, NavParams, Slides,Platform } from 'ionic-angular';
import { FormBuilder, FormGroup,FormControl, Validators, } from '@angular/forms';

//import { InAppBrowser } from 'ionic-native';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import 'rxjs/add/operator/toPromise';


import { AuthenticationService } from '../../services/authentication';
import { UserService } from '../../services/users';
import { ConfigService } from '../../services/config';

import { User } from '../../models/user';
import { Profile } from '../../models/user';
import { CourseStatusPage } from '../course-status/course-status';
import { ResultPage } from '../result/result';
import { FriendlytimeComponent } from '../../components/friendlytime/friendlytime';
import {ProfilePage} from '../profile/profile';

import { PressDirective } from '../../directives/longPress.directive';
import { TabsPage } from '../tabs/tabs';

import { Storage } from '@ionic/storage';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Chart } from 'chart.js';

@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage implements OnInit{

	isLoggedIn: boolean = false;
    register: boolean = false;
    signin: boolean = false;
	user: User;
    profile: Profile;
    currentTab:string='dashboard';
    signupForm: FormGroup;
    signinForm: FormGroup;


    signupFields:{
        'username':null,
        'email':null,
        'password':null,
    };

    @ViewChild(Content) content: Content;

  	constructor(private navCtrl: NavController, 
        private viewCtrl: ViewController, 
        private toastCtrl: ToastController,
        private navParams : NavParams, 
        private auth: AuthenticationService, 
        private userService:UserService,
        private platform:Platform,
        private config:ConfigService,
        private storage:Storage,
        private formBuilder:FormBuilder,
        private loadingCtrl:LoadingController,
        private action:ActionSheetController,
        private alertCtrl:AlertController,
        private camera: Camera,
        private iab:InAppBrowser
        ) {

            this.signupForm = formBuilder.group({
                username: ['',Validators.compose([Validators.required,Validators.maxLength(30), 
                    Validators.pattern(/[a-zA-Z0-9_]+/)]),
                ],
                email: ['', Validators.compose(
                    [Validators.required,Validators.maxLength(40), 
                    Validators.pattern(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/) ])],
                password: ['', Validators.required],
            });

            this.signinForm = formBuilder.group({
                username: ['',Validators.required],
                password: ['', Validators.required],
            });
        }

    ngOnInit(){
        this.isLoggedIn = this.config.isLoggedIn;
        this.user = this.config.user;
        
        if(!this.config.settings.access_token){
            this.isLoggedIn = false;
        }
        
    }

    launchAuthorize() {
        this.auth.authRequest();        
    }

  	onClose(){
  		console.log("close");
  		this.viewCtrl.dismiss();
  	}

  	onSignUp(){
  		console.log(this.signupForm);

        let loading = this.loadingCtrl.create({
            content: '<img src="assets/images/bubbles.svg">',duration: 15000,//this.config.get_translation('loadingresults'),
            spinner:'hide',
            showBackdrop:true,

        });

        loading.present();

        if(this.signupForm.valid){
            
            this.auth.registerUser(this.signupForm.value).subscribe(res=>{
                if(res){
                    loading.dismiss();

                    let toast = this.toastCtrl.create({
                        message: res.message,
                        duration: 2000,
                        position: 'bottom'
                    });

                    if(res.status){  
                        this.userService.getUser();
                        toast.onDidDismiss(() => {
                            this.navCtrl.setRoot(TabsPage);
                        });
                    }
                    
                    toast.present();
                }
            });
        }
  	}

  

    backToLogin(){
      this.navCtrl.push(ProfilePage);
    }

    showterms(){
        
        let alert = this.alertCtrl.create({
            title: this.config.get_translation('login_terms_conditions'),
            message:this.config.terms_conditions,
            buttons: [
            {
                text: this.config.get_translation('accept_continue'),
                role: 'cancel',
                }
            ]
        });
        alert.present();
    }

}
