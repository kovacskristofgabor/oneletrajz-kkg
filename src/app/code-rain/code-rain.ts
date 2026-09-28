import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  inject,
  viewChild,
} from '@angular/core';
import { CodeRainRenderer } from './code-rain-renderer';

@Component({
  selector: 'app-code-rain',
  template: '<canvas #canvas></canvas>',
  styleUrl: './code-rain.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class CodeRain implements AfterViewInit {
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.start());
  }

  private start(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const renderer = new CodeRainRenderer(this.canvas().nativeElement);
    const resize = () =>
      renderer.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1);
    resize();

    const onMove = (event: PointerEvent) =>
      renderer.pointer(event.clientX, event.clientY, performance.now());
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', resize);

    let frame = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      try {
        renderer.frame(now);
      } catch (error) {
        console.error(error);
      }
    };
    frame = requestAnimationFrame(tick);

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
    });
  }
}
