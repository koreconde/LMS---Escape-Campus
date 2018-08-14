import { Component, OnInit, Input , Output, EventEmitter } from '@angular/core';
import { ConfigService } from '../../services/config';

/**
 * Component converts timestamp into human readable date time
 */
@Component({
  selector: 'friendlytime',
  template: '{{friendlytime}}'
})
export class FriendlytimeComponent{

    @Input() time: number = 60;
      
    friendlytime: String;

    constructor(private config:ConfigService) {
    }

    ngOnInit(){
      this.toFriendlyTime();
    }
    totime(){

    }

    toFriendlyTime(){
          
        let count:number = 0;
        let time_labels: string;
        let measure:any;
        let key: number;
        let small_measure:any;
        let small_count:number = 0;
        let measures = [
            {   
                'label': this.config.get_translation('year'),
                'multi':this.config.get_translation('years'), 
                'value':946080000
            },
            {
                'label':this.config.get_translation('month'),
                'multi':this.config.get_translation('months'), 
                'value':2592000
            },
            {
                'label':this.config.get_translation('week'),
                'multi':this.config.get_translation('weeks'), 
                'value':604800
            },
            {
                'label':this.config.get_translation('day'),
                'multi':this.config.get_translation('days'), 
                'value':86400
            },
            {
                'label':this.config.get_translation('hour'),
                'multi':this.config.get_translation('hours'), 
                'value':3600
            },
            {
                'label':this.config.get_translation('minute'),
                'multi':this.config.get_translation('minutes'), 
                'value':60
            },
            {
                'label':this.config.get_translation('second'),
                'multi':this.config.get_translation('seconds'), 
                'value':1
            },
        ];

        if(this.time <= 0)
          return this.config.get_translation('expired');
        

        for(let i=0;i<measures.length;i++){
            measure = measures[i];
            key = i;
            if(measure.value < this.time ){
                count = Math.floor(this.time/measure.value);
                break;
            }
        }
        
        time_labels = count+' '+((count > 1)?measure.multi:measure.label);
       
        if(measure.value > 1){ // Ensure we're not on last element
          small_measure = measures[key+1];  
          small_count = Math.floor((this.time%measure.value)/small_measure.value);
          if(small_count)
            time_labels += ', '+small_count+' '+((small_count > 1)?small_measure.multi:small_measure.label);
        }  
        this.friendlytime = time_labels;
    }

}