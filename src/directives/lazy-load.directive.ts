import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  OnInit, OnDestroy, Renderer2
} from '@angular/core';

import { ImgcacheService } from '../services/imageCache';

import { Subscription } from 'rxjs/Subscription';

/**
* This directive is charge of cache the images and emit a loaded event
*/
@Directive({
  selector: '[lazy-load]'
})
export class LazyLoadDirective implements OnInit, OnDestroy {

  @Input('inputSrc')
  public inputSrc: string = '';

  @Output()
  public loaded: EventEmitter<void> = new EventEmitter<void>();

  public loadListener: () => void;
  public errorListener: () => void;

  private cacheSubscription: Subscription;

  constructor(public el: ElementRef,
    public imgCacheService: ImgcacheService,
    public renderer: Renderer2) { }

  public ngOnInit(): void {
    // get img element
    const nativeElement: HTMLElement = this.el.nativeElement;
    // add load listener
    this.loadListener = this.renderer.listen(nativeElement, 'load', () => {
      this.renderer.addClass(nativeElement, 'loaded');
      this.loaded.emit();
    });

    this.errorListener = this.renderer.listen(nativeElement, 'error', () => {
      nativeElement.remove();
    });

    // cache img and set the src to the img
    this.cacheSubscription =
      this.imgCacheService
          .cache(this.inputSrc)
          .subscribe((value) => {
            this.renderer.setAttribute(nativeElement, 'src', value);
          }, (e) => console.log(e));
  }

  public ngOnDestroy(): void {
    // remove listeners
    this.loadListener();
    this.errorListener();
    this.cacheSubscription.unsubscribe();
  }

}