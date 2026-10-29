import { primaryText } from "../../style/primary-text.js";
import { actionFill, actionInk } from "../../style/action.js";
import { type ViewStyle, type TextStyle } from "react-native";
import { MONO_FONT, alpha, shape, withInnerFill, type ColorTokens } from "../../style/index.js";
import { HOVER } from "../../style/motion.js";
import { type HoverMotion } from "../../style/hover.js";
import { LoadingArc, PlatformLoader, type ButtonLoader } from "./button-loader.js";

export const shrinkButton: ViewStyle = { flexShrink: 1, minWidth: 0 };
export const shrinkLabel: TextStyle = { flexShrink: 1, textAlign: "center" };

// Co-located Button skins, one per platform, all drawn from the Canvas v4 hand-off's
// button (`K.btn` in tools/v4/handoff/cv-kit.js, its special looks in cv-kit-code.js).
//   Web: the hand-off's control: 32 / 40 / 48 tall, the control corner, 12 / 16 / 22
//   of side padding, a 500 label at 13 / 14 / 16, an 8 gap and a 1px border on every
//   intent but link. The filled intents carry a lit top edge, rise 1px and brighten under
//   the pointer; the others take the `secondary` wash. A press scales to 0.96 and darkens,
//   a disabled button fades to 0.4.
//   iOS (HIG / iOS 26+ Liquid Glass): the hand-off's iOS row: a capsule, 50 tall at base,
//   a 600 17pt SF Pro label, dim-on-press.
//   Android (Material 3): the hand-off's Android row: a stadium, 32 / 40 / 48 tall, a 500
//   Roboto label, flat, ripple.
// Every platform paints the same hand-off colours per intent (`lookOf`), and the
// special bodies (theme choice, identity, reference link, scope and filter triggers, the
// inline link, the utility icon box) are the hand-off's on every platform.

export type Intent = "primary" | "secondary" | "destructive" | "outline" | "ghost" | "link";
export type Size = "small" | "base" | "large";

export interface ButtonSkinOpts {
  identityAction?: boolean;
  pageLink?: boolean;
  jumpLink?: boolean;
  mono?: boolean;
  referenceLink?: boolean;
  inlineIcon?: boolean;
  themeChoice?: boolean;
  selected?: boolean;
  scopeTrigger?: boolean;
  filterTrigger?: boolean;
  inlineLink?: boolean;
  plainLink?: boolean;
  foreground?: boolean;
  extraBold?: boolean;
  utility?: boolean;
  iconBox?: "compact" | "medium" | "large" | null;
  wideIcon?: boolean;
  circle?: boolean;
  inset?: boolean;
  inverse?: boolean;
  quiet?: boolean;
  softHover?: boolean;
  consistent?: boolean;
  comfortable?: boolean;
  icon: boolean;
  block: boolean;
  /** disabled or loading: dim the control (the iOS and Android skins). */
  dim: boolean;
  /** disabled alone: the web skin fades a disabled button, and a loading button keeps its full look. */
  disabled?: boolean;
}

