/**
 * Canvas drawing logic for the cursor-driven code stream.
 *
 * Every pointer movement drops a ripple. A ripple reveals a circle of glyphs
 * around the cursor that grows outward for about half a second and then fades
 * back into the white background. The glyphs flow downward column by column so
 * the reveal reads as a code stream rather than static noise.
 *
 * A click sends a ring-shaped wave of glyphs from the click position to the
 * edge of the screen. The cooldown between waves lives in ClickWaves.
 */

import { WAVE_BAND, WAVE_SPEED } from '../click-waves';

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ01{}[]<>/=+-*#$%&;:';
const CELL = 14;
const GROW_MS = 500;
const LIFETIME_MS = 620;
const MAX_RADIUS = 140;
const INK = 0.28;
const MAX_RIPPLES = 48;

interface Ripple {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}

interface Wave extends Ripple {
  /** Distance to the farthest screen corner; the wave ends past it. */
  readonly reach: number;
}

export class CodeRainRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private cols = 0;
  private rows = 0;
  private alpha = new Float32Array(0);
  private ripples: Ripple[] = [];
  private waves: Wave[] = [];
  private lastX = Number.NaN;
  private lastY = Number.NaN;
  private lastT = 0;
  private minCol = 0;
  private maxCol = -1;
  private minRow = 0;
  private maxRow = -1;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2D canvas context is unavailable');
    }
    this.ctx = ctx;
  }

  resize(width: number, height: number, dpr: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.font = `${CELL - 2}px "Arial Monospaced MT", "Courier New", monospace`;
    this.ctx.textBaseline = 'top';
    this.cols = Math.ceil(width / CELL) + 1;
    this.rows = Math.ceil(height / CELL) + 1;
    this.alpha = new Float32Array(this.cols * this.rows);
  }

  /** Registers a pointer position; spawns a ripple once the cursor moved a cell. */
  pointer(x: number, y: number, now: number): void {
    const dx = x - this.lastX;
    const dy = y - this.lastY;
    const moved = Number.isNaN(dx) || dx * dx + dy * dy >= CELL * CELL;
    if (!moved && now - this.lastT < 60) {
      return;
    }
    this.ripples.push({ x, y, t: now });
    if (this.ripples.length > MAX_RIPPLES) {
      this.ripples.shift();
    }
    this.lastX = x;
    this.lastY = y;
    this.lastT = now;
  }

  /** Starts drawing a click wave from (x, y). */
  wave(x: number, y: number, now: number): void {
    const reach = Math.max(
      Math.hypot(x, y),
      Math.hypot(this.width - x, y),
      Math.hypot(x, this.height - y),
      Math.hypot(this.width - x, this.height - y),
    );
    this.waves.push({ x, y, t: now, reach });
  }

  /** Draws one frame. Returns true while something is still visible. */
  frame(now: number): boolean {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    this.ripples = this.ripples.filter((r) => now - r.t < LIFETIME_MS);
    this.waves = this.waves.filter(
      (w) => ((now - w.t) / 1000) * WAVE_SPEED - WAVE_BAND < w.reach,
    );
    if (this.ripples.length === 0 && this.waves.length === 0) {
      return false;
    }

    this.alpha.fill(0);
    this.minCol = this.cols;
    this.maxCol = -1;
    this.minRow = this.rows;
    this.maxRow = -1;

    for (const ripple of this.ripples) {
      const age = now - ripple.t;
      const radius = MAX_RADIUS * easeOutCubic(Math.min(1, age / GROW_MS));
      const fade = 1 - age / LIFETIME_MS;
      const c0 = Math.max(0, Math.floor((ripple.x - radius) / CELL));
      const c1 = Math.min(this.cols - 1, Math.ceil((ripple.x + radius) / CELL));
      const r0 = Math.max(0, Math.floor((ripple.y - radius) / CELL));
      const r1 = Math.min(this.rows - 1, Math.ceil((ripple.y + radius) / CELL));

      for (let row = r0; row <= r1; row++) {
        const cy = row * CELL + CELL / 2;
        for (let col = c0; col <= c1; col++) {
          const cx = col * CELL + CELL / 2;
          const dist = Math.hypot(cx - ripple.x, cy - ripple.y);
          if (dist > radius) {
            continue;
          }
          const edge = Math.min(1, (radius - dist) / (CELL * 2));
          this.mark(col, row, fade * edge);
        }
      }
    }

    for (const wave of this.waves) {
      this.drawWave(wave, now);
    }

    for (let row = this.minRow; row <= this.maxRow; row++) {
      for (let col = this.minCol; col <= this.maxCol; col++) {
        const a = this.alpha[row * this.cols + col];
        if (a < 0.02) {
          continue;
        }
        // Each column scrolls at its own offset so the glyphs stream downward.
        const shift = Math.floor((now + col * 37) / 110);
        const h = hash(col, row - shift);
        const density = 0.4 + ((h % 1000) / 1000) * 0.6;
        const glyph = GLYPHS[(h >>> 10) % GLYPHS.length];
        ctx.fillStyle = `rgba(0,0,0,${(a * density * INK).toFixed(3)})`;
        ctx.fillText(glyph, col * CELL + 1, row * CELL + 1);
      }
    }
    return true;
  }

  /** Marks the cells of a wave's ring, walking only the ring's column spans per row. */
  private drawWave(wave: Wave, now: number): void {
    const outer = ((now - wave.t) / 1000) * WAVE_SPEED;
    const inner = outer - WAVE_BAND;
    const r0 = Math.max(0, Math.floor((wave.y - outer) / CELL));
    const r1 = Math.min(this.rows - 1, Math.ceil((wave.y + outer) / CELL));

    for (let row = r0; row <= r1; row++) {
      const dy = Math.abs(row * CELL + CELL / 2 - wave.y);
      if (dy > outer) {
        continue;
      }
      const outerHalf = Math.sqrt(outer * outer - dy * dy);
      const innerHalf = inner > dy ? Math.sqrt(inner * inner - dy * dy) : 0;
      this.markSpan(wave, row, wave.x - outerHalf, wave.x - innerHalf, outer);
      this.markSpan(wave, row, wave.x + innerHalf, wave.x + outerHalf, outer);
    }
  }

  private markSpan(wave: Wave, row: number, fromX: number, toX: number, outer: number): void {
    const c0 = Math.max(0, Math.floor(fromX / CELL));
    const c1 = Math.min(this.cols - 1, Math.ceil(toX / CELL));
    const cy = row * CELL + CELL / 2;
    for (let col = c0; col <= c1; col++) {
      const dist = Math.hypot(col * CELL + CELL / 2 - wave.x, cy - wave.y);
      const depth = outer - dist;
      if (depth < 0 || depth > WAVE_BAND) {
        continue;
      }
      // Bright at the front edge, fading toward the trailing edge.
      const front = Math.min(1, depth / CELL);
      this.mark(col, row, front * (1 - depth / WAVE_BAND));
    }
  }

  private mark(col: number, row: number, a: number): void {
    const i = row * this.cols + col;
    if (a <= this.alpha[i]) {
      return;
    }
    this.alpha[i] = a;
    if (col < this.minCol) this.minCol = col;
    if (col > this.maxCol) this.maxCol = col;
    if (row < this.minRow) this.minRow = row;
    if (row > this.maxRow) this.maxRow = row;
  }
}

function easeOutCubic(p: number): number {
  const q = 1 - p;
  return 1 - q * q * q;
}

function hash(a: number, b: number): number {
  let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}
