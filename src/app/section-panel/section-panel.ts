import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  effect,
  inject,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { Section } from '../cv-data';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-section-panel',
  imports: [Icon],
  templateUrl: './section-panel.html',
  styleUrl: './section-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'dialog',
    'aria-labelledby': 'panel-title',
    '[class.shown]': 'shown()',
    '[attr.aria-hidden]': '!shown()',
    '(transitionend)': 'onTransitionEnd($event)',
  },
})
export class SectionPanel implements AfterViewInit {
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly section = input<Section | null>(null);
  readonly shown = input(false);
  readonly originX = input(0);
  readonly originY = input(0);
  readonly back = output<void>();
  readonly hidden = output<void>();

  private readonly backBtn = viewChild<ElementRef<HTMLButtonElement>>('backBtn');
  private readonly title = viewChild<ElementRef<HTMLElement>>('title');
  private readonly body = viewChild<ElementRef<HTMLElement>>('body');

  constructor() {
    effect(() => {
      const x = this.originX();
      const y = this.originY();
      const el = this.host.nativeElement;
      const hidden = !untracked(this.shown);
      if (hidden) {
        el.style.transition = 'none';
      }
      el.style.setProperty('--ox', `${x}px`);
      el.style.setProperty('--oy', `${y}px`);
      if (hidden) {
        void el.offsetWidth;
        el.style.transition = '';
      }
    });
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.start());
  }

  focusBack(): void {
    this.backBtn()?.nativeElement.focus();
  }

  protected onTransitionEnd(event: TransitionEvent): void {
    if (
      event.target === this.host.nativeElement &&
      event.propertyName === 'opacity' &&
      !this.shown()
    ) {
      this.hidden.emit();
    }
  }

  private start(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    let frame = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const t = now / 1000;
      const title = this.title()?.nativeElement;
      if (title) {
        title.style.transform = breeze(t, 0);
      }
      const body = this.body()?.nativeElement;
      if (body) {
        body.style.transform = breeze(t, 1.4);
      }
    };
    frame = requestAnimationFrame(tick);
    this.destroyRef.onDestroy(() => cancelAnimationFrame(frame));
  }
}

function breeze(t: number, offset: number): string {
  const x = Math.sin(t * 0.55 + offset) * 1.6;
  const y = Math.cos(t * 0.42 + offset * 1.7) * 1.2;
  const rot = Math.sin(t * 0.3 + offset) * 0.18;
  return `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${rot.toFixed(3)}deg)`;
}
