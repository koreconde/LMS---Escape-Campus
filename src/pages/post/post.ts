import { Component,OnInit } from '@angular/core';

import { NavController,NavParams,LoadingController } from 'ionic-angular';
import { ConfigService } from '../../services/config';
import { BlogService } from '../../services/blog';

@Component({
  selector: 'page-post',
  templateUrl: 'post.html'
})
export class PostPage implements OnInit {

	post:any;
	constructor(public navCtrl: NavController,
		private navParams:NavParams,
		private blog:BlogService,
		private config:ConfigService,
		private loadingController:LoadingController) {

	}

	ngOnInit(){
		this.post = this.navParams.data;
		let loading = this.loadingController.create({
	          content: '<img src="assets/images/bubbles.svg">',
	          duration: 15000,//this.config.get_translation('loadingresults'),
	          spinner:'hide',
	          showBackdrop:true,
	    });

        loading.present();
		this.blog.getPost(this.post.id).subscribe(res=>{
			console.log('gotcha');
			console.log(res);
	        if(res){
	          this.post['content'] = res['content'];
	          console.log('Content post');
	          console.log(this.post);
	        }
	        loading.dismiss();
    	});
	}
}
