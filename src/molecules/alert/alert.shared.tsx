import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { MaterialBehind } from "../../style/glass-surface/material-behind.js";
import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { actionFill, actionInk } from "../../style/action.js";
import { mixOklab } from "../../style/color.js";
import { Icon } from "../../atoms/icon/icon.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { AnatomyPart, AnatomyScope, useAnatomyPart } from "../../style/anatomy.js";
import {
  View,
  Pressable,
  Text,
  useControllableState,
  useFillStyle,
  controlRipple,
  pressDim,
  statusColors,
  type ColorTokens,
  type LayoutStyle,
  type ViewStyle,
  type TextStyle,
  GlassPane,
  paneStyle,
  paneRipple,
  isGlass,
  alpha,
} from "../../style/index.js";

// Shared Alert shell. The structure (a leading icon glyph, a bold title, a
// description, an optional trailing dismiss control), the boolean-prop tone axis,
// and the semantic color logic live here once; a platform file supplies only its
// skin (shape radius, density/spacing, type tracking, dismiss press feedback) and
// calls createAlert.
//
// A banner that surfaces an inline notification, the Canvas v4 hand-off's callout
// (`K.def('alert')`): configured by a tone axis (info / success / warning / error, plus a
// neutral default), it draws the tone's soft wash as the fill under a 1 px edge of the
// tone's color at 30%, the tone's glyph in that color (an info circle, a check, an alert
// circle, a cross; the neutral banner an info circle in the muted ink), a foreground
// title and a muted body. The tone's colors come from statusColors
// (src/style/status.ts), the place Badge and the other toned surfaces read theirs; the
// neutral banner is the quiet `muted` surface.
//
// Neither iOS nor Material 3 ships an inline alert banner (iOS alerts are modal, see
// alert-dialog; M3 dropped the M2 banner), so there is no native shape to match and the
// native skins are the web skin; the dismiss control still meets each platform's
// minimum touch target and keeps the Android ripple.

export type Tone = "info" | "success" | "warning" | "error" | "neutral";

/** The component an Alert draws with that looks different per platform: the link Button
 *  its `action` takes outside the announcement bar. */
export interface AlertParts {
  Button?: typeof WebButton;
}

export interface AlertSkin {
  /** Banner shape + density (border-radius, padding, gap). */
  container: ViewStyle;
  /** The leading glyph's size (an `<Icon />` element and the default tone glyph). */
  iconSize: number;
  /** The leading glyph's box (its offset on the title's first line). */
  iconSlot: ViewStyle;
  /** A text-character glyph's type (size / line-height). */
  iconType: TextStyle;
  /** Title type (size / line-height / weight / tracking). */
  titleType: TextStyle;
  /** Description / body type (size / line-height / tracking). */
  bodyType: TextStyle;
  /** The gap between the title, the description, the children and the actions. */
  contentGap: number;
  /** Dismiss control shape (size, radius). */
  dismissButton: ViewStyle;
  /** The dismiss glyph's size. */
  dismissIconSize: number;
  /** Pressed opacity for the dismiss control (iOS/web dim; Android stays opaque under ripple). */
  dismissPressedOpacity: number;
  /**
   * Hit-area inset per side (pt/dp) padding the 24px dismiss box out to the platform
   * minimum touch target (HIG 44x44pt on iOS, M3 48x48dp on Android) without changing
   * the rendered size. null (web) keeps pointer targets visual.
   */
  dismissHitSlop: number | null;
  /** Footer action region: the row layout + gap between action buttons, plus the
   *  top separation dividing them from the body above. */
  actions: ViewStyle;
  /** The `announcement` bar: its one-line row (shape, padding, gap), its glow, its message
   *  and inline action type, its glyph size and its dismiss box. */
  announcement: {
    container: ViewStyle;
    glow: (glow: string) => ViewStyle;
    iconSize: number;
    message: TextStyle;
    action: TextStyle;
    dismissButton: ViewStyle;
    dismissIconSize: number;
  };
}

