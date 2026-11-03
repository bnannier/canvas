import { useState } from "react";
import { useAnatomyPart, withPartLayout, type AnatomyTarget } from "../../style/anatomy.js";
import { useComposedRefs } from "../../style/use-composed-refs.js";
import {
  Image as RNImage,
  View,
  type ImageProps as RNImageProps,
  type ImageResizeMode,
  type ImageSourcePropType,
  type ImageStyle,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { radius as radiusScale } from "../../style/index.js";
import { imageLabel, namedImageRole } from "./image.accessibility.js";

// Shared Image shell. Canvas wraps React Native's Image so the fit mode is chosen with a
// boolean prop (the kit's variant convention, like Badge/Chip) instead of RN's
// `resizeMode` string. Every other RN Image prop (source, style, onLoad / onError,
// blurRadius, …) forwards straight through untouched.
//
// The name is the one thing the shell resolves itself. React Native honors `alt` on iOS
// and Android, but react-native-web names an image only from `aria-label` /
// `accessibilityLabel` and lets `alt` fall away, which left an `alt`-only image (and
// every CardMedia) unnamed on the web: a decorative <img alt=""> under a role-less box.
// So the label is resolved here (aria-label, then accessibilityLabel, then alt;
// image.accessibility.ts) and handed to react-native-web as the label, which writes it
// onto its hidden <img alt>: the web's one image node. Natively the named image also
// takes role="img", the image trait; on the web that role would sit on the root above
// the <img> and name a second image, so the runtime picks it. `alt` still reaches React
// Native, which makes the image its own accessibility element natively. An image with no
// name stays decorative, with no role and an empty alt.
//
// `repeat` tiles the picture at its POINT size on every platform, through the same React
// Native code: the box is measured, one tile measures the asset's own size (an image with
// no width or height style takes a bundled asset's point size on iOS, Android and
// react-native-web alike), and a grid of plain images covers the box, clipped by it. Each
// tile is an ordinary Image of a bundled source, so every platform picks the density
// variant that matches the screen (grain@2x.png on a 2x screen) and draws it 1:1 into
// the tile. react-native-web's own repeat sizes its background from the bitmap's natural
// pixels instead, which tiles a 2x variant at twice its point size, and iOS and Android
// differ in how they tile; self-tiling gives one result everywhere. A source that does
// not declare a point size (a remote `{ uri }` without width and height) keeps React
// Native's own repeat. The tiles are decorative and hidden from assistive tech; a named
// repeat image is named once, on its box.
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
  /**
   * Accessible name for the image, the same name `alt` gives (and it wins when both are
   * set).
   * <!-- only: web -->
   * On iOS and Android React Native makes an image its own accessibility element
   * <!-- /only -->
   * <!-- only: ios android -->
   * In the app React Native makes an image its own accessibility element
   * <!-- /only -->
   * for `alt` (or `accessible`), so prefer `alt` for an image that stands on its own.
   */
  accessibilityLabel?: string;
  /**
   * The image's alt text: a named image is announced as an image with this name on every
   * platform (the web's <img alt>, the image role natively). With no name here or in
   * `accessibilityLabel` the image is decorative, and assistive tech skips it.
   */
  alt?: string;
  /** E2E hook forwarded to the underlying image. */
  testID?: string;
}

// Fit precedence when more than one boolean is passed: first match wins. Defaults to
// `cover` (React Native's own default) so a bare <Image /> keeps its current behavior.
export function fitOf(p: ImageProps): ImageResizeMode {
  if (p.contain) return "contain";
  if (p.cover) return "cover";
  if (p.stretch) return "stretch";
  if (p.center) return "center";
  if (p.repeat) return "repeat";
  if (p.none) return "none";
  return "cover";
}

/**
 * A local or remote image with a boolean fit prop (cover, contain, stretch, center,
 * repeat, none).
 */
