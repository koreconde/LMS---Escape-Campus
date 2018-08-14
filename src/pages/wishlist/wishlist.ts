import { Component,OnInit } from '@angular/core';

import { ConfigService } from '../../services/config';
import { WishlistService } from '../../services/wishlist';
import { Courseblock } from '../../components/courseblock/courseblock';
@Component({
  selector: 'page-wishlist',
  templateUrl: 'wishlist.html',
})

export class WishlistPage implements OnInit{

  constructor(
  	private wishlistService:WishlistService,
  	private config:ConfigService) {
  	
  }

  ionViewDidEnter(){
  	console.log("FETCH");
  	this.wishlistService.getWishList();
  }
  ngOnInit(){
  	
  }

}
