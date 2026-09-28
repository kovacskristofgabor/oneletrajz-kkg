import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  inject,
  input,
  output,
  viewChild,
  viewChildren,
} from '@angular/core';
import { Section } from '../cv-data';

const MAGNET_RADIUS = 260;
const MAGNET_STRENGTH = 22;
const SMOOTHING = 0.08;

interface Floater {
  readonly el: HTMLElement;
  readonly phase: number;
  readonly speed: number;
  readonly amp: number;
  x: number;
  y: number;
}

export interface SectionSelection {
  readonly index: number;
  readonly trigger: HTMLElement;
}

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero implements AfterViewInit {
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  readonly name = input.required<string>();
  readonly role = input.required<string>();
  readonly sections = input.required<readonly Section[]>();
  readonly activeIndex = input<number | null>(null);
  readonly selected = output<SectionSelection>();

  private readonly nameEl = viewChild.required<ElementRef<HTMLElement>>('nameEl');
  private readonly roleEl = viewChild.required<ElementRef<HTMLElement>>('roleEl');
  private readonly menuEls = viewChildren<ElementRef<HTMLElement>>('menuItem');

  private cursorX = -9999;
  private cursorY = -9999;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.start());
  }

  protected select(index: number, trigger: EventTarget | null): void {
    if (trigger instanceof HTMLElement) {
      this.selected.emit({ index, trigger });
    }
  }

  private start(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const labels = [
      this.nameEl().nativeElement,
      this.roleEl().nativeElement,
      ...this.menuEls().map((ref) => ref.nativeElement),
    ];
    const floaters: Floater[] = labels.map((el, i) => ({
      el,
      phase: i * 1.7,
      speed: 0.5 + (i % 3) * 0.12,
      amp: i < 2 ? 4 : 3,
      x: 0,
      y: 0,
    }));

    const onMove = (event: PointerEvent) => {
      this.cursorX = event.clientX;
      this.cursorY = event.clientY;
    };
    const onLeave = () => {
      this.cursorX = -9999;
      this.cursorY = -9999;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

    let frame = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (this.activeIndex() !== null) {
        return;
      }
      try {
        this.float(floaters, now / 1000);
      } catch (error) {
        console.error(error);
      }
    };
    frame = requestAnimationFrame(tick);

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    });
  }

  private float(floaters: Floater[], t: number): void {
    for (const f of floaters) {
      const rect = f.el.getBoundingClientRect();
      const baseX = rect.left + rect.width / 2 - f.x;
      const baseY = rect.top + rect.height / 2 - f.y;

      let targetX = Math.sin(t * f.speed + f.phase) * f.amp;
      let targetY = Math.cos(t * f.speed * 0.8 + f.phase * 1.3) * f.amp * 0.7;

      const dx = this.cursorX - baseX;
      const dy = this.cursorY - baseY;
      const dist = Math.hypot(dx, dy);
      if (dist < MAGNET_RADIUS && dist > 0.1) {
        const pull = (1 - dist / MAGNET_RADIUS) ** 2 * MAGNET_STRENGTH;
        targetX += (dx / dist) * pull;
        targetY += (dy / dist) * pull;
      }

      f.x += (targetX - f.x) * SMOOTHING;
      f.y += (targetY - f.y) * SMOOTHING;
      f.el.style.transform = `translate3d(${f.x.toFixed(2)}px, ${f.y.toFixed(2)}px, 0)`;
    }
  }
}
