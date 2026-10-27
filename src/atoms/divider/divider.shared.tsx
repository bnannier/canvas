import { type ReactNode, useId } from "react";
import {
  View,
  Text,
  useTheme,
  devWarn,
  channelsOf,
  type ColorTokens,
  type ViewStyle,
  type TextStyle,
  type LayoutStyle,
} from "../../style/index.js";

// Shared Divider shell. The structure (a plain hairline rule, a vertical rule, or a
// labeled/action row of two flanking hairlines around a centered node), the boolean-prop
// axes (orientation + emphasis), and the token-backed fill logic live here once; a platform
// file supplies only its skin (rule thickness, label-row gap, label type) and calls
// createDivider.
//
// Divider is a "Shared" platform treatment: a thin rule is the same idiom on every platform
// (SwiftUI Divider, the Material 3 1dp divider, and Catalyst's <hr>), so there is no native
// shape to diverge on. The skin therefore carries the same values on iOS, Android, and web;
// the per-OS files exist only so the architecture is uniform across the kit.

export type Orientation = "horizontal" | "vertical";
export type Emphasis = "soft" | "default" | "strong";

export interface DividerSkin {
  /** Rule thickness in px (height of a horizontal/flank rule, width of a vertical rule). */
  ruleThickness: number;
  /** Gap between a flanking hairline and the centered label/action node. */
  labelGap: number;
  /** The centered label type (size / line-height / weight / tracking). */
  labelType: TextStyle;
  /** An `inset` vertical rule's own length in px, centred in its row instead of stretching to it. */
  insetLength: number;
  /** The space an `inset` vertical rule keeps on each side, in px. */
  insetMargin: number;
}

export interface DividerProps {
  /**
   * Optional middle content. With children, a horizontal divider renders a
   * flanking-line + centered-label row (the "with label" / "with action"
   * patterns). A string renders as muted label text; arbitrary nodes (e.g. a
   * button) render as-is for the action pattern. Ignored when `vertical`.
   */
  children?: ReactNode;
  // Orientation (pick one; default is horizontal).
  horizontal?: boolean;
  vertical?: boolean;
  // Emphasis (pick one; default is the hairline `border`).
  /** A quieter rule: the hairline at 60% of its strength. */
  soft?: boolean;
  /** A firmer rule: the `field-border` line, twice the hairline's strength. */
  strong?: boolean;
  /**
   * Vertical only: a short rule (18 px) centred in its row with 4 px kept on each side,
   * instead of a rule that stretches to the row's height. The separator between groups
   * in a toolbar or a floating bar. A horizontal divider ignores it.
   */
  inset?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// First match wins when more than one orientation flag is passed.
export function orientationOf(p: DividerProps): Orientation {
  if (p.vertical) return "vertical";
  return "horizontal";
}

// First match wins when more than one emphasis flag is passed.
export function emphasisOf(p: DividerProps): Emphasis {
  if (p.soft) return "soft";
  if (p.strong) return "strong";
  return "default";
}

// The rule's colour, the hand-off's Divider renderer (`K.def('divider')`): the hairline
// `border` (its `--ln`) by default, `field-border` (`--ln2`) when strong, and the hairline
// at 60% when soft (its `color-mix(in oklch, var(--ln) 60%, transparent)`, which keeps the
// colour and scales the alpha). Reads the active tokens so it follows the scheme.
function ruleColor(tokens: ColorTokens, emphasis: Emphasis): string {
  if (emphasis === "strong") return tokens["field-border"] ?? tokens.input;
  if (emphasis === "soft") {
    const c = channelsOf(tokens.border);
    return c ? `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${+(c[3] * 0.6).toFixed(3)})` : tokens.border;
  }
  return tokens.border;
}

function ruleFill(tokens: ColorTokens, emphasis: Emphasis): ViewStyle {
  return { backgroundColor: ruleColor(tokens, emphasis) };
}

// The centered label text color: muted foreground.
function labelColor(tokens: ColorTokens): TextStyle {
  return { color: tokens["muted-foreground"] };
}

export function createDivider(skin: DividerSkin) {
  return function Divider(props: DividerProps) {
    const { children, testID, style } = props;
    const orientation = orientationOf(props);
    const emphasis = emphasisOf(props);
    const { tokens } = useTheme();
    const fill = ruleFill(tokens, emphasis);
    // The label's id, for the separator that names itself after it (below).
    const labelId = useId();

    devWarn(
      !!props.inset && orientation === "horizontal",
      "[canvas] <Divider inset />: `inset` shortens a vertical rule; a horizontal divider ignores it.",
    );

    if (orientation === "vertical") {
      // A thin vertical rule that adapts to the row height it sits in, or under `inset` a
      // short rule of its own length, centred in the row with its side margins.
      const length: ViewStyle = props.inset
        ? { height: skin.insetLength, alignSelf: "center", marginHorizontal: skin.insetMargin, flexShrink: 0 }
        : { alignSelf: "stretch" };
      return (
        <View
          // `separator` announces the structural break to screen readers. We use
          // the ARIA-aligned `role` prop (not `accessibilityRole`) because RN's
          // AccessibilityRole union has no "separator" member; `role` carries it
          // cross-platform (VoiceOver/TalkBack natively, the DOM role on web).
          role="separator"
          // A separator is horizontal unless it says otherwise, so a vertical rule
          // has to: without it the web announced a vertical rule as horizontal.
          aria-orientation="vertical"
          testID={testID}
          style={[{ width: skin.ruleThickness }, length, fill, style]}
        />
      );
    }

    // Horizontal with a label/action in the middle: a centered node flanked by two hairlines.
    if (children != null) {
      const isText = typeof children === "string" || typeof children === "number";
      const flankRule: ViewStyle = {
        height: skin.ruleThickness,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "0%",
      };
      return (
        <View
          // For a text label the whole flank-line + label row reads as one structural
          // separator. For the action pattern the child is an interactive control (e.g. a
          // Button), and a `separator` is a structural ARIA role that does not expect
          // focusable/interactive descendants, so we drop the container role there: the
          // wrapper is a plain group and the child's own role (button/link/...) is what
          // assistive tech exposes. The two flanking hairlines still carry the visual break.
          role={isText ? "separator" : undefined}
          // A separator's children are presentational, so the web never read the label
          // inside it: the separator takes its name from the label instead. A reference
          // rather than a copied aria-label, meant to leave the native tree reading the
          // label text once: iOS has no labelled-by relation and reaches the label Text
          // itself, and Android only links the two (setLabeledBy).
          aria-labelledby={isText ? labelId : undefined}
          testID={testID}
          style={[{ flexDirection: "row", alignItems: "center", gap: skin.labelGap }, style]}
        >
          <View style={[flankRule, fill]} />
          {isText ? (
            <Text nativeID={labelId} style={[skin.labelType, labelColor(tokens)]}>{children}</Text>
          ) : (
            children
          )}
          <View style={[flankRule, fill]} />
        </View>
      );
    }

    // Plain horizontal hairline spanning the full width.
    return (
      <View role="separator" testID={testID} style={[{ height: skin.ruleThickness, width: "100%" }, fill, style]} />
    );
  };
}
