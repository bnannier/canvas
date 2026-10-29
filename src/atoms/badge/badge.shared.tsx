import { NotificationBadge } from "./badge.notification.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { Linking } from "react-native";
import { type ReactNode } from "react";
import { hueToneColors } from "../../style/hue-tone.js";
import { View, Text, Pressable, alpha, platformMinTarget, useHugStyle, statusColors, inverseDenseTint, MONO_FONT, type ColorTokens, type StatusColorTone, type LayoutStyle, type ViewStyle, type TextStyle, GlassPane, paneStyle } from "../../style/index.js";
import { useHover } from "../../style/hover.js";
import { actionFill, actionInk } from "../../style/action.js";
import { primaryText } from "../../style/primary-text.js";
import { Icon } from "../icon/icon.js";

// Shared Badge shell. The structure (a metadata pill, or a status dot beside its label),
// the boolean-prop axes, and the semantic color logic live here once; a platform file
// supplies only its skin (heights, insets, label sizes, corners, dot sizes) and calls
// createBadge.
//
// Two families of badge, both the Canvas v4 hand-off's.
//
// 1. The metadata badge: a pill for labels like schema, role, or tag. With no tone it is
//    the accent's soft pill (the accent wash under its solved text ink); the tone axis
//    gives `default` the solid call-to-action pill, `secondary` the quiet surface pill,
//    `outline` a hairline pill and `destructive` the soft red pill. A status tone
//    (success / warning / error / info / neutral) paints the tone's wash and ink and leads
//    with a dot; `mono` sets the label in the code face for token / event names.
// 2. The status badge (`status`): no pill, a dot in the tone's color inside a ring of its
//    wash beside a muted label, for live state like active / pending / failed.
//
// The colors come from the theme's roles through statusColors (src/style/status.ts), the
// same place Alert and the other toned surfaces read theirs, so a "warning" badge and a
// "warning" alert in one view are the same state, and every ink is the solved text role
// (success-text, warning-text, destructive-text, primary-text), 4.5:1 on its wash.

export type Tone = "accent" | "default" | "contrast" | "secondary" | "outline" | "dashed" | "destructive";
export type Status = "success" | "warning" | "error" | "info" | "neutral";

/** One size step of the pill: its height, side inset and label metrics. */
export interface BadgeSize {
  height: number;
  paddingHorizontal: number;
  fontSize: number;
  lineHeight: number;
}

export interface BadgeSkin {
  /** The pill per size step (`tiny`, `small`, the default, `large`), the anatomy `marker` disc (the legend `disc` shares it), the `tier` pill, the group `band` pill and the `token` chip. */
  sizes: Record<"tiny" | "small" | "default" | "large" | "marker" | "tier" | "band" | "tick" | "token" | "step", BadgeSize>;
  /**
   * The shadow set under an anatomy `marker`, from the theme's tokens: the hand-off's ring
   * of the stage's fill and its drop shadow (Component.dc.html line 220).
   */
  markerShadow: (tokens: ColorTokens) => string;
  /** The pill corner. */
  radius: number;
  /** The `keyCorners` corner: the key cap's, on any size. */
  keyRadius: number;
  /** The numbered `step` mark's corner. */
  stepRadius: number;
  /** The shadow under a solid `step` mark: the accent's glow, from the theme's tokens. */
  stepGlow: (tokens: ColorTokens) => string;
  /** The reference key's corner. */
  referenceRadius: number;
  /** Space between the dot, the label and a reference's glyph. */
  gap: number;
  referenceGap: number;
  /** Label weight, and the solid pill's and a count's heavier one. */
  weight: TextStyle["fontWeight"];
  strongWeight: TextStyle["fontWeight"];
  /** Uppercase tracking, in ems. */
  uppercaseTracking: number;
  /** The toned pill's leading dot. */
  dotSize: number;
  /** The status family's dot and the ring of wash around it. */
  statusDot: number;
  statusRing: number;
}

