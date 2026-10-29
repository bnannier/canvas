import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { Fragment, type ReactNode } from "react";
import { View, Text, StyleSheet, useHugStyle, type ColorTokens, type ViewStyle, type TextStyle, type LayoutStyle, GlassPane, paneStyle } from "../../style/index.js";

// Shared Kbd shell. Kbd is a keyboard shortcut indicator: a small bordered, raised key
// cap with a mono label. A single key comes from `children` (<Kbd>Esc</Kbd>); a whole
// shortcut comes from `keys` (<Kbd keys="⌘ K" />), which renders one cap per key (and
// "then" between the caps of a sequence) so the component owns the composition instead
// of pushing a Row + N caps + N-1 separators onto every call site.
//
// The cap has three axes. Size: the 24px cap, `small` (22, the hand-off's compact hint
// cap) or `tiny` (20). Density: `comfortable`, the key the hand-off's component page sets
// beside a key's effect, padded 3px above and below its label and 8px at the sides (the
// 24px cap's alone; a size step wins over it). Edge: `flat`, the hint cap's one-pixel edge
// all round in the secondary ink, where the default cap is raised on a 2px bottom edge in
// the foreground ink. The structure, accessibility, and token-driven colors
// live here once, and a platform file supplies only its skin (cap geometry, label type,
// chord row) and calls createKbd.
//
// Kbd is a "Shared" platform treatment: neither iOS (no native keyboard-key cap
// element) nor Material 3 (no keyboard-key cap component) has a native control, so all
// three platforms render ONE look. The per-OS skins reference the same values as the
// web skin; only the cross-platform shape and token-driven surface remain.

export interface KbdSkin {
  /** The key-cap box geometry: a centered row, fixed cap height, min width, radius, border width, padding. */
  capBox: ViewStyle;
  /** The `comfortable` cap: the same corner and edge, padded around the label instead of held at the cap height. */
  comfortableCapBox: ViewStyle;
  /** The compact size steps: each cap's box and its label type. */
  sizes: Record<KbdSize, { capBox: ViewStyle; labelType: TextStyle }>;
  /** The key label type (size / line-height / weight / tracking). */
  labelType: TextStyle;
  /** The "then" between the caps of a sequence. */
  separatorType: TextStyle;
  /** The chord wrapper: a centered row holding each cap and its separator. */
  chordRow: ViewStyle;
}

export interface KbdProps {
  /** A single key label, rendered as one cap. Ignored when `keys` is set. */
  children?: ReactNode;
  /**
   * A multi-key shortcut (a combo, pressed together), rendered as one cap per key.
   * Pass a whitespace-separated string (`"⌘ K"`) or an array (`["⌘", "K"]`). A single
   * entry renders one cap, identical to passing that key as `children`. When set, `keys`
   * takes precedence over `children`.
   */
  keys?: string | string[];
  /**
   * Render a key SEQUENCE (press one, then the next): the caps are separated by "then".
   * Only affects the `keys` form.
   */
  sequence?: boolean;
  /**
   * The comfortable cap: padded 3 px above and below its label and 8 px at the sides
   * (25 px tall), the key the hand-off's component page sets beside a key's effect.
   * Omit for the 24 px cap with 6 px sides.
   */
  comfortable?: boolean;
  /**
   * The compact 22 px cap: 6 px sides on the small key corner, a 500 11 px label on a 20 px line
   * (the hint a search field or a command palette shows, `<Kbd small flat>`). Size
   * precedence: `small` > `tiny`; a size step wins over `comfortable`.
   */
  small?: boolean;
  /** The compact 20 px cap: 5 px sides on the tiny key corner, a 500 10 px label on an 18 px line. */
  tiny?: boolean;
  /**
   * The hint cap's edge: one pixel all round (no raised 2 px bottom) and the label in the
   * secondary ink, the keycap a field or a menu shows beside what it opens.
   */
  flat?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

export type KbdDensity = "comfortable" | "default";
export type KbdSize = "small" | "tiny";
export type KbdEdge = "flat" | "raised";

/** The size axis: `small` wins over `tiny`; null is the 24 px cap. */
export function sizeOf(p: Pick<KbdProps, "small" | "tiny">): KbdSize | null {
  if (p.small) return "small";
  if (p.tiny) return "tiny";
  return null;
}

/** The edge axis: `flat`, or the raised default. */
export function edgeOf(p: Pick<KbdProps, "flat">): KbdEdge {
  return p.flat ? "flat" : "raised";
}

/** The density axis: a single opt-in today, resolved here so the docs record it. */
export function densityOf(p: Pick<KbdProps, "comfortable">): KbdDensity {
  if (p.comfortable) return "comfortable";
  return "default";
}

// The cap surface: the raised neutral fill inside the field border (platform-neutral,
// token-driven so the cap follows light/dark). Under glass the cap is a static pane at
// control density: paneStyle drops both (a GlassPane's material and rim carry them).
function capSurface(tokens: ColorTokens): ViewStyle {
  return { borderColor: tokens["field-border"] ?? tokens.input, backgroundColor: tokens.secondary };
}

// The key label is the foreground ink, a flat hint cap's the secondary ink; a sequence's
// "then" the subtle ink.
function labelColor(tokens: ColorTokens, edge: KbdEdge = "raised"): TextStyle {
  return { color: edge === "flat" ? tokens["muted-foreground"] : tokens.foreground };
}

// The flat edge: the raised cap's 2px bottom brought back to the one pixel of its sides.
const FLAT_EDGE: ViewStyle = { borderBottomWidth: 1 };
function separatorColor(tokens: ColorTokens): TextStyle {
  return { color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] };
}