export interface ButtonSkin {
  surround?: (opts: ButtonSkinOpts) => ViewStyle;
  container: (t: ColorTokens, intent: Intent, size: Size, opts: ButtonSkinOpts) => ViewStyle;
  label: (t: ColorTokens, intent: Intent, size: Size, opts?: ButtonSkinOpts) => TextStyle;
  /** The label's colour, which the loader takes too. */
  foreground: (t: ColorTokens, intent: Intent, opts?: ButtonSkinOpts) => string;
  /**
   * What a loading button shows in place of its leading icon (button-loader.tsx): the web
   * draws the hand-off's open arc in the label's ink, iOS and Android the platform's own
   * activity indicator. The shell renders it and hides it from assistive tech.
   */
  loader: ButtonLoader;
  /**
   * Whether this intent paints a surface of its own. Under glass a button that does is a
   * CONTROL-layer puck (the material behind its label); one that does not stays bare.
   */
  surface: (intent: Intent, opts: ButtonSkinOpts) => boolean;
  /**
   * The style a hovered button of this intent switches to at once (the `secondary` wash
   * behind the unfilled looks, the brightening of a filled one), or null. Never applied
   * while disabled or loading; omitted by the iOS and Android skins. `puck` says a glass
   * pane sits under the button, so the look is made safe for the material.
   */
  hover?: (theme: HoverTheme, intent: Intent, opts: ButtonSkinOpts | undefined, puck: boolean) => ViewStyle | null;
  /**
   * The label's look while hovered, or null to keep its resting ink: the page header's
   * links brighten their muted label to `foreground` (Component.dc.html `style-hover`).
   * Never applied while disabled or loading; omitted by the iOS and Android skins.
   */
  hoverLabel?: (t: ColorTokens, opts: ButtonSkinOpts | undefined) => TextStyle | null;
  /** The resting glow under a `raised` primary button (the hand-off's raised call to action). */
  raised: (t: ColorTokens, size: Size) => ViewStyle;
  /** iOS dims the fill on press; the web scales (`press`) and Android ripples instead (null). */
  pressedOpacity: number | null;
  /**
   * The web's press: the control scales down and darkens while held. The darkening is a
   * filter, which would cut a glass pane off from the backdrop it samples, so the shell
   * drops it on a glass puck and keeps the scale. Omitted by the iOS and Android skins.
   */
  press?: { scale: number; brightness: number };
  ripple: ((t: ColorTokens, intent: Intent) => { color: string; borderless: boolean }) | null;
  /**
   * The rounded shape the shell's `<RippleClip>` parent clips the bounded ripple to (the
   * same corner radii `container` draws). Only the Android skin sets it: a bounded ripple
   * is Android-only; iOS/web omit it so no clip wrapper is applied. See src/style/ripple-clip.
   */
  rippleClipShape?: (size: Size, opts: ButtonSkinOpts) => ViewStyle;
  /**
   * Platform minimum touch target in pt/dp (iOS HIG 44pt, Android M3 48dp). When set,
   * the shell measures the rendered control and extends the TOUCH area with hitSlop on
   * whichever axis falls short (e.g. the 32pt `small` text button and the sub-minimum
   * icon squares). hitSlop never affects layout, so the visual size is untouched. null
   * (web) skips the measurement entirely: pointer targets stay visual.
   */
  minTarget: number | null;
  /**
   * Hover feedback: the rise a hovered button of this intent takes, or null for none.
   * Never applied while disabled or loading. Omitted by the iOS and Android skins, which
   * keep their platform buttons (and whose platforms deliver no pointer hover by default).
   */
  lift?: (intent: Intent, opts?: ButtonSkinOpts) => HoverMotion | null;
  /** Where the notification `count` sits over the upper trailing corner. */
  count: ViewStyle;
}

// --- the resolvers the axes registry reads (tools/axes/registry.ts) ---------------

export function webEmphasisOf(p: Pick<ButtonSkinOpts, "inlineLink" | "inverse" | "quiet">) {
  if (p?.inlineLink) return "inlineLink";
  if (p?.inverse) return "inverse";
  if (p?.quiet) return "quiet";
  return "default";
}

/** Utility hover wins over inverse emphasis on an icon control. */
export function webHoverKindOf(p: Pick<ButtonSkinOpts, "themeChoice" | "identityAction" | "utility" | "inlineLink" | "inverse">) {
  if (p.themeChoice) return "themeChoice";
  if (p.identityAction) return "inlineLink";
  if (p.utility) return "utility";
  if (p.inlineLink) return "inlineLink";
  if (p.inverse) return "inverse";
  return "default";
}

/** Inline action ink, independent of its unboxed anatomy. */
export function webLinkInkOf(p: Pick<ButtonSkinOpts, "inverse" | "foreground">) {
  if (p.inverse) return "inverse";
  if (p.foreground) return "foreground";
  return "primary";
}