export interface BadgeProps {
  children?: ReactNode;
  // Family: metadata badge (default) vs. status badge (with a dot).
  status?: boolean;
  /** Soft intent fill with matching ink (every toned pill is soft; kept for the intent grammar). */
  soft?: boolean;
  solid?: boolean;
  action?: boolean;
  primary?: boolean;
  inverse?: boolean;
  /** Neutral border-colored fill. */
  neutralFill?: boolean;
  /** Foreground ink on the quiet surface. */
  foreground?: boolean;
  /** The small pill: 18 px tall, 11 px label. */
  small?: boolean;
  /**
   * The tiny pill: 18 px tall under a 10 px label on the pill's own 18 px line, at the
   * regular weight even when solid (a navigation row's "New" tag beside its count).
   */
  tiny?: boolean;
  /** A count at the small size with the heavier label. */
  count?: boolean;
  /** Solid count used in navigation. */
  navigationCount?: boolean;
  /** Compact counter carried by a notification control. */
  notification?: boolean;
  /** A linked reference key at the key corner, in the code face. */
  reference?: boolean;
  /**
   * A code token chip: the 22 px pill with its 8 px inset under the small 11 px label in
   * the code face, for a role, a state or an attribute name beside its term.
   */
  token?: boolean;
  /** The large pill: 26 px tall. */
  large?: boolean;
  /**
   * An anatomy figure's numbered marker: a 22 px disc on the accent with its number in
   * the code face, set off from the stage by a ring of the stage's fill and a shadow
   * (Component.dc.html line 220).
   */
  marker?: boolean;
  /**
   * A legend's numbered disc: the marker's 22 px disc with its number in the code face,
   * in the tone axis's fill (the solid accent as `default`, the quiet surface as
   * `secondary`) with no ring and no shadow (Component.dc.html line 222, the anatomy
   * legend's part numbers).
   */
  disc?: boolean;
  /**
   * A tier pill (Atom, Molecule, Organism beside a page title): 24 px tall with a 10 px
   * inset and a 500 11 px label on its own line (Component.dc.html line 139), tracked in
   * caps with `uppercase` and in the code face with `mono`, as the page sets it.
   */
  tier?: boolean;
  /**
   * A group band's pill (the props table's "pick one" beside an axis's title): 20 px tall
   * with a 7 px inset and a 500 11 px label (Component.dc.html line 237), in the code face
   * with `mono` as the page sets it, in the tone axis's fill (the accent's soft pill with
   * none). It sits between `tier` and `small` in precedence.
   */
  band?: boolean;
  /**
   * A ruler tick's pill (the Layout page's "this window" readout under its marker): 20 px
   * tall with an 8 px inset and a 500 10 px label in the code face on the pill's own 20 px
   * line, with no border and no tone dot. Usually with `contrast`. After `band` in
   * precedence.
   */
  tick?: boolean;
  /**
   * A numbered step mark (the Layout page's "try in this order" list): a 32 px square at
   * the step mark's corner with its number 600 13 px in the code face, centred. In the tone
   * axis's fill: `default` the solid accent with its glow, none the accent's soft wash,
   * `secondary` the quiet surface inside the `field-border` edge in the second ink. Pass it
   * as a MediaObject's `icon` with `bareIcon`. After `disc` in precedence.
   */
  step?: boolean;
  /**
   * The key cap's corner in place of the round pill's, on any size: the sizing legend's
   * mode tags and the primitive names under a Grid (Layout.dc.html). The corner axis has
   * this one member; `reference` and `step` keep their own corners.
   */
  keyCorners?: boolean;
  /**
   * Show the intent dot without switching to the status family. With no children it is
   * the bare 8 px dot in the tone's ink, with no pill (a marker beside text that names it).
   */
  dot?: boolean;
  /** Standalone 10px signal marker, retaining its status label. */
  signal?: boolean;
  /** Pin to the start when embedded in an unmeasured host layout. */
  start?: boolean;
  uppercase?: boolean;
  /** A reference can open its source in the system browser. */
  href?: string;
  // Metadata tone (pick one; default is the accent's soft pill).
  default?: boolean;
  secondary?: boolean;
  outline?: boolean;
  /**
   * The placeholder outline: no fill inside a dashed `field-border` edge, the label in the
   * second ink (the Layout page's primitive names). On the tone axis after `outline`.
   */
  dashed?: boolean;
  /**
   * The contrast pill: the scheme's ink (`foreground`) as the fill under the page colour
   * (`background`) as the label, the most prominent neutral (the Layout ruler's "this
   * window" readout). On the tone axis after `default`; under glass the ink at the dense
   * alpha, as the Tooltip bubble's, so its label keeps its contrast.
   */
  contrast?: boolean;
  destructive?: boolean;
  // Metadata modifier: monospace face for tokens, scopes, event names.
  mono?: boolean;
  // Status tone (pick one; on a metadata pill it paints the tone and adds the dot).
  success?: boolean;
  warning?: boolean;
  error?: boolean;
  info?: boolean;
  neutral?: boolean;
  /**
   * The fixed cyan series hue (the hand-off's `--cyan`, `chart-2`) as a soft pill, whatever
   * the palette: its 16% wash under its ink, solved to 4.5:1 on the wash. No dot. On the
   * intent axis, after the status tones.
   */
  cyan?: boolean;
  /** The fixed mint series hue (the hand-off's `--mint`, `chart-3`) as a soft pill, like `cyan`. */
  mint?: boolean;
  /**
   * Accessible name for the badge. Most useful for the status family: the bare-dot status
   * form (`<Badge status error />` with no children) is otherwise color-only and silent to
   * screen readers. When omitted on a childless status badge, the status tone word (e.g.
   * "error") is announced as a fallback. Mirrors the Spinner/Progress `accessibilityLabel`
   * contract.
   */
  accessibilityLabel?: string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// Tone precedence when more than one is passed: first match wins.
export function toneOf(p: BadgeProps): Tone {
  if (p.default) return "default";
  if (p.contrast) return "contrast";
  if (p.destructive) return "destructive";
  if (p.secondary) return "secondary";
  if (p.outline) return "outline";
  if (p.dashed) return "dashed";
  return "accent";
}

export function statusOf(p: BadgeProps): Status {
  if (p.success) return "success";
  if (p.error) return "error";
  if (p.warning) return "warning";
  if (p.info) return "info";
  if (p.neutral) return "neutral";
  return "neutral";
}

/** Dense metadata axes, with explicit precedence shared by appearance and docs. */
export function badgeIntentOf(p: BadgeProps) {
  if (p.action) return "action";
  if (p.primary || p.reference) return "primary";
  if (p.success) return "success";
  if (p.warning) return "warning";
  if (p.error) return "error";
  if (p.info) return "info";
  if (p.cyan) return "cyan";
  if (p.mint) return "mint";
  return "muted";
}
export function badgeMetricOf(p: BadgeProps) {
  if (p.notification) return "notification";
  if (p.marker) return "marker";
  if (p.disc) return "disc";
  if (p.step) return "step";
  if (p.reference) return "reference";
  if (p.navigationCount) return "navigationCount";
  if (p.count) return "count";
  if (p.tier) return "tier";
  if (p.band) return "band";
  if (p.tick) return "tick";
  if (p.token) return "token";
  if (p.tiny) return "tiny";
  if (p.small) return "small";
  return "default";
}
export function badgeSurfaceOf(p: BadgeProps) {
  if (p.inverse) return "inverse";
  if (p.notification || p.marker || p.navigationCount || p.solid) return "solid";
  if (p.neutralFill) return "neutral";
  if (p.soft || p.reference) return "soft";
  return "surface";
}
export function badgeInkOf(p: BadgeProps) {
  if (p.inverse) return "inverse";
  if (p.notification || p.marker || p.navigationCount || p.solid) return "solid";
  if (p.foreground) return "foreground";
  return "intent";
}
export function badgeTrackingOf(p: BadgeProps) {
  if (p.reference) return "reference";
  // A tier tag is always in caps, at the uppercase tracking.
  if (p.uppercase || p.tier) return "uppercase";
  return "normal";
}

/** The corner axis: the key cap's corner, or the pill's (the default). */
export function badgeCornerOf(p: BadgeProps): "keyCorners" | "pill" {
  if (p.keyCorners) return "keyCorners";
  return "pill";
}

/** What a metadata pill paints: its fill, border and ink, and how glass carries the fill. */
interface BadgeLook {
  fill: string;
  border: string;
  /** A dashed edge (the placeholder outline) in place of the solid one. */
  dashed?: boolean;
  ink: string;
  strong: boolean;
  /** Under glass: a call-to-action fill is brand-tinted glass. */
  brand?: string;
  /** Under glass: a translucent wash tints the control material in place of the layer's. */
  tint?: string;
}

const CLEAR = "transparent";

// The tone a metadata pill paints, in the hand-off's order: a solid kind first, then the
// reference key, then the tone axis (which wins over a status tone, as the hand-off's
// secondary / outline / destructive override its tone colors), then the intent.
function lookOf(p: BadgeProps, theme: { tokens: ColorTokens; dark: boolean; glass: Parameters<typeof inverseDenseTint>[0]["glass"] }): BadgeLook {
  const { tokens, dark } = theme;
  const surface = badgeSurfaceOf(p);
  const tone = toneOf(p);
  const metric = badgeMetricOf(p);
  const reference = metric === "reference";
  // `neutral` is the status axis's fallback too, so the quiet wash takes the prop itself.
  const neutral = p.neutral === true;
  const accent = (fill: string): BadgeLook => ({ fill, border: CLEAR, ink: primaryText(tokens), strong: false, tint: fill });
  const wash = (s: StatusColorTone): BadgeLook => {
    const c = statusColors(tokens, s);
    // The neutral wash is the opaque `muted` role: under glass the plain control material carries it.
    return { fill: c.wash, border: CLEAR, ink: c.ink, strong: false, tint: s === "neutral" ? undefined : c.wash };
  };
  if (surface === "inverse") return { fill: "rgba(255,255,255,0.18)", border: CLEAR, ink: "#ffffff", strong: false, tint: "rgba(255,255,255,0.18)" };
  if (surface === "solid" || tone === "default") return { fill: actionFill(tokens), border: CLEAR, ink: actionInk(tokens), strong: true, brand: actionFill(tokens) };
  if (tone === "contrast") return { fill: tokens.foreground, border: CLEAR, ink: tokens.background, strong: false, tint: inverseDenseTint(theme) };
  if (reference) return { fill: tokens.muted, border: fieldBorder(tokens), ink: primaryText(tokens), strong: false };
  // The quiet step mark (Layout.dc.html: `background:var(--sf3);border:1px solid var(--ln2);
  // color:var(--tx2)`): the quiet surface inside the field-border edge.
  if (metric === "step" && tone === "secondary") return { fill: tokens.secondary, border: fieldBorder(tokens), ink: tokens["muted-foreground"], strong: false };
  if (tone === "dashed") return { fill: CLEAR, border: fieldBorder(tokens), ink: tokens["muted-foreground"], strong: false, dashed: true };
  if (tone === "outline") return { fill: CLEAR, border: fieldBorder(tokens), ink: tokens["muted-foreground"], strong: false };
  if (tone === "destructive") return wash("error");
  if (tone === "secondary") return { fill: tokens.muted, border: CLEAR, ink: tokens["muted-foreground"], strong: false };
  if (surface === "neutral") return { fill: tokens.border, border: CLEAR, ink: tokens["muted-foreground"], strong: false, tint: tokens.border };
  const intent = badgeIntentOf(p);
  if (intent === "action") return accent(tokens["action-soft"] ?? alpha(actionFill(tokens), 0.12));
  if (intent === "success" || intent === "warning" || intent === "error" || intent === "info") return wash(intent);
  if (intent === "cyan" || intent === "mint") {
    const hue = hueToneColors(tokens, dark, intent);
    return { fill: hue.wash, border: CLEAR, ink: hue.ink, strong: false, tint: hue.wash };
  }
  if (intent === "primary") return accent(tokens["primary-soft"] ?? alpha(tokens.primary, 0.12));
  if (neutral) return wash("neutral");
  return accent(tokens["primary-soft"] ?? alpha(tokens.primary, 0.12));
}

// The hand-off's ln2 hairline, the outline pill's and the reference key's border.
/** The bare dot's edge (`<Badge dot />` with no label). */
const BARE_DOT = 8;

const fieldBorder = (tokens: ColorTokens) => tokens["field-border"] ?? tokens.input;

export function createBadge(skin: BadgeSkin) {
  return function Badge(props: BadgeProps) {
    const { children, mono, style, accessibilityLabel, testID } = props;
    const theme = useMaterialTheme({ static: true, layer: "control" });
    const { tokens } = theme;
    // HUG: content width inside a stretching Column, content-sized in a Row.
    const hug = useHugStyle();
    const { hovered, target } = useHover(!!props.href);

    if (props.signal) return <View testID={testID} accessibilityRole="image" accessibilityLabel={accessibilityLabel ?? statusOf(props)} aria-label={accessibilityLabel ?? statusOf(props)} style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: statusColors(tokens, statusOf(props)).dot }} />;

