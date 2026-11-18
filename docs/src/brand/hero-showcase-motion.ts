import { panelTransform, type CollagePanel, type CollagePanelId } from "./library-hero-look";

// One independent replacement at a time. Travel is in the collage's own plane,
// before its perspective projection, so even a moving card follows the pointer.
export const SHOWCASE_MOTION = { duration: 1350, travel: 210 } as const;
export interface ShowcaseFlight { slot: number; from: number; to: number; direction: number }

/** Shuffle both locations and their specimens so random choices cannot starve
 * a location or keep replaying a small subset of its samples. */
export class HeroShowcaseSequence {
  private slots: number[] = [];
  private variants = new Map<number, { count: number; queue: number[] }>();

  constructor(private random = Math.random) {}

  private shuffle(values: number[]) {
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [values[i], values[j]] = [values[j]!, values[i]!];
    }
    return values;
  }

  next(selected: readonly number[], counts: readonly number[], previousSlot: number): ShowcaseFlight | null {
    // Variant zero is the opening artwork, never a later replacement.
    const eligible = counts.flatMap((count, slot) => count > 2 || (count === 2 && selected[slot] !== 1) ? [slot] : []);
    this.slots = this.slots.filter(slot => eligible.includes(slot));
    if (!this.slots.length) this.slots = this.shuffle([...eligible]);
    if (!this.slots.length) return null;
    // Only a cycle boundary can repeat a location. Swap the first draw with
    // another location, keeping the full shuffled cycle intact.
    if (this.slots.at(-1) === previousSlot && this.slots.length > 1) {
      const other = this.slots.findIndex(slot => slot !== previousSlot);
      const last = this.slots.length - 1;
      [this.slots[other], this.slots[last]] = [this.slots[last]!, this.slots[other]!];
    }
    const slot = this.slots.pop()!;
    const from = selected[slot] ?? 0;
    const count = counts[slot]!;
    let pool = this.variants.get(slot);
    if (!pool || pool.count !== count || !pool.queue.length) {
      pool = { count, queue: this.shuffle(Array.from({ length: count - 1 }, (_, i) => i + 1)) };
      this.variants.set(slot, pool);
    }
    if (pool.queue.at(-1) === from && pool.queue.length > 1) {
      const other = pool.queue.findIndex(variant => variant !== from);
      const last = pool.queue.length - 1;
      [pool.queue[other], pool.queue[last]] = [pool.queue[last]!, pool.queue[other]!];
    }
    return { slot, from, to: pool.queue.pop()!, direction: this.random() < 0.5 ? -1 : 1 };
  }
}

/** The sign names the arrival side; departure travels to the opposite side. */
export function entryDirection(position: CollagePanelId, centerDirection: number): number {
  if (position === "revenue") return centerDirection;
  return position === "online" || position === "glass" ? -1 : 1;
}

export function flightFrame(progress: number, incoming: boolean, direction: number) {
  "worklet";
  const t = Math.max(0, Math.min(1, incoming ? progress : progress / 0.76));
  // Ease-out for arrivals; ease-in for departures. Fade near the outer
  // end of the path, leaving a readable, genuinely sliding component in between.
  const eased = incoming ? 1 - Math.pow(1 - t, 4) : t * t;
  return {
    distance: SHOWCASE_MOTION.travel * direction * (incoming ? 1 - eased : -eased),
    opacity: incoming ? Math.min(1, t * 3) : Math.max(0, 1 - t * 1.5),
  };
}

export function flyingPanelTransform(panel: CollagePanel, width: number, rotation: readonly [number, number, number], distance: number) {
  "worklet";
  return [...panelTransform(panel, width, rotation), { translateX: distance }, { translateY: distance * -0.16 }];
}
