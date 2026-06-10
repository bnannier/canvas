import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle, type ColorTokens } from "../../style/index.js";
import * as s from "./pagination.styles.js";
import { type Size } from "./pagination.styles.js";

// Pagination is page-of-N navigation for tables and lists: a horizontal row of
// page-number buttons flanked by Prev/Next controls, with the current page
// highlighted. When there are too many pages to show at once, the middle is
// truncated with an ellipsis glyph, keeping the first page, the last page, and a
// small window around the current page.
//
// Boolean-prop API across two axes (mirrors Button's intentOf precedence; first
// match wins within an axis, axes are orthogonal):
//   - Variant: `withSize` prepends a "Rows per page" size selector to the
//     compact Prev/Next + "Page X of N" layout; `compact` collapses the number
//     row to just Prev/Next plus a "Page X of N" label; the default is the full
//     numbered row. Precedence when more than one is passed: withSize, then
//     compact, then the numbered default.
//   - Size: `small`, `large` (omit for the default, medium size).
//
// There is no icon utility at this layer, so Prev/Next use reading-direction
// single guillemet glyphs ("‹" / "›") rendered as Text rather than SVG chevrons,
// the size selector uses a "▾" caret glyph, and the truncation gap is an ellipsis
// glyph ("…").

export interface PaginationProps {
  /** Current page, 1-based. Clamped into the 1..total range before rendering. */
  page?: number;
  /** Total number of pages. */
  total?: number;
  /** Fired with the next 1-based page when a control or number is pressed. */
  onChange?: (page: number) => void;

  // Variant (pick one; default is the full numbered row).
  /** Collapse to Prev/Next plus a "Page X of N" label, no number buttons. */
  compact?: boolean;
  /**
   * Prepend a "Rows per page" size selector to the compact Prev/Next +
   * "Page X of N" layout. Takes precedence over `compact`.
   */
  withSize?: boolean;

  // Content for the `withSize` selector.
  /** Currently selected rows-per-page value shown in the selector. */
  pageSize?: number;
  /** Selectable rows-per-page values; pressing the selector advances through them. */
  pageSizes?: number[];
  /** Fired with the next rows-per-page value when the selector is pressed. */
  onPageSizeChange?: (size: number) => void;

  // Size (pick one; default is the medium size).
  small?: boolean;
  large?: boolean;

  disabled?: boolean;
  /** Escape hatch for layout/positioning composition (margins, alignment). */
  style?: StyleProp<ViewStyle>;
}

// Size precedence when more than one is passed: first match wins.
function sizeOf(p: PaginationProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

type Variant = "withSize" | "compact" | "numbered";

// Variant precedence when more than one is passed: first match wins.
function variantOf(p: PaginationProps): Variant {
  if (p.withSize) return "withSize";
  if (p.compact) return "compact";
  return "numbered";
}

// Sentinel inserted into the page list for a truncation gap.
const GAP = -1;

// Compute the windowed page list: first page, last page, and a one-page window
// around the current page, with GAP sentinels marking truncated stretches. For
// small totals (<= 7) every page is shown.
function pageWindow(current: number, total: number): number[] {
  if (total <= 7) {
    const all: number[] = [];
    for (let p = 1; p <= total; p++) all.push(p);
    return all;
  }
  const list: number[] = [];
  const add = (p: number) => {
    if (!list.includes(p)) list.push(p);
  };
  add(1);
  if (current > 3) list.push(GAP);
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) add(p);
  if (current < total - 2) list.push(GAP);
  add(total);
  return list;
}

interface ControlProps {
  glyph: string;
  size: Size;
  tokens: ColorTokens;
  disabled: boolean;
  accessibilityLabel: string;
  onPress: () => void;
}

// A Prev/Next chevron control. Reads as a square page button without a number.
function Control({ glyph, size, tokens, disabled, accessibilityLabel, onPress }: ControlProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        s.controlBox(tokens),
        s.itemSize[size],
        disabled ? { opacity: 0.5 } : null,
        pressed ? { opacity: 0.9 } : null,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      <Text style={[s.controlLabel(tokens), s.labelSize[size]]}>{glyph}</Text>
    </Pressable>
  );
}