    const metric = badgeMetricOf(props);
    // The legend disc is the marker's size; the tier and band pills their own steps.
    const size = skin.sizes[metric === "marker" || metric === "disc" ? "marker" : metric === "tier" || metric === "band" || metric === "tick" || metric === "token" || metric === "tiny" || metric === "step" ? metric : metric === "small" || metric === "count" || metric === "navigationCount" ? "small" : props.large ? "large" : "default"];

    if (props.status) {
      const tone = statusOf(props);
      const colors = statusColors(tokens, tone);
      // The bare-dot status form (no children) is color-only; give it an accessible name so a
      // screen reader does not announce a silent, meaningless dot. Prefer the caller's label,
      // else fall back to the status tone word ("error", "success", ...).
      const statusName = accessibilityLabel ?? (children == null ? tone : undefined);
      // A name has to sit on a node that can carry one. A bare View is a generic
      // element, and ARIA prohibits naming those, so the label was being discarded by
      // validators and by some screen readers rather than announced.
      //
      // Which role depends on what the badge contains, and getting that wrong trades
      // one defect for a worse one. A dot ALONE standing in for a word is image-like,
      // and img is what Swatch uses for the same reason. A badge that also renders
      // text must NOT take img, because img is a leaf role: it would replace the
      // visible text in the accessibility tree with the label. There it is a group,
      // which accepts a name and keeps its children readable. With no name at all,
      // no role: a decorative dot beside its own text label stays silent, correctly.
      const role = statusName == null ? null : children == null ? "img" : "group";
      // The ring is the wash around the dot, outside the dot's own box as the hand-off's
      // spread shadow is: the ringed disc gives the ring back in negative side margins, so
      // the label sits the skin's gap from the dot itself.
      const ringed = skin.statusDot + skin.statusRing * 2;
      return (
        <View
          style={[{ flexDirection: "row", alignItems: "center", gap: skin.gap }, hug, style]}
          testID={testID}
          {...(role === "img"
            ? { accessibilityRole: "image" as const, role: "img" as const }
            : role === "group"
              ? { role: "group" as const }
              : null)}
          accessibilityLabel={statusName}
          aria-label={statusName}
        >
          <View style={{ width: ringed, height: ringed, marginHorizontal: -skin.statusRing, borderRadius: 9999, backgroundColor: colors.wash, alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: skin.statusDot, height: skin.statusDot, borderRadius: 9999, backgroundColor: colors.dot }} />
          </View>
          {children != null ? (
            <Text style={{ fontSize: size.fontSize, lineHeight: size.lineHeight, fontWeight: skin.weight, color: tokens["muted-foreground"] }}>{children}</Text>
          ) : null}
        </View>
      );
    }

