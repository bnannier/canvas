import { type ViewStyle, type TextStyle } from "react-native";
import { MONO_FONT, platformMinTarget, shape, statusColors, darkColors, lightColors, type ColorTokens } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { type CodeBlockSkin, type Density } from "./code-block.shared.js";

// Co-located CodeBlock skins. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens, so the code card follows
// light/dark. Surfaced CodeBlock variants use static content frost with these opaque
// fills as their solid fallback. Code ink stays unwarped.
//
// The look is the Canvas v4 hand-off's code block (`K.def('code-block')` in
// tools/v4/handoff/cv-kit-data.js, with its code-driven form, cv-kit-code3.js
// `O('code-block')`):
//
//   The card: the code-card corner on a `border` hairline over the sunken well
//   (`surface-sunken`, the hand-off's bg2). A header row of at least 36 sits on top,
//   14 in at the start and 12 at the end, over a `border` hairline: the file name (or
//   the language) in 12 px mono in the subtle ink, a 12 px mono language detail when
//   both are set, and the copy chip (a 26 tall, 8 in, `field-border` hairline chip of a
//   13 px glyph and a 500 12 label in the muted ink). Tabs are 6 by 10, 500 12, the
//   active one in the foreground over a 2 px accent underline, the rest subtle.
//   The code: 13 / 1.7 mono (12 compact), 14 above and below (8 compact), each row 16
//   in (12 compact); line numbers in the subtle ink, 14 before the code. A highlighted
//   row takes the accent's soft wash, a diff row the success or destructive wash with
//   its marker in the text-grade ink. A collapsed block closes on a `border` hairline
//   with a 500 12 "show more" in the accent's text ink, 8 by 16.
//   The terminal: the dark scheme's page as a fixed dark window in every scheme, its
//   header the three 9 px status dots and the label, the prompt in the success green,
//   commands in the dark foreground and output in the dark subtle ink.
//   The `playground` density is the hand-off component page's own JSX card instead
//   (Component.dc.html lines 171 to 174, the playground's output, drawn by the page and
//   not by its CodeBlock renderer): `border:1px solid var(--ln);border-radius:16px;
//   background:var(--bg2)`, its bar `height:40px;padding:0 8px 0 16px;...;border-bottom:
//   1px solid var(--ln);background:var(--sf)` with the 400 12px mono tx3 label and a Copy
//   button `height:28px;padding:0 10px;border-radius:8px;...;font:500 12px var(--ft);
//   color:var(--tx2);border:1px solid var(--ln2)` of a 13 px glyph 6 before its label,
//   and its `<pre style="padding:16px 18px;font:400 13px/1.7 var(--fm)">`.
//
// CodeBlock is a "Shared" platform treatment: neither iOS nor Android ships a code
// display control, and the web reference is the standard `pre`/`code` HTML pattern,
// so there is ONE look on every platform. `iosSkin` and `androidSkin` therefore
// reference the SAME object as `webSkin` (no fabricated per-OS difference); the skin
// contract exists only so the file pattern matches the rest of the kit.

export type Variant = "terminal" | "numbered" | "inline" | "plain";

// Monospace face: requested inline since RN has no font-family utility (the same
// approach Badge's `mono` modifier uses).
export const MONO = { fontFamily: MONO_FONT } as const;

// --- type ramp ---------------------------------------------------------------

// The code type: 13 / 1.7, and the compact 12 / 1.7.
const codeType: TextStyle = { fontSize: 13, lineHeight: 22.1 };
const codeTypeCompact: TextStyle = { fontSize: 12, lineHeight: 20.4 };

// Code foreground color (text-foreground).
function codeText(tokens: ColorTokens): TextStyle {
  return { color: tokens.foreground };
}

// --- surface -----------------------------------------------------------------

// The code card: the sunken well on a hairline at the code-card corner (the card corner
// on the playground card, `border-radius:16px`). The fill is
// OPAQUE (a content surface); `overflow: "hidden"` clips full-bleed row tints (line
// highlight, diff) at the rounded corners. Its header bar and the terminal window
// share the corner; the hairline is the inset the expander's corners sit inside.
const CARD_RADIUS = platformShape.web.codeCard;
const PLAYGROUND_RADIUS = shape.web.card;
const CARD_BORDER = 1;

/** The card's corner at a density: the code-card corner, or the card corner on the playground card. */
function cardRadius(density: Density): number {
  return density === "playground" ? PLAYGROUND_RADIUS : CARD_RADIUS;
}

function surface(tokens: ColorTokens, density: Density = "default"): ViewStyle {
  return {
    width: "100%",
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: cardRadius(density),
    borderWidth: CARD_BORDER,
    borderColor: tokens.border,
    backgroundColor: tokens["surface-sunken"] ?? tokens.muted,
  };
}

