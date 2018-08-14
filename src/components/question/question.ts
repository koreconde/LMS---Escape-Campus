import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { DragulaModule,DragulaService } from '../../../node_modules/ng2-dragula/ng2-dragula';

import {ConfigService} from '../../services/config';

@Component({
    selector: 'question',
    templateUrl: 'question.html'
})

export class QuestionComponent implements OnInit {

    answer:any;
    marks:number=0;
    flip:boolean = false;
    listOne:any;
    match_options:any;
    sort_options:any;
    @Input('question') question;
    @Input('display') display;
    @Output() answerChecked: EventEmitter<any> = new EventEmitter<any>();
    @Output() markedQuestion: EventEmitter<any> = new EventEmitter<any>();

    constructor(private config:ConfigService,
        private dragulaService: DragulaService) {
        
        
        
    }

    ngOnInit(){
        

        if(this.question.type == 'sort' || this.question.type == 'match'){
            this.sort_options = this.question.options.slice();
            this.answer=[];
            for(let l=0;l<this.sort_options.length;l++){                
                this.answer.push((this.question.options.indexOf(this.sort_options[l])+1));
            }

            this.dragulaService.dropModel.subscribe((value) => {
                this.answer=[];
                for(let l=0;l<this.sort_options.length;l++){                
                    this.answer.push((this.question.options.indexOf(this.sort_options[l])+1));
                }
                this.markedQuestion.emit(this.question);
                this.processCheckAnswer();
            });
        }

    }


    saveOptionAnswer(marked:number){
        this.answer = marked;
        this.question.status= 1;
        this.question.marked=this.answer;
        this.markedQuestion.emit(this.question);
        this.processCheckAnswer();
    }

    savemultiOptionAnswer(marked:number){
        if(this.answer){
            //let ans = this.answer.split(',');
            if(this.answer.indexOf(marked) > -1) { //Remove Makred
                let index: number = this.answer.indexOf(marked);
                this.answer.splice(index, 1);
            }else{
                this.answer.push(marked);
            }
        }else{
            this.answer = [];
            this.answer.push(marked);
        }
        this.question.status= 1;
        this.question.marked=this.answer;
        this.markedQuestion.emit(this.question);
        this.processCheckAnswer();
    }

    checkInAnswer(i:number){
        
        if(this.answer){
            if(this.answer.indexOf(i) !== -1) {
                return true;
            }else{
                return false;
            }
        }

        return false;
    }

    checkInCorrectOrder(i:number){
        let ans = this.question.correct.split(',');
        if(ans[i] == (this.question.options.indexOf(this.sort_options[i])+1)){
            return true;
        }
        return false;
    }

    checkInCorrect(i:number){
        if(this.question.correct){
            var ans = this.question.correct.split(',');
            i=i+1;
            let match = i.toString();
            if(ans.indexOf(match) !== -1) {
                return true;
            }
        }
        return false;
    }

    checkAnswer(){
        this.question.user_marks = 0;
        this.question.marked=this.answer;
        this.question.status= 2;
        this.processCheckAnswer();
    }
    
    processCheckAnswer(){
        switch(this.question.type){
            case 'truefalse':
                if(this.answer == this.question.correct){
                    this.question.user_marks = this.question.marks;
                }else{
                    this.question.user_marks = 0;
                }
            case 'single':
                if(this.answer == (this.question.correct - 1)){
                    this.question.user_marks = this.question.marks;
                }else{
                    this.question.user_marks = 0;
                }
            break;
            case 'multiple':
                
                var ans = this.answer;
                console.log(ans);
                this.question.marked=this.answer.join(',').slice();
                var correct = this.question.correct.split(',');
                if((ans.length) == correct.length){
                    for(let k=0;k<ans.length;k++){
                        this.question.user_marks = this.question.marks;
                        let match = (ans[k]+1);
                        match = match.toString();
                        //console.log('Checking in correct  '+(ans[k]+1)+' = '+correct.indexOf(match));
                        if(correct.indexOf(match) == -1){
                            console.log('7777');
                            this.question.user_marks = 0;
                            break;
                        }
                    }
                }
            break;
            case 'match':
                this.question.marked=this.answer.join(',').slice();
                let match_ans = this.answer;
                let match_correct = this.question.correct.split(',');
                for(let k=0;k<match_ans.length;k++){
                    this.question.user_marks = this.question.marks;
                    let match:string;
                    match = match_ans[k].toString();
                    if(match_correct[k] != match){
                        this.question.user_marks = 0;
                        break;
                    }
                }
            break;
            case 'sort':
                this.question.marked=this.answer.join(',').slice();
                let sort_ans = this.answer;
                let sort_correct = this.question.correct.split(',');
                for(let k=0;k<sort_ans.length;k++){
                    this.question.user_marks = this.question.marks;
                    let match:string;
                    match = sort_ans[k].toString();
                    if(sort_correct[k] != match){
                        this.question.user_marks = 0;
                        break;
                    }
                }
            break;
            case 'fillblank':
                this.question.marked=this.answer.join('|').slice();
                let fill_correct = this.question.correct.split('|');
                this.question.user_marks = 0;
                
                if(fill_correct.length == this.answer.length){

                    this.question.user_marks = this.question.marks;
                    for(let k=0;k<this.answer.length;k++){
                        let match:string;
                        match = this.answer[k].toString();
                        let fill_variants = fill_correct[k].split(',');
                        if(fill_variants.indexOf(match) == -1){
                            this.question.user_marks = 0;
                            break;
                        }
                    }
                }
                
            break;
            case 'select':
                this.question.marked=this.answer.join('|').slice();
                let select_correct = this.question.correct.split('|');
                this.question.user_marks = 0;
                
                if(select_correct.length == this.answer.length){

                    this.question.user_marks = this.question.marks;
                    for(let k=0;k<this.answer.length;k++){
                        let match:string;
                        match = (this.answer[k]+1).toString();
                        
                        if(match != select_correct[k]){
                            this.question.user_marks = 0;
                            break;
                        }
                    }
                }
            break;
        }

        this.answerChecked.emit(this.question);
    }

