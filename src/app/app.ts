import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { CodeRain } from './code-rain/code-rain';
import { FULL_NAME, ROLE, SECTIONS } from './cv-data';
import { Hero, SectionSelection } from './hero/hero';
import { SectionPanel } from './section-panel/section-panel';

/** Fallback for when no transitionend fires (e.g. reduced motion). */
const CLOSE_FALLBACK_MS = 700;

@Component({
  selector: 'app-root',
  imports: [CodeRain, Hero, SectionPanel],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'close()',
  },
})
export class App {
  private readonly panel = viewChild.required(SectionPanel);

  protected readonly fullName = FULL_NAME;
  protected readonly role = ROLE;
  protected readonly sections = SECTIONS;

  /** Index of the section whose panel is rendered (stays set while it slides back). */
  protected readonly openIndex = signal<number | null>(null);
  /** True while the panel is in its centered, visible state. */
  protected readonly shown = signal(false);
  protected readonly originX = signal(0);
  protected readonly originY = signal(0);
  protected readonly current = computed(() => {
    const i = this.openIndex();
    return i === null ? null : SECTIONS[i];
  });

  private lastTrigger: HTMLElement | null = null;

  protected open({ index, trigger }: SectionSelection): void {
    if (this.openIndex() !== null) {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    this.originX.set(rect.left + rect.width / 2 - window.innerWidth / 2);
    this.originY.set(rect.top + rect.height / 2 - window.innerHeight / 2);
    this.lastTrigger = trigger;
    this.openIndex.set(index);
    // Let the panel render at its origin first, then transition to the center.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        this.shown.set(true);
        this.panel().focusBack();
      }),
    );
  }

  protected close(): void {
    if (!this.shown()) {
      return;
    }
    this.shown.set(false);
    this.lastTrigger?.focus();
    setTimeout(() => this.onPanelHidden(), CLOSE_FALLBACK_MS);
  }

  protected onPanelHidden(): void {
    if (!this.shown()) {
      this.openIndex.set(null);
    }
  }
}