/** Resolve reference anatomy before generic utility-box metrics; the underlined inline link wins over the plain one. */
export function webBodyOf(p: Pick<ButtonSkinOpts, "themeChoice" | "identityAction" | "pageLink" | "jumpLink" | "referenceLink" | "inlineIcon" | "scopeTrigger" | "filterTrigger" | "inlineLink" | "plainLink" | "utility">) {
  if (p.themeChoice) return "themeChoice";
  if (p.identityAction) return "identity";
  if (p.pageLink) return "pageLink";
  if (p.jumpLink) return "jumpLink";
  if (p.referenceLink) return "reference";
  if (p.inlineIcon) return "inlineIcon";
  if (p.scopeTrigger) return "scope";
  if (p.filterTrigger) return "filter";
  if (p.inlineLink) return "link";
  if (p.plainLink) return "plainLink";
  if (p.utility) return "utility";
  return "button";
}

// --- the hand-off's colours per intent, shared by every platform -------------------

/** The hand-off's inverse ink: white over a dark or branded surface. */
const INVERSE_INK = "#ffffff";

/**
 * The look of one intent: its fill, border, label ink and lit top edge. The hand-off's
 * `K.btn` table: `primary` the accent (`action`) with its ink, `destructive` the status
 * red with its own, `secondary` the `secondary` well, `outline` a bare boundary, `ghost`
 * and `link` bare. Both bordered looks rest on `input`, the 3:1 control boundary (the
 * hand-off's `ln2` hairline is about 1.5:1, the deviation audit/v4-redesign/PLAN.md D4
 * records). Emphasis wins over the intent, as Argus spells it (`outline inverse`):
 * `inverse` is a white outline over a branded surface, `quiet` a muted outline, and the
 * inline link takes its link ink.
 */
/** What a hover look needs of the theme: its tokens, and whether glass is in force. */
export type HoverTheme = Parameters<typeof withInnerFill>[0];

export interface Look { fill: string; border: string; label: string; edge: string | null }

export function lookOf(t: ColorTokens, intent: Intent, o?: ButtonSkinOpts): Look {
  const emphasis = webEmphasisOf(o ?? {});
  if (emphasis === "inlineLink") return { fill: "transparent", border: "transparent", label: linkInk(t, o), edge: null };
  if (emphasis === "inverse") return { fill: "transparent", border: alpha(INVERSE_INK, 0.5), label: INVERSE_INK, edge: null };
  if (emphasis === "quiet") return { fill: "transparent", border: t.border, label: t["muted-foreground"], edge: null };
  switch (intent) {
    case "primary": return { fill: actionFill(t), border: "transparent", label: actionInk(t), edge: FILLED_EDGE };
    case "destructive": return { fill: t.destructive, border: "transparent", label: t["destructive-foreground"], edge: FILLED_EDGE };
    case "secondary": return { fill: t.secondary, border: t.input, label: t["secondary-foreground"], edge: t.highlight ?? null };
    case "outline": return { fill: "transparent", border: t.input, label: t.foreground, edge: null };
    case "ghost": return { fill: "transparent", border: "transparent", label: t.foreground, edge: null };
    case "link": return { fill: "transparent", border: "transparent", label: linkInk(t, o), edge: null };
  }
}

/**
 * The label's ink, which the loader takes too (the hand-off's arc is `currentColor`): a
 * special body's own ink, else the intent's.
 */
export function foregroundOf(t: ColorTokens, intent: Intent, o?: ButtonSkinOpts): string {
  const body = o ? bodyLabel(t, intent, "base", o) : null;
  return (body?.color as string | undefined) ?? lookOf(t, intent, o).label;
}

function linkInk(t: ColorTokens, o?: ButtonSkinOpts): string {
  const ink = webLinkInkOf(o ?? {});
  return ink === "inverse" ? INVERSE_INK : ink === "foreground" ? t.foreground : primaryText(t);
}

// The lit top edge the filled intents carry (the hand-off's `inset 0 1px 0`), a white
// highlight at a fixed alpha over any accent.
const FILLED_EDGE = alpha("#ffffff", 0.28);
const edgeShadow = (edge: string | null): ViewStyle => (edge ? { boxShadow: `inset 0px 1px 0px ${edge}` } : {});

