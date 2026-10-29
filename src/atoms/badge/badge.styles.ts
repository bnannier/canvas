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
//
// The anatomy marker (`marker`) is the hand-off's numbered disc over the Anatomy figure
// (Component.dc.html line 220: `width:22px;height:22px;...;border-radius:50%;...;
// background:var(--ion);color:var(--ion-fg);font:600 11px/1 var(--fm);box-shadow:0 0 0
// 3px var(--bg2),0 4px 12px rgba(0,0,0,.4)`): a 22 px pill with no inset, its number 600
// 11 px on an 11 px line in the code face, on the accent, set off from the stage by a
// 3 px ring of the stage well's fill (`--bg2`, the `surface-sunken` token CardMedia's
// well paints) and the drop shadow.
// The `token` chip is the component page template's Semantics chip (Component.dc.html
// line 264: `height:22px;padding:0 8px;border-radius:999px;background:var(--ion-soft);
// color:var(--ion-tx);font:500 11px var(--fm)`): 22 tall with an 8 px inset under the
// small pill's 11 px mono label.

// Badges are HUG: the shell appends `useHugStyle()` (src/style/sizing.ts) at the
// root instead of a static alignSelf, which would pin a Row child to the top.
export const webSkin: BadgeSkin = {
  sizes: {
    // The navigation row's tag (Navigation.dc.html, the sidebar's "New": `height:18px;padding:0
    // 6px;...;font:500 10px/18px`): the small pill's box under a 10 px label on its own line.
    tiny: { height: 18, paddingHorizontal: 6, fontSize: 10, lineHeight: 18 },
    small: { height: 18, paddingHorizontal: 6, fontSize: 11, lineHeight: 14 },
    default: { height: 22, paddingHorizontal: 8, fontSize: 12, lineHeight: 16 },
    large: { height: 26, paddingHorizontal: 8, fontSize: 12, lineHeight: 16 },
    // Line 220: `width:22px;height:22px` and `font:600 11px/1 var(--fm)`.
    marker: { height: 22, paddingHorizontal: 0, fontSize: 11, lineHeight: 11 },
    // The tier pill beside a page title (Component.dc.html line 139): `height:24px;padding:0
    // 10px;...;font:500 11px/1 var(--fm);letter-spacing:.06em;text-transform:uppercase`.
    tier: { height: 24, paddingHorizontal: 10, fontSize: 11, lineHeight: 11 },
    // The group band's pill (Component.dc.html line 237, the props table's "pick one"):
    // `height:20px;padding:0 7px;border-radius:999px;...;background:var(--ion-soft);
    // color:var(--ion-tx);font:500 11px var(--fm)`. The hand-off sets no line ratio; the
    // 14 px line is what Chromium gives JetBrains Mono 11 px at `normal`, measured on the
    // served hand-off page, the small pill's line.
    band: { height: 20, paddingHorizontal: 7, fontSize: 11, lineHeight: 14 },
    // The Semantics chip (line 264): the pill's 1 px edge sits inside the 8 px inset, so the
    // chip is the template's width; the 14 px line is JetBrains Mono's normal at 11 px.
    token: { height: 22, paddingHorizontal: 7, fontSize: 11, lineHeight: 14 },
  },
  // Line 220: `box-shadow:0 0 0 3px var(--bg2),0 4px 12px rgba(0,0,0,.4)`, `--bg2` the
  // stage well's fill (CardMedia reads `surface-sunken`, falling back to `muted` as it does).
  markerShadow: (tokens) => `0px 0px 0px 3px ${tokens["surface-sunken"] ?? tokens.muted}, 0px 4px 12px rgba(0,0,0,0.4)`,
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

// No native label pill on either platform: the native skins are the web skin, the
// marker's ring and shadow included (React Native's own boxShadow, as the notification
// count's ring is drawn), since neither platform ships a control for the job.
export const iosSkin: BadgeSkin = webSkin;
export const androidSkin: BadgeSkin = webSkin;
