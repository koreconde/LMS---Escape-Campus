import { Injectable,  } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { Platform, LoadingController, ToastController } from 'ionic-angular';

import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';
import { User } from "../models/user";
//import { InAppBrowser } from 'ionic-native';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ConfigService } from "./config";


import { TabsPage } from '../pages/tabs/tabs';

import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device';

import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';

@Injectable()
export class AuthenticationService {  


	client_id: string;
	client_secret: string;
	redirect_uri: string;
	state: string;


	browser:any;

    //For Testing purpose
    headers: any;
    access_token: string;
    authCode: string;

    user:User;
	private observable: Observable<any>; //Tracks request in progress
    private fbObservable: Observable<any>; //fb Login
    private baseUrl;
    public fbloggedin:boolean = false;
    constructor(
    	public http:Http,
    	private platform : Platform,
        private storage: Storage,
        private config:ConfigService,
        public fb: Facebook, 
        public loadingCtrl:LoadingController,
        public toastCtrl:ToastController,
        private iab:InAppBrowser,
        private googlePlus: GooglePlus,
        private device: Device
        ) {
        
        this.baseUrl = this.config.oAuthUrl;
        this.client_id = this.config.settings.client_id; 
        this.client_secret = this.config.settings.client_secret;
        this.redirect_uri = this.config.settings.url; 
        this.state = this.config.settings.state; 

        if(!this.config.isLoggedIn){
           // this.fb.browserInit(this.config.settings.facebook.app_id, "v2.9");    
        }
        
         
        this.access_token = this.config.settings.access_token;//'mbyrxvaoicy7encgoi3t62jt1koiq6szqmystpt0';

    }

    public authorizeURL(){
    	return this.baseUrl+'authorize?client_id='+this.config.settings.client_id +'&redirect_uri='+this.redirect_uri+'&response_type=code&scope=basic&state='+this.config.settings.state;
    }

    public tokenURL(){
      return this.baseUrl+'token';
    }

    public getAccessToken(){
        
        if(this.access_token)
            return this.access_token;
        else 
            return this.config.settings.access_token;

    }

    public setAccessToken(token:any){
        console.log('Setting access token '+token);
        if(token){
            this.access_token =  token;
            console.log('setting token '+token);
            this.config.set_settings('access_token',token);
        }
    }

    public setUser(user:any){
        
        this.config.isLoggedIn = true;
        this.config.user = user;
        this.user = this.config.user;
        this.storage.set('user',this.user);
        this.config.addToTracker('user',user);
        this.config.getTracker();
    }

    private getHeaders(){
        this.headers = this.storage.get('token').then((token) => {
            return new Headers({
                "Content-Type": "application/json",
                "Authorization": token,
            });
        });
    }

    public authRequest(){

        this.platform.ready().then(() => {
        
            //, "EnableViewPortScale=yes,closebuttoncaption=Done"
            this.browser = this.iab.create(this.authorizeURL(), "_blank");

            this.browser.on('loadstop', function(event) {
                console.log('listen event oauth callback');

                if((event.url).startsWith(this.redirect_uri)) {
                    console.log('oauth callback url');
                    var query = event.url.substr(event.url.indexOf('?code') + 1);
                    var data = {};
                    var parts = query.split('&');

                    console.log(parts);

                    // read names and values
                    for (var i = 0; i < parts.length; i++) {
                        var name = parts[i].substr(0, parts[i].indexOf('='));
                        var val = parts[i].substr(parts[i].indexOf('=') + 1);
                        val = decodeURIComponent(val);
                        data[name] = val;
                        if(name == 'code'){
                            console.log('authorization code = '+val);
                            this.authCode = val;
                        }
                        if(name == 'error'){
                            this.browser.close();
                            let toast = this.toastCtrl.create({
                                  message: val,
                                  duration: 1000,
                                  position: 'bottom'
                            });

                            toast.present();
                        }
                    }
                    let body = JSON.stringify({
                              grant_type: 'authorization_code',
                              code:this.authCode,
                              client_id:this.client_id,
                              client_secret: this.client_secret,
                              redirect_uri:this.redirect_uri
                          });

                    let loading = this.loadingCtrl.create({
                        content: '<img src="assets/images/bubbles.svg">',
                        duration: 2000,
                        spinner:'hide',
                        showBackdrop:true,

                    });

                    loading.present();

                    this.http.post(this.tokenURL(), body)
                      .map(res => res.json())
                      .subscribe(
                          data => {
                              console.log(data);
                              if(!data.error){
                                this.access_token = data.access_token;
                                this.setAccessToken(data.access_token);
                                let opt = this.getUserAuthorizationHeaders();
                                this.http.get(`${this.config.baseUrl}user/?full`,opt)
                                .map(response =>{                  
                                    if(response.status == 400) {
                                      return "FAILURE";
                                    } else if(response.status == 200) {
                                        let body = response.json();
                                        console.log(body);
                                        if(body){ 
                                            this.setUser(body);
                                        }
                                    }
                                }); 
                              }
                              loading.dismiss();
                          },
                          err => {
                            console.log("ERROR!: ", err);
                          }
                      );
                
                }
            });


        });

        //return this.access_token;
    }