const FILLED = new Set<Intent>(["primary", "destructive"]);

/** Whether the button draws the hand-off's standard control (no special body, no emphasis). */
function standard(o?: ButtonSkinOpts): boolean {
  return webBodyOf(o ?? {}) === "button" && webEmphasisOf(o ?? {}) === "default";
}

/** A filled look: the accent or the destructive fill on the standard control. */
function filled(intent: Intent, o?: ButtonSkinOpts): boolean {
  return FILLED.has(intent) && standard(o);
}

const ROW: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "center" };

// --- the hand-off's metrics ---------------------------------------------------------

// A size's height, side padding and label type. The height is the border box, its two 1px
// borders included, with the label centred in it.
interface Metrics { height: number; padX: number; type: TextStyle }

const FS = (fontSize: number, lineHeight: number): TextStyle => ({ fontSize, lineHeight });

// The hand-off's control (`K.btn`): 32 / 40 / 48 tall, 12 / 16 / 22 of side padding,
// 13 / 14 / 16 px labels. Android's row keeps these heights (its `--h-c` is 40).
const CONTROL: Record<Size, Metrics> = {
  small: { height: 32, padX: 12, type: FS(13, 18) },
  base: { height: 40, padX: 16, type: FS(14, 20) },
  large: { height: 48, padX: 22, type: FS(16, 22) },
};

// iOS's row: a 50pt control with a 17pt label (`--h-c: 50px; --fs: 17px`). The small step
// is the hand-off's 32; its large step (48, 16) would sit below the 50pt base, so large
// keeps the HIG's tier above it at the base's type.
const IOS_CONTROL: Record<Size, Metrics> = {
  small: { height: 32, padX: 12, type: FS(13, 18) },
  base: { height: 50, padX: 16, type: FS(17, 22) },
  large: { height: 58, padX: 22, type: FS(17, 22) },
};

const BORDER = 1;

// The utility icon boxes (`compactIcon`, `mediumIcon`, `largeIcon`).
const UTILITY_BOX = { compact: 28, medium: 32, large: 34 } as const;

// The hand-off's raised call to action: the accent's glow under the button.
const RAISED_GLOW = { y: 10, blur: 26, spread: -8 };

/** The glow under a raised call to action, in the accent's own `glow`, over its lit edge. */
function raisedGlow(t: ColorTokens, edge: boolean): ViewStyle {
  const glow = `0px ${RAISED_GLOW.y}px ${RAISED_GLOW.blur}px ${RAISED_GLOW.spread}px ${t.glow ?? t.ring}`;
  return { boxShadow: edge ? `inset 0px 1px 0px ${FILLED_EDGE}, ${glow}` : glow };
}

// Special-body type: every one of them at or above 13, so none takes a reading-floor role.
const BODY_TYPE: TextStyle = { ...FS(13, 18), fontWeight: "500" };
const SCOPE_TYPE: TextStyle = { ...FS(14, 20), fontWeight: "600" };
const TRIGGER_HEIGHT = 32;
const IDENTITY_HEIGHT = 28;
// The component page header's links (Component.dc.html `<header>`): 34 tall, 12 at the
// sides, the hairline `border` around a muted label, a `mono` path at 400 12/16.
const PAGE_LINK = { height: 34, padX: 12 };
const PAGE_LINK_MONO: TextStyle = { ...FS(12, 16), fontWeight: "400", fontFamily: MONO_FONT };
// The page's jumps to its sections (the same header): a 28-tall hairline pill, 11 at the
// sides, a muted 500 12px label.
const JUMP_LINK = { height: 28, padX: 11 };
const JUMP_LINK_TYPE: TextStyle = { ...FS(12, 16), fontWeight: "500" };
// The plain accent link, the hand-off's bare `<button>` (Component.dc.html line 43:
// `background:none;border:0;padding:0`) in the accent text ink: the props table's show-all
// row is `font:500 13px var(--ft);color:var(--ion-tx)` (line 241), the props panel's
// Reset `font:500 12px var(--ft);color:var(--ion-tx)` (line 158), which `small` gives.
// Neither sets a ratio, so each line is the browser's `normal` for Instrument Sans at its
// size, measured in Playwright on the hand-off page served from tools/v4/handoff
// (Chromium, the face loaded): the Reset button's line box is 15 px at 12 px, and the
// show-all row's 16 px at 13 px.
const PLAIN_LINK_TYPE: TextStyle = { ...FS(13, 16), fontWeight: "500" };
const PLAIN_LINK_SMALL_TYPE: TextStyle = { ...FS(12, 15), fontWeight: "500" };
const INLINE_ICON = 22;

