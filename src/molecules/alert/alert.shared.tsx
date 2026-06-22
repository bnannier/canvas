import { type ReactNode } from "react";
import {
  View,
  Pressable,
  Text,
  useTheme,
  controlRipple,
  pressDim,
  palette,
  type ColorTokens,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "../../style/index.js";

// Shared Alert shell. The structure (a leading icon glyph, a bold title, a
// description, an optional trailing dismiss control), the boolean-prop tone axis,
// and the semantic color logic live here once; a platform file supplies only its
// skin (shape radius, density/spacing, type tracking, dismiss press feedback) and
// calls createAlert.
//
// A bordered banner that surfaces an inline notification. Configured by a tone axis
// (info / success / warning / error, plus a neutral default), and an optional `icon`
// glyph. Each tone is theme-aware: a soft 50/200 surface with a 600/700/800 type ramp
// in light mode, and a 950/800 surface with a 200/300/400 ramp in dark mode (branching
// on the active scheme). The neutral default uses the semantic card / border / foreground
// tokens.
//
// Alert is a "Light" platform treatment. Neither iOS nor Material 3 ships an inline
// alert banner (iOS alerts are modal — see alert-dialog; M3 dropped the M2 banner), so
// there is no native shape to match; the per-OS skins keep the one structure and apply
// only platform conventions: iOS uses SF/HIG corner + type tracking, Android uses the
// M3 medium shape + M3 type tracking + ripple, and web keeps the current shadcn look.
// The semantic colors are identical on every platform, so the skin carries shape, density,
// type, and dismiss press feedback only — not the colors.

export type Tone = "info" | "success" | "warning" | "error" | "neutral";

export interface AlertSkin {
  /** Banner shape + density (border-radius, padding, gap). */
  container: ViewStyle;
  /** Leading glyph type (size / line-height). */
  iconType: TextStyle;
  /** Title type (size / line-height / weight / tracking). */
  titleType: TextStyle;
  /** Description / body type (size / line-height / tracking). */
  bodyType: TextStyle;
  /** Dismiss control shape (size, radius). */
  dismissButton: ViewStyle;
  /** Dismiss glyph type (size / line-height). */
  dismissType: TextStyle;
  /** Pressed opacity for the dismiss control (iOS/web dim; Android stays opaque under ripple). */
  dismissPressedOpacity: number;
}

export interface AlertProps {
  // Content.
  title?: string;
  description?: string;
  // A leading glyph (a single Text character; the foundation has no icon set).
  icon?: ReactNode;
  // Tone (pick one; omit for the neutral default).
  info?: boolean;
  success?: boolean;
  warning?: boolean;
  error?: boolean;
  /** Shows a trailing dismiss control. */
  dismissible?: boolean;
  /** Fired when the dismiss control is pressed. */
  onDismiss?: () => void;
  children?: ReactNode;
  /** Escape hatch for layout/positioning composition (width, margins). */
  style?: StyleProp<ViewStyle>;
}

// Tone precedence when more than one is passed: first match wins.
function toneOf(p: AlertProps): Tone {
  if (p.error) return "error";
  if (p.warning) return "warning";
  if (p.success) return "success";
  if (p.info) return "info";
  return "neutral";
}

// The palette hue per toned alert (neutral rides the semantic tokens).
const TONE_HUE: Record<Exclude<Tone, "neutral">, string> = {
  info: "blue",
  success: "green",
  warning: "amber",
  error: "red",
};

// Container border + fill. Light: 200 border / 50 surface; dark: 800 / 950.
// Neutral: semantic card surface with the border token.
function containerColor(tokens: ColorTokens, dark: boolean, tone: Tone): ViewStyle {
  if (tone === "neutral") return { borderColor: tokens.border, backgroundColor: tokens.card };
  const hue = TONE_HUE[tone];
  return dark
    ? { borderColor: palette[`${hue}-800`], backgroundColor: palette[`${hue}-950`] }
    : { borderColor: palette[`${hue}-200`], backgroundColor: palette[`${hue}-50`] };
}

// Icon color. Light: 600; dark: 400. Neutral: muted-foreground.
function iconColor(tokens: ColorTokens, dark: boolean, tone: Tone): TextStyle {
  if (tone === "neutral") return { color: tokens["muted-foreground"] };
  const hue = TONE_HUE[tone];
  return { color: dark ? palette[`${hue}-400`] : palette[`${hue}-600`] };
}

// Title color. Light: 800; dark: 200. Neutral: foreground.
function titleColor(tokens: ColorTokens, dark: boolean, tone: Tone): TextStyle {
  if (tone === "neutral") return { color: tokens.foreground };
  const hue = TONE_HUE[tone];
  return { color: dark ? palette[`${hue}-200`] : palette[`${hue}-800`] };
}

// Body color. Light: 700; dark: 300. Neutral: muted-foreground.
function bodyColor(tokens: ColorTokens, dark: boolean, tone: Tone): TextStyle {
  if (tone === "neutral") return { color: tokens["muted-foreground"] };
  const hue = TONE_HUE[tone];
  return { color: dark ? palette[`${hue}-300`] : palette[`${hue}-700`] };
}

export function createAlert(skin: AlertSkin) {
  return function Alert(props: AlertProps) {
    const { title, description, icon, children, dismissible, onDismiss, style } = props;
    const { tokens, dark } = useTheme();
    const tone = toneOf(props);

    // An Alert is an inline notification surface, so it announces itself as an
    // alert and rides a live region (assistive tech reads the message without
    // stealing focus). RNW drops accessibilityLiveRegion, so the aria-live alias
    // carries the web announcement. An error tone is urgent enough to interrupt
    // ("assertive"); the rest stay "polite".
    const live = tone === "error" ? "assertive" : "polite";

    return (
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion={live}
        aria-live={live}
        style={[skin.container, containerColor(tokens, dark, tone), style]}
      >
        {icon != null ? <Text style={[skin.iconType, iconColor(tokens, dark, tone)]}>{icon}</Text> : null}
        <View style={CONTENT}>
          {title != null && title !== "" ? (
            <Text style={[skin.titleType, titleColor(tokens, dark, tone)]}>{title}</Text>
          ) : null}
          {description != null && description !== "" ? (
            <Text style={[skin.bodyType, bodyColor(tokens, dark, tone)]}>{description}</Text>
          ) : null}
          {children}
        </View>
        {dismissible ? (
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            android_ripple={controlRipple(tokens)}
            style={({ pressed }) => [skin.dismissButton, pressDim(pressed, skin.dismissPressedOpacity)]}
          >
            <Text style={[skin.dismissType, iconColor(tokens, dark, tone)]}>×</Text>
          </Pressable>
        ) : null}
      </View>
    );
  };
}

// flex-1 gap-1 — the content column beside the icon (platform-neutral layout).
const CONTENT: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%", gap: 4 };