/** Normalize `keys` into a clean list of key labels, or null when unset/empty. */
function keyList(keys: string | string[] | undefined): string[] | null {
  if (keys == null) return null;
  const list = (Array.isArray(keys) ? keys : keys.split(/\s+/)).map((k) => `${k}`.trim()).filter(Boolean);
  return list.length > 0 ? list : null;
}

/** Build a Kbd component from a platform skin. */
export function createKbd(skin: KbdSkin) {
  return function Kbd({ children, keys, sequence, comfortable, small, tiny, flat, testID, style }: KbdProps) {
    const theme = useMaterialTheme({ static: true, layer: "control" });
    const { tokens } = theme;
    const size = sizeOf({ small, tiny });
    const edge = edgeOf({ flat });
    const step = size != null ? skin.sizes[size] : null;
    const capBox: ViewStyle = StyleSheet.flatten([
      step ? step.capBox : densityOf({ comfortable }) === "comfortable" ? skin.comfortableCapBox : skin.capBox,
      edge === "flat" ? FLAT_EDGE : null,
    ]);
    const labelType = step ? step.labelType : skin.labelType;
    const pane = <GlassPane static layer="control" shape={capBox} />;
    // HUG: a keycap keeps its content width inside a stretching Column.
    const hug = useHugStyle();

    const list = keyList(keys);

    // Single cap: a 1-key `keys` list, or `children`. Renders exactly as before.
    if (list == null || list.length === 1) {
      const label = list != null ? list[0] : children;
      return (
        <View testID={testID} style={[paneStyle(theme, [capBox, capSurface(tokens)]), hug, style]}>
          {pane}
          {label != null ? <Text style={[labelType, labelColor(tokens, edge)]}>{label}</Text> : null}
        </View>
      );
    }

    // Chord: one cap per key, and "then" between the caps of a sequence. The whole
    // shortcut reads as a single accessible name (e.g. "⌘+K", "G then C"), so a screen
    // reader announces the shortcut once instead of each cap in turn; the caps and
    // separators are hidden from the tree as decorative.
    const name = list.join(sequence ? " then " : "+");
    return (
      <View
        testID={testID}
        // The chord is announced once, as a unit, rather than cap by cap. That needs a
        // role the name can sit on: react-native-web maps accessibilityRole="text" to
        // no DOM role at all, so the aria-label was landing on a generic div, which
        // ARIA prohibits naming. img is the role for a group of glyphs read as one
        // thing, and is what Swatch and the named status Badge use for the same reason.
        accessibilityRole="image"
        role="img"
        accessibilityLabel={name}
        aria-label={name}
        style={[skin.chordRow, hug, style]}
      >
        {list.map((key, i) => (
          <Fragment key={i}>
            {i > 0 && sequence ? (
              <Text
                style={[skin.separatorType, separatorColor(tokens)]}
                importantForAccessibility="no-hide-descendants"
                aria-hidden
              >
                then
              </Text>
            ) : null}
            <View
              style={[paneStyle(theme, [capBox, capSurface(tokens)])]}
              importantForAccessibility="no-hide-descendants"
              aria-hidden
            >
              {pane}
              <Text style={[labelType, labelColor(tokens, edge)]}>{key}</Text>
            </View>
          </Fragment>
        ))}
      </View>
    );
  };
}
