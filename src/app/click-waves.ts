import { Injectable } from '@angular/core';

/** Wave front speed in px per second. */
export const WAVE_SPEED = 1400;
/** Thickness of the drawn wave ring in px. */
export const WAVE_BAND = 70;
/** Minimum time between two click waves. */
const WAVE_COOLDOWN_MS = 250;

/** Peak push (px) a passing wave gives a floating label. */
const PUSH_STRENGTH = 70;
/** Wave travel (px) past a label until the push is at full strength. */
const PUSH_RISE = 40;
/** Wave travel (px) past a label over which the push dies down. */
const PUSH_DECAY = 450;
/** Labels within this distance (px) of a wave's origin are not pushed, so they stay clickable. */
const PUSH_SAFE_RADIUS = 180;
/** Distance (px) beyond the safe radius over which the push fades in to full strength. */
const PUSH_SAFE_FADE = 120;
/** Waves older than this no longer affect anything. */
const WAVE_MEMORY_MS = 3000;

interface ClickWave {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}

/**
 * Click waves shared between the code stream (which draws them) and the
 * floating labels (which get pushed away as a wave front passes them).
 */
@Injectable({ providedIn: 'root' })
export class ClickWaves {
  private waves: ClickWave[] = [];
  private lastT = Number.NEGATIVE_INFINITY;

  /** Starts a wave unless one already started within the cooldown. */
  start(x: number, y: number, now: number): boolean {
    if (now - this.lastT < WAVE_COOLDOWN_MS) {
      return false;
    }
    this.lastT = now;
    this.waves = this.waves.filter((w) => now - w.t < WAVE_MEMORY_MS);
    this.waves.push({ x, y, t: now });
    return true;
  }

  /** Offset (px) that the active waves push a point at (x, y) away from their origin. */
  pushAt(x: number, y: number, now: number): { x: number; y: number } {
    let px = 0;
    let py = 0;
    for (const wave of this.waves) {
      const dx = x - wave.x;
      const dy = y - wave.y;
      const dist = Math.hypot(dx, dy);
      const passed = ((now - wave.t) / 1000) * WAVE_SPEED - dist;
      if (passed <= 0 || dist <= PUSH_SAFE_RADIUS) {
        continue;
      }
      const safety = smoothstep((dist - PUSH_SAFE_RADIUS) / PUSH_SAFE_FADE);
      const amount =
        PUSH_STRENGTH *
        safety *
        Math.min(1, passed / PUSH_RISE) *
        Math.exp(-passed / PUSH_DECAY);
      px += (dx / dist) * amount;
      py += (dy / dist) * amount;
    }
    return { x: px, y: py };
  }
}

function smoothstep(p: number): number {
  const c = Math.min(1, Math.max(0, p));
  return c * c * (3 - 2 * c);
}