// `attached`: the block sits flush under an adjoining bar/stage, so its top edge
// squares off and the shared border is not doubled.
const attachedTop: ViewStyle = {
  borderTopStartRadius: 0,
  borderTopEndRadius: 0,
  borderTopWidth: 0,
};

// The vertical padding per density (14, 8 compact, 16 on the playground card) and the
// row inset (16, 12 compact, 18 on the playground card: its `padding:16px 18px`).
function padUnit(density: Density): number {
  return density === "compact" ? 12 : density === "playground" ? 18 : 16;
}

// Vertical padding of the rows column (horizontal padding lives on each row so
// line tints run full-bleed to the surface edges).
function bodyPad(density: Density): ViewStyle {
  return { paddingVertical: density === "compact" ? 8 : density === "playground" ? 16 : 14 };
}

// Horizontal padding of one code row. With a pinned gutter to the left, the row
// keeps only its end padding (the gutter carries the start inset).
function rowPad(density: Density, gutter: boolean): ViewStyle {
  return {
    flexDirection: "row",
    paddingStart: gutter ? 0 : padUnit(density),
    paddingEnd: padUnit(density),
  };
}

// --- header bar (filename/language label, tab strip, hosted copy chip) -------

// The header row above the code: the card's own top, on the sunken well, its bottom
// edge the hairline the code surface's top border draws. On the playground card it is
// the hand-off's 40 px bar on the `card` fill (its `background:var(--sf)`), 16 in and 8
// out (`padding:0 8px 0 16px`).
function headerBar(tokens: ColorTokens, density: Density = "default"): ViewStyle {
  const playground = density === "playground";
  return {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "flex-start",
    width: "100%",
    borderTopStartRadius: cardRadius(density),
    borderTopEndRadius: cardRadius(density),
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: tokens.border,
    backgroundColor: playground ? tokens.card : tokens["surface-sunken"] ?? tokens.muted,
    paddingStart: playground ? 16 : 14,
    paddingEnd: playground ? 8 : 12,
    paddingVertical: 4,
    minHeight: playground ? 40 : 36,
  };
}

// When the header hosts a tab strip, the tabs carry their own vertical rhythm
// (and their active underline must sit on the bar's bottom edge).
const headerBarWithTabs: ViewStyle = { paddingTop: 6, paddingBottom: 0, paddingStart: 8 };

// The header label: 12 px mono in the subtle ink (the file name).
function headerLabel(tokens: ColorTokens): TextStyle {
  return { fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] };
}

// The trailing language detail shown when both `filename` and `language` are set:
// the label's own 12 px mono in the subtle ink.
function headerBadge(tokens: ColorTokens): TextStyle {
  return { fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] };
}

// When a header bar sits above the surface, the surface's own top corners must be
// squared off so the two strips read as one card.
const surfaceUnderHeader: ViewStyle = { borderTopStartRadius: 0, borderTopEndRadius: 0 };

// --- tab strip ---------------------------------------------------------------

// The tab row hosted by the header bar (or the terminal chrome), 2 apart.
const tabStrip: ViewStyle = {
  flexDirection: "row",
  alignItems: "stretch",
  gap: 2,
  flexShrink: 1,
};

// One tab, 6 by 10, with a 2px accent underline when active. The `dark` flag styles
// the terminal-chrome incarnation (the fixed dark window).
function tabItem(tokens: ColorTokens, active: boolean, dark: boolean): ViewStyle {
  const underline = dark ? DARK.primary : tokens.primary;
  return {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: active ? underline : "transparent",
    justifyContent: "center",
  };
}

// 500 12: the active tab in the foreground, the rest in the subtle ink.
function tabLabel(tokens: ColorTokens, active: boolean, dark: boolean): TextStyle {
  const t = dark ? DARK : tokens;
  return {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: active ? t.foreground : t["subtle-foreground"] ?? t["muted-foreground"],
  };
}

// --- line emphasis (highlightLines) ------------------------------------------

// A highlighted row: the accent's soft wash.
function highlightRow(tokens: ColorTokens, _dark: boolean): ViewStyle {
  return { backgroundColor: tokens["primary-soft"] };
}

// --- diff mode ---------------------------------------------------------------

// Added/removed rows: the scheme's success and destructive washes.
function diffRow(kind: "add" | "del", dark: boolean): ViewStyle {
  const t = dark ? DARK : lightColors;
  return { backgroundColor: kind === "add" ? t["success-soft"] : t["destructive-soft"] };
}

