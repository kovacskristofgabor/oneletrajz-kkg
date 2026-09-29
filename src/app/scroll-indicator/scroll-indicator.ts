import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';

const MIN_THUMB_PX = 24;

@Component({
  selector: 'app-scroll-indicator',
  template: '<div #thumb class="thumb"></div>',
  styleUrl: './scroll-indicator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class ScrollIndicator {
  private readonly zone = inject(NgZone);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly thumb = viewChild.required<ElementRef<HTMLElement>>('thumb');

  readonly for = input.required<HTMLElement>();

  constructor() {
    effect((onCleanup) => {
      const target = this.for();
      const thumb = this.thumb().nativeElement;
      const cleanup = this.zone.runOutsideAngular(() => this.track(target, thumb));
      onCleanup(cleanup);
    });
  }

  private track(target: HTMLElement, thumb: HTMLElement): () => void {
    const host = this.host.nativeElement;
    let thumbHeight = 0;
    let travel = 0;

    const update = () => {
      const overflow = target.scrollHeight - target.clientHeight;
      host.classList.toggle('visible', overflow > 1);
      if (overflow <= 1) {
        return;
      }
      const trackHeight = host.clientHeight;
      thumbHeight = Math.max(MIN_THUMB_PX, (trackHeight * target.clientHeight) / target.scrollHeight);
      travel = trackHeight - thumbHeight;
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${(travel * target.scrollTop) / overflow}px)`;
    };

    let dragStartY = 0;
    let dragStartScroll = 0;
    const onDown = (event: PointerEvent) => {
      dragStartY = event.clientY;
      dragStartScroll = target.scrollTop;
      thumb.setPointerCapture(event.pointerId);
      thumb.classList.add('dragging');
      event.preventDefault();
    };
    const onMove = (event: PointerEvent) => {
      if (!thumb.hasPointerCapture(event.pointerId) || travel <= 0) {
        return;
      }
      const overflow = target.scrollHeight - target.clientHeight;
      target.scrollTop = dragStartScroll + ((event.clientY - dragStartY) * overflow) / travel;
    };
    const onUp = (event: PointerEvent) => {
      thumb.releasePointerCapture(event.pointerId);
      thumb.classList.remove('dragging');
    };

    target.addEventListener('scroll', update, { passive: true });
    thumb.addEventListener('pointerdown', onDown);
    thumb.addEventListener('pointermove', onMove);
    thumb.addEventListener('pointerup', onUp);
    thumb.addEventListener('pointercancel', onUp);
    const observer = new ResizeObserver(update);
    observer.observe(target);
    observer.observe(host);
    for (const child of Array.from(target.children)) {
      observer.observe(child);
    }
    update();

    return () => {
      target.removeEventListener('scroll', update);
      thumb.removeEventListener('pointerdown', onDown);
      thumb.removeEventListener('pointermove', onMove);
      thumb.removeEventListener('pointerup', onUp);
      thumb.removeEventListener('pointercancel', onUp);
      observer.disconnect();
    };
  }
}
