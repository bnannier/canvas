import { View, Text, type StyleProp, type ViewStyle, useTheme } from "../../style/index.js";
import { Button } from "../../atoms/button/button.js";
import * as s from "./empty-state.styles.js";

// Empty state: a centered, calm column that explains why a region is empty and,
// when the user can act, offers the one action that fills it. Anatomy mirrors
// the docs entry: a round 48x48 icon disc, a 12px gap, a semibold title, a
// muted description, and an optional primary action button.
//
// Boolean-prop API: flat booleans grouped into axes, first-match precedence
// within an axis (mirrors Button's intentOf).
//
// - Tone axis: `positive` paints the disc and glyph green for states where
//   emptiness is good news (no errors, all caught up). The default tone keeps
//   the disc muted and the glyph muted-foreground for routinely-empty states.
// - Container axis: `bordered` wraps the column in a rounded, bordered card
//   (used inside a SectionCard or a table cell). Omit for a bare column.
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
  /** Escape hatch for layout/positioning composition (width, margins). */
  style?: StyleProp<ViewStyle>;
}

// Tone precedence: first match wins.
function isPositive(p: EmptyStateProps): boolean {
  return !!p.positive;
}

export function EmptyState(props: EmptyStateProps) {
  const { icon, title, description, actionLabel, onAction, bordered, compact, style } = props;
  const { tokens } = useTheme();
  const tone: s.Tone = isPositive(props) ? "positive" : "default";

  const container: StyleProp<ViewStyle> = [
    s.container,
    bordered ? s.borderedBase : null,
    bordered ? s.borderedSurface(tokens) : null,
    bordered ? s.borderedPad[compact ? "compact" : "default"] : null,
    style,
  ];

  return (
    <View style={container}>
      {icon != null ? (
        <View style={[s.discBase, s.discTone(tokens, tone)]}>
          <Text style={[s.glyphBase, s.glyphTone(tokens, tone)]}>{icon}</Text>
        </View>
      ) : null}
      {title != null ? <Text style={s.title(tokens)}>{title}</Text> : null}
      {description != null ? <Text style={s.description(tokens)}>{description}</Text> : null}
      {actionLabel != null ? (
        <View style={s.actionSpacing}>
          <Button primary small onPress={onAction}>
            {actionLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}
