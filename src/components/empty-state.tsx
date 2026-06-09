import { cn } from "../cn.js";
import { View, Text } from "../engine/index.js";
import { Button } from "./button.js";

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
  className?: string;
}

// Tone precedence: first match wins.
function isPositive(p: EmptyStateProps): boolean {
  return !!p.positive;
}

const DISC_BASE = "mb-3 h-12 w-12 items-center justify-center rounded-full";
const DISC_TONE = {
  positive: "bg-green-600/10",
  default: "bg-muted",
};
const GLYPH_TONE = {
  positive: "text-green-600",
  default: "text-muted-foreground",
};

export function EmptyState(props: EmptyStateProps) {
  const { icon, title, description, actionLabel, onAction, bordered, compact, className } = props;
  const tone = isPositive(props) ? "positive" : "default";

  const container = cn(
    "items-center",
    bordered && "rounded-lg border border-border",
    bordered && (compact ? "px-4 py-6" : "px-6 py-8"),
    className,
  );

  return (
    <View className={container}>
      {icon != null ? (
        <View className={cn(DISC_BASE, DISC_TONE[tone])}>
          <Text className={cn("text-xl", GLYPH_TONE[tone])}>{icon}</Text>
        </View>
      ) : null}
      {title != null ? (
        <Text className="text-center text-base font-semibold text-foreground">{title}</Text>
      ) : null}
      {description != null ? (
        <Text className="mt-1 text-center text-sm text-muted-foreground">{description}</Text>
      ) : null}
      {actionLabel != null ? (
        <View className="mt-4">
          <Button primary small onPress={onAction}>
            {actionLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}
