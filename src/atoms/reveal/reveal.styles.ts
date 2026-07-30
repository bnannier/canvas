import { type RevealSkin } from "./reveal.shared.js";

// Per-OS Reveal skins. Reveal is a "Shared" treatment: an entrance reveal has no
// per-OS visual delta to match. Neither the HIG nor Material 3 specifies a
// scroll-into-view entrance for content (both describe entering elements in general
// motion terms: a short offset plus a fade on a decelerating curve, which is what
// this is), so there is no native shape to mirror and the movement is identical on
// every platform. The iOS and Android skins reference the web skin verbatim, the way
// skeleton.styles.ts does, rather than repeating three byte-identical objects. The
// skin still exists so the architecture stays uniform across the kit, and so these
// numbers live in the skin layer where a platform delta could later be introduced
// without touching the shell.
//
// The values, and why each is what it is:
//   travel / travelPronounced: 16 is a short, tasteful lift that reads as arrival
//     without the content appearing to fly in; 40 is the deliberate, sectional
//     version for a hero or a section header. Both are well under a screen, because a
//     long travel on a scroll-triggered element fights the scroll itself.
//   duration / durationBrisk: 460ms is a calm content entrance; 260ms is the brisk
//     one for dense sets where the eye should not have to wait. Both sit inside the
//     200-500ms band that reads as responsive rather than sluggish.
//   inset / insetDeep: how far inside the bottom edge of the window the element's top
//     must come before it fires. 48 fires as the element is entering (so the entrance
//     is not still running by the time it is at eye level), and 140 holds it until the
//     element is properly in the viewport, for content that should not begin arriving
//     until it is really being looked at.
//   staggerStep / staggerMaxSteps: 60ms per ordinal is the classic list cascade, fast
//     enough that a row of cards feels like one gesture. The step count is capped at
//     10 (600ms) so a long list cannot push its tail item into a delay a reader would
//     notice as lateness rather than rhythm.

export const webSkin: RevealSkin = {
  travel: 16,
  travelPronounced: 40,
  duration: 460,
  durationBrisk: 260,
  inset: 48,
  insetDeep: 140,
  staggerStep: 60,
  staggerMaxSteps: 10,
};

// Shared treatment: identical to web on every platform (no native entrance shape to
// match, and motion this short reads the same on all three).
export const iosSkin: RevealSkin = webSkin;
export const androidSkin: RevealSkin = webSkin;
