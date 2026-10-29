import { type ViewStyle } from "react-native";
import { platformMinTarget, TOUCH_TARGET, shape, MONO_FONT } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { type ChipSkin } from "./chip.shared.js";

// Co-located Chip skins, drawn from the Canvas v4 hand-off (`K.def('chip')` in
// tools/v4/handoff/cv-kit-controls.js, and its Android row `K.PF.chip` in
// cv-kit-platform.js). The colors live in the shell; each skin carries its platform's
// shape, sizing, type, and the color choices that differ by platform.
//
//   Web and iOS: the hand-off's outlined pill, 28px tall and fully round, 12px sides that
//     drop to 8 beside a leading icon and to 6 beside the remove disc, 6px between
//     elements, a 500 13px label. The idle chip is the raised neutral fill with its 1px
//     hairline; a selected chip is the accent's soft wash inside an accent edge, leading
//     with a 13px check when it has no icon of its own. The remove control is an 18px
//     disc washed in a neutral grey around an 11px "x"; a count is the 500 11px mono
//     numeral at 0.7. A hovering pointer brightens the chip (1.12). iOS ships no chip
//     control, so its skin is the web skin; the remove control still pads out to the
//     44pt HIG minimum through platformMinTarget.
//   Android (Material 3 chips, m3.material.io/components/chips/specs): a 32dp container
//     at the Material 3 chip corner (NOT a pill) with a 1dp outline, 16dp sides that
//     drop to 8dp beside an icon, 8dp between elements, a label-large label (14/20, 500,
//     tracking 0), 18dp icons (the leading icon in the accent ink on a neutral chip), an
//     18dp remove glyph with a 48dp close target. A selected filter chip is the tonal
//     accent with a leading 18dp checkmark and no outline. Disabled at 0.38.
//
// A chip is a compact tag, so it has ONE size per platform; there is no size axis.

// The structure every skin shares. The horizontal insets resolve per side in the shell
// from `sidePadding`. The chip is HUG: the shell appends `useHugStyle()`
// (src/style/sizing.ts) at the root, so it keeps its content width in a stretching
// Column without pinning a Row child to the top the way a static alignSelf would.
const shell: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  borderWidth: 1,
};

// The hand-off's chip pill: 28 tall at the full round, its border inside the height.
const pill: ViewStyle = {
  ...shell,
  height: 28,
  gap: 6,
  borderRadius: shape.web.pill,
};

// The remove disc and its glyph, and the touch area the disc pads out to: the platform
// minimum on a native build (biased away from the label, on the left), the established
// pointer target on the web, where a mouse needs no minimum.
const REMOVE = 18;
const MIN_TARGET = platformMinTarget();
const removeHitSlop = MIN_TARGET == null
  ? { top: 13, bottom: 13, left: 6, right: 13 }
  : { top: (MIN_TARGET - REMOVE) / 2, bottom: (MIN_TARGET - REMOVE) / 2, left: 6, right: MIN_TARGET - REMOVE - 6 };

// A tappable chip's fixed body slop on the web and iOS skin: 8 on every side, which clears
// the 44pt minimum around the 28pt pill (the web drops hitSlop).
const BODY_HIT_SLOP = 8;

// The `option` chip (the hand-off playground's knob picks, Component.dc.html): 26 tall at the
// web row's `optionChip` corner, 9 at the sides, a 500 12px label, no check and no hover; an icon-only pick is a
// 30 px square at the web row's `optionTile` corner (line 163: `width:30px;height:30px;border-radius:8px;
// display:grid;place-items:center`). The tile's own label is the hand-off's "none" pick,
// the empty glyph of its ICONS list (line 319) drawn by the same tile (line 163:
// `font:500 10px var(--fm)` on the button, which its `<span>none</span>` inherits): a
// 500 10 px mono line, centred in the square.
const option: NonNullable<ChipSkin["option"]> = {
  base: { ...shell, height: 26, gap: 6, borderRadius: platformShape.web.optionChip },
  sidePadding: { text: 9, icon: 9, remove: 6 },
  labelType: { fontSize: 12, lineHeight: 16, fontWeight: "500" },
  selectedCheck: null,
  hoverBrightness: undefined,
  iconOnly: { width: 30, height: 30, borderRadius: platformShape.web.optionTile, justifyContent: "center", paddingStart: 0, paddingEnd: 0 },
  tileLabelType: { fontFamily: MONO_FONT, fontSize: 10, lineHeight: 12, fontWeight: "500" },
};

