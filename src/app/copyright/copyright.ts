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
import { startFloating } from '../floating';

@Component({
  selector: 'app-copyright',
  template: `<p #text>{{ name() }} - All Rights Reserved ™, ® &amp; © Copyright 2026</p>`,
  styleUrl: './copyright.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Copyright implements AfterViewInit {
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  readonly name = input.required<string>();
  readonly frozen = input(false);

  private readonly text = viewChild.required<ElementRef<HTMLElement>>('text');

  ngAfterViewInit(): void {
    const stop = this.zone.runOutsideAngular(() =>
      startFloating([this.text().nativeElement], () => this.frozen(), { phaseOffset: 9 }),
    );
    this.destroyRef.onDestroy(stop);
  }
}
