import { type ReactNode } from "react";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./alert.styles.js";
import { type Tone } from "./alert.styles.js";

// A bordered banner that surfaces an inline notification: a leading icon glyph,
// a bold title, and a description. Configured by a tone axis (info / success /
// warning / error, plus a neutral default), and an optional `icon` glyph.
//
// Boolean-prop API: one boolean per tone, first-match precedence within the
// axis (mirrors Button's intentOf / Badge's statusOf). Each tone is theme-aware:
// a soft 50/200 surface with a 600/700/800 type ramp in light mode, and a
// 950/800 surface with a 200/300/400 ramp in dark mode (branching on the active
// scheme). The neutral default uses the semantic card / border / foreground tokens.

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

export function Alert(props: AlertProps) {
  const { title, description, icon, children, dismissible, onDismiss, style } = props;
  const { tokens, dark } = useTheme();
  const tone = toneOf(props);

  return (
    <View style={[s.alertBase, s.container(tokens, dark, tone), style]}>
      {icon != null ? <Text style={[s.iconType, s.iconColor(tokens, dark, tone)]}>{icon}</Text> : null}
      <View style={s.content}>
        {title != null && title !== "" ? (
          <Text style={[s.titleType, s.titleColor(tokens, dark, tone)]}>{title}</Text>
        ) : null}
        {description != null && description !== "" ? (
          <Text style={[s.bodyType, s.bodyColor(tokens, dark, tone)]}>{description}</Text>
        ) : null}
        {children}
      </View>
      {dismissible ? (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={({ pressed }) => [s.dismissButton, pressed ? { opacity: 0.7 } : null]}
        >
          <Text style={[s.dismissType, s.iconColor(tokens, dark, tone)]}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
