import { Injectable} from '@angular/core';

import { Storage } from '@ionic/storage';
import { ConfigService } from "./config";
import { Course } from "../models/course";

@Injectable()
export class WishlistService{  
	wishlist:Course[]=[];

	constructor(
        private storage: Storage,
        private config:ConfigService) {

	}

	getWishList(){
		console.log('fetching wishlist...');
		this.storage.get('wishlist').then(res => {
			if(res){
				this.wishlist = res;	
			}else{
				this.wishlist = [];
			}
			console.log('fetching complete..');
		});
	}

	addToWishlist(course:Course){
		if(!this.wishlist){
			this.wishlist=[];
		}
		if(!this.checkInWishList(course)){
			this.wishlist.push(course);
			this.storage.set('wishlist',this.wishlist);
		}
	}

	removeFromWishList(course:Course){
		if(this.wishlist && this.wishlist.length){
			var key = this.wishlist.indexOf(course);
			this.wishlist.splice(key,1);
			this.storage.set('wishlist',this.wishlist);
		}
	}

	checkInWishList(course:any){
		
		if(this.wishlist && this.wishlist.length){
			for(let i=0;i<this.wishlist.length;i++){
				if(this.wishlist[i].id == course.id){
					return true;
				}
			}
		}

		return false;
	}
}