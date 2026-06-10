import { useState } from "react";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./row-menu.styles.js";
import { type RowMenuItem } from "./row-menu.styles.js";

// RowMenu: the per-row "⋯" actions menu found in tables and lists. A small
// square icon-button trigger surfaces a floating card of action rows: each row
// carries an optional leading icon glyph and a label, destructive rows are
// red-tinted, and a hairline separator splits off groups (e.g. a trailing
// Delete). An optional muted section label heads the menu, and a `links` axis
// switches the rows to navigation links.
//
// Overlay note: a real row menu portals its card over the page and dismisses on
// outside click. Here, for the docs playground (which has no portal/Modal), the
// open menu renders INLINE directly below the trigger as a floating card so the
// preview is never covered. The `open` boolean (default true) keeps it shown.
//
// Style axes are limited: `links` selects the kind, `sectionLabel` toggles the
// heading. There is no two-flag stacking, so no per-axis precedence to resolve;
// the per-item `destructive` flag is the only row-level variant and it is scoped
// to its own row.

export type { RowMenuItem };

export interface RowMenuProps {
  /** The menu rows, top to bottom. */
  items: RowMenuItem[];
  /** Controlled open state. Omit for uncontrolled (the trigger toggles it). */
  open?: boolean;
  /** Fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Render rows as navigation links rather than action buttons. */
  links?: boolean;
  /** Show a muted section label heading the menu. */
  sectionLabel?: string;
  /** Fired with the selected item and its index when a row is pressed. */
  onSelect?: (item: RowMenuItem, index: number) => void;
  /** Escape hatch for layout/positioning composition. */
  style?: StyleProp<ViewStyle>;
}

export function RowMenu(props: RowMenuProps) {
  const { items, links = false, sectionLabel, onSelect, onOpenChange, style } = props;
  const { tokens, dark } = useTheme();
  // Uncontrolled by default: the ⋯ trigger toggles the menu (closed), a select
  // closes it; a controlled `open` prop overrides this.
  const [internalOpen, setInternalOpen] = useState(false);
  const open = props.open ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (props.open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    // self-start keeps the trigger from stretching; relative anchors the menu.
    <View style={[s.anchor, style]}>
      <Pressable
        style={({ pressed }) => [s.trigger, pressed ? { backgroundColor: tokens.accent } : null]}
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
      >
        <Text style={s.triggerGlyph(tokens)}>⋯</Text>
      </Pressable>

      {open ? (
        <View style={s.menuCard(tokens)}>
          {sectionLabel ? <Text style={s.menuLabel(tokens)}>{sectionLabel}</Text> : null}
          {items.map((item, index) => (
            <View key={`${item.label}-${index}`}>
              {item.separatorBefore ? <View style={s.separator(tokens)} /> : null}
              <Pressable
                style={({ pressed }) => [s.itemRow, pressed ? { backgroundColor: tokens.accent } : null]}
                onPress={() => {
                  onSelect?.(item, index);
                  setOpen(false);
                }}
                accessibilityRole={links ? "link" : "menuitem"}
              >
                {item.icon ? (
                  <Text style={[s.rowTextSize, s.rowTextColor(item, links, tokens, dark)]}>{item.icon}</Text>
                ) : null}
                <Text style={[s.rowTextSize, s.rowTextColor(item, links, tokens, dark)]}>{item.label}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
