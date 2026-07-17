import { useMemo } from "react";
import { View, Text, Pressable, useTheme, useControllableState, RippleClip, cornerRadii, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Badge as WebBadge } from "../../atoms/badge/badge.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { Checkbox as WebCheckbox } from "../../atoms/checkbox/checkbox.js";
import {
  type Density,
  type FilterPanelSkin,
  type CheckboxComponent,
  type BadgeComponent,
  type ButtonComponent,
} from "./filter-panel.styles.js";

// Shared FilterPanel shell. The structure (the fixed-width column, the
// header with the "Filters" title + active-count badge + Clear action, and the
// grouped checkbox list), the public boolean-prop API (`bordered`, `compact`),
// the density precedence, the change/clear handlers, and accessibility all live
// here once. A platform file supplies only its skin (panel radius, padding/gap
// density, group-heading type, and the press feedback on this component's OWN
// option rows) and calls createFilterPanel.
//
// FilterPanel COMPOSES the already-skinned Checkbox, Badge, and Button atoms: each
// platform wrapper passes its own Checkbox/Badge/Button variant into
// createFilterPanel (the way field passes the platform Input/Button), so the rows
// and the header Clear action read native per OS without this organism re-skinning
// any atom. The literal `.ios`/`.android` atom imports in those wrappers are
// required for the WEB docs 3-up, where a barrel import would resolve the web
// atoms in every column.
//
// FilterPanel is a "Light" platform treatment: one structure, with per-OS touches
// limited to panel radius, spacing density, group-heading tracking, and press
// feedback (Android ripple on the option rows; iOS/web opacity dim).

export interface FilterOption {
  /** Row label, shown beside the checkbox. */
  label: string;
  /**
   * Stable key this option is identified by in the controlled `value`/`defaultValue`
   * arrays. Defaults to `"groupIndex:optionIndex"`; set it (e.g. a slug) when you
   * drive selection from a URL/query so reordering groups doesn't break the mapping.
   */
  value?: string;
  /** Whether this option is initially checked (seeds uncontrolled state when
   *  `defaultValue` is not given). */
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
  /**
   * Controlled selection: the keys of the checked options (each option's `value`,
   * falling back to `"groupIndex:optionIndex"`). Provide it with `onSelectionChange`
   * to drive or reset selection from a parent (e.g. from a URL query).
   */
  value?: string[];
  /** Initial selection for uncontrolled use. When omitted, the panel seeds from each
   *  option's `checked` flag. */
  defaultValue?: string[];
  /** Active-filter count shown next to the "Filters" title. Omit to derive it from the checked options. */
  activeCount?: number;
  /** Fired when the header "Clear" action is pressed. */
  onClear?: () => void;
  /** Fired with the full set of checked keys whenever the selection changes (both
   *  modes) — the controlled signal a parent mirrors into `value`. */
  onSelectionChange?: (selected: string[]) => void;
  /** Fired when a single option row toggles, with its group/option indexes and next
   *  value. Fires alongside `onSelectionChange`. */
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
 * `Checkbox` / `Badge` / `Button` are the platform-correct atoms for the option
 * rows, the counts, and the header Clear action. Each platform's thin
 * `.tsx`/`.ios`/`.android` file passes the variants it already resolves for that
 * platform, so the panel matches its OS. They default to the WEB atoms because a
 * bare barrel import always resolves the WEB atoms in a browser bundler, which is
 * wrong in the docs 3-up; the device Metro resolves the right atoms by extension
 * regardless, so the defaults only matter for the web column.
 */
export function createFilterPanel(
  skin: FilterPanelSkin,
  Checkbox: CheckboxComponent = WebCheckbox,
  Badge: BadgeComponent = WebBadge,
  Button: ButtonComponent = WebButton,
) {
  return function FilterPanel(props: FilterPanelProps) {
    const { groups, activeCount, onClear, onChange, onSelectionChange, bordered, testID, style } = props;
    const { tokens } = useTheme();
    const density = densityOf(props);

    const ripple = skin.rowRipple ? skin.rowRipple(tokens) : undefined;

    // Each option's stable key: its explicit `value`, else its group/option index.
    const keyOf = (gi: number, oi: number) => groups[gi].options[oi].value ?? `${gi}:${oi}`;

    // Selection is controllable: `value` drives it (a parent can sync or reset it),
    // otherwise the panel owns it, seeded from `defaultValue` or each option's
    // `checked` flag, so a bare panel toggles filters on press. `onSelectionChange`
    // fires the full set in both modes; `onChange` still fires per-toggle.
    const seededDefault = useMemo<string[]>(() => {
      if (props.defaultValue) return props.defaultValue;
      const seeded: string[] = [];
      groups.forEach((group, gi) =>
        group.options.forEach((option, oi) => {
          if (option.checked) seeded.push(option.value ?? `${gi}:${oi}`);
        }),
      );
      return seeded;
      // Seed is read once by useControllableState on mount; recomputing later is inert.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [selected, setSelected] = useControllableState<string[]>(props.value, seededDefault, onSelectionChange);
    const selectedSet = useMemo(() => new Set(selected), [selected]);

    const isChecked = (gi: number, oi: number) => selectedSet.has(keyOf(gi, oi));
    const toggle = (gi: number, oi: number) => {
      const key = keyOf(gi, oi);
      const next = !selectedSet.has(key);
      setSelected(next ? [...selected, key] : selected.filter((k) => k !== key));
      onChange?.(gi, oi, next);
    };
    const clearAll = () => {
      setSelected([]);
      onClear?.();
    };
    // The header badge tracks the live checked count; an explicit `activeCount`
    // overrides it for callers that manage the number themselves.
    const shownCount = activeCount ?? selectedSet.size;

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
            {/* RippleClip clips the Android bounded-ripple option rows to the bordered
                card's rounded corners (a no-op on iOS/web, and only clips when
                `bordered` so the bare panel keeps rectangular ripples). */}
            <RippleClip
              shape={bordered ? cornerRadii(skin.borderedSurface(tokens)) : undefined}
              style={{ alignSelf: "stretch" }}
            >
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
            </RippleClip>
          </View>
        ))}
      </View>
    );
  };
}
