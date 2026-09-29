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
import { startFloating } from '../floating';

@Component({
  selector: 'app-copyright',
  template: `<p #text>© 2026 Kovács Kristóf Gábor · MIT License</p>`,
  styleUrl: './copyright.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Copyright implements AfterViewInit {
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly waves = inject(ClickWaves);

  readonly name = input.required<string>();
  readonly frozen = input(false);

  private readonly text = viewChild.required<ElementRef<HTMLElement>>('text');

  ngAfterViewInit(): void {
    const stop = this.zone.runOutsideAngular(() =>
      startFloating([this.text().nativeElement], () => this.frozen(), {
        phaseOffset: 9,
        waves: this.waves,
      }),
    );
    this.destroyRef.onDestroy(stop);
  }
}
