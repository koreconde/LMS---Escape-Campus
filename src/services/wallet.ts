import { Injectable} from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';

import {LoadingController, ToastController} from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { ConfigService } from "./config";


import { Wallet } from "../models/wallet";

import { WalletTransaction } from "../models/wallet";
import { AuthenticationService } from "./authentication";

import { InAppPurchase } from '@ionic-native/in-app-purchase';

import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class WalletService{  
	

	wallet:Wallet;
	products:any=[];
	transactions:WalletTransaction[]=[];

	private walletObservable:Observable<any>;
	private transactionsObservable:Observable<any>;

	constructor(
        private storage: Storage,
        private config:ConfigService,
        private iap: InAppPurchase,
        private auth:AuthenticationService,
        private http:Http,
        private toast:ToastController,
        private loadingCtrl:LoadingController) {
        console.log(this.config.user);
        console.log('##### '+this.config.isLoggedIn);
        if(this.config.isLoggedIn){
            this.wallet = {
                'userid':this.config.user.id,
                'amount':0,
            };
        }

	}

	getWalletAmount(){
		return this.wallet.amount;
	}
	
	getWallet(force:boolean=false){

        console.log('WAllet CAlled in');
        if(this.config.isLoggedIn){
            if(this.config.trackComponents('wallet') && !force ){

                if(this.wallet && this.wallet.userid == this.config.user.id){
                    return Observable.of(this.wallet);
                }else{
                    this.walletObservable = Observable.fromPromise(
                        this.storage.get('wallet').then((wallet) => {
                        if(wallet && wallet.userid == this.config.user.id){
                            this.wallet = wallet;
                            console.log(this.wallet);
                            return this.wallet;
                        }
                    }));
                }
            }else{
                console.log('making wallet hit #3');
            	let opt = this.auth.getUserAuthorizationHeaders();
                console.log(opt);
                this.walletObservable = this.http.get(`${this.config.baseUrl}user/wallet`,opt)
                .map(response =>{
                    console.log('Got wallet hit response');
                    let body = response.json();
                    if(body){
                    	console.log('Wallet API call result');
                    	console.log(body);
                    	this.wallet=body;
                        this.config.updateComponents('wallet',1);
                        console.log('amount ='+this.wallet.amount);
                        return this.wallet;
                    }
                });
            }
        }

        return this.walletObservable;
    }
	//Returns Promise Always use .then and .catch to avoid errors
	getProducts(){
        let walletproducts:any=[];
        if(this.config.wallet.length){
            for(let i=0;i<this.config.wallet.length;i++){
                walletproducts.push(this.config.wallet[i].product_id);
            }
        }
		return this.iap
		 .getProducts(walletproducts);
	}

	getTransactions(args:any){

		if((this.config.trackComponents('transactions') && this.config.trackComponents('transactions') <= this.transactions.length) && !args.force){
            
            if(this.transactions.length){
                return Observable.of(this.transactions);
            }else{
                this.transactionsObservable = Observable.fromPromise(
                    this.storage.get('transactions').then((transactions ) => {
                    if(transactions){
                        this.transactions = transactions;
                        return this.transactions;
                    }
                }));
            }
        }else{

        	let opt = this.auth.getUserAuthorizationHeaders();
            this.transactionsObservable = this.http.get(`${this.config.baseUrl}user/wallet/transactions?type=`+args.type+`&per_page=`+this.config.settings.per_view+`&paged=`+args.paged,opt)
            .map(response =>{
                let body = response.json();
                if(body){
                	this.transactions = this.mergeTransactions(this.transactions,body);
                	this.storage.set('transactions',this.transactions);
                    console.log(this.transactions.length);
                    return this.transactions;
                }
            });
        }
        return this.transactionsObservable;
	}

	mergeTransactions(trx:any,trans:any){
      console.log('1');
      for(let i=0;i<trans.length;i++){
        let merge=1;
        for(let j=0;j<trx.length;j++){
        	//console.log(trx[j].transactionid + ' == '+ trans[i].transactionid);
          	if(trx[j].transactionid == trans[i].transactionid){
            	merge=0;
            break;
          }
        }
        if(merge){
          trx.push(trans[i]);
        }
      }
      return trx;
    }

    
    walletPayment(args:any){

        let transaction:any;
        let opt = this.auth.getUserAuthorizationHeaders();

        transaction = {
            'userid':this.config.user.id,
            'transactionid':this.config.timestamp,
            'pid':args.extras.course.course_id,
            'status':args.type,
            'store':'wallet',
            'date':this.config.timestamp,
            'amount':args.amount,
            'points':args.amount,
            'description':args.extras.course.course.name,
            'more':{
                'type':'subscribe_course',
                'course':args.extras.course.course.id,
                'pricing':args.extras.pricing,
            }
        };

        return this.http.post(`${this.config.baseUrl}user/wallet/update`,transaction,opt)
            .map(response =>{
                let body = response.json();
                if(body){
                    if(body.status == 'success'){
                        this.wallet.amount = body.points;
                        this.transactions.push(transaction);
                        this.storage.set('wallet',this.wallet);
                        this.storage.set('transactions',this.transactions);
                    }
                    return body;
                }
            });
    }

	buyProduct(product:any){

		let transaction:any;
		

        let loading = this.loadingCtrl.create({
            content: '<img src="assets/images/bubbles.svg">',
            duration: 3000,
            spinner:'hide',
            showBackdrop:true,

        });
        loading.present();
		if(product.productId == 'sample'){
			let opt = this.auth.getUserAuthorizationHeaders();

			transaction = {
  				'userid':this.config.user.id,
	  			'transactionid':this.config.timestamp,
	  			'pid':'sample',
	  			'status':'credit',
	  			'store':'sample',
	  			'date':this.config.timestamp,
	  			'amount':10,
	  			'points':10,
	  			'description':product.title,
	  		};

	  		
            return this.http.post(`${this.config.baseUrl}user/wallet/update`,transaction,opt)
            .map(response =>{
                let body = response.json();
                if(body){
                	let toast = this.toast.create({
                                message: body.message,
                                duration: 1000,
                                position: 'bottom'
                            });
                    toast.present();

                    if(body.status == 'success'){
                        this.wallet.amount = body.points;
                        this.transactions.push(transaction);    
                        this.storage.set('wallet',this.wallet);
                        this.storage.set('transactions',this.transactions);
                    }
                    loading.dismiss().catch((err) => console.log(err));
                    return body;
                }
            }).toPromise();
		}else{
			return this.iap
		  		.buy(product.productId)
		  		.then((data)=> {
		  			console.log(data);
		  			if(data){
                        let points = 0;
                        for(let k=0;k< this.config.wallet.length;k++){
                            if(product.productId == this.config.wallet[k].product_id){
                                points = this.config.wallet[k].points;
                            }
                        }
                        
			  			transaction = {
			  				'userid':this.config.user.id,
				  			'transactionid':data.transactionId,
				  			'pid':product.productId,
				  			'status':'credit',
				  			'store':'google',
				  			'date':this.config.timestamp,
				  			'amount':product.price,
                            'points':points,
				  			'description':product.title,
                            'reciept':data.receipt,
                            'signature':data.signature,
				  		};
			  			
			  			//this.wallet.amount = this.wallet.amount + 

                        let opt = this.auth.getUserAuthorizationHeaders();

                        return this.http.post(`${this.config.baseUrl}user/wallet/update`,transaction,opt)
                            .map(response =>{
                                let body = response.json();
                                if(body){

                                    let toast = this.toast.create({
                                        message: body.message,
                                        duration: 1000,
                                        position: 'bottom'
                                    });
                                    toast.present();

                                    if(body.status == 'success'){
                                        this.wallet.amount = body.points;
                                        this.transactions.push(transaction);    
                                        this.storage.set('wallet',this.wallet);
                                        this.storage.set('transactions',this.transactions);
                                    }
                                    return body;
                                }
                                loading.dismiss().catch((err) => console.log(err));
                            }).subscribe(res=>{
                                return this.iap.consume(data.productType, data.receipt, data.signature);        
                            });

			  		}
		  		})
		  		.catch((err)=> {
                    loading.dismiss().catch((err) => console.log(err));
		    		console.log(err);
		  		});
		}
	}

	restorePurchases(){
		return this.iap.restorePurchases();
	}
	
}