import { Directive,ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[fillblank]' // Attribute selector
})
export class Fillblank implements OnInit{

  constructor(private elementRef: ElementRef) {
    
  }

  ngOnInit(){
  	
  }

}
