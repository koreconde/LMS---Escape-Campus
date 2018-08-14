import { Component, OnInit } from '@angular/core';

import { NavController,LoadingController,ModalController } from 'ionic-angular';

import { ConfigService } from '../../services/config';
import { BlogService } from '../../services/blog';

import { PostPage } from '../post/post';
import { ProfilePage } from '../profile/profile';
import { SearchPage } from '../search/search';

@Component({
  selector: 'page-blog',
  templateUrl: 'blog.html'
})
export class BlogPage implements OnInit{

    posts:any[]=[];
    profilePage=ProfilePage;
    userdata:any;
    noMorePostsAvailable:boolean=false;
    paged:number=1;
    constructor(
  		public navCtrl: NavController,
  		private config:ConfigService,
  		private blog:BlogService,
      public loadingController: LoadingController,
      private modalCtrl:ModalController
  	) {

    }

    ngOnInit(){


      let loading = this.loadingController.create({
          content: '<img src="assets/images/bubbles.svg">',
          duration: 15000,//this.config.get_translation('loadingresults'),
          spinner:'hide',
          showBackdrop:true,

      });

        loading.present();

    	this.blog.getPosts(this.paged).subscribe(res=>{
        if(res){
          this.posts = res;
          console.log(this.posts);
        }
        loading.dismiss();
    	});
    }

    loadPost(post:any){
    	this.navCtrl.push(PostPage,post);
    }

    doRefresh($event:any){
      this.blog.getPosts().subscribe(res=>{
        if(res){
          this.posts = res;
        }
      });
    }

    doInfinite($event){
      
      if(this.posts.length >= this.config.settings.per_view*this.paged){
        this.paged++;
        this.blog.getPosts(this.paged).subscribe(res=>{
        if(res){
          this.posts=res;
        }
        $event.complete();
      });
      }else{
        this.noMorePostsAvailable = true;
      }
    }

    openSearch(){
        let modal = this.modalCtrl.create(SearchPage);
        modal.present();
    }
}
