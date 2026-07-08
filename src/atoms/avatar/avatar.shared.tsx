import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { View, Image, Pressable, Text, useTheme, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle, type ImageStyle } from "../../style/index.js";

// Shared Avatar shell. The structure (a photo when the account has one, falling
// back to one or two initials on a muted surface), the boolean-prop axes, the
// initials reduction, accessibility, and the optional Pressable trigger all live
// here once; a platform file supplies only its skin (rounded-square radius,
// initials type per size, and press feedback) and calls createAvatar.
//
// It is a circle by default (the consistent shape across topbars, identity rows,
// and menus), optionally a rounded square.
//
// Avatar is a "Light" platform treatment: one structure and one set of (muted)
// colors, with per-OS touches limited to the rounded-square corner radius, the
// initials type, and the press feedback (Android ripple vs. iOS/web opacity dim).
// iOS and Android have no native avatar control (the iOS 27 kit and Material 3
// both lack one; iOS composes one from an image view or the person.crop.circle SF
// Symbol, M3 shows avatars only as content inside lists, chips, and app bars), so
// the skins apply platform conventions to the shared composition rather than
// matching a native widget.

export type Size = "small" | "default" | "large";
export type Shape = "circle" | "rounded";

// The only things a platform skin owns: the rounded-square corner radius, the
// initials type (size / line-height / weight / tracking) per size, and the press
// feedback for the optional trigger. The circle radius (9999), the box sizes, the
// muted fallback surface, and the ring outline are platform-neutral and live below.
//
// Android sets `ripple` (an android_ripple config) and leaves `pressedOpacity`
// null; iOS and web set `pressedOpacity` and leave `ripple` null, so the press
// feedback never double-signals.
export interface AvatarSkin {
  /** Corner radius for the `rounded` (square) shape; the circle is always 9999. */
  roundedRadius: number;
  /** Initials type per size (weight / size / line-height / tracking). */
  labelType: Record<Size, TextStyle>;
  /** Android ripple config for the pressable trigger, or null on iOS/web. */
  ripple: ((tokens: ColorTokens) => { color: string; borderless: boolean }) | null;
  /** iOS/web press dim opacity for the pressable trigger, or null on Android. */
  pressedOpacity: number | null;
}

export interface AvatarProps {
  /** Photo URL. When set, the image fills the circle and the fallback is hidden. */
  src?: string;
  /** Alias for `src`, for callers that think in terms of a native image uri. */
  uri?: string;
  /** Full name. Drives the initials fallback AND the accessible label/alt text. */
  name?: string;
  /** Ready-made initials, used verbatim as the glyph (overrides `name`/`children`). */
  initials?: string;
  /** Same as `name`; the rendered initials when no photo is supplied. */
  children?: ReactNode;
  /**
   * Accessible name for the avatar (the photo's alt text and, when pressable, the
   * button's label). Falls back to `name`, then string `children`. Set it for a
   * photo-only or pressable avatar that has no `name`.
   */
  accessibilityLabel?: string;
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
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For layout composition only; overlap/stacking is owned by AvatarGroup, not this prop. */
  style?: StyleProp<ViewStyle>;
}

// Diameter per size: small is the inline topbar/stack size, default the 40px row
// avatar, large the identity-header size. Platform-neutral.
const BOX: Record<Size, number> = { small: 28, default: 40, large: 48 };
const CIRCLE_RADIUS = 9999;

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

function radiusFor(skin: AvatarSkin, shape: Shape): number {
  return shape === "rounded" ? skin.roundedRadius : CIRCLE_RADIUS;
}

function containerStyle(tokens: ColorTokens, skin: AvatarSkin, size: Size, shape: Shape, ring: boolean): ViewStyle {
  return {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: tokens.muted,
    width: BOX[size],
    height: BOX[size],
    borderRadius: radiusFor(skin, shape),
    // No ring-* equivalent in RN; a 2px background-colored border is the stand-in
    // for ring-2 ring-background, the separator outline used when avatars overlap.
    ...(ring ? { borderWidth: 2, borderColor: tokens.background } : null),
  };
}

// The photo fills the container exactly; the parent's overflow-hidden clips it to
// the shape (RN clips children to a parent's borderRadius).
function imageStyle(skin: AvatarSkin, shape: Shape): ImageStyle {
  return { width: "100%", height: "100%", borderRadius: radiusFor(skin, shape) };
}

function labelStyle(tokens: ColorTokens, skin: AvatarSkin, size: Size): TextStyle {
  return { color: tokens["muted-foreground"], ...skin.labelType[size] };
}

