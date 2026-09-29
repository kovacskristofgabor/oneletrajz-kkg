import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ItemIcon } from '../cv-data';

@Component({
  selector: 'app-icon',
  template: `
    <svg viewBox="0 0 24 24">
      @switch (name()) {
        @case ('phone') {
          <path
            d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"
          />
        }
        @case ('mail') {
          <rect x="3" y="5" width="18" height="14" rx="1" />
          <path d="M3 7l9 6 9-6" />
        }
        @case ('home') {
          <path d="M3 11 12 4l9 7" />
          <path d="M5 10v10h14V10" />
          <path d="M10 20v-6h4v6" />
        }
        @case ('code') {
          <path d="M8 7l-5 5 5 5" />
          <path d="M16 7l5 5-5 5" />
          <path d="M14 4l-4 16" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      width: 14px;
      height: 14px;
    }
    svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: #000;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class Icon {
  readonly name = input.required<ItemIcon>();
}