/**
 * The hand-off's special bodies (cv-kit-code.js's button overrides), the same on every
 * platform but for the corner a platform gives its controls, or null for the standard
 * control. A theme choice is a 32-tall pill around its colour disc whose selection is the
 * accent edge and a soft accent halo; an identity action a 28-tall hairline pill; a
 * reference link, a plain link and an inline icon are unboxed; a scope or filter trigger
 * is a bare 32-tall row that washes on hover; the utility box is a square of its own size.
 */
function bodyContainer(t: ColorTokens, intent: Intent, o: ButtonSkinOpts, corner: number, pill: number): ViewStyle | null {
  const body = webBodyOf(o);
  const fade = o.disabled ? { opacity: 0.4 } : null;
  if (body === "themeChoice") {
    // The hand-off's theme choice (cv-kit-code.js line 69): `height:32px;padding:0 12px 0 6px;
    // border-radius:999px;...gap:8px` around a 20 px disc (`width:20px;height:20px;
    // border-radius:50%;...box-shadow:inset 0 0 0 1px rgba(127,127,127,.35)`, the caller's
    // `<Swatch tiny ring circle>` through `iconLeft`), so the height is the border box, not
    // padding around the 18 px label line, and the disc centres in it.
    return {
      ...ROW, gap: 8, borderRadius: pill, borderWidth: BORDER,
      height: TRIGGER_HEIGHT, paddingVertical: 0, paddingLeft: 6, paddingRight: 12,
      borderColor: o.selected ? t.primary : t.input,
      backgroundColor: o.selected ? t.secondary : "transparent",
      ...(o.selected ? { boxShadow: `0px 0px 0px 3px ${t["primary-soft"] ?? alpha(t.primary, 0.16)}` } : null),
      ...fade,
    };
  }
  if (body === "identity") {
    return {
      ...ROW, gap: 8, borderRadius: pill, borderWidth: BORDER, borderColor: t.border, backgroundColor: "transparent",
      paddingVertical: (IDENTITY_HEIGHT - 2 * BORDER - (BODY_TYPE.lineHeight as number)) / 2, paddingLeft: 4, paddingRight: 10,
      ...fade,
    };
  }
  if (body === "pageLink") {
    return {
      ...ROW, gap: 8, height: PAGE_LINK.height, paddingVertical: 0, paddingHorizontal: PAGE_LINK.padX,
      borderRadius: corner, borderWidth: BORDER, borderColor: t.border, backgroundColor: "transparent",
      ...fade,
    };
  }
  if (body === "jumpLink") {
    return {
      ...ROW, gap: 8, height: JUMP_LINK.height, paddingVertical: 0, paddingHorizontal: JUMP_LINK.padX,
      borderRadius: pill, borderWidth: BORDER, borderColor: t.border, backgroundColor: "transparent",
      ...fade,
    };
  }
  if (body === "reference") return { ...ROW, gap: 4, padding: 0, borderWidth: 0, backgroundColor: "transparent", ...fade };
  if (body === "inlineIcon") return { ...ROW, ...sq(INLINE_ICON), borderRadius: corner, borderWidth: 0, backgroundColor: "transparent", ...fade };
  if (body === "scope" || body === "filter") {
    const line = (body === "scope" ? SCOPE_TYPE : BODY_TYPE).lineHeight as number;
    return { ...ROW, gap: 6, borderRadius: corner, borderWidth: 0, backgroundColor: "transparent", paddingVertical: (TRIGGER_HEIGHT - line) / 2, paddingLeft: 10, paddingRight: 6, ...fade };
  }
  if (body === "link" || body === "plainLink") return { ...ROW, gap: 8, padding: 0, borderWidth: 0, backgroundColor: "transparent", ...fade };
  if (body === "utility") {
    const box = UTILITY_BOX[o.iconBox!];
    const look = lookOf(t, intent, o);
    return {
      ...ROW, width: box + (o.wideIcon ? 2 : 0), height: box,
      borderRadius: o.circle ? pill : corner,
      borderWidth: BORDER, borderColor: look.border,
      backgroundColor: o.inset ? t.secondary : look.fill,
      ...fade,
    };
  }
  return null;
}

