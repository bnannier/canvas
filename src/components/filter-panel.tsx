import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";
import { Badge } from "./badge.js";
import { Button } from "./button.js";
import { Checkbox } from "./checkbox.js";

export interface FilterOption {
  /** Row label, shown beside the checkbox. */
  label: string;
  /** Controlled checked state for this option. */
  checked?: boolean;
  /** Optional trailing count, rendered as a secondary badge. */
  count?: string;
}

export interface FilterGroup {
  /** Group heading, rendered uppercase and muted. */
  title: string;
  /** The checkbox options under this group. */
  options: FilterOption[];
}

export interface FilterPanelProps {
  /** Filter groups, each a heading plus its checkbox options. */
  groups: FilterGroup[];
  /** Active-filter count shown next to the "Filters" title in the header. */
  activeCount?: number;
  /** Fired when the header "Clear" action is pressed. */
  onClear?: () => void;
  /** Fired when an option row toggles, with its group/option indexes and next value. */
  onChange?: (groupIndex: number, optionIndex: number, next: boolean) => void;
  // Surface (pick one path): a rounded, bordered card vs. a bare panel.
  bordered?: boolean;
  // Density (pick one): tighten the panel's padding and row spacing.
  compact?: boolean;
  className?: string;
}

// Density precedence when more than one is passed: first match wins. There is a
// single density flag today, so this collapses to compact vs. the default.
function densityOf(p: FilterPanelProps): "compact" | "base" {
  if (p.compact) return "compact";
  return "base";
}

export function FilterPanel(props: FilterPanelProps) {
  const { groups, activeCount, onClear, onChange, bordered, className } = props;
  const density = densityOf(props);
  const compact = density === "compact";

  // The panel surface. `bordered` wraps it as a rounded card with a border and
  // a card fill; the bare panel keeps the same width but drops the chrome.
  const panel = cn(
    "w-[280px]",
    bordered ? "rounded-lg border border-border bg-card" : "",
    compact ? "p-3" : "p-4",
    className,
  );

  // Vertical rhythm between the header and groups, and between groups.
  const stack = compact ? "gap-3" : "gap-5";
  // Row spacing inside a group, and between a group's title and its options.
  const groupGap = compact ? "gap-1.5" : "gap-2";

  return (
    <Box className={cn("flex-col", stack, panel)}>
      <Box className="flex-row items-center justify-between">
        <Box className="flex-row items-center gap-2">
          <Text className="text-sm font-semibold text-foreground">Filters</Text>
          {activeCount != null ? <Badge secondary>{String(activeCount)}</Badge> : null}
        </Box>
        <Button ghost small onPress={onClear}>
          Clear
        </Button>
      </Box>

      {groups.map((group, gi) => (
        <Box key={gi} className={cn("flex-col", groupGap)}>
          <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {group.title}
          </Text>
          <Box className={cn("flex-col", groupGap)}>
            {group.options.map((option, oi) => (
              <Box key={oi} className="flex-row items-center justify-between gap-2">
                <Checkbox
                  checked={option.checked}
                  onChange={(next) => onChange?.(gi, oi, next)}
                >
                  {option.label}
                </Checkbox>
                {option.count != null ? <Badge secondary>{option.count}</Badge> : null}
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
