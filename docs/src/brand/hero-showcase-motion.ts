import { panelTransform, type CollagePanel } from "./library-hero-look";

// One independent replacement at a time. Travel is in the collage's own plane,
// before its perspective projection, so even a moving card follows the pointer.
export const SHOWCASE_MOTION = { duration: 1350, minimumRest: 1700, restRange: 1600, travel: 210 } as const;
export interface ShowcaseFlight { slot: number; from: number; to: number; direction: number }

export function chooseReplacement(selected: readonly number[], counts: readonly number[], previousSlot: number, random = Math.random, minimumVariant = 0): ShowcaseFlight | null {
  const options = counts.map((count, slot) => Array.from({ length: count }, (_, variant) => variant)
    .filter(variant => variant >= minimumVariant && variant !== selected[slot]));
  const eligible = options.flatMap((choices, slot) => choices.length ? [slot] : []);
  const candidates = eligible.length > 1 ? eligible.filter(slot => slot !== previousSlot) : eligible;
  if (!candidates.length) return null;
  const slot = candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))]!;
  const from = selected[slot] ?? 0;
  const choices = options[slot]!;
  const to = choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))]!;
  return { slot, from, to, direction: random() < 0.5 ? -1 : 1 };
}

export function flightFrame(progress: number, incoming: boolean, direction: number) {
  "worklet";
  const t = Math.max(0, Math.min(1, incoming ? (progress - 0.16) / 0.84 : progress / 0.76));
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
