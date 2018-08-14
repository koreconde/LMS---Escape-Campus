import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { Storage } from '@ionic/storage';
import { ConfigService } from "./config";

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

/**
 * This service is used for displaying blog and posts 
 */

@Injectable()
export class BlogService{ 

	paged:number=1;
	posts:any[]=[];
    fullposts:any[]=[];
    private allpostssobservable: Observable<any>;
    private postobservable: Observable<any>;
	constructor(
    	public http:Http,
        private storage: Storage,
        private config:ConfigService,
    ) {
	}

    /**
    * Get Posts from Blog, if cached show cached posts
    * @return {Observable}
    */
	public getPosts(paged:number=1){


		//console.log('PAGED '+paged+' Loaded Posts = '+this.posts.length+' Tacker Posts ='+this.config.trackComponents('blog'));

		if( this.posts && this.config.trackComponents('allposts') >= paged*this.config.settings.per_view){

			if(this.posts.length >= paged*this.config.settings.per_view){            
                return Observable.of(this.posts);
            }else{
                console.log('fetching blog psots from localstorage)');
                this.allpostssobservable = Observable.fromPromise(this.storage.get('posts').then((posts) => {
                    if(posts){
                        console.log(posts);
                        this.posts = posts;
                    }
                }));
            }
		}else{
			let url = `${this.config.baseUrl}blog/?per_page=`+this.config.settings.per_view+'&page='+paged;
			
			if(this.allpostssobservable) {
                return this.allpostssobservable;
            }else{

            	this.allpostssobservable = this.http.get(url).map(res=>{

            		this.allpostssobservable = null;
                    
                    res = res.json();
                    console.log('FETCHING RES');
                    console.log(res);
                   if(res && Array.isArray(res)){
                        if(Array.isArray(this.posts)){
                            this.mergePosts(this.posts,res);
                        }else{
                            this.posts = res;
                        }
                        console.log("posts stored");
                        this.storage.set('posts',this.posts);
                        this.config.updateComponents('allposts',this.posts.length);
                        return this.posts;
                    } 
					
				});
			}	
		}

		return this.allpostssobservable;
	}

    /**
    * Merge Posts
    * @return {array}
    */
	public mergePosts(postsA: any[],postsB: any){

        for(let i=0;i<postsB.length;i++){
            var flag = 1;
            for(let j=0;j<postsA.length;j++){
                if(postsB[i].id == postsA[j].id){
                    flag= 0;
                }
            }
            if(flag){
                postsA.push(postsB[i]);
            }
        }
        return postsA;
    }

    /**
    * Get single post from blog
    * @return {Observable}
    */
    public getPost(postID:number){
        let allp = this.config.trackComponents('fullposts');
        if(allp && allp.indexOf(postID) != -1){
            let flag =1;
            if(Array.isArray(this.fullposts)){
                if(this.fullposts.length){
                    for(let i=0;i<this.fullposts.length;i++){
                        if(this.fullposts[i].id == postID){
                            flag=0;
                            return Observable.of(this.fullposts[i]); //return if already cached
                        }
                    }    
                }
            }

            if(flag){
                console.log('Storage Full course');
                this.postobservable = Observable.fromPromise(this.storage.get('fullpost_'+postID).then((fullpost) => {
                    
                    if(fullpost){
                        this.fullposts.push(fullpost);
                        return fullpost;
                    }
                    
                }));
            }

        }else{

            let url = `${this.config.baseUrl}blog/`+postID;
            
            if(this.postobservable) {
                return this.postobservable;
            }else{

                this.postobservable = this.http.get(url).map(res=>{

                    this.postobservable = null;
                    
                    res = res.json();
                    console.log('FETCHING RES');
                    console.log(res);
                   if(res){
                        if(Array.isArray(this.fullposts)){
                            this.mergePosts(this.fullposts,[res]);
                        }else{
                            this.fullposts = [res];
                        }
                        this.storage.set('fullposts',this.fullposts);
                        
                        //this.config.updateComponents('blog',this.posts.length);
                    } 
                    
                    return res;
                });
            }   
        }

        return this.postobservable;
    }
}