// The +/- marker glyph in the text-grade ink, excluded from selection so a copied
// block never drags diff markers along.
function diffMarker(kind: "add" | "del" | "ctx", tokens: ColorTokens, _dark: boolean): TextStyle {
  const color = kind === "add" ? statusColors(tokens, "success").ink : kind === "del" ? statusColors(tokens, "error").ink : tokens["subtle-foreground"] ?? tokens["muted-foreground"];
  return { color, userSelect: "none" };
}

// --- numbered gutter ---------------------------------------------------------

// The pinned line-number column: right-aligned digits, start inset matching the
// row inset. Sits OUTSIDE the horizontal scroller so numbers never scroll.
function gutterCol(density: Density): ViewStyle {
  return { alignItems: "stretch", paddingStart: padUnit(density) };
}

// One gutter row: a right-aligned number, 14 before the code.
function gutterRow(_density: Density): ViewStyle {
  return { alignItems: "flex-end", paddingEnd: 14 };
}

// Line numbers in the subtle ink, sharing the code type. `userSelect: "none"` keeps
// them out of a copied selection, so the pasted block is clean, runnable code.
function gutterText(tokens: ColorTokens): TextStyle {
  return { color: tokens["subtle-foreground"] ?? tokens["muted-foreground"], userSelect: "none" };
}

// --- collapsible expander ----------------------------------------------------

// The expander under a collapsed block: a row on a `border` hairline, 8 by 16.
function expanderBar(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 6,
    borderTopWidth: 1,
    borderColor: tokens.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
  };
}

// The expander's ripple clip: the card's bottom corners inside its 1px border, so the
// press layer follows the card's curve (the card corner's on the playground card).
function expanderClip(density: Density = "default"): ViewStyle {
  return density === "playground"
    ? { borderBottomStartRadius: PLAYGROUND_RADIUS - CARD_BORDER, borderBottomEndRadius: PLAYGROUND_RADIUS - CARD_BORDER }
    : { borderBottomStartRadius: CARD_RADIUS - CARD_BORDER, borderBottomEndRadius: CARD_RADIUS - CARD_BORDER };
}

// 500 12 in the accent's text ink.
function expanderLabel(tokens: ColorTokens): TextStyle {
  return {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: tokens["primary-text"] ?? tokens.primary,
  };
}

// --- terminal variant --------------------------------------------------------

// The terminal is a fixed dark window: the dark scheme's tokens in every scheme.
const DARK: ColorTokens = darkColors;

// The window: the code-card corner on the dark hairline, no shade.
function terminalOuter(_tokens: ColorTokens): ViewStyle {
  return {
    position: "relative",
    width: "100%",
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: DARK.border,
    backgroundColor: DARK.background,
  };
}

// The header row: the status dots and the label, 36 tall, over the dark hairline.
const terminalChrome: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 5,
  borderBottomWidth: 1,
  borderColor: DARK.border,
  backgroundColor: DARK.background,
  paddingStart: 14,
  paddingEnd: 12,
  paddingVertical: 4,
  minHeight: 36,
};

// When the chrome hosts a tab strip, the tabs carry the vertical rhythm.
const terminalChromeWithTabs: ViewStyle = { paddingTop: 6, paddingBottom: 0 };

// A status dot: 9 px, the dark scheme's destructive, warning and success.
function trafficDot(hue: "red" | "amber" | "green"): ViewStyle {
  return { height: 9, width: 9, borderRadius: 9999, backgroundColor: hue === "red" ? DARK.destructive : hue === "amber" ? DARK.warning : DARK.success };
}

// The label: 12 px mono in the dark subtle ink, 8 after the dots.
const terminalLabel: TextStyle = {
  marginStart: 3,
  fontFamily: MONO_FONT,
  fontSize: 12,
  lineHeight: 16,
  color: DARK["subtle-foreground"],
};

// The terminal body: the dark page; vertical padding per density (rows carry horizontal).
function terminalBody(density: Density): ViewStyle {
  return { backgroundColor: DARK.background, ...bodyPad(density) };
}

// The non-selectable prompt, in the success green. `userSelect: "none"` keeps the
// shell glyph out of a copied selection (it is a cross-platform RN TextStyle prop).
const terminalPrompt: TextStyle = { color: DARK.success, userSelect: "none" };

// The command line itself: the dark foreground.
const terminalLine: TextStyle = { color: DARK.foreground };

// A transcript output line: the dark subtle ink, no prompt.
const terminalOutput: TextStyle = { color: DARK["subtle-foreground"] };

// --- inline variant ----------------------------------------------------------

// self-start rounded border border-border bg-muted px-1.5 py-0.5
function inlineBox(tokens: ColorTokens): ViewStyle {
  return {
    alignSelf: "flex-start",
    borderRadius: platformShape.web.key,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.muted,
    paddingHorizontal: 6,
    paddingVertical: 2,
  };
}

