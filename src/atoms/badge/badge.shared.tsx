import { type ReactNode } from "react";
import { View, Text, useTheme, palette, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";

// Shared Badge shell. The structure (a metadata pill, or a status pill with a leading
// dot), the boolean-prop axes, and the semantic color logic live here once; a platform
// file supplies only its skin (shape, padding, label type, dot size) and calls createBadge.
//
// Two families of badge.
//
// 1. The metadata badge: a rounded pill for static labels like schema, role, or tag.
//    Configured by a tone axis (default / secondary / outline / destructive) plus a `mono`
//    modifier for token / event names.
// 2. The status badge (`status`): a fully rounded pill carrying a leading dot, for live
//    state like active / pending / failed. Configured by a status-tone axis (success /
//    warning / error / info / neutral).
//
// Badge is a "Light" platform treatment: one structure and one set of (semantic) colors,
// with per-OS touches limited to shape radius, label type, and dot size — so the skin
// carries only those, not the colors.

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

// Semantic colors (platform-neutral): the metadata badge uses semantic tokens; the status
// badge uses the Tailwind palette (a soft 50/200/700 surface in light, a 950/800/400 surface
// in dark) with a saturated 500 dot, and neutral stays on the semantic muted token.
function metaContainer(tokens: ColorTokens, tone: Tone): ViewStyle {
  switch (tone) {
    case "default": return { borderColor: "transparent", backgroundColor: tokens.primary };
    case "secondary": return { borderColor: "transparent", backgroundColor: tokens.secondary };
    case "outline": return { borderColor: tokens.border, backgroundColor: "transparent" };
    case "destructive": return { borderColor: "transparent", backgroundColor: tokens.destructive };
  }
}

function metaLabel(tokens: ColorTokens, tone: Tone): TextStyle {
  switch (tone) {
    case "default": return { color: tokens["primary-foreground"] };
    case "secondary": return { color: tokens["secondary-foreground"] };
    case "outline": return { color: tokens.foreground };
    case "destructive": return { color: tokens["destructive-foreground"] };
  }
}

const STATUS_HUE: Record<Exclude<Status, "neutral">, string> = {
  success: "green",
  warning: "amber",
  error: "red",
  info: "blue",
};

function statusContainer(tokens: ColorTokens, dark: boolean, status: Status): ViewStyle {
  if (status === "neutral") return { borderColor: tokens.border, backgroundColor: tokens.muted };
  const hue = STATUS_HUE[status];
  return dark
    ? { borderColor: palette[`${hue}-800`], backgroundColor: palette[`${hue}-950`] }
    : { borderColor: palette[`${hue}-200`], backgroundColor: palette[`${hue}-50`] };
}

function statusLabel(tokens: ColorTokens, dark: boolean, status: Status): TextStyle {
  if (status === "neutral") return { color: tokens["muted-foreground"] };
  const hue = STATUS_HUE[status];
  return { color: dark ? palette[`${hue}-400`] : palette[`${hue}-700`] };
}

function statusDotColor(tokens: ColorTokens, status: Status): string {
  if (status === "neutral") return tokens["muted-foreground"];
  return palette[`${STATUS_HUE[status]}-500`];
}

export function createBadge(skin: BadgeSkin) {
  return function Badge(props: BadgeProps) {
    const { children, mono, style } = props;
    const { tokens, dark } = useTheme();

    if (props.status) {
      const tone = statusOf(props);
      return (
        <View style={[skin.statusBase, statusContainer(tokens, dark, tone), style]}>
          <View style={{ height: skin.dotSize, width: skin.dotSize, borderRadius: 9999, backgroundColor: statusDotColor(tokens, tone) }} />
          {children != null ? (
            <Text style={[skin.labelType, statusLabel(tokens, dark, tone)]}>{children}</Text>
          ) : null}
        </View>
      );
    }

    const tone = toneOf(props);
    // The mono modifier asks for a monospace face; RN has no font-family utility, so request
    // the cross-platform monospace alias via inline style.
    const monoStyle = mono ? { fontFamily: "monospace" as const } : null;

    return (
      <View style={[skin.metaBase, metaContainer(tokens, tone), style]}>
        {children != null ? (
          <Text style={[skin.labelType, metaLabel(tokens, tone), monoStyle]}>{children}</Text>
        ) : null}
      </View>
    );
  };
}
