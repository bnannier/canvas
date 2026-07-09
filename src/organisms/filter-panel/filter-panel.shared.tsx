import { useState } from "react";
import { View, Text, Pressable, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Badge as WebBadge } from "../../atoms/badge/badge.js";
import { Button } from "../../atoms/button/button.js";
import { Checkbox as WebCheckbox } from "../../atoms/checkbox/checkbox.js";
import {
  type Density,
  type FilterPanelSkin,
  type CheckboxComponent,
  type BadgeComponent,
} from "./filter-panel.styles.js";

// Shared FilterPanel shell. The structure (the fixed-width column, the
// header with the "Filters" title + active-count badge + Clear action, and the
// grouped checkbox list), the public boolean-prop API (`bordered`, `compact`),
// the density precedence, the change/clear handlers, and accessibility all live
// here once. A platform file supplies only its skin (panel radius, padding/gap
// density, group-heading type, and the press feedback on this component's OWN
// option rows) and calls createFilterPanel.
//
// FilterPanel COMPOSES the already-skinned Checkbox and Badge atoms: each
// platform wrapper passes its own Checkbox/Badge variant into createFilterPanel
// (the way alert-dialog passes the platform Input), so the rows read native per
// OS without this organism re-skinning either atom. The literal `.ios`/`.android`
// atom imports in those wrappers are required for the WEB docs 3-up, where a
// barrel import would resolve the web atoms in every column.
//
// FilterPanel is a "Light" platform treatment: one structure, with per-OS touches
// limited to panel radius, spacing density, group-heading tracking, and press
// feedback (Android ripple on the option rows; iOS/web opacity dim).

