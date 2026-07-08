import { View, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Button } from "../../atoms/button/button.js";
import * as s from "./empty-state.styles.js";
import { type Tone, type EmptyStateSkin } from "./empty-state.styles.js";

// Shared EmptyState shell. The structure (a centered, calm column: a round icon
// disc, a semibold title, a muted description, and an optional primary action),
// the boolean-prop axes, the tone precedence, and the semantic color logic live
// here once; a platform file supplies only its skin (card radius, density/spacing,
// type tracking) and calls createEmptyState.
//
// Empty state: a centered, calm column that explains why a region is empty and,
// when the user can act, offers the one action that fills it. Anatomy mirrors the
// docs entry: a round 48x48 icon disc, a gap, a semibold title, a muted
// description, and an optional primary action button.
//
// EmptyState is a "Light" platform treatment: one structure and one set of
// (semantic) colors, with per-OS touches limited to the bordered card's radius,
// the column density/spacing, and the title/description type tracking. The
// optional action is the already-skinned Button atom, which brings its own per-OS
// fidelity (shape + press feedback), so this molecule's skin does NOT cover it and
// the surface has no pressable of its own.
//
// Boolean-prop API: flat booleans grouped into axes, first-match precedence within
// an axis (mirrors Button's intentOf).
//
// - Tone axis: `positive` paints the disc and glyph green for states where
//   emptiness is good news (no errors, all caught up). The default tone keeps the
//   disc muted and the glyph muted-foreground for routinely-empty states.
// - Container axis: `bordered` wraps the column in a rounded, bordered card (used
//   inside a SectionCard or a table cell). Omit for a bare column.
// - Density axis: `compact` tightens the card padding for dense table cells.

export interface EmptyStateProps {
  /** A glyph (emoji or icon character) shown in the disc. */
  icon?: string;
  /** Short, neutral headline naming the empty result. */
  title?: string;
  /** One reassuring line, ideally pointing at the next step. */
  description?: string;
  /** When set, renders a primary action button below the description. */
  actionLabel?: string;
  /** Called when the action button is pressed. */
  onAction?: () => void;
  // Tone axis (pick one; default keeps the disc muted).
  positive?: boolean;
  // Container axis: wrap the column in a bordered card.
  bordered?: boolean;
  // Density axis (only affects the bordered card's padding).
  compact?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// Tone precedence: first match wins.
function toneOf(p: EmptyStateProps): Tone {
  return p.positive ? "positive" : "default";
}

export function createEmptyState(skin: EmptyStateSkin) {
  return function EmptyState(props: EmptyStateProps) {
    const { icon, title, description, actionLabel, onAction, bordered, compact, testID, style } = props;
    const { tokens } = useTheme();
    const tone: Tone = toneOf(props);

    const container: StyleProp<ViewStyle> = [
      skin.container,
      bordered ? skin.borderedBase : null,
      bordered ? s.borderedSurface(tokens) : null,
      bordered ? skin.borderedPad[compact ? "compact" : "default"] : null,
      style,
    ];

    return (
      <View testID={testID} style={container}>
        {icon != null ? (
          // The disc glyph is purely decorative; the title carries the meaning.
          // Emoji announce their own accessible name, so hide the disc from
          // assistive tech. react-native-web does not forward
          // accessibilityElementsHidden to the DOM, so add the aria-hidden alias.
          <View
            style={[skin.discBase, s.discTone(tokens, tone)]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            aria-hidden
          >
            <Text style={[skin.glyph, s.glyphTone(tokens, tone)]}>{icon}</Text>
          </View>
        ) : null}
        {title != null ? <Text style={skin.title(tokens)}>{title}</Text> : null}
        {description != null ? <Text style={skin.description(tokens)}>{description}</Text> : null}
        {actionLabel != null ? (
          <View style={skin.actionSpacing}>
            <Button primary small onPress={onAction}>
              {actionLabel}
            </Button>
          </View>
        ) : null}
      </View>
    );
  };
}