    if (props.notification) return <NotificationBadge solid={!!props.solid} halo={!!props.action} style={style} testID={testID}>{children}</NotificationBadge>;

    const look = lookOf(props, theme);
    // The bare dot (`dot` with no label): the pill's dot alone, at the hand-off's 8 px
    // (Foundations' glass pane, `width:8px;height:8px;border-radius:50%;background:var(--ion)`).
    // Named, it is an image; unnamed, decoration beside the text that names it.
    if (props.dot && children == null) {
      const ink = badgeInkOf(props) === "foreground" ? tokens.foreground : look.ink;
      const named = accessibilityLabel != null;
      return (
        <View
          testID={testID}
          {...(named
            ? { accessibilityRole: "image" as const, role: "img" as const, accessibilityLabel, "aria-label": accessibilityLabel }
            : { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const, "aria-hidden": true })}
          style={[{ width: BARE_DOT, height: BARE_DOT, borderRadius: 9999, backgroundColor: ink }, hug, style]}
        />
      );
    }
    const inkKind = badgeInkOf(props);
    const ink = inkKind === "foreground" ? tokens.foreground : look.ink;
    const reference = metric === "reference";
    const marker = metric === "marker";
    // The legend disc: the marker's disc and number, in the tone's fill, with no ring or shadow.
    const disc = marker || metric === "disc";
    const step = metric === "step";
    // The band pill (Component.dc.html line 237) and the tick pill lead with no tone dot.
    const toned = metric !== "band" && metric !== "tick" && !!(props.success || props.warning || props.error || props.info || props.neutral);
    const base: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      gap: reference ? skin.referenceGap : skin.gap,
      height: size.height,
      paddingHorizontal: size.paddingHorizontal,
      // The tier pill (line 139), the band pill (line 237) and the tick pill draw no border,
      // so their boxes are the fill alone; every other pill keeps the hand-off's 1 px
      // border, transparent until a tone draws it.
      borderWidth: metric === "tier" || metric === "band" || metric === "tick" ? 0 : 1,
      borderRadius: reference ? skin.referenceRadius : step ? skin.stepRadius : badgeCornerOf(props) === "keyCorners" ? skin.keyRadius : skin.radius,
      // The marker, the legend disc and the step mark are as wide as they are tall, the
      // number centred (the hand-off's `width:22px;height:22px;...;display:grid;
      // place-items:center`, lines 220 and 222; the Layout page's 32 px step).
      ...(disc || step ? { width: size.height, justifyContent: "center" as const } : null),
    };
    const fill: ViewStyle = { backgroundColor: look.fill, borderColor: look.border, ...(look.dashed ? { borderStyle: "dashed" as const } : null) };
    const label: TextStyle = {
      fontSize: size.fontSize,
      lineHeight: size.lineHeight,
      // A disc's number is always the heavier weight (line 222: `font:600 11px/1 var(--fm)`
      // on the quiet disc as on the accent one).
      // The tiny pill keeps the regular weight on every surface (the hand-off's `font:500 10px/18px`).
      fontWeight: metric !== "tiny" && metric !== "tick" && (look.strong || metric === "count" || disc || step) ? skin.strongWeight : skin.weight,
      letterSpacing: props.uppercase ? size.fontSize * skin.uppercaseTracking : 0,
      textTransform: props.uppercase ? "uppercase" : "none",
      color: ink,
      ...(reference ? { textDecorationLine: "underline" as const } : null),
    };
    // An outline badge is deliberately unfilled metadata, so it inherits its host.
    const surfaced = look.fill !== CLEAR;
    // The mono modifier (a reference key, a disc, a token chip and a tier tag too) asks for a monospace face; RN
    // has no font-family utility, so request the cross-platform monospace alias via inline
    // style.
    const monoStyle = mono || reference || disc || step || metric === "token" || metric === "tier" || metric === "tick" ? { fontFamily: MONO_FONT } : null;
    // The marker's ring and shadow, the skin's, from the theme's tokens; the solid step
    // mark's glow.
    const markerShadow = marker ? { boxShadow: skin.markerShadow(tokens) } : step && look.strong ? { boxShadow: skin.stepGlow(tokens) } : null;

    const content = <>
      {surfaced ? <GlassPane static layer="control" shape={base} brand={look.brand} tint={look.tint} /> : null}
      {props.dot || toned ? <View style={{ width: skin.dotSize, height: skin.dotSize, borderRadius: 9999, backgroundColor: ink }} /> : null}
      {children != null ? <Text style={[label, monoStyle]}>{children}</Text> : null}
      {reference && props.href ? <Icon decorative arrowUpRight size={11} primary /> : null}
    </>;
    // Under glass a reference key's resting hairline drops: the material's rim is its edge.
    const rootStyle = [surfaced || theme.increasedContrast ? paneStyle(theme, [base, fill]) : [base, fill], markerShadow, hug, props.start ? { alignSelf: "flex-start" as const } : null, style];
    const minTarget = platformMinTarget();
    const linkSlop = minTarget == null ? undefined : Math.max(0, (minTarget - size.height) / 2);
    if (props.href) return <Pressable hitSlop={linkSlop} accessibilityRole="link" accessibilityLabel={accessibilityLabel ?? `Open ${children}`} onPress={() => Linking.openURL(props.href!)} style={[rootStyle, hovered ? { opacity: 0.85 } : null]} {...target} testID={testID}>{content}</Pressable>;
    return (
      <View style={rootStyle} testID={testID}>
        {content}
      </View>
    );
  };
}