/** The special bodies' label type, or null for the standard control's. */
function bodyLabel(t: ColorTokens, intent: Intent, size: Size, o: ButtonSkinOpts): TextStyle | null {
  const body = webBodyOf(o);
  if (body === "themeChoice" || body === "identity") return { ...BODY_TYPE, color: t.foreground };
  if (body === "pageLink") return { ...(o.mono ? PAGE_LINK_MONO : BODY_TYPE), color: t["muted-foreground"] };
  if (body === "jumpLink") return { ...JUMP_LINK_TYPE, color: t["muted-foreground"] };
  if (body === "reference") return { ...BODY_TYPE, fontFamily: MONO_FONT, color: primaryText(t), textDecorationLine: "underline" };
  if (body === "scope") return { ...SCOPE_TYPE, color: t.foreground };
  if (body === "filter") return { ...BODY_TYPE, color: t["muted-foreground"] };
  if (body === "link") return { ...CONTROL[size].type, fontWeight: o.extraBold ? "800" : "500", color: lookOf(t, intent, o).label, textDecorationLine: "underline" };
  // The plain link: the accent text ink (the hand-off's `--ion-tx`), 13 px, 12 with `small`, no underline.
  if (body === "plainLink") return { ...(size === "small" ? PLAIN_LINK_SMALL_TYPE : PLAIN_LINK_TYPE), color: primaryText(t) };
  return null;
}

/**
 * The standard control on one platform's metrics: its padding around the label (or its
 * square), its corner, the intent's fill, border and lit edge. A link has no box: no
 * border, no vertical padding, 2 at the sides.
 */
function controlContainer(t: ColorTokens, intent: Intent, size: Size, o: ButtonSkinOpts, m: Record<Size, Metrics>, corner: number): ViewStyle {
  const look = lookOf(t, intent, o);
  const metrics = m[size];
  return {
    ...ROW,
    gap: 8,
    borderRadius: corner,
    ...(o.icon
      ? sq(metrics.height)
      : intent === "link" ? { paddingHorizontal: 2, paddingVertical: 0 }
      // The hand-off's fixed height (`K.btn`, `height: 48px`), the border box: an icon taller
      // than the label line (a 24 px arrow beside a 22 px line) centres in it rather than
      // growing the button.
      : { height: metrics.height, paddingVertical: 0, paddingHorizontal: metrics.padX }),
    backgroundColor: look.fill,
    borderWidth: intent === "link" ? 0 : BORDER,
    borderColor: look.border,
    ...edgeShadow(standard(o) ? look.edge : null),
    ...(o.consistent ? { minWidth: 78 } : null),
    // `block` (full width) lives on the shell's <RippleClip> wrapper, the outer node.
  };
}