// The inline pill's own smaller size (text-[13px]).
const inlineType: TextStyle = { fontSize: 13 };

// The copyable inline pill (`inline copy`): the hand-off's import chip on the component
// detail page (Component.dc.html's header), a 34-tall raised pill of mono 12 code with
// a trailing copy glyph, the whole pill one button. `sf2` is the raised `popover`
// surface, `ln2` the `field-border` hairline, `tx2` the `muted-foreground` ink; under
// the pointer the hairline turns to the accent (`ion`) and the ink to `foreground`.
// `minHeight` (not the hand-off's fixed height) so a line too long for a phone wraps
// inside the pill instead of spilling out of it.
function inlineCopyBox(tokens: ColorTokens, hovered: boolean): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 8,
    // The control corner (10 on the web row): the chip is a button.
    borderRadius: shape.web.control,
    borderWidth: 1,
    borderColor: hovered ? tokens.primary : tokens["field-border"] ?? tokens.input,
    backgroundColor: tokens.popover,
  };
}

// The copyable pill's code: JetBrains Mono 12 at regular weight, monochrome (the
// hand-off sets the import line in one ink, no syntax colors).
function inlineCopyType(tokens: ColorTokens, hovered: boolean): TextStyle {
  return {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
    flexShrink: 1,
    color: hovered ? tokens.foreground : tokens["muted-foreground"],
  };
}

// The trailing glyph's size (the hand-off's 13px icon).
const inlineCopyIcon = 13;

// --- copy affordance ---------------------------------------------------------

// The copy chip: 26 tall, 8 in, a 13 px glyph 6 from a 500 12 label, on a
// `field-border` hairline at the key corner. Positioning is NOT part of the chip: a
// floating chip is placed by an absolutely-positioned wrapper in the shell (which also
// measures its width so code rows can reserve a matching end inset). A hosted chip sits
// bare in the header; a floating one, over code, takes the card fill so the code does
// not read through it. `dark` is the terminal's chip, on the dark window. On the
// playground card it is the hand-off page's Copy button: 28 tall, 10 in, at the page's
// copy-button corner (`height:28px;padding:0 10px;border-radius:8px`, the same
// `field-border` hairline, 500 12 label and 13 px glyph 6 apart).
function copyButton(tokens: ColorTokens, dark: boolean, floating: boolean, density: Density = "default"): ViewStyle {
  const t = dark ? DARK : tokens;
  const playground = density === "playground";
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: playground ? 28 : 26,
    borderRadius: playground ? platformShape.web.copyButton : platformShape.web.key,
    borderWidth: 1,
    paddingHorizontal: playground ? 10 : 8,
    paddingVertical: 4,
    borderColor: t["field-border"] ?? t.border,
    ...(floating ? { backgroundColor: t.card } : null),
  };
}

// Copy label: 500 12 in the muted ink.
function copyText(tokens: ColorTokens, dark: boolean): TextStyle {
  return {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: (dark ? DARK : tokens)["muted-foreground"],
  };
}

// ---------- Web: the code card, the one look every platform shares ----------
// The sunken code card with the terminal / numbered / inline variants and the copy chip
// described above. This is the single source of truth for the one
// shared look.
export const webSkin: CodeBlockSkin = {
  // One shared skin across the three platforms (a code surface is
  // platform-neutral), so the minimum comes from the platform at runtime.
  minTarget: platformMinTarget(),
  codeType,
  codeTypeCompact,
  codeText,
  surface,
  attachedTop,
  bodyPad,
  rowPad,
  headerBar,
  headerBarWithTabs,
  headerLabel,
  headerBadge,
  surfaceUnderHeader,
  tabStrip,
  tabItem,
  tabLabel,
  highlightRow,
  diffRow,
  diffMarker,
  gutterCol,
  gutterRow,
  gutterText,
  expanderBar,
  expanderClip,
  expanderLabel,
  terminalOuter,
  terminalChrome,
  terminalChromeWithTabs,
  trafficDot,
  terminalLabel,
  terminalBody,
  terminalPrompt,
  terminalLine,
  terminalOutput,
  inlineBox,
  inlineType,
  inlineCopyBox,
  inlineCopyType,
  inlineCopyIcon,
  copyButton,
  copyText,
  copyPressedOpacity: 0.8,
};

// ---------- iOS / Android: identical to web (Shared treatment) ----------
// CodeBlock has no native iOS/Android control to match (the reference catalog marks
// both `(none)`), so there is one look everywhere. These intentionally reference the
// same object as `webSkin`; do NOT fabricate per-OS differences here.
export const iosSkin: CodeBlockSkin = webSkin;
export const androidSkin: CodeBlockSkin = webSkin;
