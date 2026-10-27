import { shape } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { type BadgeSkin } from "./badge.shared.js";

// Per-OS Badge skins. Badge is the Canvas v4 hand-off's pill (`K.def('badge')` in
// tools/v4/handoff/cv-kit-controls.js, with its docs overrides in cv-kit-code.js) on
// every platform: neither iOS nor Material 3 ships a label pill (their badges are the
// count dots on an icon), so there is no native shape to keep and the iOS and Android
// skins are the web skin.
//
// The pill is fully round and 22 px tall (18 small, 26 large) with an 8 px inset (6
// small) inside a 1 px border that stays transparent unless a tone draws it, and its
// label is 500 12 px (11 small) in the interface face. A toned pill leads with a 6 px dot
// in its ink. A reference key is the same height at the 6 px key corner. The status
// family has no pill: a 7 px dot inside a 3 px ring of its wash, beside the label. The
// colors live in badge.shared.tsx.

// Badges are HUG: the shell appends `useHugStyle()` (src/style/sizing.ts) at the
// root instead of a static alignSelf, which would pin a Row child to the top.
export const webSkin: BadgeSkin = {
  sizes: {
    small: { height: 18, paddingHorizontal: 6, fontSize: 11, lineHeight: 14 },
    default: { height: 22, paddingHorizontal: 8, fontSize: 12, lineHeight: 16 },
    large: { height: 26, paddingHorizontal: 8, fontSize: 12, lineHeight: 16 },
  },
  radius: shape.web.pill,
  referenceRadius: platformShape.web.key,
  gap: 6,
  referenceGap: 4,
  weight: "500",
  strongWeight: "600",
  uppercaseTracking: 0.06,
  dotSize: 6,
  statusDot: 7,
  statusRing: 3,
};

// No native label pill on either platform: the native skins are the web skin.
export const iosSkin: BadgeSkin = webSkin;
export const androidSkin: BadgeSkin = webSkin;
