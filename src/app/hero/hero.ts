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
import { ClickWaves } from '../click-waves';
import { Section } from '../cv-data';
import { startFloating } from '../floating';

export interface SectionSelection {
  readonly section: Section;
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
  private readonly waves = inject(ClickWaves);

  readonly name = input.required<string>();
  readonly role = input.required<string>();
  readonly sections = input.required<readonly Section[]>();
  readonly about = input.required<Section>();
  readonly active = input<Section | null>(null);
  readonly selected = output<SectionSelection>();

  private readonly nameEl = viewChild.required<ElementRef<HTMLElement>>('nameEl');
  private readonly roleEl = viewChild.required<ElementRef<HTMLElement>>('roleEl');
  private readonly menuEls = viewChildren<ElementRef<HTMLElement>>('menuItem');

  ngAfterViewInit(): void {
    const labels = [
      this.nameEl().nativeElement,
      this.roleEl().nativeElement,
      ...this.menuEls().map((ref) => ref.nativeElement),
    ];
    const stop = this.zone.runOutsideAngular(() =>
      startFloating(labels, () => this.active() !== null, {
        amplitudes: labels.map((_, i) => (i < 2 ? 4 : 3)),
        waves: this.waves,
      }),
    );
    this.destroyRef.onDestroy(stop);
  }

  protected select(section: Section, trigger: EventTarget | null): void {
    if (trigger instanceof HTMLElement) {
      this.selected.emit({ section, trigger });
    }
  }
}
