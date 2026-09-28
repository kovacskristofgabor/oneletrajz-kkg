const MAGNET_RADIUS = 260;
const MAGNET_STRENGTH = 22;
const SMOOTHING = 0.08;

export interface FloatOptions {
  /** Shifts the float phases so separate groups of labels don't move in sync. */
  readonly phaseOffset?: number;
  /** Floating amplitude in px for each element; defaults to 3. */
  readonly amplitudes?: readonly number[];
}

interface Floater {
  readonly el: HTMLElement;
  readonly phase: number;
  readonly speed: number;
  readonly amp: number;
  x: number;
  y: number;
}

/**
 * Makes the elements float gently and drift toward the cursor.
 * While `isFrozen()` returns true they stand still. Returns a cleanup function.
 * Must be called outside the Angular zone.
 */
export function startFloating(
  elements: readonly HTMLElement[],
  isFrozen: () => boolean,
  options: FloatOptions = {},
): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {};
  }
  const offset = options.phaseOffset ?? 0;
  const floaters: Floater[] = elements.map((el, i) => ({
    el,
    phase: (i + offset) * 1.7,
    speed: 0.5 + ((i + offset) % 3) * 0.12,
    amp: options.amplitudes?.[i] ?? 3,
    x: 0,
    y: 0,
  }));

  let cursorX = -9999;
  let cursorY = -9999;
  const onMove = (event: PointerEvent) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
  };
  const onLeave = () => {
    cursorX = -9999;
    cursorY = -9999;
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  window.addEventListener('blur', onLeave);

  const update = (t: number) => {
    for (const f of floaters) {
      const rect = f.el.getBoundingClientRect();
      const baseX = rect.left + rect.width / 2 - f.x;
      const baseY = rect.top + rect.height / 2 - f.y;

      let targetX = Math.sin(t * f.speed + f.phase) * f.amp;
      let targetY = Math.cos(t * f.speed * 0.8 + f.phase * 1.3) * f.amp * 0.7;

      const dx = cursorX - baseX;
      const dy = cursorY - baseY;
      const dist = Math.hypot(dx, dy);
      if (dist < MAGNET_RADIUS && dist > 0.1) {
        const pull = (1 - dist / MAGNET_RADIUS) ** 2 * MAGNET_STRENGTH;
        targetX += (dx / dist) * pull;
        targetY += (dy / dist) * pull;
      }

      f.x += (targetX - f.x) * SMOOTHING;
      f.y += (targetY - f.y) * SMOOTHING;
      f.el.style.transform = `translate3d(${f.x.toFixed(2)}px, ${f.y.toFixed(2)}px, 0)`;
    }
  };

  let frame = 0;
  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    if (isFrozen()) {
      return;
    }
    try {
      update(now / 1000);
    } catch (error) {
      console.error(error);
    }
  };
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('blur', onLeave);
  };
}
