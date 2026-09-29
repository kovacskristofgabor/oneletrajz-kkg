import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { CodeRain } from './code-rain/code-rain';
import { Copyright } from './copyright/copyright';
import { ABOUT, FULL_NAME, ROLE, SECTIONS, Section } from './cv-data';
import { Hero, SectionSelection } from './hero/hero';
import { SectionPanel } from './section-panel/section-panel';

/** Fallback for when no transitionend fires (e.g. reduced motion). */
const CLOSE_FALLBACK_MS = 700;

@Component({
  selector: 'app-root',
  imports: [CodeRain, Copyright, Hero, SectionPanel],
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
  protected readonly about = ABOUT;
  protected readonly openSection = signal<Section | null>(null);
  protected readonly shown = signal(false);
  protected readonly originX = signal(0);
  protected readonly originY = signal(0);

  private lastTrigger: HTMLElement | null = null;
  private pending: SectionSelection | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | undefined;
  private closing = false;

  protected open(selection: SectionSelection): void {
    const openSection = this.openSection();
    if (openSection === null) {
      this.show(selection);
      return;
    }
    if (openSection === selection.section && !this.closing) {
      return;
    }
    if (!this.shown() && !this.closing) {
      this.show(selection);
      return;
    }
    this.pending = selection;
    if (!this.closing) {
      this.hide();
    }
  }

  protected close(): void {
    if (!this.shown()) {
      return;
    }
    this.pending = null;
    this.hide();
    this.lastTrigger?.focus();
  }

  protected onPanelHidden(): void {
    if (!this.closing) {
      return;
    }
    this.closing = false;
    clearTimeout(this.hideTimer);
    this.openSection.set(null);
    const next = this.pending;
    this.pending = null;
    if (next) {
      this.show(next);
    }
  }

  private show({ section, trigger }: SectionSelection): void {
    const rect = trigger.getBoundingClientRect();
    const anchor = this.panel().anchor();
    this.originX.set(rect.left + rect.width / 2 - anchor.x);
    this.originY.set(rect.top + rect.height / 2 - anchor.y);
    this.lastTrigger = trigger;
    this.openSection.set(section);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (this.openSection() !== section) {
          return;
        }
        this.shown.set(true);
        this.panel().focusBack();
      }),
    );
  }

  private hide(): void {
    this.closing = true;
    this.shown.set(false);
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.onPanelHidden(), CLOSE_FALLBACK_MS);
  }
}
