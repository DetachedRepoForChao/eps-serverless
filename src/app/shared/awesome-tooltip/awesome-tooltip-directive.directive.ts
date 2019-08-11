import {Directive, Input, HostListener, OnInit, ComponentRef, ElementRef} from '@angular/core';
import {Overlay, OverlayPositionBuilder, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {AwesomeTooltipComponent} from './awesome-tooltip.component';

@Directive({
  selector: '[appAwesomeTooltipDirective]'
})
export class AwesomeTooltipDirectiveDirective implements OnInit {

  @Input('appAwesomeTooltipDirective') object = null;
  private overlayRef: OverlayRef;

  constructor(private overlayPositionBuilder: OverlayPositionBuilder,
              private elementRef: ElementRef,
              private overlay: Overlay) {}

  ngOnInit() {
    const positionStrategy = this.overlayPositionBuilder
    // Create position attached to the elementRef
      .flexibleConnectedTo(this.elementRef)
      // Describe how to connect overlay to the elementRef
      // Means, attach overlay's center bottom point to the
      // top center point of the elementRef.
      .withPositions([{
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
      }]);

    // Connect position strategy
    this.overlayRef = this.overlay.create({ positionStrategy });
  }

  @HostListener('mouseenter')
  show() {
    // Create tooltip portal
    const tooltipPortal = new ComponentPortal(AwesomeTooltipComponent);

    // Attach tooltip portal to overlay
    const tooltipRef: ComponentRef<AwesomeTooltipComponent> = this.overlayRef.attach(tooltipPortal);

    // Pass content to tooltip component instance
    tooltipRef.instance.object = this.object;
  }

  @HostListener('mouseout')
  hide() {
    this.overlayRef.detach();
  }

}
