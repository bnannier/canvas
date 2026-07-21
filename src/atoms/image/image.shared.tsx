import {
  Image as RNImage,
  type ImageProps as RNImageProps,
  type ImageResizeMode,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
} from "react-native";

// Shared Image shell. Canvas wraps React Native's Image so the fit mode is chosen with a
// boolean prop (the kit's variant convention, like Badge/Chip) instead of RN's
// `resizeMode` string. Every other RN Image prop (source, style, accessibilityLabel / alt,
// onLoad / onError, blurRadius, …) forwards straight through untouched.
//
// Image carries no per-OS skin — fitting is platform-neutral — so there is one shell that
// re-exports unchanged on every platform (the BadgeGroup pattern): no ios / android forks.

export interface ImageProps extends Omit<RNImageProps, "resizeMode"> {
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
  /** Size, radius, and aspect. Sizing lives here; the fit props only choose how it fills. */
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
  // Strip the boolean fit props so they never leak to the native / DOM node; everything
  // else forwards untouched, with the chosen fit translated to RN's resizeMode.
  const { contain, cover, stretch, center, repeat, none, ...rest } = props;
  return <RNImage {...rest} resizeMode={fitOf(props)} />;
}
