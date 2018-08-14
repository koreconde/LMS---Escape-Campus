import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer } from '@angular/core';
import { Gesture } from 'ionic-angular/gestures/gesture';

@Directive({
	selector: '[pinch-zoom]'
})
export class PinchZoomDirective {
	el: HTMLElement;
	pinchGesture: Gesture;
	scale = 1;
	last_scale = 1;

	constructor(el: ElementRef,private renderer: Renderer) {
		this.el = el.nativeElement;
	}

	ngOnInit() {
		this.pinchGesture = new Gesture(this.el);
		this.pinchGesture.listen();
		this.pinchGesture.on('pinch', ev => {
			this.scale = Math.max(.999, Math.min(this.last_scale * (ev.scale), 4));
			this.last_scale = this.scale;
			let fontSize = this.scale * 25;
			let textElement = this.el.getElementsByClassName('style-ayah');
			if (textElement.length > 0) {
				this.renderer.setElementStyle(textElement[0], 'font-size', fontSize+'px');
			}
		});
	}

	OnDestroy() {
		this.pinchGesture.destroy();
	}

}