// The `token` chip (the hand-off's Tokens section, Component.dc.html line 294:
// `height:32px;padding:0 12px 0 6px;border-radius:999px;border:1px solid var(--ln);
// background:var(--sf);display:inline-flex;align-items:center;gap:8px`, its label the
// `<span style="font:500 12px var(--fm)">`): a 32 px full-round pill, 8 between elements,
// 12 on the text side and 6 beside the leading element (its 20 px swatch), the label a
// 500 12 px mono line, no check and no hover. The shell paints it the card fill (`--sf`)
// inside the hairline (`--ln`) in the foreground ink.
const token: NonNullable<ChipSkin["token"]> = {
  base: { ...shell, height: 32, gap: 8, borderRadius: shape.web.pill },
  sidePadding: { text: 12, icon: 6, remove: 6 },
  labelType: { fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "500" },
  selectedCheck: null,
  hoverBrightness: undefined,
};

// The `link` chip (the hand-off's section card link pill, every `c-*` card of
// `Canvas v4.0.0 <Section>.dc.html`: `height:26px;padding:0 10px;border-radius:999px;
// display:inline-flex;align-items:center;gap:6px;border:1px solid var(--ln2);
// background:var(--sf2);font:500 12px/1 var(--ft);color:var(--tx2)`, its hover
// `color:var(--ion-tx);border-color:var(--ion)`): a 26 px full-round pill, 6 between
// elements, 10 at both sides (beside its trailing arrow too), a 500 12/12 label, no check.
// The hand-off draws no press state on the web, so a press keeps the resting look there.
const link: NonNullable<ChipSkin["link"]> = {
  base: { ...shell, height: 26, gap: 6, borderRadius: shape.web.pill },
  sidePadding: { text: 10, icon: 10, remove: 6 },
  labelType: { fontSize: 12, lineHeight: 12, fontWeight: "500" },
  selectedCheck: null,
  steadyPress: true,
};

export const webSkin: ChipSkin = {
  base: pill,
  sidePadding: { text: 12, icon: 8, remove: 6 },
  labelType: { fontSize: 13, lineHeight: 17, fontWeight: "500" },
  countType: { fontFamily: MONO_FONT, fontSize: 11, lineHeight: 14, fontWeight: "500", opacity: 0.7 },
  removeSize: REMOVE,
  removeGlyph: 11,
  // The hand-off's neutral grey wash, the same on either scheme's page.
  removeDisc: "rgba(127, 127, 127, 0.18)",
  removeHitSlop,
  bodyHitSlop: BODY_HIT_SLOP,
  selectedCheck: { size: 13, replacesIcon: false },
  selectedEdge: true,
  hoverBrightness: 1.12,
  disabledOpacity: 0.4,
  option,
  token,
  link,
};

// iOS ships no chip control: the native skin is the web skin, the link pill included.
export const iosSkin: ChipSkin = webSkin;

// Material 3 chips (assist/filter/input/suggestion) share a 32dp container with an
// 8dp corner radius (NOT a full pill), a 1dp outline, 16dp side padding (8dp beside
// an icon), and 8dp between elements.
const androidBase: ViewStyle = {
  ...shell,
  height: 32,
  gap: 8, // M3 8dp padding between elements
  borderRadius: platformShape.android.chip, // the M3 chip corner, the small shape (8dp, not a pill)
  // Bound the press ripple (state layer) to the rounded container; this skin is
  // shadow-free, so the clip is set directly here per src/style/ripple.ts.
  overflow: "hidden",
};

export const androidSkin: ChipSkin = {
  base: androidBase,
  sidePadding: { text: 16, icon: 8, remove: 8 }, // M3 16dp side padding, 8dp beside an icon
  // M3 chip label = label-large: 14/20, medium (500), tracking 0.
  labelType: { fontSize: 14, lineHeight: 20, fontWeight: "500", letterSpacing: 0 },
  countType: { fontSize: 12, lineHeight: 16, fontWeight: "500", opacity: 0.75 },
  removeSize: 18, // M3 trailing (close) icon 18dp
  removeGlyph: 18,
  // 18dp glyph + 15/15 vertical, 8/22 horizontal slop = the M3 48dp minimum close
  // target, biased away from the label (left).
  removeHitSlop: { top: 15, bottom: 15, left: 8, right: 22 },
  // A tappable chip's touch area is measured and grows to the M3 48dp minimum: 8dp above and
  // below the 32dp chip, and nothing sideways once it is 48dp wide.
  bodyMinTarget: TOUCH_TARGET.android,
  selectedCheck: { size: 18, replacesIcon: true }, // M3 selected filter chip: leading 18dp checkmark
  outlined: true, // M3 idle chips are the bare container inside the 1dp outline
  accentIcon: true, // M3: a neutral chip's leading icon takes the accent ink
  disabledOpacity: 0.38,
  // No `option`, `token` or `link` look: Android has the real control for each job, so an
  // option pick, a token tag and a link (the assist chip) are its Material 3 chip
  // (design-language item 4), and the shell leaves those props unread here.
};
