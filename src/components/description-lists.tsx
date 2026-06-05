import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";

// DescriptionList: term/value pairs for detail panels, settings, and profile
// views. Each item is a { term, value } pair. The term is the small muted
// label; the value is the full-weight data it describes, so the data always
// outranks its label.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf / Card's surfaceOf).
//
// - Layout (pick one): `inline` lays the term on the left and the value on the
//   right of a single row; the default stacks the value beneath the term.
// - Rows: `divided` draws a hairline (border-b border-border) under every row
//   but the last, for the two-column detail look.
// - Surface: `card` wraps the whole list in a card surface (border, radius,
//   padding) so it reads as a self-contained panel.
//
// Layout, rows, and surface are orthogonal axes and combine freely.

export interface DescriptionListItem {
  term: string;
  value: string;
}

export interface DescriptionListProps {
  items: DescriptionListItem[];
  // Layout (pick one; default is stacked, value beneath term).
  inline?: boolean;
  // Rows: hairline divider beneath every row but the last.
  divided?: boolean;
  // Surface: wrap the list in a card surface.
  card?: boolean;
  className?: string;
}

type Layout = "inline" | "stacked";

// Layout precedence when more than one is passed: first match wins.
function layoutOf(p: DescriptionListProps): Layout {
  if (p.inline) return "inline";
  return "stacked";
}

const CARD_SURFACE = "rounded-lg border border-border bg-card shadow-sm p-6";

// Term: small, muted label. Value: full-weight foreground data.
const TERM_LABEL = "text-sm text-muted-foreground";
const VALUE_LABEL = "text-sm font-medium text-foreground";

export function DescriptionList(props: DescriptionListProps) {
  const { items, divided, card, className } = props;
  const layout = layoutOf(props);

  const container = cn(card ? CARD_SURFACE : null, "gap-3", className);

  return (
    <Box className={container}>
      {items.map((item, index) => {
        const last = index === items.length - 1;
        // A divided list draws a hairline under each row except the last, and
        // pads the row vertically so the rule sits clear of the text.
        const row = cn(
          layout === "inline"
            ? "flex-row items-baseline justify-between gap-4"
            : "gap-1",
          divided && "pb-3",
          divided && !last && "border-b border-border",
        );
        return (
          <Box key={`${item.term}-${index}`} className={row}>
            <Text className={TERM_LABEL}>{item.term}</Text>
            <Text className={cn(VALUE_LABEL, layout === "inline" && "text-right")}>
              {item.value}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