    flipped(){
        if(this.question.status > 1){
            if(this.flip){
                this.flip = false;
            }else{
                this.flip = true;
            }
        }
    }

    getUserMarkedAnswer(){
        let answer: string;
        switch(this.question.type){
            case 'truefalse':
                if(this.question.marked){
                    answer = this.config.get_translation('true');
                }else{
                    answer = this.config.get_translation('false');
                }
            break;
            case 'single':
            case 'survey':
                if(this.question.marked != null && typeof this.question.marked != 'undefined'){
                    answer = this.question.options[(this.question.marked)];
                }
            break;
            
            case 'sort':
            case 'match':
            case 'multiple':
                answer = '';
                if(this.question.marked){
                    var correct = this.question.marked.split(',');;
                    if(correct.length){
                        for(let i=0;i<correct.length;i++){
                            answer += '( '+(i+1)+' ) '+this.question.options[(correct[i]-1)];
                        }
                    } 
                }
               
            break;
            case 'select':
                answer = '';
                if(this.question.marked){
                    var correct = this.question.marked.split(',');;
                    if(correct.length){
                        for(let i=0;i<correct.length;i++){
                            
                            answer += '( '+(i+1)+' ) '+this.question.options[(correct[i]-1)];
                        }
                    }
                }
            break;
            case 'fillblank':
            case 'text':
            case 'textarea':
                answer = '';
                if(this.question.marked){
                    var correct = this.question.marked.split(',');;
                    if(correct.length){
                        for(let i=0;i<correct.length;i++){
                            answer += '( '+(i+1)+' ) '+correct[i];
                        }
                    }
                }
            break;
        }
        return answer;
    }

    getAnswer(){
        let answer: string;
        switch(this.question.type){
            case 'truefalse':
                if(this.question.correct){
                    answer = this.config.get_translation('true');
                }else{
                    answer = this.config.get_translation('false');
                }
            break;
            case 'single':
            case 'survey':
                answer = this.question.options[(this.question.correct-1)];
            break;
            
            case 'sort':
            case 'match':
            case 'multiple':
                answer = '';
                
                var correct = this.question.correct.split(',');
                if(correct.length){
                    for(let i=0;i<correct.length;i++){
                        
                        answer += '( '+(i+1)+' ) '+this.question.options[(correct[i]-1)];
                    }
                }
            break;
            case 'select':
                answer = '';
                
                var correct = this.question.correct.split('|');
                if(correct.length){
                    for(let i=0;i<correct.length;i++){
                        
                        answer += '( '+(i+1)+' ) '+this.question.options[(correct[i]-1)];
                    }
                }
            break;
            case 'fillblank':
            case 'text':
            case 'textarea':
                answer = '';
                var correct = this.question.correct.split('|');
                if(correct.length){
                    for(let i=0;i<correct.length;i++){
                        answer += '( '+(i+1)+' ) '+correct[i];
                    }
                }
            break;
        }

        return answer;
    }

    trackSelect(value:number,i:number){
        
        if(this.answer){
            this.answer[i] = value;
        }else{
            this.answer = [];
            this.answer[i] = value;
        }
        this.question.status= 1;
        this.markedQuestion.emit(this.question);
        this.processCheckAnswer();
    }
    trackFillBlank(value:any,i:number){
        if(this.answer){
            this.answer[i] = value;
        }else{
            this.answer = [];
            this.answer[i] = value;
        }
        
        this.question.status= 1;
        this.markedQuestion.emit(this.question);
        this.processCheckAnswer();
    }
}
