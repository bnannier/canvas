import { type ReactNode } from "react";
import { View, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./badge.styles.js";
import { type Tone, type Status } from "./badge.styles.js";

// Two families of badge.
//
// 1. The metadata badge: a rectangular pill (rounded-md) for static labels like
//    schema, role, or tag. Configured by a tone axis (default / secondary /
//    outline / destructive) plus a `mono` modifier for token / event names.
// 2. The status badge (`status`): a fully rounded pill carrying a leading dot,
//    for live state like active / pending / failed. Configured by a status-tone
//    axis (success / warning / error / info / neutral).
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). The `status` boolean
// switches families; the status-tone booleans only apply in that family.

export interface BadgeProps {
  children?: ReactNode;
  // Family: metadata badge (default) vs. status badge (with a dot).
  status?: boolean;
  // Metadata tone (pick one; default is the solid primary fill).
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
  /** Escape hatch for layout/positioning composition. */
  style?: StyleProp<ViewStyle>;
}

// Tone precedence when more than one is passed: first match wins.
function toneOf(p: BadgeProps): Tone {
  if (p.default) return "default";
  if (p.destructive) return "destructive";
  if (p.secondary) return "secondary";
  if (p.outline) return "outline";
  return "secondary";
}

function statusOf(p: BadgeProps): Status {
  if (p.success) return "success";
  if (p.error) return "error";
  if (p.warning) return "warning";
  if (p.info) return "info";
  if (p.neutral) return "neutral";
  return "neutral";
}

export function Badge(props: BadgeProps) {
  const { children, mono, style } = props;
  const { tokens, dark } = useTheme();

  if (props.status) {
    const tone = statusOf(props);
    return (
      <View style={[s.statusBase, s.statusContainer(tokens, dark, tone), style]}>
        <View style={s.statusDot(tokens, tone)} />
        {children != null ? (
          <Text style={[s.labelType, s.statusLabel(tokens, dark, tone)]}>{children}</Text>
        ) : null}
      </View>
    );
  }

  const tone = toneOf(props);
  // The mono modifier asks for a monospace face; RN has no font-family utility,
  // so request the cross-platform monospace alias via inline style.
  const monoStyle = mono ? { fontFamily: "monospace" as const } : null;

  return (
    <View style={[s.metaBase, s.metaContainer(tokens, tone), style]}>
      {children != null ? (
        <Text style={[s.labelType, s.metaLabel(tokens, tone), monoStyle]}>{children}</Text>
      ) : null}
    </View>
  );
}
