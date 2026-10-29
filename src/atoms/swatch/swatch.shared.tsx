import { type ReactNode } from "react";
import { type ViewStyle } from "react-native";
import {
  View,
  Text,
  Pressable,
  platformMinTarget,
  StyleSheet,
  useTheme,
  devWarn,
  MONO_FONT,
  oklchHex,
  paletteHue,
  requestedPaletteOf,
  useReducedMotion,
  useHugStyle,
  type LayoutStyle,
  type Palette,
} from "../../style/index.js";
import { useHover } from "../../style/hover.js";
import { type SwatchSkin } from "./swatch.styles.js";

// Shared Swatch shell. A color sample: one filled block with the token's name and
// value beneath it, the anatomy a design-system color sheet repeats down a page. The
// component owns the whole lockup (the block, the name, the mono value, the mono
// detail), so a sheet never hand-composes a bare View plus a Typography column beside
// it and re-invents the spacing, the type scale, and the tap-free label alignment.
//
// A color sample is display-only: it has no press feedback, so no skin carries a ripple
// or a pressed opacity. A sheet that needs a copy-the-hex action wraps the row in a real
// interactive kit component rather than making the sample itself pressable. The one
// pressable form is the palette picker (a palette boolean, with `selected` and
// `onPress`): a 16 px hue disc that is a radio, rendered by PalettePick below.
//
// Swatch is a "Shared" platform treatment: one structure and one set of token colors
// (here), and no platform ships a color sample, so the iOS and Android skins are the web
// skin (swatch.styles.ts). The continuous corner curve is drawn only where the platform
// draws one (iOS).

export type SwatchSize = "tiny" | "small" | "default" | "large";

export interface SwatchProps {
  /** The fill: any React Native color string. Pass a theme token, not a literal. */
  color?: string;
  // Palette picker (pick one): the sample becomes the 16 px hue disc of that accent
  // palette, a radio named for it (a size boolean sizes the disc to that sample edge:
  // `small` is 32 px). Precedence is ThemeProvider's: cyan, mint, rose, amber, violet.
  violet?: boolean;
  cyan?: boolean;
  mint?: boolean;
  rose?: boolean;
  amber?: boolean;
  /**
   * The sample is the chosen one: draws the selection ring (a 2 px gap in the page color,
   * then a 2 px band). On a plain sample the band is the accent and the name says
   * "selected"; on a palette picker it is the one in force and the radio is checked.
   */
  selected?: boolean;
  /** Palette picker: pick this palette. */
  onPress?: () => void;
  /** The sample's name (the token name). Swatch owns this label column. */
  children?: ReactNode;
  /** Primary mono line under the name: what the name resolves to (a hex, a custom-property name, a ramp step). */
  value?: string;
  /** Secondary mono line under the value, for a second notation of the same color (an oklch value, a legacy alias). */
  detail?: string;
  // Size (pick one; default 48). Sets the block's edge, or its height when `block`.
  // Precedence: `tiny` > `small` > `large`.
  /** The 20 px disc of a token chip (`<Chip token icon={<Swatch tiny ring circle />}>`). */
  tiny?: boolean;
  small?: boolean;
  large?: boolean;
  /** Circle instead of the default rounded square. Keeps the 1:1 footprint, so it wins over `block`'s stretch. */
  circle?: boolean;
  /**
   * Draws the token chip's hairline INSIDE the sample, a 1 px inset ring in the field
   * border, in place of the resting hairline edge; a selected sample keeps its selection
   * ring outside it.
   */
  ring?: boolean;
  /** Put the label column beside the block instead of under it. */
  inline?: boolean;
  /** Stretch the block to the parent's width; the size then reads as its height (the full-width ramp bar). */
  block?: boolean;
  /**
   * Accessible name override. By default the sample names itself from its own name,
   * value, and detail (falling back to the color string), so pass this only when the
   * name is a node rather than text and there is nothing to read.
   */
  accessibilityLabel?: string;
  /**
   * The sample is decoration beside text that already names it (a theme choice's disc
   * before its label): hidden from assistive tech, so the text carries the name once.
   * Pass it in place of `accessibilityLabel`.
   */
  decorative?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For layout composition only (not styling): the fill, radius, and size come from props. */
  style?: LayoutStyle;
}

/** The palette a picker sample shows, or null for a plain color sample (no palette prop). */
export function paletteOf(p: Pick<SwatchProps, Palette>): Palette | null {
  if (!p.violet && !p.cyan && !p.mint && !p.rose && !p.amber) return null;
  return requestedPaletteOf(p);
}

/** A palette's name as a picker announces it ("Violet"). */
export function paletteName(palette: Palette): string {
  return palette.charAt(0).toUpperCase() + palette.slice(1);
}