/** Build an Avatar component from a platform skin. */
export function createAvatar(skin: AvatarSkin) {
  return function Avatar(props: AvatarProps) {
    const { src, uri, name, initials, children, ring, accessibilityLabel, onPress, testID, style } = props;
    const { tokens } = useTheme();
    const size = sizeOf(props);
    const shape = shapeOf(props);
    const photo = src ?? uri;
    // The accessible name: an explicit label, else the full name, else string children.
    const label = accessibilityLabel ?? name ?? (typeof children === "string" ? children : undefined);

    const container: StyleProp<ViewStyle> = [containerStyle(tokens, skin, size, shape, !!ring), style];

    let inner: ReactNode;
    if (photo) {
      inner = (
        <Image
          style={imageStyle(skin, shape)}
          source={{ uri: photo }}
          accessibilityLabel={label}
          aria-label={label}
          resizeMode="cover"
        />
      );
    } else {
      // Explicit `initials` win verbatim; otherwise reduce the name / string children.
      const source = name ?? (typeof children === "string" ? children : "");
      const glyph = initials ?? (source ? initialsFrom(source) : "");
      inner = glyph ? <Text style={labelStyle(tokens, skin, size)}>{glyph}</Text> : null;
    }

    if (onPress) {
      return (
        <Pressable
          android_ripple={skin.ripple ? skin.ripple(tokens) : undefined}
          style={({ pressed }) => [
            container,
            pressed && skin.pressedOpacity != null ? { opacity: skin.pressedOpacity } : null,
          ]}
          onPress={onPress}
          testID={testID}
          accessibilityRole="button"
          accessibilityLabel={label}
          aria-label={label}
        >
          {inner}
        </Pressable>
      );
    }
    return <View style={container} testID={testID}>{inner}</View>;
  };
}

// AvatarGroup: the overlapping avatar stack, so no call site writes a negative
// `marginLeft` to overlap avatars. It caps the visible avatars at `max`,
// collapses the remainder into a "+N" chip, forwards its size to every child,
// and injects the overlap margin + separator ring internally (the caller's
// Avatars carry no layout style). Co-located with Avatar because it reuses the
// same AvatarSkin, size scale, box, and ring outline.

export type Overlap = "tight" | "snug" | "loose";

// Overlap (negative marginLeft) per size and tightness. The magic negative margin
// is owned here, once, instead of at every call site.
const OVERLAP: Record<Size, Record<Overlap, number>> = {
  small: { tight: -10, snug: -6, loose: -2 },
  default: { tight: -12, snug: -8, loose: -4 },
  large: { tight: -14, snug: -10, loose: -6 },
};

export interface AvatarGroupProps {
  /** Avatar elements to stack. */
  children?: ReactNode;
  /** Cap the visible avatars; the remainder collapses into a "+N" chip. */
  max?: number;
  /** Override the total behind the "+N" chip (e.g. a server-known member count). */
  total?: number;
  // Size (pick one; forwarded to every child so the whole stack is uniform).
  small?: boolean;
  large?: boolean;
  // Overlap tightness (pick one; default `tight`). Precedence loose > snug > tight.
  tight?: boolean;
  snug?: boolean;
  loose?: boolean;
  /** Accessible name for the whole group (e.g. "8 members"). */
  accessibilityLabel?: string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
}

// Overlap precedence when more than one is passed: first match wins.
function overlapOf(p: AvatarGroupProps): Overlap {
  if (p.loose) return "loose";
  if (p.snug) return "snug";
  return "tight";
}

/** Build an AvatarGroup from the same platform skin as Avatar. */
export function createAvatarGroup(skin: AvatarSkin) {
  return function AvatarGroup(props: AvatarGroupProps) {
    const { children, max, total, small, large, accessibilityLabel, testID } = props;
    const { tokens } = useTheme();
    const size = sizeOf(props);
    const overlap = OVERLAP[size][overlapOf(props)];

    const items = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[];
    const cap = max ?? items.length;
    const visible = items.slice(0, cap);
    const totalCount = total ?? items.length;
    const hidden = totalCount - visible.length;

    // Size is forwarded only when the group sets one, so a child keeps its own
    // size otherwise. Overlap + ring are always injected, so the caller's
    // Avatars never carry layout style.
    const sizeProps: Partial<AvatarProps> = small ? { small: true } : large ? { large: true } : {};

    return (
      <View
        style={{ flexDirection: "row", alignItems: "center" }}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        aria-label={accessibilityLabel}
      >
        {visible.map((child, i) =>
          cloneElement(child, {
            key: child.key ?? i,
            ...sizeProps,
            ring: true,
            style: [child.props.style, i > 0 ? { marginStart: overlap } : null],
          }),
        )}
        {hidden > 0 ? (
          <View
            style={{
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              backgroundColor: tokens.muted,
              width: BOX[size],
              height: BOX[size],
              borderRadius: CIRCLE_RADIUS,
              borderWidth: 2,
              borderColor: tokens.background,
              marginStart: visible.length > 0 ? overlap : 0,
            }}
          >
            <Text style={{ color: tokens["muted-foreground"], ...skin.labelType[size] }}>+{hidden}</Text>
          </View>
        ) : null}
      </View>
    );
  };
}
