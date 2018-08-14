import { Component, Input } from '@angular/core';

/**
 * Component in charge of lazy load images and cache them
 */
@Component({
  selector: 'lazy-img',
  template: `
  <div text-center [ngClass]="{ 'placeholder': placeholderActive }">
    <img [inputSrc]="inputSrc" [ngStyle]="style" lazy-load (loaded)="placeholderActive = false"/>
  </div>
  `
})
export class LazyImgComponent {

  @Input() inputSrc: string;
  @Input() imgStyle:any={}; 
  public placeholderActive: boolean = true;

}