/**
 * A palette's disc fill: the hand-off navbar's `oklch(.72 .17 hue)`, the same in both
 * schemes, since the disc names the hue rather than painting the accent of a scheme.
 */
export function paletteDiscColor(palette: Palette): string {
  return oklchHex(PICKER_DISC.l, PICKER_DISC.c, paletteHue[palette]);
}

const PICKER_DISC = { l: 0.72, c: 0.17 } as const;

// Size precedence when more than one is passed: first match wins.
export function sizeOf(p: SwatchProps): SwatchSize {
  if (p.tiny) return "tiny";
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

// Whether `block` stretches the sample itself: `circle` and `inline` each keep its
// square edge and widen only the root (the shell says why where it reads this).
export function stretchesOf(p: Pick<SwatchProps, "block" | "circle" | "inline">): boolean {
  return p.block === true && !p.circle && !p.inline;
}

// The value lines' face. The type itself (size, line box, weight) is the skin's, and it
// does NOT scale with the size axis: a color sheet mixes sample sizes down one page and
// the captions have to keep one rhythm.
const MONO_TYPE = { fontFamily: MONO_FONT };

/** The text of a name node, when it is text at all (so it can be read into the accessible name). */
function textOf(node: ReactNode): string | null {
  if (typeof node === "string") return node.trim() === "" ? null : node;
  if (typeof node === "number") return String(node);
  return null;
}

/**
 * The data-carrying accessible name. `role="img"` makes the whole subtree
 * presentational, so a screen reader never reaches the rendered name/value/detail
 * lines: whatever a sighted user reads off the sample has to be folded into the NAME
 * (the kit's charts rule). Falls back to the raw color string, so a bare
 * `<Swatch color="#4f39f6" />` still announces something instead of shipping an
 * unnamed image (WCAG 1.1.1).
 */
function dataName(name: string | null, value?: string, detail?: string, color?: string, selected?: boolean): string {
  const parts = [name, value, detail].filter((p): p is string => p != null && p !== "");
  const base = parts.length > 0 ? parts.join(", ") : (color ?? "");
  return selected ? `${base}, selected` : base;
}

/** Build a Swatch from a platform skin. */
export function createSwatch(skin: SwatchSkin) {
  return function Swatch(props: SwatchProps) {
    const { color, children, value, detail, circle, ring, inline, block, selected, accessibilityLabel, decorative, testID, style } = props;
    const { tokens } = useTheme();
    // HUG (src/style/sizing.ts): the sample keeps its content width inside a stretching
    // Column and otherwise takes its parent's alignment, so a Chip's centred row centres
    // the 20 px disc it carries; a static flex-start here pinned it to the chip's top.
    const hug = useHugStyle();
    const size = sizeOf(props);
    const edge = skin.box[size];
    const palette = paletteOf(props);
    if (palette) return <PalettePick skin={skin} palette={palette} {...props} />;

    // A name node (an Icon row, a formatted element) cannot be read into the
    // accessible name, and role="img" hides it, so the sample would announce only its
    // value. Warn in dev; the caller fixes it with accessibilityLabel.
    const name = textOf(children);
    devWarn(
      children != null && name == null && accessibilityLabel == null && !decorative,
      "[canvas] <Swatch />: `children` is a node, not text, so the name cannot be read into the accessible name; pass `accessibilityLabel`.",
    );
    const label = accessibilityLabel ?? dataName(name, value, detail, color, selected);
    // A decorative sample is hidden from assistive tech, as Icon's `decorative` glyph is
    // (the adjacent text carries the name); the aria-* aliases cover the web, where
    // react-native-web drops the RN-only a11y props.
    const a11y = decorative
      ? { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const, "aria-hidden": true }
      : { role: "img" as const, accessibilityLabel: label, "aria-label": label };

    // `circle` owns the shape, so it keeps the 1:1 footprint even under `block`: a
    // stretched circle is a pill, not a circle. `inline` puts the label BESIDE the
    // block, which makes the root a row, and a stretched child of a row has no width
    // of its own: `block` there collapsed the sample to a sliver. In both cases the
    // block keeps its square edge and only the ROOT widens, so the label column still
    // gets the full width.
    const stretch = stretchesOf(props);
    // The value lines' ink: the hand-off's tertiary `--tx3`.
    const subtle = tokens["subtle-foreground"] ?? tokens["muted-foreground"];
    const hasLabel = children != null || value != null || detail != null;
    // The edge the sample reads by. `ring` is the token chip's swatch (Component.dc.html
    // line 294: `box-shadow:inset 0 0 0 1px var(--ln2)`), a 1 px inset ring in the field
    // border (`--ln2`) that takes over the hairline's job; React Native 0.86 draws an inset
    // boxShadow on every platform, so it needs no border stand-in. Without it the resting
    // hairline below stays. A selected sample's ring, the hand-off's 2 px gap then 2 px of
    // the accent outside the sample, composes with it.
    const shadows = [
      ring ? `inset 0 0 0 1px ${tokens["field-border"] ?? tokens.input}` : null,
      selected ? `0 0 0 2px ${tokens.background}, 0 0 0 4px ${tokens.primary}` : null,
    ].filter((s): s is string => s != null);

    return (
      <View
        {...a11y}
        testID={testID}
        style={[
          block ? { alignSelf: "stretch" } : hug,
          {
            flexDirection: inline ? "row" : "column",
            alignItems: inline ? "center" : "flex-start",
            gap: inline ? skin.inlineGap : skin.gap,
          },
          style,
        ]}
      >
        <View
          style={[
            {
              flexShrink: 0,
              height: edge,
              width: stretch ? undefined : edge,
              alignSelf: stretch ? "stretch" : "auto",
              borderRadius: circle ? 9999 : skin.radius[size],
              backgroundColor: color ?? tokens.primary,
              // LOAD-BEARING, not decoration: do not remove. A swatch of the
              // `background` token is #ffffff on a white card in light and #09090b on
              // #18181b in dark, so without this hairline those samples have no edge
              // at all and read as blank space. The border token is the same rule the
              // rest of the kit draws its edges with, so it stays legible in both
              // schemes and never competes with the fill. `ring` draws that edge as the
              // inset ring instead (see `shadows` above), so the hairline steps aside.
              borderWidth: ring ? 0 : StyleSheet.hairlineWidth,
              borderColor: tokens.border,
              // The inset ring and the selection ring, drawn so the layout never moves.
              boxShadow: shadows.length ? shadows.join(", ") : undefined,
            },
            skin.shape,
          ]}
        />
        {hasLabel ? (
          <View style={{ flexShrink: 1, gap: skin.lineGap }}>
            {children != null ? (
              <Text style={[skin.name, { color: tokens.foreground }]}>{children}</Text>
            ) : null}
            {value != null ? (
              <Text style={[skin.value, MONO_TYPE, { color: subtle }]}>{value}</Text>
            ) : null}
            {detail != null ? (
              <Text style={[skin.detail, MONO_TYPE, { color: subtle }]}>{detail}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  };
}

/**
 * The palette picker: the hand-off docs navbar's hue swatch, a 16 px disc of the
 * palette's hue that is a radio named for the palette. The palette in force wears the
 * selection ring (a 2 px gap in the card colour, then a 2 px muted-foreground band);
 * the others draw none. On the web a hovered disc grows by the skin's `pickerHover`
 * scale; the hover target is the Pressable, which never moves, and the disc inside it
 * scales, ring included, as the hand-off's button does.
 */
function PalettePick(props: SwatchProps & { skin: SwatchSkin; palette: Palette }) {
  const { skin, palette, selected, onPress, accessibilityLabel, testID, style } = props;
  const { tokens } = useTheme();
  const motion = skin.pickerHover;
  const { hovered, target } = useHover(motion != null);
  const reduced = useReducedMotion();
  const minTarget = platformMinTarget();
  // The navbar's 16 px disc by default; a size boolean takes the sample's own edge for that
  // size (`small` is the hand-off wizard's 32 px hue disc), so a picker in a form reads at
  // the size of the samples beside it.
  const size = sizeOf(props);
  const edge = size === "default" ? skin.picker : skin.box[size];
  const label = accessibilityLabel ?? paletteName(palette);
  const grow: ViewStyle | null = motion
    ? ({
        ...(hovered ? { transform: [{ scale: motion.scale }] } : null),
        transitionProperty: "transform",
        transitionDuration: `${reduced ? 0 : motion.duration}ms`,
        transitionTimingFunction: motion.easing,
      } as unknown as ViewStyle)
    : null;
  return (
    <Pressable
      {...target}
      hitSlop={minTarget == null ? undefined : Math.max(0, (minTarget - edge) / 2)}
      accessibilityRole="radio"
      accessibilityLabel={label}
      aria-label={label}
      accessibilityState={{ checked: !!selected }}
      aria-checked={!!selected}
      onPress={onPress}
      testID={testID}
      style={[{ width: edge, height: edge, flexShrink: 0 }, style]}
    >
      <View
        style={[
          {
            pointerEvents: "none",
            width: edge,
            height: edge,
            borderRadius: 9999,
            backgroundColor: paletteDiscColor(palette),
            boxShadow: selected ? `0 0 0 2px ${tokens.card}, 0 0 0 4px ${tokens["muted-foreground"]}` : undefined,
          },
          grow,
        ]}
      />
    </Pressable>
  );
}