function webHover(t: ColorTokens, intent: Intent, o?: ButtonSkinOpts): ViewStyle | null {
  const body = webBodyOf(o ?? {});
  // A plain link has no box to wash; its label brightens instead (`hoverLabel`).
  if (body === "themeChoice" || body === "reference" || body === "inlineIcon" || body === "plainLink") return null;
  if (o?.softHover && intent === "link") return { opacity: 0.85 };
  if (body === "button" && webHoverKindOf(o ?? {}) === "inverse") return { backgroundColor: alpha(INVERSE_INK, 0.12) };
  if (filled(intent, o)) return { filter: "brightness(1.07)" };
  return { backgroundColor: intent === "secondary" && standard(o) ? t["surface-raised"] ?? t.secondary : t.secondary };
}

/**
 * A hover look made safe for glass. A filter on the Pressable would cut its glass pane off
 * from the backdrop the pane samples, so a puck brightens nothing; and an opaque wash
 * under glass becomes the inner-fill ink tint, so it never sits as a patch on the
 * material (the inverse outline's white wash is already translucent).
 */
function glassSafeHover(look: ViewStyle | null, theme: HoverTheme, puck: boolean, inverse: boolean): ViewStyle | null {
  if (look == null) return null;
  let style = look;
  if (puck && style.filter != null) {
    const { filter: _filter, ...rest } = style;
    style = rest;
  }
  return inverse ? style : withInnerFill(theme, style);
}

// ---------- Web: the hand-off's control ----------
export const webSkin: ButtonSkin = {
  surround: (o) => o.comfortable ? { paddingHorizontal: 16, paddingVertical: 7 } : {},
  container: (t, intent, size, o) =>
    bodyContainer(t, intent, o, shape.web.control, shape.web.pill) ?? {
      ...controlContainer(t, intent, size, o, CONTROL, shape.web.control),
      ...(o.disabled ? { opacity: 0.4 } : null),
    },
  label: (t, intent, size, o) =>
    bodyLabel(t, intent, size, o ?? { icon: false, block: false, dim: false }) ?? {
      ...CONTROL[size].type,
      fontWeight: "500",
      color: lookOf(t, intent, o).label,
      ...(intent === "link" ? { textDecorationLine: "underline" } : null),
    },
  foreground: (t, intent, o) => foregroundOf(t, intent, o),
  // The hand-off's open arc, turning in the label's ink.
  loader: LoadingArc,
  // The filled intents and the secondary well paint a surface; the outline, ghost and
  // link looks, the emphases and the special bodies are bare.
  surface: (intent, o) => standard(o) && (FILLED.has(intent) || intent === "secondary"),
  // A filled button brightens under the pointer (its rise is `lift`); every other look
  // takes the `secondary` wash, a secondary well its raised step. An inverse outline keeps
  // a translucent white wash (the hand-off's `secondary` wash would sit light under its
  // white label), a `softHover` link dims to 85%, and the theme choice, the reference link,
  // the plain link and the inline icon have no hover look.
  hover: (theme, intent, o, puck) => glassSafeHover(webHover(theme.tokens, intent, o), theme, puck, !!o?.inverse),
  // The page's links and the plain link brighten their label to the foreground ink.
  hoverLabel: (t, o) => {
    const body = webBodyOf(o ?? {});
    return body === "pageLink" || body === "jumpLink" || body === "plainLink" ? { color: t.foreground } : null;
  },
  raised: (t) => raisedGlow(t, true),
  pressedOpacity: null,
  press: { scale: 0.96, brightness: 0.92 },
  ripple: null,
  minTarget: null, // web is pointer-first: no touch-target extension, layout untouched
  // The filled looks rise 1 px under the pointer; every other hover switches at once.
  lift: (intent, o) => (filled(intent, o) ? HOVER.button : null),
  count: { position: "absolute", top: -5, right: -5 },
};

// The surfaces a button paints on iOS and Android: every standard intent but the bare
// ghost and link, the outline included (a plain control puck under glass).
const nativeSurface = (intent: Intent, o: ButtonSkinOpts) => standard(o) && intent !== "ghost" && intent !== "link";

