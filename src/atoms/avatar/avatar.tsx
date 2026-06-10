import { type ReactNode } from "react";
import { View, Image, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./avatar.styles.js";
import { type Size, type Shape } from "./avatar.styles.js";

// The avatar shows an account's photo when it has one, falling back to one or
// two initials on a muted surface. It is a circle by default (the consistent
// shape across topbars, identity rows, and menus), optionally a rounded square.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). Size picks the
// diameter and proportional type (~40% of the diameter); shape switches the
// corner radius; `ring` draws the separator outline used when avatars overlap
// in a stack.

export interface AvatarProps {
  /** Photo URL. When set, the image fills the circle and the fallback is hidden. */
  src?: string;
  /** Alias for `src`, for callers that think in terms of a native image uri. */
  uri?: string;
  /** Initials fallback shown when there is no photo (e.g. "AO"). */
  name?: string;
  /** Same as `name`; the rendered initials when no photo is supplied. */
  children?: ReactNode;
  // Size (pick one; default is the 40px row avatar).
  small?: boolean;
  large?: boolean;
  // Shape (pick one; default is a circle).
  circle?: boolean;
  rounded?: boolean;
  /** Separator outline, for avatars that overlap in a stack. */
  ring?: boolean;
  /** When set, the avatar becomes pressable (e.g. a topbar account trigger). */
  onPress?: () => void;
  /** Escape hatch for layout/positioning composition (e.g. negative margin to overlap in a stack). */
  style?: StyleProp<ViewStyle>;
}

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: AvatarProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

// Shape precedence when more than one is passed: first match wins.
function shapeOf(p: AvatarProps): Shape {
  if (p.circle) return "circle";
  if (p.rounded) return "rounded";
  return "circle";
}

// Reduce a name or label to one or two initials ("Rachel Chen" -> "RC", "AO" ->
// "AO"), so callers can pass either a full name or ready-made initials.
function initialsFrom(text: string): string {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar(props: AvatarProps) {
  const { src, uri, name, children, ring, onPress, style } = props;
  const { tokens } = useTheme();
  const size = sizeOf(props);
  const shape = shapeOf(props);
  const photo = src ?? uri;

  const container: StyleProp<ViewStyle> = [s.container(tokens, size, shape, !!ring), style];

  let inner: ReactNode;
  if (photo) {
    inner = (
      <Image
        style={s.image(shape)}
        source={{ uri: photo }}
        accessibilityLabel={name}
        resizeMode="cover"
      />
    );
  } else {
    const source = name ?? (typeof children === "string" ? children : "");
    const initials = source ? initialsFrom(source) : "";
    inner = initials ? <Text style={s.label(tokens, size)}>{initials}</Text> : null;
  }

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [container, pressed ? { opacity: 0.9 } : null]}
        onPress={onPress}
        accessibilityRole="button"
      >
        {inner}
      </Pressable>
    );
  }
  return <View style={container}>{inner}</View>;
}
