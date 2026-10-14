import { platformShape } from "../../style/platform-shape.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { Linking } from "react-native";
import { type ReactNode } from "react";
import { View, Text, Pressable, alpha, shape, platformMinTarget, useHugStyle, statusColors, MONO_FONT, type ColorTokens, type LayoutStyle, type StyleProp, type ViewStyle, type TextStyle, GlassPane, paneStyle } from "../../style/index.js";
import { useHover } from "../../style/hover.js";
import { actionFill, actionInk } from "../../style/action.js";

// Shared Badge shell. The structure (a metadata pill, or a status pill with a leading
// dot), the boolean-prop axes, and the semantic color logic live here once; a platform
// file supplies only its skin (shape, padding, label type, dot size) and calls createBadge.
//
// Two families of badge, both Dark Factory's Pill.
//
// 1. The metadata badge: a pill for static labels like schema, role, or tag. Configured
//    by a tone axis (default / secondary / outline / destructive) plus a `mono` modifier
//    for token / event names. `secondary` (the default) is Dark Factory's surface pill,
//    `default` its solid pill in the call-to-action color, `destructive` its soft red
//    pill, and `outline` a hairline pill.
// 2. The status badge (`status`): Dark Factory's live-state pill, a quiet surface pill
//    whose leading dot carries the tone, for state like active / pending / failed.
//    Configured by a status-tone axis (success / warning / error / info / neutral).
//
// The colors come from the theme's roles through statusColors (src/style/status.ts), the
// same place Alert and the other toned surfaces read theirs, so a "warning" badge and a
// "warning" alert in one view are the same state.

const NOTIFICATION_TYPE: TextStyle = { fontSize: 9.5 };

export type Tone = "default" | "secondary" | "outline" | "destructive";
export type Status = "success" | "warning" | "error" | "info" | "neutral";

export interface BadgeSkin {
  /** Metadata pill shape + padding (the tone fill/label color is supplied by shared). */
  metaBase: ViewStyle;
  /** Status pill shape + padding + gap. */
  statusBase: ViewStyle;
  /** Label type (size / line-height / weight / tracking) for both families. */
  labelType: TextStyle;
  /** Status dot diameter. */
  dotSize: number;
}

export interface BadgeProps {
  children?: ReactNode;
  // Family: metadata badge (default) vs. status badge (with a dot).
  status?: boolean;
  /** Soft intent fill with matching ink. */
  soft?: boolean;
  solid?: boolean;
  action?: boolean;
  primary?: boolean;
  inverse?: boolean;
  /** Neutral border-colored fill. */
  neutralFill?: boolean;
  /** Foreground ink on the quiet surface. */
  foreground?: boolean;
  /** Dense 10px status label. */
  small?: boolean;
  /** Compact, extra-bold 10px count. */
  count?: boolean;
  /** Solid count used in navigation. */
  navigationCount?: boolean;
  /** Compact counter carried by a notification control. */
  notification?: boolean;
  /** Squared, tracked reference key; `large` uses the 11px card form. */
  reference?: boolean;
  large?: boolean;
  /** Show the intent dot without switching to the legacy status family. */
  dot?: boolean;
  /** Pin to the start when embedded in an unmeasured host layout. */
  start?: boolean;
  uppercase?: boolean;
  /** A reference can open its source in the system browser. */
  href?: string;
  // Metadata tone (pick one; default is the `secondary` surface pill).
  default?: boolean;
  secondary?: boolean;
  outline?: boolean;
  destructive?: boolean;
  // Metadata modifier: monospace face for tokens, scopes, event names.
  mono?: boolean;
  // Status tone (pick one; only applies when `status`).
  success?: boolean;
  warning?: boolean;
  error?: boolean;
  info?: boolean;
  neutral?: boolean;
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
  if (p.destructive) return "destructive";
  if (p.secondary) return "secondary";
  if (p.outline) return "outline";
  return "secondary";
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
  return "muted";
}
export function badgeMetricOf(p: BadgeProps) {
  if (p.notification) return "notification";
  if (p.reference) return "reference";
  if (p.navigationCount) return "navigationCount";
  if (p.count) return "count";
  if (p.small) return "small";
  return "default";
}
export function badgeSurfaceOf(p: BadgeProps) {
  if (p.inverse) return "inverse";
  if (p.notification || p.navigationCount || p.solid) return "solid";
  if (p.neutralFill) return "neutral";
  if (p.soft || p.reference) return "soft";
  return "surface";
}
export function badgeInkOf(p: BadgeProps) {
  if (p.inverse) return "inverse";
  if (p.notification || p.navigationCount || p.solid) return "solid";
  if (p.foreground) return "foreground";
  return "intent";
}
export function badgeTrackingOf(p: BadgeProps) {
  if (p.reference) return "reference";
  if (p.uppercase) return "uppercase";
  return "normal";
}