// The iOS and Android text buttons are tint-coloured with no underline, the platforms' own,
// and a plain link is that text button (its tint ink at the platform's weight and size),
// since each platform ships one; the web's 13 and 12 px accent label is the web's alone.
function nativeLabel(t: ColorTokens, intent: Intent, size: Size, o: ButtonSkinOpts | undefined, m: Record<Size, Metrics>, weight: TextStyle["fontWeight"], letterSpacing: number): TextStyle {
  const plain = webBodyOf(o ?? {}) === "plainLink";
  const body = plain ? null : bodyLabel(t, intent, size, o ?? { icon: false, block: false, dim: false });
  if (body) return body;
  return { ...m[size].type, fontWeight: weight, letterSpacing, color: lookOf(t, plain ? "link" : intent, o).label };
}

// ---------- iOS (HIG / iOS 26+ Liquid Glass): capsule, semibold, dim on press ----------
export const iosSkin: ButtonSkin = {
  container: (t, intent, size, o) => ({
    ...(bodyContainer(t, intent, o, shape.ios.control, shape.ios.pill) ?? controlContainer(t, intent, size, o, IOS_CONTROL, shape.ios.control)),
    ...(o.dim ? { opacity: 0.4 } : null), // iOS disabled control alpha (the hand-off's 0.4)
  }),
  // The hand-off's iOS row: 600 weight, -0.2 tracking.
  label: (t, intent, size, o) => nativeLabel(t, intent, size, o, IOS_CONTROL, "600", -0.2),
  foreground: (t, intent, o) => foregroundOf(t, intent, o),
  // The platform's own activity indicator.
  loader: PlatformLoader,
  surface: nativeSurface,
  raised: (t) => raisedGlow(t, true),
  pressedOpacity: 0.8,
  ripple: null,
  minTarget: 44, // HIG minimum tappable area 44x44pt (small = 32pt tall, extended via hitSlop)
  count: { position: "absolute", top: -5, right: -5 },
};

// Android ripple over a fill: a light ripple on dark fills, a dark one on light/
// transparent fills, so the Material press feedback reads on every variant.
function androidRipple(_t: ColorTokens, intent: Intent) {
  return { color: FILLED.has(intent) ? "rgba(255, 255, 255, 0.24)" : "rgba(0, 0, 0, 0.10)", borderless: false };
}

// ---------- Android (Material 3): stadium, medium label, flat, ripple ----------
export const androidSkin: ButtonSkin = {
  container: (t, intent, size, o) => ({
    // The Material ripple is clipped to this pill by the shell's <RippleClip> parent, NOT here:
    // a bounded android_ripple is the pressable's own rectangular-masked background, which a
    // same-node overflow:"hidden" cannot clip (RN only path-clips CHILDREN). See ripple-clip.tsx.
    ...(bodyContainer(t, intent, o, shape.android.control, shape.android.pill) ?? controlContainer(t, intent, size, o, CONTROL, shape.android.control)),
    ...(o.dim ? { opacity: 0.38 } : null), // M3 disabled opacity
  }),
  // The hand-off's Android row: 500 weight, 0.1 tracking.
  label: (t, intent, size, o) => nativeLabel(t, intent, size, o, CONTROL, "500", 0.1),
  foreground: (t, intent, o) => foregroundOf(t, intent, o),
  // The platform's own activity indicator.
  loader: PlatformLoader,
  surface: nativeSurface,
  // The wrapper carries the glow here (its ripple clip would cut one drawn on the button),
  // and the button keeps its own lit edge.
  raised: (t) => raisedGlow(t, false),
  pressedOpacity: null,
  ripple: androidRipple,
  // Clip the bounded ripple to the stadium (icon = circle). Same corner as `container`, so
  // the <RippleClip> parent's rounded outline matches the button's own corners at every size.
  rippleClipShape: () => ({ borderRadius: shape.android.control }),
  minTarget: 48, // M3 minimum touch target 48x48dp (small = 32dp, base = 40dp; extended via hitSlop)
  // Inside the ripple clip, so the badge sits within the corner rather than over it.
  count: { position: "absolute", top: 3, right: 2 },
};

function sq(d: number): ViewStyle {
  return { width: d, height: d };
}
