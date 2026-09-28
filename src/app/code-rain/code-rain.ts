import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { ClickWaves } from '../click-waves';
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
  private readonly waves = inject(ClickWaves);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  /** When false, clicks start no waves (e.g. while a section is open). */
  readonly wavesEnabled = input(true);

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
    const onDown = (event: PointerEvent) => {
      if (!this.wavesEnabled() || event.button !== 0 || !isEmptySurface(event.target)) {
        return;
      }
      const now = performance.now();
      if (this.waves.start(event.clientX, event.clientY, now)) {
        renderer.wave(event.clientX, event.clientY, now);
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
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
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', resize);
    });
  }
}

/** Controls and the opened section panel are not "empty"; clicks there start no wave. */
const NON_EMPTY = 'button, a, input, textarea, select, label, [role="button"], app-section-panel';

function isEmptySurface(target: EventTarget | null): boolean {
  return !(target instanceof Element && target.closest(NON_EMPTY));
}