// Semantic colors (platform-neutral), all from the theme's roles.
function metaContainer(tokens: ColorTokens, tone: Tone): ViewStyle {
  switch (tone) {
    case "default": return { borderColor: "transparent", backgroundColor: actionFill(tokens) };
    case "secondary": return { borderColor: "transparent", backgroundColor: tokens.muted };
    case "outline": return { borderColor: tokens.border, backgroundColor: "transparent" };
    case "destructive": return { borderColor: "transparent", backgroundColor: statusColors(tokens, "error").wash };
  }
}

function metaLabel(tokens: ColorTokens, tone: Tone): TextStyle {
  switch (tone) {
    case "default": return { color: actionInk(tokens) };
    case "secondary": return { color: tokens["muted-foreground"] };
    case "outline": return { color: tokens.foreground };
    case "destructive": return { color: statusColors(tokens, "error").ink };
  }
}

// The status pill is the quiet surface pill in every tone: the dot says the state, and the
// label keeps the foreground so it reads the same whatever the tone.
const statusContainer = (tokens: ColorTokens): ViewStyle => ({ borderColor: "transparent", backgroundColor: tokens.muted });
const statusLabel = (tokens: ColorTokens): TextStyle => ({ color: tokens.foreground });

// Under glass a badge is a static pane at control density: a GlassPane paints the material
// behind the label and the box drops its fill and hairline (the pane's material and rim
// carry them). The solid pill is call-to-action-tinted glass with its ink on top, the soft
// destructive pill washes the material with its own wash under the same ink, and the rest
// take the plain control material.

function metaBrand(tokens: ColorTokens, tone: Tone): string | undefined {
  return tone === "default" ? actionFill(tokens) : undefined;
}

function metaTint(tokens: ColorTokens, tone: Tone): string | undefined {
  return tone === "destructive" ? statusColors(tokens, "error").wash : undefined;
}

