import { Injectable, OnInit } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { CacheService } from "ionic-cache";

import { ConfigService } from "./config";
import { UserService } from "./users";

import { Storage } from '@ionic/storage';

@Injectable()
export class QuizService implements OnInit{  


	token:string;
    quiz_started:any[]=[];
    quiz_timer:any[]=[];
    results:any[]=[];
    isloggedin: boolean=false;

	private observable: Observable<any>; 
	
    constructor(private http:Http,
        private userService: UserService,
        private storage: Storage,
        private config:ConfigService) {
         
    }

    ngOnInit(){
        
    }

    getQuizStarted(){
        this.storage.get('quiz_started').then(res=>{
            if(res){
                this.quiz_started = res;
            }
        });
    }
    checkQuizStarted(quiz_id){
        if(this.quiz_started.indexOf(quiz_id)>-1){
            return true;
        }
        return false;
    }

    addQuizStarted(quiz_id){
        if(this.quiz_started.indexOf(quiz_id) == -1){
            this.quiz_started.push(quiz_id);
            this.storage.set('quiz_started',this.quiz_started);
            this.userService.quizStarted(quiz_id);
        }
    }

    removeQuizStarted(quiz_id){
        let key = this.quiz_started.indexOf(quiz_id);
        this.quiz_started.splice(key,1);
        this.storage.set('quiz_started',this.quiz_started);
    }

    getRemainingTimer(quiz_id,duration){
        if(this.quiz_started.indexOf(quiz_id) > -1){
            let k = this.quiz_started.indexOf(quiz_id);

           let current_time = Math.floor(new Date().getTime() / 1000);    
            if(!this.quiz_timer[k]){
                this.quiz_timer[k] = current_time
                this.storage.set('quiz_timer',this.quiz_timer);
                console.log('Quiz timer saved');    
            }
            
            duration = duration - (current_time - this.quiz_timer[k]);
            console.log('remaining duration :'+duration);
            
        }else{
            console.log('Quiz not started');
        }

        return duration;
    }

    stopTimer(quiz_id){
        if(this.quiz_started.indexOf(quiz_id) > -1){
            let k = this.quiz_started.indexOf(quiz_id);
            this.quiz_timer.splice(k,1);
            this.storage.set('quiz_timer',this.quiz_timer);
            console.log('Quiz timer removed');
        }
    }

    getTimer(quiz_id){
        return this.storage.get('quiz_timer').then(res=>{
            if(res){
                if(this.quiz_started.indexOf(quiz_id) > -1){
                    let k = this.quiz_started.indexOf(quiz_id);
                    return this.quiz_timer[k];
                }
            }
        });
    }
}