    public getUser(){
        
        if(this.config.trackComponents('user')){
            
                this.storage.get('user').then((user) => {
                    this.user = user;
                    return Observable.of(this.user);
                });
        }else{

            let opt = this.getUserAuthorizationHeaders();

            this.observable =  this.http.get(`${this.config.baseUrl}user/`,opt)
                .map(response =>{
                    this.observable = null;                    
                    if(response.status == 400) {
                      return "FAILURE";
                    } else if(response.status == 200) {

                        let body = response.json();
                        console.log(body);
                        if(body){ 
                            this.user = body;
                            this.config.updateComponents('user',this.user.id);
                            this.storage.set('user',this.user);
                            return body;
                        }
                    }
                }); 
        }
        return this.observable;
    }
    public fbLogin(): Observable<any>{
        console.log('FB CLICKED');
        let  permissions = ["public_profile","email"];
        let obj = {};
        //let env = this;
        let params = [];

        
        return Observable.fromPromise(this.fb.login(permissions).then(
            res=>{
                return Observable.fromPromise(this.fb.api("/me?fields=name,email,gender", params)
                .then(function(user) {
                    console.log('FB User response');
                    console.log(user);
                    //env.fbloggedin=true;
                    return {
                        'name':user.name,
                        'email':user.email,
                        'fbid': user.id,
                        'avatar':"https://graph.facebook.com/" + user.id + "/picture?type=large",
                    };
                    
                }));
            }
        ));    
    }

    public googleLogin(): Observable<any>{
        let loading = this.loadingCtrl.create({
            content: '<img src="assets/images/bubbles.svg">',
            duration: 2000,
            spinner:'hide',
            showBackdrop:true,

        });

        loading.present();


        return Observable.fromPromise(this.googlePlus.login({}).then((res) => {
            console.log('Response');
            console.log(res);
            loading.dismiss();
            return {
                        'name':res.displayName,
                        'email':res.email,
                        'gid': res.userId,
                        'avatar':res.imageUrl,
                    };

            
        }, (err) => {
            console.log('Error');
            console.log(err);
        }));
    }

    public logout(user){
        if(user){
            let opt = this.getUserAuthorizationHeaders();
            let url = `${this.config.baseUrl}user/logout`;
            this.http.post(url,{},opt).subscribe(res=>{

            });
            console.log(this.config.defaultTrack);
            console.log('this.config.defaultTrack;');
            console.log(this.config.track);
            this.config.track = this.config.defaultTrack;
        }
        this.fb.logout();
        this.googlePlus.logout();
    }
    
    public signinUser(form:any): Observable<any>{

        
        form.client_id = this.client_id;
        form.state = this.config.settings.state;
        form.device = this.device.uuid;
        form.platform = this.device.platform;
        form.model = this.device.model;

        let headers = new Headers({
            'Content-Type': 'application/json'
        });
        let options = new RequestOptions({
            headers: headers
        });

        this.observable =  this.http.post(`${this.config.baseUrl}user/signin`,form,options)
            .map(response =>{
                this.observable = null;    
                console.log('signinuser first response');
                    console.log(response);
                if(response.status == 400) {
                  return "FAILURE";
                } else if(response.status == 200) {
                    console.log('signinuser response');
                    console.log(response);
                    let body = response.json();
                    console.log('Attempting Signin');
                    console.log(body);
                    if(body.status){
                        this.setAccessToken(body.token.access_token);
                        this.setUser(body.user);
                        this.config.track.counter--;
                        //this.config.getTracker();
                    }

                    return {'status':body.status,'message':body.message};
                }
            });

        return this.observable;    

    }

    public registerUser(form:any): Observable<any>{
        console.log(form); 
        
        form.client_id = this.client_id;
        form.state = this.config.settings.state;
        form.device = this.device.uuid;
        form.platform = this.device.platform+' ( '+this.device.version+') ';
        form.model = this.device.model;

        let headers = new Headers({
        'Content-Type': 'application/json'
        });
        let options = new RequestOptions({
            headers: headers
        });

        this.observable =  this.http.post(`${this.config.baseUrl}user/register`,form,options)
            .map(response =>{
                this.observable = null;    

                if(response.status == 400) {
                  return "FAILURE";
                } else if(response.status == 200) {

                    let body = response.json();
                    if(body.status){
                        this.setAccessToken(body.token.access_token);
                        this.setUser(body.user);
                    }

                    return {'status':body.status,'message':body.message};
                }
            });

        return this.observable;    

    }

    public checkEmailAvailability(control:any){
        let email = control.value;
        console.log('CALLED ='+email);
        return new Promise(resolve => {
            this.http.get(`${this.config.baseUrl}user/verify/?email=`+email)
              .map(res => res.json())
              .subscribe(data => {
                resolve(data);
              });
          });
    }
    public checkUsernameAvailability(control:any){
        let username = control.value;
        console.log('CALLED ='+username);
        return new Promise(resolve => {
            this.http.get(`${this.config.baseUrl}user/verify/?username=`+username)
                .map(res => res.json())
                .subscribe(data => {

                    resolve(data);
              });
          });
    }

    public getUserAuthorizationHeaders(){
        var userheaders = new Headers();
        userheaders.append('Authorization', this.config.settings.access_token);
        return new RequestOptions({ headers: userheaders }); 
    }


    public openRegistration(){

    }

    public signIn(){
        this.authRequest();
    }
}  	