export function createBadge(skin: BadgeSkin) {
  return function Badge(props: BadgeProps) {
    const { children, mono, style, accessibilityLabel, testID } = props;
    const theme = useMaterialTheme({ static: true, layer: "control" });
    const { tokens } = theme;
    // HUG: content width inside a stretching Column, content-sized in a Row.
    const hug = useHugStyle();
    const { hovered, target } = useHover(!!props.href);

    if (props.status) {
      const tone = statusOf(props);
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
      return (
        <View
          style={[paneStyle(theme, [skin.statusBase, statusContainer(tokens)]), hug, style]}
          testID={testID}
          {...(role === "img"
            ? { accessibilityRole: "image" as const, role: "img" as const }
            : role === "group"
              ? { role: "group" as const }
              : null)}
          accessibilityLabel={statusName}
          aria-label={statusName}
        >
          <GlassPane static layer="control" shape={skin.statusBase} />
          <View style={{ height: skin.dotSize, width: skin.dotSize, borderRadius: 9999, backgroundColor: statusColors(tokens, tone).dot }} />
          {children != null ? (
            <Text style={[skin.labelType, statusLabel(tokens)]}>{children}</Text>
          ) : null}
        </View>
      );
    }

    const tone = toneOf(props);
    const extended = props.success || props.warning || props.error || props.info || props.solid || props.soft || props.action || props.primary || props.inverse || props.neutralFill || props.foreground || props.small || props.count || props.navigationCount || props.notification || props.reference || props.large || props.dot || props.uppercase;
    const intent = badgeIntentOf(props);
    const metric = badgeMetricOf(props);
    const surfaceKind = badgeSurfaceOf(props);
    const inkKind = badgeInkOf(props);
    const tracking = badgeTrackingOf(props);
    const notification = metric === "notification";
    const reference = metric === "reference";
    const navigation = metric === "navigationCount";
    const count = metric === "count";
    const small = metric === "small";
    const labelMetrics: TextStyle = notification ? NOTIFICATION_TYPE : { fontSize: reference ? props.large ? 11 : 10 : small || count || navigation ? 10 : 11 };
    const fontSize = Number(labelMetrics.fontSize);
    const intentInk = intent === "action" ? actionFill(tokens) : intent === "primary" ? tokens["primary-text"] ?? tokens.primary : intent === "success" ? tokens.success : intent === "warning" ? tokens.warning : intent === "error" ? tokens["destructive-text"] ?? tokens.destructive : intent === "info" ? tokens.info ?? tokens.primary : tokens["muted-foreground"];
    const intentWash = intent === "action" ? tokens["action-soft"] ?? alpha(actionFill(tokens), 0.12) : intent === "primary" ? tokens["primary-soft"] ?? alpha(tokens.primary, 0.12) : intent === "success" ? tokens["success-soft"] ?? alpha(tokens.success, 0.12) : intent === "warning" ? tokens["warning-soft"] ?? alpha(tokens.warning, 0.12) : intent === "error" ? tokens["destructive-soft"] ?? alpha(tokens.destructive, 0.12) : intent === "info" ? tokens["info-soft"] ?? alpha(intentInk, 0.12) : tokens.muted;
    const base: ViewStyle = extended ? {
      flexDirection: "row", alignItems: "center", gap: 6,
      borderRadius: reference ? platformShape.web.key : shape.web.pill,
      paddingVertical: reference || navigation ? 2 : count ? 1 : 3,
      paddingHorizontal: reference ? props.large ? 8 : 7 : navigation || count ? 7 : small ? 8 : 9,
    } : skin.metaBase;
    if (notification) Object.assign(base, { minWidth: 16, height: 16, paddingVertical: 0, paddingHorizontal: 4, justifyContent: "center" });
    const fill: ViewStyle = extended ? { backgroundColor: surfaceKind === "inverse" ? "rgba(255,255,255,0.18)" : surfaceKind === "solid" ? actionFill(tokens) : surfaceKind === "neutral" ? tokens.border : surfaceKind === "soft" ? intentWash : tokens.muted } : metaContainer(tokens, tone);
    const label: TextStyle = extended ? {
      ...labelMetrics, lineHeight: notification ? 9.5 : fontSize === 10 ? 13 : 14.3,
      fontWeight: notification || count || navigation || reference ? "800" : "700",
      letterSpacing: tracking === "reference" ? fontSize * 0.04 : tracking === "uppercase" ? fontSize * 0.06 : 0,
      textTransform: props.uppercase ? "uppercase" : "none",
      color: inkKind === "inverse" ? "#ffffff" : inkKind === "solid" ? actionInk(tokens) : inkKind === "foreground" ? tokens.foreground : intentInk,
    } : { ...skin.labelType, ...metaLabel(tokens, tone) };
    // An outline badge is deliberately unfilled metadata, so it inherits its host.
    const surfaced = tone !== "outline";
    // The mono modifier asks for a monospace face; RN has no font-family utility, so request
    // the cross-platform monospace alias via inline style.
    const monoStyle = mono ? { fontFamily: MONO_FONT } : null;

    const content = <>
      {surfaced ? <GlassPane static layer="control" shape={base} brand={metaBrand(tokens, tone)} tint={extended ? fill.backgroundColor as string : metaTint(tokens, tone)} /> : null}
      {props.dot ? <View style={{ width: skin.dotSize, height: skin.dotSize, borderRadius: 9999, backgroundColor: intentInk }} /> : null}
      {children != null ? <Text style={[label, monoStyle]}>{children}</Text> : null}
    </>;
    const rootStyle = [surfaced || theme.increasedContrast ? paneStyle(theme, [base, fill]) : [base, fill], hug, props.start ? { alignSelf: "flex-start" as const } : null, style];
    const minTarget = platformMinTarget();
    const labelHeight = Number(label.lineHeight ?? 15);
    const verticalInset = Number(base.paddingVertical ?? 0);
    const linkSlop = minTarget == null ? undefined : Math.max(0, (minTarget - labelHeight - verticalInset * 2) / 2);
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
