import { cn } from "../cn.js";
import { View, Text } from "../engine/index.js";
import { Badge } from "./badge.js";
import { Button } from "./button.js";

// DescriptionList: term/value pairs for detail panels, settings, and profile
// views. Each item is a { term, value } pair. The term is the small muted
// label; the value is the full-weight data it describes, so the data always
// outranks its label.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf / Card's surfaceOf).
//
// - Layout (pick one; precedence inline > twoColumn > stacked):
//   `inline` lays the term on the left and the value on the right of a single
//   row; `twoColumn` puts the term in a fixed 160px label column with the value
//   beside it (the read-only detail look); the default `stacked` puts a small
//   uppercase muted label above a full-weight value.
// - Rows: `divided` draws a hairline (border-b border-border) under every row
//   but the last, for the two-column detail look.
// - Surface: `card` wraps the whole list in a card surface (border, radius,
//   padding) so it reads as a self-contained panel. `title`/`subtitle` add a
//   bordered header band to the card.
//
// Per-item value affordances (all optional, render the value richly):
// `badge` renders the value as a secondary metadata Badge; `status` renders it
// as a success status Badge with a leading dot (live state); `mono` sets a
// monospace face for tokens/IDs; `update` appends a trailing "Update" link
// button so an editable row is discoverable (the inline-edit affordance).
//
// Layout, rows, and surface are orthogonal axes and combine freely.

export interface DescriptionListItem {
  term: string;
  value: string;
  // Render the value as a secondary metadata badge (e.g. a role).
  badge?: boolean;
  // Render the value as a success status badge with a leading dot (live state).
  status?: boolean;
  // Monospace value face, for tokens, scopes, identifiers.
  mono?: boolean;
  // Append a trailing "Update" link affordance, marking the row editable.
  update?: boolean;
}

export interface DescriptionListProps {
  items: DescriptionListItem[];
  // Card header band (only shown when `card`): a title and optional subtitle.
  title?: string;
  subtitle?: string;
  // Layout (pick one; precedence inline > twoColumn > stacked).
  inline?: boolean;
  twoColumn?: boolean;
  stacked?: boolean;
  // Rows: hairline divider beneath every row but the last.
  divided?: boolean;
  // Surface: wrap the list in a card surface.
  card?: boolean;
  className?: string;
}

type Layout = "inline" | "twoColumn" | "stacked";

// Layout precedence when more than one is passed: first match wins.
function layoutOf(p: DescriptionListProps): Layout {
  if (p.inline) return "inline";
  if (p.twoColumn) return "twoColumn";
  return "stacked";
}

// Card surface. When a header band is present the card carries no padding (the
// header and rows supply their own px-6) so the header rule spans the full
// width; otherwise the card pads itself.
const CARD_SURFACE = "rounded-lg border border-border bg-card shadow-sm";
const CARD_PAD = "p-6";

// Term: small, muted label. The stacked layout uppercases and tracks it so the
// label reads as secondary above a full-weight value. Value: full-weight data.
const TERM_LABEL = "text-sm text-muted-foreground";
const TERM_STACKED = "text-xs font-medium uppercase tracking-wide text-muted-foreground";
const VALUE_LABEL = "text-sm font-medium text-foreground";

// Render a value cell: a badge family, a monospace token, or plain text.
function Value({ item, align }: { item: DescriptionListItem; align?: boolean }) {
  if (item.status) return <Badge status success>{item.value}</Badge>;
  if (item.badge) return <Badge secondary>{item.value}</Badge>;
  if (item.mono) {
    return (
      <Text className={VALUE_LABEL} style={{ fontFamily: "monospace" }}>
        {item.value}
      </Text>
    );
  }
  return (
    <Text className={cn(VALUE_LABEL, align && "text-right")}>{item.value}</Text>
  );
}

export function DescriptionList(props: DescriptionListProps) {
  const { items, title, subtitle, divided, card, className } = props;
  const layout = layoutOf(props);
  const hasHeader = card && !!title;

  const container = cn(
    card ? CARD_SURFACE : null,
    // No global padding when a header band supplies its own px-6 per section.
    card && !hasHeader ? CARD_PAD : null,
    !hasHeader && "gap-3",
    className,
  );
  // With a header, rows sit in their own px-6 group beneath the bordered band.
  const rowsWrap = hasHeader ? "px-6 gap-3" : null;

  const rows = items.map((item, index) => {
    const last = index === items.length - 1;
    // A divided list draws a hairline under each row except the last, and pads
    // the row vertically so the rule sits clear of the text.
    const row = cn(
      layout === "inline"
        ? "flex-row items-baseline justify-between gap-4"
        : layout === "twoColumn"
          ? "flex-row items-baseline gap-4"
          : "gap-1",
      divided && "pb-3",
      divided && !last && "border-b border-border",
    );
    return (
      <View key={`${item.term}-${index}`} className={row}>
        <Text className={cn(layout === "stacked" ? TERM_STACKED : TERM_LABEL, layout === "twoColumn" && "w-40")}>
          {item.term}
        </Text>
        <View className={cn(layout === "twoColumn" && "flex-1 flex-row items-baseline justify-between gap-4")}>
          <Value item={item} align={layout === "inline"} />
          {item.update ? (
            <Button link small>
              Update
            </Button>
          ) : null}
        </View>
      </View>
    );
  });

  return (
    <View className={container}>
      {hasHeader ? (
        <View className="border-b border-border px-6 py-4 gap-0.5">
          <Text className="text-base font-semibold text-foreground">{title}</Text>
          {subtitle ? <Text className="text-xs text-muted-foreground">{subtitle}</Text> : null}
        </View>
      ) : null}
      {rowsWrap ? <View className={rowsWrap}>{rows}</View> : rows}
    </View>
  );
}