// BadgeGroup: the wrapping row that lays out a series of badges, so no call site
// hand-writes `<Row wrap alignCenter snug>` (or a raw flex View) to sit badges
// beside a name or each other. It owns the flex direction, the wrap, the
// cross-axis centering, and the inter-badge gap; the caller passes only Badges.
// The sibling of AvatarGroup (avatar.shared), scoped to badges.
//
// Layout-only, so it carries no per-OS skin and no colors: the badges it holds
// own their own platform treatment. Gap draws from the kit's spacing scale
// (a subset of Row's), defaulting to `snug`.

export type BadgeGap = "tight" | "snug" | "cozy";

// Inter-badge gap per axis value, from the shared spacing scale (matches Row's
// tight/snug/cozy). Owned here once instead of a magic `gap` at every call site.
const BADGE_GAP: Record<BadgeGap, number> = { tight: 4, snug: 8, cozy: 12 };

export interface BadgeGroupProps {
  /** The Badge elements to lay out in a wrapping row. */
  children?: ReactNode;
  // Inter-badge gap (pick one; default `snug`). Precedence: cozy > snug > tight.
  tight?: boolean;
  snug?: boolean;
  cozy?: boolean;
  /** Accessible name for the whole group (e.g. "Rachel Chen's roles"). */
  accessibilityLabel?: string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// Gap precedence when more than one is passed: first match wins, largest-first
// (mirrors Row's gapOf ordering). Default `snug` when none is set.
export function badgeGapOf(p: BadgeGroupProps): BadgeGap {
  if (p.cozy) return "cozy";
  if (p.snug) return "snug";
  if (p.tight) return "tight";
  return "snug";
}

/** A wrapping row of badges. */
export function BadgeGroup(props: BadgeGroupProps) {
  const { children, accessibilityLabel, testID, style } = props;
  // A name needs a role that can carry it (Badge's own rule above): a bare View is a
  // generic element, so a labelled group is a `group`, which accepts the name and keeps
  // its badges' text readable. Unlabelled, it stays a plain layout row with no role.
  const named = accessibilityLabel != null && accessibilityLabel !== "";
  return (
    <View
      style={[{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: BADGE_GAP[badgeGapOf(props)] }, style]}
      testID={testID}
      role={named ? "group" : undefined}
      accessibilityLabel={named ? accessibilityLabel : undefined}
      aria-label={named ? accessibilityLabel : undefined}
    >
      {children}
    </View>
  );
}
