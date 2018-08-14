import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {ConfigService} from '../../services/config';
import {QuizService} from '../../services/quiz';
import 'rxjs/Rx';
@Component({
  selector: 'timer',
  templateUrl: 'timer.html'
})
export class TimerComponent implements OnInit , OnChanges {

  
  
  hours:number=0;
  minutes:number=0;
  seconds:number=0;
  remaining: number=100;
  timer:any;


  @Input('time') time;
  @Input('quiz') quiz;
  @Input('start') start;
  @Output() QuizEnded: EventEmitter<number> = new EventEmitter<number>();

  constructor(private quizService:QuizService,private config:ConfigService) {
  }

    ngOnInit(){

        console.log('IS QUIZ STARTED');
        this.start = this.quizService.checkQuizStarted(this.quiz);
        console.log(this.start);
    }

    ionViewLoaded(){
        this.QuizTimer();
    }

    ngOnChanges(){
        
        if(this.remaining > 0){
          console.log("CHANGE DETECTED");
          this.start = this.quizService.checkQuizStarted(this.quiz);
          console.log('IS QUIZ STARTED ='+this.start); 
          this.QuizTimer();

        }
    }

    startQuiz($event:any){
        console.log('Event Captured');
        console.log($event);
        this.QuizTimer();

    }
    
    QuizTimer(){

        console.log('start '+this.start);

        if(this.start){
            console.log('Time '+this.time);
            let endtimer = this.time*1000;
            const stopTimer$ = Observable.timer(endtimer);
            
            setTimeout(() => {
              this.remaining = 0;
              console.log('SetTimeout fired');
              this.QuizEnded.emit(this.quiz);
            },endtimer);
            console.log(this.time);
            this.timer = Observable.timer(1000,1000).takeUntil(stopTimer$);
            this.timer.subscribe(t => {
                
                //console.log(t+'-- t | time ->'+this.time);
                let newtime = this.time - t;
                this.hours = Math.floor(newtime/3600);
                this.minutes = Math.floor((newtime - 3600*this.hours)/60);
                this.seconds = newtime - 3600*this.hours -60*this.minutes;
                this.remaining = Math.floor(100*(newtime/this.time));
                //console.log(this.remaining+'<= REMAINING | newtime = '+newtime);

            });


        }else{
          this.hours = Math.floor(this.time/3600);
          this.minutes = Math.floor((this.time - 3600*this.hours)/60);
          this.seconds = this.time - 3600*this.hours -60*this.minutes;
        }
    }
}
