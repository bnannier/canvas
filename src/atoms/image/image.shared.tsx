import {
  Image as RNImage,
  type ImageProps as RNImageProps,
  type ImageResizeMode,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
} from "react-native";
import { radius as radiusScale } from "../../style/index.js";

// Shared Image shell. Canvas wraps React Native's Image so the fit mode is chosen with a
// boolean prop (the kit's variant convention, like Badge/Chip) instead of RN's
// `resizeMode` string. Every other RN Image prop (source, style, accessibilityLabel / alt,
// onLoad / onError, blurRadius, …) forwards straight through untouched.
//
// Image carries no per-OS skin — fitting is platform-neutral — so there is one shell that
// re-exports unchanged on every platform (the BadgeGroup pattern): no ios / android forks.

// Corner radius steps: the named keys of the kit's radius token scale (src/style/tokens.ts).
export type ImageRadius = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";

// Omit RN's `resizeMode` (replaced by the fit booleans) and its legacy top-level
// `width` / `height` (number-only), which we re-declare below as full style dimensions.
export interface ImageProps extends Omit<RNImageProps, "resizeMode" | "width" | "height"> {
  /** The image to display: a remote `{ uri }`, or a bundled asset from `require(...)`. */
  source?: ImageSourcePropType;
  // Fit (pick one; default `cover`). Chooses how the image is sized to fill its box.
  // When more than one is set, first match wins in the order below.
  /** Fit: fit the whole image inside the box, letterboxing the spare space (pick one). */
  contain?: boolean;
  /** Fit: fill the box, cropping any overflow. The default when no fit is set (pick one). */
  cover?: boolean;
  /** Fit: fill the box by distorting the aspect ratio (pick one). */
  stretch?: boolean;
  /** Fit: center at intrinsic size, scaling down only when larger than the box (pick one). */
  center?: boolean;
  /** Fit: tile the image at its intrinsic size to fill the box (pick one). */
  repeat?: boolean;
  /** Fit: show at intrinsic size with no scaling (pick one). */
  none?: boolean;
  /** Width of the image box (px, or a percent string like `"100%"`). Images have no intrinsic layout size. */
  width?: ImageStyle["width"];
  /** Height of the image box (px, or a percent string). */
  height?: ImageStyle["height"];
  /** Corner radius from the kit's radius scale (pick one): none, sm, md, lg, xl, 2xl, 3xl, full. */
  radius?: ImageRadius;
  /** Composition only (aspectRatio, layout within a parent). Size comes from `width` / `height`, rounding from `radius`. */
  style?: StyleProp<ImageStyle>;
  /** Accessible name / alt text announced for the image. */
  accessibilityLabel?: string;
  /** Alias for `accessibilityLabel` (web alt text). */
  alt?: string;
  /** E2E hook forwarded to the underlying image. */
  testID?: string;
}

// Fit precedence when more than one boolean is passed: first match wins. Defaults to
// `cover` (React Native's own default) so a bare <Image /> keeps its current behavior.
function fitOf(p: ImageProps): ImageResizeMode {
  if (p.contain) return "contain";
  if (p.cover) return "cover";
  if (p.stretch) return "stretch";
  if (p.center) return "center";
  if (p.repeat) return "repeat";
  if (p.none) return "none";
  return "cover";
}

export function Image(props: ImageProps) {
  // Strip the atom's own props (fit booleans, dimensions, radius) so they never leak to the
  // native / DOM node. `box` carries the size and rounding into the RN Image style; `style`
  // merges after it as a composition-only override. Everything else forwards untouched.
  const { contain, cover, stretch, center, repeat, none, width, height, radius, style, ...rest } = props;
  const box: ImageStyle = {};
  if (width !== undefined) box.width = width;
  if (height !== undefined) box.height = height;
  if (radius !== undefined) box.borderRadius = radiusScale[radius];
  return <RNImage {...rest} style={[box, style]} resizeMode={fitOf(props)} />;
}
