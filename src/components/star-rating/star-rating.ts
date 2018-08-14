import { Component, Input  } from '@angular/core';

@Component({
  selector: 'star-rating',
  templateUrl: 'star-rating.html'
})
export class StarRatingComponent{

	  @Input() rating: number = 4;
  
  	stars: String[]=[];

  	constructor() {
  	}

  	ngOnInit(){
  		this.prepareStars();
  	}
  	prepareStars(){
  		for(let i=0;i<5;i++){
  			if(i <= this.rating && (i+1) <= this.rating){
  				this.stars[i] = 'star';
  			}else if(i < this.rating && (i+1) > this.rating){
  				this.stars[i] = 'star-half';
  			}else{
  				this.stars[i] = 'star-outline';
  			}
  		}

  	}

}
