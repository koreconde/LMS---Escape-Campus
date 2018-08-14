import { Component, OnInit , ViewChild} from '@angular/core';

import { NavController,LoadingController, ToastController, Slides,Platform } from 'ionic-angular';

import { ConfigService } from '../../services/config';
import { WalletService } from '../../services/wallet';

import { Storage } from '@ionic/storage';
import { Wallet } from "../models/wallet";

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { Chart } from 'chart.js';

@Component({
  selector: 'page-wallet',
  templateUrl: 'wallet.html',
})

export class WalletPage implements OnInit{

    wallet:any;
    transactions:any=[];

	  walletTabslist:any=[];
	  products:any=[];
	  wallettransactionstab:number=0;
    noMoreTransactionsAvailable:boolean=false;
    transactionpaged:number=1;
    transactiontype:any='all';

  	@ViewChild('WalletTabs') walletTabs: Slides;
  	@ViewChild('WalletSlides') walletSlides: Slides;

  	constructor(
  	private walletService:WalletService,
  	private config:ConfigService,
  	private toast:ToastController,
  	private nav:NavController,
  	private storage:Storage
  	) {
  		
  		this.walletTabslist=[
  		{'name':'Dashboard','value':'dashbord','icon':'md-speedometer'},
  		{'name':'Transactions','value':'transactions','icon':'md-analytics'}
  		];
  	}

  	ngOnInit(){
  		
        this.walletService.getWallet(true).subscribe(res=>{
            if(res){
              console.log('Got wallet');
                this.wallet=res;
                console.log(this.wallet);
            }
        });

        
  		this.walletService.getProducts().then((products) => {
		   if(products){
		   	this.walletService.products=products;
		   	this.products=products;
		   }

       this.products.push({
        'productId':'sample',
        'price':'10',
        'title':'Sample Product',
        'description':'Sample product',
       });
		 })
		 .catch((err) => {
		   console.log(err);
	 	}); 

  	}


  	onTabChanged(){
        let index = this.walletTabs.getActiveIndex();
        this.walletSlides.slideTo(index, 500);
    }
    onSlideChanged(){
        let index = this.walletSlides.getActiveIndex();
        this.walletTabs.slideTo(index,500);
        
        if(index){
            console.log('fetching transactions');
            this.walletService.getTransactions({force:false,type:'all',paged:1}).subscribe(res=>{
              console.log('Got transactions');
                if(res){
                  this.transactions = this.walletService.mergeTransactions(this.transactions,res);
                  this.transactions.sort((a,b) => {
                    if (a.date > b.date)
                      return -1;
                    if (a.date < b.date)
                      return 1;
                    return 0;
                  });
                  console.log('Sorted transactions');
                  console.log(this.transactions);
                }
            });
        }
    }

    selectedTab(index:number){
        this.walletSlides.slideTo(index, 500);
    }

    doRefresh(refresher){
        let index = this.walletSlides.getActiveIndex();
        console.log(index);
        if(index){
        	this.walletService.getTransactions({force:true,type:this.transactiontype,paged:this.transactionpaged}).subscribe(res=>{
                if(res){
                    this.transactions = res;
                }
                refresher.complete();
            });
        }else{
            this.walletService.getWallet(true).subscribe(res=>{
                if(res){
                    this.transactions = this.walletService.mergeTransactions(this.transactions,res);
                }
            });
        	this.walletService.getProducts().then((products) => {
    		 	console.log(products);
    		   if(products){
    		   	this.walletService.products=products;
    		   	this.products=products;
    		   	refresher.complete();
    		   }
    		 })
    		 .catch((err) => {
    		   console.log(err);
    		   refresher.complete();
    	 	});
        }
    }
    
    gettimediff(time:number){
    	return (this.config.timestamp - time);
    }

    getWalletAmount(){
		return this.walletService.wallet.amount;
	}

	restorePurchases(){
		this.walletService.restorePurchases().then(function(purchases) {
    		console.log(JSON.stringify(purchases));
  		})
  		.catch(function (err) {
    		console.log(err);
  		});
	}

  showTransactions(type:any){
    this.transactiontype = type;
    this.transactions = this.walletService.transactions;
    this.transactionpaged = 1;
    if(type == 'credit'){
      this.wallettransactionstab = 1;
    }
    if(type == 'debit'){
      this.wallettransactionstab = 2;
    }
    if(type == 'all'){
      this.wallettransactionstab = 0;
    }

    if(this.transactions.length && type != 'all'){
        this.transactions = this.transactions.filter((item) => {
              return item.status.toLowerCase().indexOf(type) > -1;
          });
      }
  }



  loadMoreTransactions(event:any){
        
        this.transactionpaged++;


        this.walletService.getTransactions({force:false,type:this.transactiontype,paged:this.transactionpaged}).subscribe(res=>{
            if(res){
                this.transactions = this.walletService.mergeTransactions(this.transactions,res);
                this.transactions.sort((a,b) => {
                  if (a.date > b.date)
                    return -1;
                  if (a.date < b.date)
                    return 1;
                  return 0;
                });
                if(this.walletService.transactions.length >= this.config.trackComponents('transactions')){
                  this.noMoreTransactionsAvailable = true;
                }
            }
            event.complete();
        });
  }
}