export interface FilterOption {
  /** Row label, shown beside the checkbox. */
  label: string;
  /** Whether this option is initially checked (uncontrolled seed). */
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
  /** Active-filter count shown next to the "Filters" title. Omit to derive it from the checked options. */
  activeCount?: number;
  /** Fired when the header "Clear" action is pressed. */
  onClear?: () => void;
  /** Fired when an option row toggles, with its group/option indexes and next value. */
  onChange?: (groupIndex: number, optionIndex: number, next: boolean) => void;
  // Surface (pick one path): a rounded, bordered card vs. a bare panel.
  bordered?: boolean;
  // Density (pick one): tighten the panel's padding and row spacing.
  compact?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// Density precedence when more than one is passed: first match wins. There is a
// single density flag today, so this collapses to compact vs. the default.
function densityOf(p: FilterPanelProps): Density {
  if (p.compact) return "compact";
  return "base";
}

/**
 * Build a FilterPanel component from a platform skin.
 *
 * `Checkbox` / `Badge` are the platform-correct atoms for the option rows and
 * counts. Each platform's thin `.tsx`/`.ios`/`.android` file passes the variants
 * it already resolves for that platform, so the rows match the panel's OS. They
 * default to the WEB atoms because a bare barrel import always resolves the WEB
 * atoms in a browser bundler, which is wrong in the docs 3-up; the device Metro
 * resolves the right atoms by extension regardless, so the defaults only matter
 * for the web column.
 */
export function createFilterPanel(
  skin: FilterPanelSkin,
  Checkbox: CheckboxComponent = WebCheckbox,
  Badge: BadgeComponent = WebBadge,
) {
  return function FilterPanel(props: FilterPanelProps) {
    const { groups, activeCount, onClear, onChange, bordered, testID, style } = props;
    const { tokens } = useTheme();
    const density = densityOf(props);

    const ripple = skin.rowRipple ? skin.rowRipple(tokens) : undefined;

    // Uncontrolled checked state, seeded from each option's `checked` flag, so a
    // bare panel actually toggles filters on press instead of ignoring the tap.
    // `onChange` still fires so a parent can mirror the selection.
    const [checkedKeys, setCheckedKeys] = useState<Set<string>>(() => {
      const seeded = new Set<string>();
      props.groups.forEach((group, gi) =>
        group.options.forEach((option, oi) => {
          if (option.checked) seeded.add(`${gi}:${oi}`);
        }),
      );
      return seeded;
    });
    const isChecked = (gi: number, oi: number) => checkedKeys.has(`${gi}:${oi}`);
    const toggle = (gi: number, oi: number) => {
      const key = `${gi}:${oi}`;
      const next = !checkedKeys.has(key);
      setCheckedKeys((prev) => {
        const updated = new Set(prev);
        if (next) updated.add(key);
        else updated.delete(key);
        return updated;
      });
      onChange?.(gi, oi, next);
    };
    const clearAll = () => {
      setCheckedKeys(new Set());
      onClear?.();
    };
    // The header badge tracks the live checked count; an explicit `activeCount`
    // overrides it for callers that manage the number themselves.
    const shownCount = activeCount ?? checkedKeys.size;

    return (
      <View
        testID={testID}
        style={[
          skin.panelBase,
          // `bordered` wraps it as a rounded card with a border and a card fill;
          // the bare panel keeps the same width but drops the chrome. The radius
          // comes from the skin (per-OS); the border/fill follow the tokens so it
          // tracks light/dark (the card fill stays solid under glass).
          bordered ? skin.borderedSurface(tokens) : null,
          skin.panelPad[density],
          skin.panelStack[density],
          style,
        ]}
      >
        <View style={skin.headerRow}>
          <View style={skin.titleCluster}>
            <Text style={skin.titleText(tokens)}>Filters</Text>
            {shownCount > 0 ? <Badge secondary>{String(shownCount)}</Badge> : null}
          </View>
          <Button ghost small onPress={clearAll}>
            Clear
          </Button>
        </View>

        {groups.map((group, gi) => (
          <View key={gi} style={[skin.groupColumn, skin.groupGap[density]]}>
            <Text style={skin.groupTitle(tokens)}>{group.title}</Text>
            <View style={[skin.groupColumn, skin.groupGap[density]]}>
              {group.options.map((option, oi) => (
                // The option row is this component's OWN pressable: tapping it
                // anywhere toggles the option, so the whole row is the tap target.
                // Android shows a ripple; iOS/web dim the row on press (the web
                // skin sets neither, so the web row stays visually identical to its
                // previous plain-View look). The Checkbox is rendered as a
                // non-interactive visual mirror of the state (`pointerEvents` off,
                // no onChange) so the press goes to the row and there is a single
                // toggle path, not a double-fire.
                //
                // The row Pressable owns the only checkbox role + state in the
                // subtree, and names itself via accessibilityLabel (with the count
                // appended when present) so it announces independent of the inner
                // visual. The wrapper View hides the inner Checkbox atom entirely
                // from assistive tech (accessibilityElementsHidden +
                // importantForAccessibility on native, aria-hidden + role
                // "presentation" on web), so the inner atom's own Pressable/role
                // never surfaces a second, nested checkbox to the screen reader.
                <Pressable
                  key={oi}
                  style={({ pressed }) => [
                    skin.optionRow,
                    skin.rowPressedOpacity != null && pressed
                      ? { opacity: skin.rowPressedOpacity }
                      : null,
                  ]}
                  onPress={() => toggle(gi, oi)}
                  android_ripple={ripple}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked(gi, oi) }}
                  aria-checked={isChecked(gi, oi)}
                  accessibilityLabel={
                    option.count != null ? `${option.label}, ${option.count}` : option.label
                  }
                >
                  <View
                    style={{ pointerEvents: "none" }}
                    accessibilityElementsHidden={true}
                    importantForAccessibility="no-hide-descendants"
                    role="presentation"
                    aria-hidden
                  >
                    <Checkbox checked={isChecked(gi, oi)}>{option.label}</Checkbox>
                  </View>
                  {option.count != null ? <Badge secondary>{option.count}</Badge> : null}
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };
}