export function Image(props: ImageProps) {
  // The anatomy parts a docs AnatomyProvider numbers (src/style/anatomy.tsx), in the
  // hand-off's order: Frame, Image. The kit's image box is the frame and the picture at
  // once, so both measure the one node.
  const framePart = useAnatomyPart("Frame");
  const imagePart = useAnatomyPart("Image");
  const hostRef = useComposedRefs<View>(framePart?.ref, imagePart?.ref);
  // Strip the atom's own props (fit booleans, dimensions, radius) so they never leak to the
  // native / DOM node. `box` carries the size and rounding into the RN Image style; `style`
  // merges after it as a composition-only override. Everything else forwards untouched.
  const { contain, cover, stretch, center, repeat, none, width, height, radius, style, ...rest } = props;
  const box: ImageStyle = {};
  if (width !== undefined) box.width = width;
  if (height !== undefined) box.height = height;
  if (radius !== undefined) box.borderRadius = radiusScale[radius];
  const fit = fitOf(props);
  if (fit === "repeat" && declaresPointSize(rest.source)) return <TiledImage {...rest} source={rest.source} box={box} style={style} parts={[framePart, imagePart]} />;
  // React Native's own order: aria-label, then accessibilityLabel, then alt. A caller's
  // own role stays; otherwise the runtime's role for a named image (none on the web).
  const label = imageLabel(rest);
  const name = label ? { role: rest.role ?? namedImageRole(), accessibilityLabel: label, "aria-label": label } : null;
  const onLayout = withPartLayout(framePart, withPartLayout(imagePart, rest.onLayout));
  return <RNImage {...rest} {...name} ref={framePart || imagePart ? hostRef : undefined} onLayout={onLayout} style={[box, style]} resizeMode={fit} />;
}

/** Whether a source states its own point size: a bundled asset (`require(...)`, whose
 * registry entry carries it on every platform) or a single `{ uri, width, height }`. */
export function declaresPointSize(source: ImageSourcePropType | undefined): source is number | { uri?: string; width: number; height: number } {
  if (typeof source === "number") return true;
  return source != null && !Array.isArray(source) && typeof source === "object" && typeof source.width === "number" && typeof source.height === "number" && source.width > 0 && source.height > 0;
}

/** How many tiles of `tile` points cover `extent` points: at least the one that measures. */
export function tileCount(extent: number, tile: number): number {
  return extent > 0 && tile > 0 ? Math.ceil(extent / tile) : 1;
}

type Size = { width: number; height: number };
const sizeOf = (e: LayoutChangeEvent): Size => ({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
const sameSize = (a: Size | null, b: Size) => a != null && a.width === b.width && a.height === b.height;

type TiledImageProps = Omit<ImageProps, "contain" | "cover" | "stretch" | "center" | "repeat" | "none" | "width" | "height" | "radius" | "source"> & {
  source: ImageSourcePropType;
  box: ImageStyle;
  parts: (AnatomyTarget | undefined)[];
};

// The repeat fit, tiled by the kit (see the header). The first frame mounts one tile, the
// one that measures the asset's point size; once the box and the tile are measured, the
// grid fills the box. The grid sits absolutely in the box, so it never sizes it: a box
// with no size of its own takes one tile's size, as a bundled image does.
function TiledImage({ source, box, style, parts, testID, nativeID, onLayout, onLoad, onLoadStart, onLoadEnd, onError, role, alt, accessibilityLabel, "aria-label": ariaLabel, ...imageProps }: TiledImageProps) {
  const [boxSize, setBoxSize] = useState<Size | null>(null);
  const [tile, setTile] = useState<Size | null>(null);
  const label = imageLabel({ "aria-label": ariaLabel, accessibilityLabel, alt });
  const name = label ? { accessible: true, role: role ?? "img", accessibilityLabel: label, "aria-label": label } : role ? { role } : null;
  const rows = tile && boxSize ? tileCount(boxSize.height, tile.height) : 1;
  const cols = tile && boxSize ? tileCount(boxSize.width, tile.width) : 1;
  const hostRef = useComposedRefs<View>(...parts.map((part) => part?.ref));
  const measureBox = (e: LayoutChangeEvent) => {
    onLayout?.(e);
    for (const part of parts) part?.onLayout();
    const next = sizeOf(e);
    if (!sameSize(boxSize, next)) setBoxSize(next);
  };
  const measureTile = (e: LayoutChangeEvent) => {
    const next = sizeOf(e);
    if (next.width > 0 && next.height > 0 && !sameSize(tile, next)) setTile(next);
  };
  // An ImageStyle's composition keys are view layout keys; the box itself is a View.
  const rootStyle = [styles.root, tile, box, style] as StyleProp<ViewStyle>;
  return (
    <View ref={parts.some(Boolean) ? hostRef : undefined} testID={testID} nativeID={nativeID} {...name} onLayout={measureBox} style={rootStyle}>
      <View style={styles.grid} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {Array.from({ length: rows }, (_, r) => (
          <View key={r} style={styles.row}>
            {Array.from({ length: cols }, (_, c) => {
              const first = r === 0 && c === 0;
              return (
                <RNImage
                  key={c}
                  {...imageProps}
                  {...(first ? { onLayout: measureTile, onLoad, onLoadStart, onLoadEnd, onError } : null)}
                  source={source}
                  resizeMode="stretch"
                  accessible={false}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = {
  root: { overflow: "hidden" },
  grid: { position: "absolute", top: 0, left: 0, pointerEvents: "none" },
  row: { flexDirection: "row" },
} satisfies Record<string, ViewStyle>;