export interface AlertProps {
  // Content.
  title?: string;
  description?: string;
  /**
   * The leading glyph: an element (an `<Icon />`, tinted to the tone's color unless it
   * sets its own, and sized to the banner's glyph) or a single text character. Omitted,
   * the banner draws its tone's own glyph (an info circle on info and neutral, a check
   * on success, an alert circle on warning, a cross on destructive); `null` draws none.
   */
  icon?: ReactNode;
  // Tone (pick one; omit for the neutral default).
  info?: boolean;
  success?: boolean;
  warning?: boolean;
  /** The danger tone. This is the name the intent axis uses across the kit (Button,
   *  AlertDialog, and every chart) and the one the design hand-off uses here too. */
  destructive?: boolean;
  /**
   * The announcement bar: one line on the accent gradient (the accent running into the
   * cyan series hue) in the accent's own ink, under its glow, with its `action` inline at
   * the end. For page-wide news ("v4 is live"), not for a status. It is its own look, so
   * it ignores the tone axis.
   */
  announcement?: boolean;
  /**
   * One action, as a label and a handler. On the announcement bar it sits inline at the
   * end of the line, in the bar's ink; on the other looks it is a link Button in the
   * actions region, before any `actions`.
   */
  action?: { label: string; onPress?: () => void };
  /** Shows a trailing dismiss control. Pressing it hides the banner out of the box
   *  (uncontrolled); pass `dismissed` to own that state instead. */
  dismissible?: boolean;
  /** Controlled dismissal: `true` hides the banner. Omit to let the Alert manage it. */
  dismissed?: boolean;
  /** Uncontrolled seed: start hidden. Rarely useful; defaults to false. */
  defaultDismissed?: boolean;
  /** Fired when the dismiss control is pressed (both modes). */
  onDismiss?: () => void;
  children?: ReactNode;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /**
   * A footer action region rendered under the body. The Alert owns the layout: it
   * separates the actions from the description above and lays the buttons out in a
   * row, so a call site passes the buttons directly
   * (`actions={<Button primary small>Upgrade plan</Button>}`) with no wrapper.
   * Pass a fragment for more than one action.
   */
  actions?: ReactNode;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// Width: an Alert is FILL (src/style/sizing.ts). It spans the parent it is given,
// a page column, a dialog body, a Container step over a form, so a column of
// alerts is the same measure top to bottom and a banner over a form lines up with
// the fields; the parent layout container decides the measure.

// Tone precedence when more than one is passed: first match wins.
export function toneOf(p: AlertProps): Tone {
  if (p.destructive) return "error";
  if (p.warning) return "warning";
  if (p.success) return "success";
  if (p.info) return "info";
  return "neutral";
}

// The tone's accent: the solid status color (the hand-off's `--ok`, `--warn`, `--bad`), the
// accent's text ink on info (`--ion-tx`), the muted ink on the neutral banner (`--tx2`).
function accentOf(tokens: ColorTokens, tone: Tone): string {
  const c = statusColors(tokens, tone === "error" ? "error" : tone);
  return tone === "info" ? c.ink : c.dot;
}

// The colors per tone, from statusColors: the tone's wash as the fill (the neutral banner
// the `muted` surface) under a 1 px edge of the accent at 30%.
function containerColor(tokens: ColorTokens, tone: Tone): ViewStyle {
  return { borderColor: alpha(accentOf(tokens, tone), 0.3), backgroundColor: statusColors(tokens, tone).wash };
}

// The under-fill of the alert's glass pane: its own wash over the content material.
function paneTint(tokens: ColorTokens, tone: Tone): string {
  return statusColors(tokens, tone).wash;
}

// The icon: the tone's accent. The dismiss glyph is the subtle ink (`--tx3`).
function iconColor(tokens: ColorTokens, tone: Tone): TextStyle {
  return { color: accentOf(tokens, tone) };
}

// The title is the foreground on every tone.
function titleColor(tokens: ColorTokens): TextStyle {
  return { color: tokens.foreground };
}

// The body reads in the muted ink on every tone.
function bodyColor(tokens: ColorTokens): TextStyle {
  return { color: tokens["muted-foreground"] };
}

// The tone's own glyph, drawn when the caller passes no `icon`.
function toneGlyph(tone: Tone): Record<string, true> {
  return tone === "success" ? { circleCheck: true } : tone === "warning" ? { circleAlert: true } : tone === "error" ? { circleX: true } : { info: true };
}

/** The announcement bar's gradient: the accent into a 60 / 40 mix of the accent and cyan. */
function AnnouncementFill({ tokens }: { tokens: ColorTokens }) {
  const id = `announcement-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const from = actionFill(tokens);
  const to = mixOklab(from, tokens["chart-2"] ?? from, 0.4);
  return (
    <View style={ANNOUNCEMENT_FILL} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="1" height="1" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const ANNOUNCEMENT_FILL: ViewStyle = { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 };

export function createAlert(skin: AlertSkin, parts: AlertParts = {}) {
  const content: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%", gap: skin.contentGap };
  const LinkButton = parts.Button ?? WebButton;

  return function Alert(props: AlertProps) {
    const { title, description, icon, children, actions, action, dismissible, onDismiss, testID, style } = props;
    const theme = useMaterialTheme({ static: true });
    const { tokens } = theme;
    const glass = isGlass(theme);
    const tone = toneOf(props);
    const fill = useFillStyle("Alert");
    // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
    // hand-off's order: Container, Icon, Title, Description, Dismiss, Actions. Taken
    // before the tree's AnatomyScope so the action Buttons register nothing of their own.
    const containerPart = useAnatomyPart("Container");
    const iconPart = useAnatomyPart("Icon");
    const titlePart = useAnatomyPart("Title");
    const descriptionPart = useAnatomyPart("Description");
    const dismissPart = useAnatomyPart("Dismiss");
    const actionsPart = useAnatomyPart("Actions");

    // Dismissal obeys the kit's controlled + uncontrolled contract: pressing the
    // trailing "×" hides the banner out of the box, a controlled `dismissed` prop
    // hands that state to the parent, and `onDismiss` fires in both modes.
    const [dismissed, setDismissed] = useControllableState<boolean>(
      props.dismissed,
      props.defaultDismissed ?? false,
      () => onDismiss?.(),
    );

    // Auto-tint a leading `<Icon />` element to the tone's icon color, so a bare
    // `<Icon info />` matches the banner hue without the caller threading a color
    // (the same idiom Chip uses for its leading icon). An Icon that sets its own
    // `color` (or a semantic color boolean, which wins inside Icon) keeps it; a
    // non-Icon element ignores the injected prop.
    const tintedIcon = isValidElement(icon)
      ? cloneElement(icon as ReactElement<Record<string, unknown>>, {
          color: (icon.props as Record<string, unknown>).color ?? iconColor(tokens, tone).color,
          size: skin.iconSize,
        })
      : icon === undefined
        ? <Icon {...toneGlyph(tone)} color={accentOf(tokens, tone)} size={skin.iconSize} decorative />
        : null;

    // An Alert is an inline notification surface, so it announces itself as an
    // alert and rides a live region (assistive tech reads the message without
    // stealing focus). RNW drops accessibilityLiveRegion, so the aria-live alias
    // carries the web announcement. An error tone is urgent enough to interrupt
    // ("assertive"); the rest stay "polite".
    const live = tone === "error" ? "assertive" : "polite";

    if (dismissed) return null;

    if (props.announcement) {
      // The announcement bar: a brand fill like a primary Button's, so it paints its
      // gradient in every surface mode, under its glow, with the accent's own ink.
      const a = skin.announcement;
      const ink = actionInk(tokens);
      const glyph = isValidElement(icon)
        ? cloneElement(icon as ReactElement<Record<string, unknown>>, { color: ink, size: a.iconSize })
        : icon === undefined ? <Icon sparkles color={ink} size={a.iconSize} decorative /> : null;
      // The announcement's Actions part is its inline action, else the caller's actions.
      return (
        <AnatomyScope>
          <View
            ref={containerPart?.ref}
            onLayout={containerPart?.onLayout}
            testID={testID}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            aria-live="polite"
            style={[a.container, a.glow(tokens.glow ?? tokens.ring), fill, style]}
          >
            <AnnouncementFill tokens={tokens} />
            {glyph != null ? <AnatomyPart part={iconPart}>{glyph}</AnatomyPart> : null}
            <View style={content}>
              {title != null && title !== "" ? <Text ref={titlePart?.ref} onLayout={titlePart?.onLayout} style={[a.message, { color: ink }]}>{title}</Text> : null}
              {description != null && description !== "" ? <Text ref={descriptionPart?.ref} onLayout={descriptionPart?.onLayout} style={[a.message, { color: ink, fontWeight: "400" }]}>{description}</Text> : null}
              {children}
            </View>
            {action != null ? (
              <Pressable ref={actionsPart?.ref} onLayout={actionsPart?.onLayout} accessibilityRole="button" onPress={action.onPress} style={({ pressed }) => pressDim(pressed, skin.dismissPressedOpacity)}>
                <Text style={[a.action, { color: ink }]}>{action.label}</Text>
              </Pressable>
            ) : null}
            {actions != null ? <AnatomyPart part={action != null ? undefined : actionsPart}>{actions}</AnatomyPart> : null}
            {dismissible ? (
              <Pressable
                ref={dismissPart?.ref}
                onLayout={dismissPart?.onLayout}
                onPress={() => setDismissed(true)}
                accessibilityRole="button"
                accessibilityLabel="Dismiss"
                hitSlop={skin.dismissHitSlop ?? undefined}
                style={({ pressed }) => [a.dismissButton, pressDim(pressed, skin.dismissPressedOpacity)]}
              >
                <Icon x color={ink} size={a.dismissIconSize} decorative />
              </Pressable>
            ) : null}
          </View>
        </AnatomyScope>
      );
    }

    return (
      <AnatomyScope>
        <View
          ref={containerPart?.ref}
          onLayout={containerPart?.onLayout}
          testID={testID}
          accessibilityRole="alert"
          accessibilityLiveRegion={live}
          aria-live={live}
          style={[paneStyle(theme, [skin.container, containerColor(tokens, tone)], glass), fill, style]}
        >
          {/* Under glass the alert is a CONTENT-layer pane tinted with its wash, painted
              behind the live-region root, which keeps its semantics; the toned edge stays
              over the pane. Renders nothing in solid mode. */}
          <GlassPane layer="content" shape={[skin.container, containerColor(tokens, tone)]} stateBorder tint={paneTint(tokens, tone)} />
          {tintedIcon != null ? (
            <View ref={iconPart?.ref} onLayout={iconPart?.onLayout} style={skin.iconSlot}>{tintedIcon}</View>
          ) : icon != null ? (
            <Text ref={iconPart?.ref} onLayout={iconPart?.onLayout} style={[skin.iconType, iconColor(tokens, tone)]}>{icon}</Text>
          ) : null}
          <View style={content}>
            <MaterialBehind rendered={glass}>
            {title != null && title !== "" ? (
              <Text ref={titlePart?.ref} onLayout={titlePart?.onLayout} style={[skin.titleType, titleColor(tokens)]}>{title}</Text>
            ) : null}
            {description != null && description !== "" ? (
              <Text ref={descriptionPart?.ref} onLayout={descriptionPart?.onLayout} style={[skin.bodyType, bodyColor(tokens)]}>{description}</Text>
            ) : null}
            {children}
            {actions != null || action != null ? (
              <View ref={actionsPart?.ref} onLayout={actionsPart?.onLayout} style={skin.actions}>
                {action != null ? <LinkButton link small onPress={action.onPress}>{action.label}</LinkButton> : null}
                {actions}
              </View>
            ) : null}
            </MaterialBehind>
          </View>
          {dismissible ? (
            <Pressable
              ref={dismissPart?.ref}
              onLayout={dismissPart?.onLayout}
              onPress={() => setDismissed(true)}
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
              hitSlop={skin.dismissHitSlop ?? undefined}
              // A borderless ripple is projected onto an ancestor's background, beneath the
              // alert's pane: where the pane renders it draws in the foreground (`paneRipple`).
              android_ripple={paneRipple(theme, controlRipple(tokens))}
              style={({ pressed }) => [skin.dismissButton, pressDim(pressed, skin.dismissPressedOpacity)]}
            >
              <Icon x color={tokens["subtle-foreground"]} size={skin.dismissIconSize} decorative />
            </Pressable>
          ) : null}
        </View>
      </AnatomyScope>
    );
  };
}