export function Pagination(props: PaginationProps) {
  const { onChange, disabled, style } = props;
  const size = sizeOf(props);
  const variant = variantOf(props);
  const { tokens } = useTheme();

  // Clamp inputs so the control never renders an out-of-range current page.
  const total = Math.max(1, Math.floor(props.total ?? 1));
  const current = Math.min(Math.max(1, Math.floor(props.page ?? 1)), total);

  const atStart = current <= 1;
  const atEnd = current >= total;

  const go = (next: number) => {
    if (disabled) return;
    const clamped = Math.min(Math.max(1, next), total);
    if (clamped !== current) onChange?.(clamped);
  };

  const prev = (
    <Control
      glyph="‹"
      size={size}
      tokens={tokens}
      disabled={disabled || atStart}
      accessibilityLabel="Previous page"
      onPress={() => go(current - 1)}
    />
  );
  const next = (
    <Control
      glyph="›"
      size={size}
      tokens={tokens}
      disabled={disabled || atEnd}
      accessibilityLabel="Next page"
      onPress={() => go(current + 1)}
    />
  );

  // Compact: Prev/Next bracketing a "Page X of N" indicator, no number buttons.
  if (variant === "compact") {
    return (
      <View style={[s.compactRow, style]}>
        {prev}
        <Text style={[s.mutedLabel(tokens), s.labelSize[size]]}>
          {`Page ${current} of ${total}`}
        </Text>
        {next}
      </View>
    );
  }

  // With-size: a "Rows per page" selector ahead of the compact indicator and the
  // Prev/Next controls. There is no native select, so the selector is a closed
  // trigger (value + caret) that advances through `pageSizes` on press.
  if (variant === "withSize") {
    const sizes = props.pageSizes ?? [10, 25, 50];
    const pageSize = props.pageSize ?? sizes[0] ?? 10;
    const cycleSize = () => {
      if (disabled) return;
      const i = sizes.indexOf(pageSize);
      const nextSize = sizes[(i + 1) % sizes.length];
      if (nextSize !== undefined && nextSize !== pageSize) props.onPageSizeChange?.(nextSize);
    };
    return (
      <View style={[s.withSizeRow, style]}>
        <View style={s.selectorCluster}>
          <Text style={[s.mutedLabel(tokens), s.labelSize[size]]}>Rows per page</Text>
          <Pressable
            style={[s.selectorBox(tokens), s.itemSize[size], disabled ? { opacity: 0.5 } : null]}
            onPress={cycleSize}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Rows per page"
          >
            <Text style={[s.controlLabel(tokens), s.labelSize[size]]}>{pageSize}</Text>
            <Text style={[s.mutedLabel(tokens), s.labelSize[size]]}>▾</Text>
          </Pressable>
        </View>
        <Text style={[s.mutedLabel(tokens), s.labelSize[size]]}>
          {`Page ${current} of ${total}`}
        </Text>
        <View style={s.controlPair}>
          {prev}
          {next}
        </View>
      </View>
    );
  }

  // Numbered (default): a windowed row of page buttons with ellipsis gaps.
  const window = pageWindow(current, total);

  return (
    <View style={[s.numberedRow, style]}>
      {prev}
      {window.map((p, i) => {
        if (p === GAP) {
          return (
            <Text
              key={`gap-${i}`}
              style={[s.gapLabel(tokens), s.labelSize[size]]}
              accessibilityElementsHidden
            >
              …
            </Text>
          );
        }
        const selected = p === current;
        return (
          <Pressable
            key={`page-${p}`}
            style={({ pressed }) => [
              s.pageBox(tokens, selected),
              s.itemSize[size],
              disabled ? { opacity: 0.5 } : null,
              pressed ? { opacity: 0.9 } : null,
            ]}
            onPress={() => go(p)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Page ${p}`}
            accessibilityState={{ selected, disabled: !!disabled }}
          >
            <Text style={[s.pageLabel(tokens, selected), s.labelSize[size]]}>{p}</Text>
          </Pressable>
        );
      })}
      {next}
    </View>
  );
}
