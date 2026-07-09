import { useRef, useState } from "react";
import { View, Pressable, Text, useTheme, AnchoredOverlay, useEscapeKey, type StyleProp, type ViewStyle } from "../../style/index.js";
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
// Overlay note: the open menu renders through AnchoredOverlay. When an
// OverlayProvider is mounted (an app root, or a docs example stage) the card is
// portaled over the page, anchored below the ⋯ trigger, and a tap anywhere off it
// dismisses it — identically on iOS, Android, and web, with no Platform.OS branch
// and no position:fixed, so it escapes the stage's clip. With no provider it falls
// back to an inline card positioned absolutely below the trigger (the kit's
// pre-portal behavior). The `open` boolean keeps it shown across platforms.

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
  /** Accessible name for the icon-only ⋯ trigger. Defaults to "More options". */
  triggerLabel?: string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// The inline-fallback anchor: with no OverlayProvider mounted the menu renders in
// place, absolutely positioned below the ⋯ trigger (the kit's pre-portal
// behavior). With a provider, AnchoredOverlay positions the card over the page and
// adds the outside-tap dismiss backdrop instead. The skin owns the card's
// shape/fill/shadow; this owns the inline anchoring.
const MENU_ANCHOR: ViewStyle = { position: "absolute", top: "100%", start: 0, zIndex: 50, marginTop: 4 };

/** Build a RowMenu component from a platform skin. */
export function createRowMenu(skin: RowMenuSkin) {
  return function RowMenu(props: RowMenuProps) {
    const { items, links = false, sectionLabel, onSelect, onOpenChange, triggerLabel = "More options", testID, style } = props;
    const { tokens, dark } = useTheme();
    // Uncontrolled by default: the ⋯ trigger toggles the menu (closed), a select
    // closes it; a controlled `open` prop overrides this.
    const [internalOpen, setInternalOpen] = useState(false);
    const open = props.open ?? internalOpen;
    const setOpen = (next: boolean) => {
      if (props.open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };

    // Escape dismisses the open menu on web (no-op natively).
    useEscapeKey(open, () => setOpen(false));

    // The wrapper tightly wraps the ⋯ trigger (the menu portals out when hosted),
    // so measuring it gives the trigger's box for anchoring the floating card. The
    // measured width is a floor for the menu; a wide trigger never yields a
    // narrower menu than the skin's own minimum.
    const triggerRef = useRef<View>(null);
    const [triggerWidth, setTriggerWidth] = useState(0);

    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    return (
      // self-start keeps the trigger from stretching; relative anchors the inline
      // fallback menu.
      <View
        ref={triggerRef}
        testID={testID}
        style={[skin.anchor, open ? anchorLifted : null, style]}
        onLayout={(e) => setTriggerWidth(e.nativeEvent.layout.width)}
      >
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
          accessibilityLabel={triggerLabel}
          accessibilityState={{ expanded: open }}
          // RNW forwards neither accessibilityState nor aria-haspopup; alias both.
          aria-expanded={open}
          {...{ "aria-haspopup": "menu" }}
        >
          <Text
            style={skin.triggerGlyph(tokens)}
            aria-hidden
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            ⋯
          </Text>
        </Pressable>

        <AnchoredOverlay
          open={open}
          onDismiss={() => setOpen(false)}
          triggerRef={triggerRef}
          gap={4}
          cardStyle={[skin.menuCard(tokens), { minWidth: Math.max(triggerWidth, skin.menuMinWidth) }]}
          inlineStyle={MENU_ANCHOR}
        >
          {sectionLabel ? <Text style={skin.menuLabel(tokens)}>{sectionLabel}</Text> : null}
          {items.map((item, index) => (
            <View key={`${item.label}-${index}`}>
              {item.separatorBefore ? <View style={skin.separator(tokens)} /> : null}
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
        </AnchoredOverlay>
      </View>
    );
  };
}
