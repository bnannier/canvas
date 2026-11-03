import { referenceSizeOf, referencePaintOf, sheenOf, REFERENCE_SIZES, REFERENCE_TYPE, ConicRing } from "./avatar.reference.js";
import { Children, cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from "react";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { View, Pressable, Text, pressDim, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle, type ImageStyle, type LayoutStyle } from "../../style/index.js";
import { GlassPane, paneRipple, paneStyle } from "../../style/glass-surface/glass-pane.js";
import { actionFill } from "../../style/action.js";
import { platformShape } from "../../style/platform-shape.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { identityDisc, identityHue, type IdentityDisc } from "../../style/identity-hue.js";
import { alpha, composite, contrastRatio, oklchHex } from "../../style/color.js";
import { Image } from "../image/image.js";
import { AnatomyScope, useAnatomyPart } from "../../style/anatomy.js";

// Shared Avatar shell. The structure (a photo when the account has one, falling
// back to one or two initials on a deterministic per-name colour), the
// boolean-prop axes, the initials reduction, accessibility, and the optional
// Pressable trigger all live here once; a platform file supplies only its skin
// (rounded-square radius, initials type per size, and press feedback) and calls
// createAvatar.
//
// It is a circle by default (the consistent shape across topbars, identity rows,
// and menus), optionally a rounded square.
//
// The initials fallback is the Canvas v4 hand-off's (`K.def('avatar')`): the name resolves
// to an identity hue (src/style/identity-hue.ts, or the `hue` prop), and the disc is that
// hue's soft wash, oklch(0.72 0.14 h) at 22%, under its ink, oklch(0.82 0.12 h) walked in
// lightness until it holds 4.5:1 on the wash over the page (the hand-off's ink already does
// on the dark page; on the light page it darkens). The initials sit at weight 600. Argus's
// reference geometry (`annotation` .. `spotlight`) keeps Dark Factory's identity gradient,
// drawn with react-native-svg so every platform paints the same blend.
// iOS and Android have no native avatar control (the iOS 27 kit and Material 3 both lack
// one), so every platform takes this look; the press feedback stays each platform's own
// (the Android ripple, the iOS and web dim).

export type Size = "tiny" | "small" | "default" | "large";
export type Shape = "circle" | "rounded";

// The only things a platform skin owns: the rounded-square corner radius, the
// initials type (size / line-height / weight / tracking) per size, the press
// feedback for the optional trigger, and the platform's minimum touch target.
// The circle radius (9999), the box sizes, the per-name fallback colour, and the
// ring outline are platform-neutral and live below.
//
// Android sets `ripple` (an android_ripple config) and leaves `pressedOpacity`
// null; iOS and web set `pressedOpacity` and leave `ripple` null, so the press
// feedback never double-signals.
export interface AvatarSkin {
  /** Internal compound-control geometry; standalone Avatar keeps its public size scale. */
  diameter?: Partial<Record<Size, number>>;
  /** A compound control's exact identity paint, before the default readable wash. */
  initialsPaint?: (hue: number) => { ink: string; wash: string };
  /** Corner radius for the `rounded` (square) shape per size; the circle is always 9999. */
  roundedRadius: Record<Size, number>;
  /** Initials type per size (weight / size / line-height / tracking). */
  labelType: Record<Size, TextStyle>;
  /** The AvatarGroup "+N" label per size (the hand-off's 600 13px at the 40px disc). */
  overflowType: Record<Size, TextStyle>;
  /** The `online` presence dot per size: its diameter and its ring of the card. */
  presence: (tokens: ColorTokens, size: number) => ViewStyle;
  /** Android ripple config for the pressable trigger (null where there is no ripple). */
  ripple: ((tokens: ColorTokens) => { color: string; borderless: boolean }) | null;
  /** The press dim for the pressable trigger (the shell skips it on Android, where the ripple carries the press; see pressDim). */
  pressedOpacity: number;
  /**
   * Minimum effective touch target for the pressable trigger (HIG 44pt on iOS,
   * Material 48dp on Android). The shell pads a smaller visual box out to this
   * with hitSlop, so the tap area meets the platform minimum without changing
   * the rendered size. Inert for pointer input on web.
   */
  minTarget: number;
}

export interface AvatarProps {
  /** Original 30px rounded brand mark with its action-to-selection gradient. */
  logo?: boolean;
  /** Reference identity geometry, smallest first in precedence. */
  annotation?: boolean;
  compact?: boolean;
  account?: boolean;
  row?: boolean;
  person?: boolean;
  profile?: boolean;
  detail?: boolean;
  hero?: boolean;
  featured?: boolean;
  spotlight?: boolean;
  /** Stage identity hue, independent of the display name. */
  hue?: number;
  whiteInk?: boolean;
  bold?: boolean;
  inverse?: boolean;
  orchid?: boolean;
  glow?: boolean;
  sheen?: boolean;
  mediumSheen?: boolean;
  strongSheen?: boolean;
  /**
   * The photo. A remote/URI string, or a bundled image module from `require(...)` /
   * `import`. When set (and it loads), the image fills the circle and the initials
   * fallback is hidden; if the image fails to load, it falls back to the initials.
   */
  src?: string | number;
  /** Alias for `src`, for callers that think in terms of a native image uri. */
  uri?: string | number;
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
  // Size (pick one; default is the 40px row avatar, `tiny` the 20px disc, `small` 28, `large` 56). Precedence: `tiny` > `small` > `large`.
  tiny?: boolean;
  small?: boolean;
  large?: boolean;
  // Shape (pick one; default is a circle).
  circle?: boolean;
  rounded?: boolean;
  /** Separator outline, for avatars that overlap in a stack. */
  ring?: boolean;
  /**
   * A presence dot: the `success` disc in a 2px ring of the card, at the bottom right,
   * one pixel past the disc's edge. It is decoration (hidden from assistive tech), so
   * name the presence in the label where it matters.
   */
  online?: boolean;
  /** When set, the avatar becomes pressable (e.g. a topbar account trigger). */
  onPress?: () => void;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For layout composition only; overlap/stacking is owned by AvatarGroup, not this prop. */
  style?: LayoutStyle;
}

// Diameter per size, the hand-off's four steps: tiny the 20px disc of a dense row or
// toolbar, small the 28px inline topbar/stack size (the disc AvatarMenu builds its pill
// around), default the 40px row avatar, large the 56px identity-header size.
// Platform-neutral; Skeleton's avatar placeholder reads it too.
export const AVATAR_DIAMETER: Record<Size, number> = { tiny: 20, small: 28, default: 40, large: 56 };
const BOX = AVATAR_DIAMETER;
const CIRCLE_RADIUS = 9999;
// Width of the separator ring (and the matching "+N" chip border) drawn in the
// background color when avatars overlap in a stack. A thin hairline, owned once.
const RING_WIDTH = 1.5;

// Size precedence when more than one is passed: first match wins, smallest first.
export function sizeOf(p: AvatarProps): Size {
  if (p.tiny) return "tiny";
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

// Shape precedence when more than one is passed: first match wins.
export function shapeOf(p: AvatarProps): Shape {
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

function radiusFor(skin: AvatarSkin, shape: Shape, size: Size): number {
  return shape === "rounded" ? skin.roundedRadius[size] : CIRCLE_RADIUS;
}

// The hand-off's initials disc for a hue on a page: the hue's 22% wash, and its ink walked
// in oklch lightness from 0.82 (darker on a light page, lighter on a dark one) until it
// holds the 4.5:1 text floor on the wash over the page. Cached per hue and page.
const WASH = { l: 0.72, c: 0.14, alpha: 0.22 } as const;
const INK = { l: 0.82, c: 0.12 } as const;
const TEXT_FLOOR = 4.5;
const DISCS = new Map<string, { wash: string; ink: string }>();
export function initialsDisc(hue: number, page: string, dark: boolean): { wash: string; ink: string } {
  const key = `${hue}:${page}:${dark ? 1 : 0}`;
  const hit = DISCS.get(key);
  if (hit) return hit;
  const wash = alpha(oklchHex(WASH.l, WASH.c, hue), WASH.alpha);
  const bed = composite(wash, page);
  let l: number = INK.l;
  let ink = oklchHex(l, INK.c, hue);
  while (contrastRatio(ink, bed) < TEXT_FLOOR && l > 0 && l < 1) {
    l = Math.round((l + (dark ? 0.01 : -0.01)) * 100) / 100;
    ink = oklchHex(l, INK.c, hue);
  }
  const disc = { wash, ink };
  DISCS.set(key, disc);
  return disc;
}

function containerStyle(tokens: ColorTokens, skin: AvatarSkin, size: Size, shape: Shape, ring: boolean, background: string): ViewStyle {
  return {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: background,
    width: BOX[size],
    height: BOX[size],
    borderRadius: radiusFor(skin, shape, size),
    // No ring-* equivalent in RN; a thin background-colored border is the stand-in
    // for ring ring-background, the separator outline used when avatars overlap.
    ...(ring ? { borderWidth: RING_WIDTH, borderColor: tokens.background } : null),
  };
}

// The photo fills the container exactly; the parent's overflow-hidden clips it to
// the shape (RN clips children to a parent's borderRadius).
function imageStyle(skin: AvatarSkin, shape: Shape, size: Size): ImageStyle {
  return { width: "100%", height: "100%", borderRadius: radiusFor(skin, shape, size) };
}

function labelStyle(skin: AvatarSkin, size: Size, foreground: string): TextStyle {
  return { color: foreground, ...skin.labelType[size] };
}

// The disc's gradient, filling the container (which clips it to the shape). Decorative:
// the avatar's name is on its root, and the hiding sits on a View because react-native-web
// drops the React Native accessibility props there, where an Svg would forward them to the
// DOM (Icon wraps its glyph the same way). The id is per instance, so two discs on one page
// never share (or clobber) a gradient definition on the web.
function DiscGradient({ disc, id }: { disc: IdentityDisc; id: string }) {
  return (
    <View style={DISC_FILL} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%">
        <Defs>
          {/* 135 degrees: from the top-left corner to the bottom-right one. */}
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={disc.from} />
            <Stop offset="1" stopColor={disc.to} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const PRESENCE: ViewStyle = { position: "absolute", right: -1, bottom: -1, borderRadius: 9999, pointerEvents: "none" };

const DISC_FILL: ViewStyle = { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" };

/** Build an Avatar component from a platform skin. */
export function createAvatar(skin: AvatarSkin) {
  return function Avatar(props: AvatarProps) {
    // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
    // hand-off's order: Frame, Image or initials, Ring.
    const framePart = useAnatomyPart("Frame");
    const contentPart = useAnatomyPart("Image or initials");
    const ringPart = useAnatomyPart("Ring");
    const { src, uri, name, initials, children, ring, accessibilityLabel, onPress, testID, style } = props;
    const theme = useMaterialTheme({ static: true, layer: "control" });
    const { tokens, dark } = theme;
    const size = sizeOf(props);
    const shape = shapeOf(props);
    const reference = referenceSizeOf(props);
    const referenceGeometry = reference ? REFERENCE_SIZES[reference] : null;
    const diameter = referenceGeometry ?? skin.diameter?.[size] ?? BOX[size];
    const sheen = sheenOf(props);
    const photo = src ?? uri;
    // Track a photo that failed to load so we fall back to the initials rather than
    // showing a blank circle (a broken URL, or a relative URL with no host on native).
    // Keyed on the photo value, so swapping in a new photo re-attempts the image.
    const [failedPhoto, setFailedPhoto] = useState<string | number | undefined>(undefined);
    const showPhoto = photo != null && failedPhoto !== photo;
    // The accessible name: an explicit label, else the full name, else string children.
    const label = accessibilityLabel ?? name ?? (typeof children === "string" ? children : undefined);

    // The initials glyph, resolved once. Explicit `initials` win verbatim; otherwise
    // reduce the name / string children. The colour identity keys off the full name
    // when present (so one person maps to one colour), else the initials or children.
    const source = name ?? (typeof children === "string" ? children : "");
    const glyph = showPhoto ? "" : initials ?? (source ? initialsFrom(source) : "");
    const identity = name ?? initials ?? (typeof children === "string" ? children : "");

    // Identity stays static whether or not it is pressable. Photos keep their pixels, and
    // the initials disc keeps its gradient in every mode: like a photo it is identity
    // content, so it paints over the material rather than taking it. Only the neutral
    // glyph-less trigger is a plain control puck.
    const colored = glyph !== "";
    const discHue = props.hue ?? identityHue(identity);
    const paint = referencePaintOf(props);
    // Argus's reference geometry and paints keep their gradient; a stock disc is the
    // hand-off's flat wash.
    const gradient = colored && (referenceGeometry != null || paint !== "identity");
    const disc = gradient ? paint === "logo" ? { from: actionFill(tokens), to: tokens.ring, mid: actionFill(tokens), ink: "#ffffff" } : paint === "orchid" ? { from: "#d9b8ea", to: "#b559a6", mid: "#d9b8ea", ink: "#ffffff" } : identityDisc(discHue) : null;
    const wash = colored && !gradient ? skin.initialsPaint?.(discHue) ?? initialsDisc(discHue, tokens.background, dark) : null;
    const gradientId = `avatar-disc-${useId().replace(/:/g, "")}`;
    const background = disc ? disc.mid : wash ? wash.wash : tokens.muted;
    const foreground = props.whiteInk || props.inverse ? "#ffffff" : disc ? disc.ink : wash ? wash.ink : tokens["muted-foreground"];
    const identityFill = disc != null || wash != null;
    const shapeStyle = { ...containerStyle(tokens, skin, size, shape, !!ring, background), width: diameter, height: diameter,
      ...(props.inverse || referenceGeometry != null ? { backgroundColor: "transparent" } : null),
      ...(props.logo ? { borderRadius: platformShape.web.brandMark, boxShadow: `0 10px 18px -8px ${tokens.glow ?? tokens.ring}` } : null),
      // The glow: Argus's account disc keeps its card gap and accent ring; a stock disc takes
      // the hand-off's 2px page gap inside an 18px accent glow.
      ...(props.glow ? { boxShadow: referenceGeometry != null ? `0 0 0 2px ${tokens.card}, 0 0 0 3.5px ${tokens.primary}` : `0 0 0 2px ${tokens.background}, 0 0 18px ${tokens.glow ?? tokens.ring}` } : null),
    };
    const separator = ring ? { borderWidth: RING_WIDTH, borderColor: theme.increasedContrast ? tokens.foreground : tokens.background } : null;
    // The separator ring is a border a tile keeps under glass, over its pane, which sits
    // flush inside it (paneStyle's and GlassPane's `stateBorder`).
    const container: StyleProp<ViewStyle> = [showPhoto || identityFill ? shapeStyle : paneStyle(theme, shapeStyle, !!ring), separator, props.online ? null : style];
    const pane = showPhoto || identityFill ? null : <GlassPane static layer="control" shape={shapeStyle} stateBorder={!!ring} />;
    const fill = props.inverse ? <View style={[DISC_FILL, { borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.2)", boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.7)" }]} /> : !showPhoto && disc ? <DiscGradient disc={disc} id={gradientId} /> : null;
    const innerRing = sheen ? <View style={[DISC_FILL, { borderRadius: 9999, boxShadow: `inset 0 0 0 ${sheen}px ${tokens.card}` }]} /> : null;
    // The presence dot sits past the disc's clipped edge, so it rides a wrapper the size
    // of the disc, which takes the call site's layout style in place of the disc.
    const presence = props.online ? <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[PRESENCE, skin.presence(tokens, diameter)]} /> : null;
    const wrap = (node: ReactNode) => <AnatomyScope>{presence ? <View style={[{ width: diameter, height: diameter, flexShrink: 0 }, style]}>{wrapSheen(node)}{presence}</View> : wrapSheen(node)}</AnatomyScope>;
    // The photo and the separator ring have no node of their own to ref (the Image atom takes
    // none, the ring is the disc's border): inside a docs AnatomyProvider each is a
    // transparent node over the disc's padding box, the area the photo fills and the ring encloses.
    const photoPart = showPhoto ? <View ref={contentPart?.ref} onLayout={contentPart?.onLayout} style={DISC_FILL} /> : null;
    const ringNode = ring && ringPart ? <View ref={ringPart.ref} onLayout={ringPart.onLayout} style={DISC_FILL} /> : null;
    const wrapSheen = (node: ReactNode) => sheen ? <View style={{ width: diameter + sheen * 2, height: diameter + sheen * 2, alignItems: "center", justifyContent: "center" }}><ConicRing size={diameter + sheen * 2} width={sheen} hue={discHue} />{node}</View> : node;

    // Pad the visual box out to the skin's minimum touch target (44pt HIG / 48dp
    // M3) when the avatar is pressable: e.g. the 28px `small` topbar trigger gets
    // hitSlop 8 on iOS (28 + 2*8 = 44) and 10 on Android (28 + 2*10 = 48). The
    // large 48px box already meets both minimums, so its slop resolves to 0.
    const targetSlop = Math.max(0, Math.ceil((skin.minTarget - diameter) / 2));
    const hitSlop = targetSlop > 0 ? targetSlop : undefined;

    let inner: ReactNode;
    if (showPhoto) {
      inner = (
        <Image
          cover
          style={imageStyle(skin, shape, size)}
          source={typeof photo === "number" ? photo : { uri: photo }}
          onError={() => setFailedPhoto(photo)}
          accessibilityLabel={label}
          aria-label={label}
        />
      );
    } else {
      inner = glyph ? <Text ref={contentPart?.ref} onLayout={contentPart?.onLayout} style={[labelStyle(skin, size, foreground), reference ? REFERENCE_TYPE[reference] : null, props.bold ? { fontWeight: "700" } : null]}>{glyph}</Text> : null;
    }

    if (onPress) {
      return wrap(
        <Pressable
          // The tile's pane is a child of this Pressable, which the borderless ripple,
          // projected onto an ancestor's background, lands beneath: where the pane renders
          // the ripple draws in the foreground (`paneRipple`).
          android_ripple={paneRipple(pane != null ? theme : false, skin.ripple ? skin.ripple(tokens) : undefined)}
          style={({ pressed }) => [container, pressDim(pressed, skin.pressedOpacity)]}
          ref={framePart?.ref}
          onLayout={framePart?.onLayout}
          onPress={onPress}
          hitSlop={hitSlop}
          testID={testID}
          accessibilityRole="button"
          accessibilityLabel={label}
          aria-label={label}
        >
          {pane}
          {fill}
          {innerRing}
          {inner}
          {photoPart}
          {ringNode}
        </Pressable>
      );
    }
    return wrap(<View ref={framePart?.ref} onLayout={framePart?.onLayout} style={container} testID={testID}>{pane}{fill}{innerRing}{inner}{photoPart}{ringNode}</View>);
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
  tiny: { tight: -11, snug: -7, loose: -3 },
  small: { tight: -13, snug: -8, loose: -3 },
  default: { tight: -16, snug: -10, loose: -5 },
  large: { tight: -20, snug: -13, loose: -7 },
};

export interface AvatarGroupProps {
  /** Avatar elements to stack. */
  children?: ReactNode;
  /** Cap the visible avatars; the remainder collapses into a "+N" chip. */
  max?: number;
  /** Override the total behind the "+N" chip (e.g. a server-known member count). */
  total?: number;
  // Size (pick one; forwarded to every child so the whole stack is uniform). Precedence: `tiny` > `small` > `large`.
  tiny?: boolean;
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
export function overlapOf(p: AvatarGroupProps): Overlap {
  if (p.loose) return "loose";
  if (p.snug) return "snug";
  return "tight";
}

/** Build an AvatarGroup from the same platform skin as Avatar. */
export function createAvatarGroup(skin: AvatarSkin) {
  return function AvatarGroup(props: AvatarGroupProps) {
    const { children, max, total, tiny, small, large, accessibilityLabel, testID } = props;
    const theme = useMaterialTheme({ static: true, layer: "control" });
    const { tokens } = theme;
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
    const sizeProps: Partial<AvatarProps> = tiny ? { tiny: true } : small ? { small: true } : large ? { large: true } : {};

    const overflowShape: ViewStyle = {
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: tokens.muted,
      width: BOX[size],
      height: BOX[size],
      borderRadius: CIRCLE_RADIUS,
      borderWidth: RING_WIDTH,
      borderColor: tokens.background,
    };

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
            style={[paneStyle(theme, overflowShape, true), { borderWidth: RING_WIDTH, borderColor: theme.increasedContrast ? tokens.foreground : tokens.background, marginStart: visible.length > 0 ? overlap : 0 }]}
          >
            <GlassPane static layer="control" shape={overflowShape} stateBorder />
            <Text style={{ color: tokens["muted-foreground"], ...skin.overflowType[size] }}>+{hidden}</Text>
          </View>
        ) : null}
      </View>
    );
  };
}
