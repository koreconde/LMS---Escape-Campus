import { Directive, ElementRef, Renderer } from '@angular/core';
 
@Directive({
  selector: '[avatarscrollzoomout]'
})
export class AvatarScrollZoomout {
   
    imageHandle:any;
    profileHeader: any;
    profileHeaderHeight:any;
    scrollerHandle: any;
    avatar: any;
    avatarHeight: any;
    translateAmt: any;
    marginTop:any;
    scaleAmt: any;
    scrollTop: any;
    lastScrollTop: any;
    ticking: any;
    
    adjustment: number = 75;

    constructor(public element: ElementRef, public renderer: Renderer) {
 
    }
 
    ngOnInit(){
        this.scrollerHandle = this.element.nativeElement.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('scroll-content')[0];
        
        
        this.imageHandle = this.element.nativeElement.getElementsByClassName('avatar')[0];
        this.avatar = this.imageHandle.firstElementChild;
        this.avatarHeight = (window.innerWidth/2); //this.imageHandle.clientHeight;
        this.ticking = false;
        this.marginTop = (window.innerWidth/2)+this.adjustment;
       
        this.renderer.setElementStyle(this.imageHandle, 'width', (window.innerWidth/2)+'px');
        this.renderer.setElementStyle(this.imageHandle, 'height', (window.innerWidth/2)+'px');
        this.renderer.setElementStyle(this.scrollerHandle,'margin-top',this.marginTop+'px');

        window.addEventListener('resize', () => {
            this.avatarHeight = this.imageHandle.clientHeight;
        }, false);
 
        this.scrollerHandle.addEventListener('scroll', () => {
             
            if(!this.ticking){
                window.requestAnimationFrame(() => {
                    this.updateAvatarZoomOut();
                });
            }
 
            this.ticking = true;
 
        });
 
    }
 
    updateAvatarZoomOut(){
 
        this.scrollTop = this.scrollerHandle.scrollTop;
     

        if(this.scrollTop >= 0 ){
            this.translateAmt = this.scrollTop / 2;
            this.scaleAmt = this.avatarHeight/(this.avatarHeight+this.scrollTop);

            if(this.scaleAmt < 0.1){
                this.scaleAmt = 0;
            }
        } else {
            this.translateAmt = 0;
            this.scaleAmt = 1+this.avatarHeight/(this.avatarHeight-this.scrollTop);
            if(this.scaleAmt > 1.2){
                this.scaleAmt = 1.2;
            }
        }

        let height = (this.scaleAmt * this.avatarHeight);
        if(this.translateAmt > this.avatarHeight){
            height=0;        
        }

        this.renderer.setElementStyle(this.imageHandle, 'width', height+'px');
        this.renderer.setElementStyle(this.imageHandle, 'height', height+'px');
        this.renderer.setElementStyle(this.scrollerHandle,'margin-top',(((height - this.avatarHeight) + this.marginTop))+'px'); //+this.adjustment
        this.renderer.setElementStyle(this.scrollerHandle,'padding-top','0');
        this.renderer.setElementStyle(this.avatar, 'webkitTransform', 'translate3d(0,-'+this.translateAmt+'px,0) ');

        this.ticking = false;
 
    }
 
} 