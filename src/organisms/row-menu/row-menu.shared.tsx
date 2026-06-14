import { useState } from "react";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { anchorLifted, type RowMenuItem, type RowMenuSkin } from "./row-menu.styles.js";

// Shared RowMenu shell. The structure (the self-start anchor, the ⋯ icon-button
// trigger, and the floating card of an optional section label plus the item
// rows), the public boolean-prop API, the controlled/uncontrolled open state, the
// select/close handlers, the overlay open-close behavior, the per-row destructive
// tint, the link/action role, and accessibility all live here once. A platform
// file supplies only its skin (the trigger and card shape/fill/shadow, whether
// separators are drawn, the row text scale, and the press feedback mode) and
// calls createRowMenu.
//
// Overlay note: a real row menu portals its card over the page and dismisses on
// outside click. Here, for the docs playground (which has no portal/Modal), the
// open menu renders INLINE directly below the trigger as a floating card so the
// preview is never covered. The `open` boolean keeps it shown; this behavior is
// identical across platforms.

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

/** Build a RowMenu component from a platform skin. */
export function createRowMenu(skin: RowMenuSkin) {
  return function RowMenu(props: RowMenuProps) {
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

    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    return (
      // self-start keeps the trigger from stretching; relative anchors the menu.
      <View style={[skin.anchor, open ? anchorLifted : null, style]}>
        <Pressable
          style={({ pressed }) => [
            skin.trigger,
            // Android ripples; iOS dims via opacity; web tints the fill.
            skin.triggerPressedOpacity != null && pressed ? { opacity: skin.triggerPressedOpacity } : null,
            skin.ripple == null && skin.triggerPressedOpacity == null && pressed
              ? skin.triggerPressed(tokens)
              : null,
          ]}
          onPress={() => setOpen(!open)}
          android_ripple={ripple}
          accessibilityRole="button"
        >
          <Text style={skin.triggerGlyph(tokens)}>⋯</Text>
        </Pressable>

        {open ? (
          <View style={skin.menuCard(tokens)}>
            {sectionLabel ? <Text style={skin.menuLabel(tokens)}>{sectionLabel}</Text> : null}
            {items.map((item, index) => (
              <View key={`${item.label}-${index}`}>
                {item.separatorBefore && skin.showSeparators ? <View style={skin.separator(tokens)} /> : null}
                <Pressable
                  style={({ pressed }) => [
                    skin.itemRow,
                    // Web/iOS tint the row on press here; Android uses the ripple instead.
                    skin.ripple == null && pressed ? skin.itemPressed(tokens) : null,
                  ]}
                  onPress={() => {
                    onSelect?.(item, index);
                    setOpen(false);
                  }}
                  android_ripple={ripple}
                  accessibilityRole={links ? "link" : "menuitem"}
                >
                  {item.icon ? (
                    <Text style={[skin.rowTextSize, skin.rowTextColor(item, links, tokens, dark)]}>{item.icon}</Text>
                  ) : null}
                  <Text style={[skin.rowTextSize, skin.rowTextColor(item, links, tokens, dark)]}>{item.label}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  };
}
