import { 
    Directive,
    ElementRef,
    Renderer
} from '@angular/core';

@Directive({
    selector: '[fixedscrollheader]',
    host: {
        '(ionScroll)': 'onContentScroll($event)'
    }
})
export class FixedScrollHeader {

    header: any;
    headerHeight: any;
    translateAmt: any;
    scrollPosition: number = 0;
    lastScrollTop: number = 0;

    constructor(public element: ElementRef, public renderer: Renderer) {

    }

    ngAfterViewInit() {
        // ion-header classname
        this.header = document.getElementsByClassName("toolbar")[0];
        // the height of the header
        this.headerHeight = this.header.clientHeight;
    }

    onContentScroll(ev) {
        ev.domWrite(() => {
            this.updateHeader(ev);
        });   
    }
 
    updateHeader(ev) {

      	this.scrollPosition = ev.scrollTop;
      if (this.scrollPosition > this.lastScrollTop && this.scrollPosition >= 25) {
        // scrolling down
        this.renderer.setElementStyle(this.header, 'transition', 'all 0.3s linear');
        this.renderer.setElementStyle(this.header, 'transform', 'translateY(-' + this.headerHeight + 'px)');
      } else {
        // scrolling up
        this.renderer.setElementStyle(this.header, 'transform', 'translateY(0px)');
      }

      // reset
      this.lastScrollTop = this.scrollPosition;

    }


 
 
}