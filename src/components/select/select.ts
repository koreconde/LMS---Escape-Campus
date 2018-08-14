import { Directive,ElementRef, OnInit } from '@angular/core';


@Directive({
  selector: '[select]' // Attribute selector
})
export class Select implements OnInit{

  constructor(private elementRef: ElementRef) {
    
  }

  ngOnInit(){
  	this.elementRef.nativeElement.innerHTML = '<select>\
    <option>SELECT1</option>\
    <option>SELECT2</option>\
    <option>SELECT2</option>\
    </select>';
  }

}
