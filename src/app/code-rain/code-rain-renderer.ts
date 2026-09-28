/**
 * Canvas drawing logic for the cursor-driven code stream.
 *
 * Every pointer movement drops a ripple. A ripple reveals a circle of glyphs
 * around the cursor that grows outward for about half a second and then fades
 * back into the white background. The glyphs flow downward column by column so
 * the reveal reads as a code stream rather than static noise.
 */

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

export class CodeRainRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private cols = 0;
  private rows = 0;
  private alpha = new Float32Array(0);
  private ripples: Ripple[] = [];
  private lastX = Number.NaN;
  private lastY = Number.NaN;
  private lastT = 0;

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

  /** Draws one frame. Returns true while something is still visible. */
  frame(now: number): boolean {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    this.ripples = this.ripples.filter((r) => now - r.t < LIFETIME_MS);
    if (this.ripples.length === 0) {
      return false;
    }

    this.alpha.fill(0);
    let minCol = this.cols;
    let maxCol = -1;
    let minRow = this.rows;
    let maxRow = -1;

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
          const a = fade * edge;
          const i = row * this.cols + col;
          if (a > this.alpha[i]) {
            this.alpha[i] = a;
            if (col < minCol) minCol = col;
            if (col > maxCol) maxCol = col;
            if (row < minRow) minRow = row;
            if (row > maxRow) maxRow = row;
          }
        }
      }
    }

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
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
