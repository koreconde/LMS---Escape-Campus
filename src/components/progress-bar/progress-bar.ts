import { Component, Input } from '@angular/core';
 
@Component({
  selector: 'progress-bar',
  templateUrl: 'progress-bar.html'
})
export class ProgressBarComponent {
 
  @Input('progress') progress;
 
  constructor() {
 	if(this.progress > 100){
 		this.progress = 100;
 	}
  }
 
}