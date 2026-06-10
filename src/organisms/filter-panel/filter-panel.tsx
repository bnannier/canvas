import { View, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Badge } from "../../atoms/badge/badge.js";
import { Button } from "../../atoms/button/button.js";
import { Checkbox } from "../../atoms/checkbox/checkbox.js";
import * as s from "./filter-panel.styles.js";

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
  /** Escape hatch for layout/positioning composition (mainly width, margins). */
  style?: StyleProp<ViewStyle>;
}

// Density precedence when more than one is passed: first match wins. There is a
// single density flag today, so this collapses to compact vs. the default.
function densityOf(p: FilterPanelProps): s.Density {
  if (p.compact) return "compact";
  return "base";
}

export function FilterPanel(props: FilterPanelProps) {
  const { groups, activeCount, onClear, onChange, bordered, style } = props;
  const { tokens } = useTheme();
  const density = densityOf(props);

  return (
    <View
      style={[
        s.panelBase,
        // `bordered` wraps it as a rounded card with a border and a card fill;
        // the bare panel keeps the same width but drops the chrome.
        bordered ? s.borderedSurface(tokens) : null,
        s.panelPad[density],
        s.panelStack[density],
        style,
      ]}
    >
      <View style={s.headerRow}>
        <View style={s.titleCluster}>
          <Text style={s.titleText(tokens)}>Filters</Text>
          {activeCount != null ? <Badge secondary>{String(activeCount)}</Badge> : null}
        </View>
        <Button ghost small onPress={onClear}>
          Clear
        </Button>
      </View>

      {groups.map((group, gi) => (
        <View key={gi} style={[s.groupColumn, s.groupGap[density]]}>
          <Text style={s.groupTitle(tokens)}>{group.title}</Text>
          <View style={[s.groupColumn, s.groupGap[density]]}>
            {group.options.map((option, oi) => (
              <View key={oi} style={s.optionRow}>
                <Checkbox checked={option.checked} onChange={(next) => onChange?.(gi, oi, next)}>
                  {option.label}
                </Checkbox>
                {option.count != null ? <Badge secondary>{option.count}</Badge> : null}
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
