import { Directive,ElementRef, OnInit } from '@angular/core';


@Directive({
  selector: '[MatchAnswers]' 
})
export class MatchAnswers implements OnInit{

  constructor(private elementRef: ElementRef) {
    
  }

  ngOnInit(){
  	
  }
}
