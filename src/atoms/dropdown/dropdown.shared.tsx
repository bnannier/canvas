import { useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Button } from "../button/button.js";
import { wrapper, customTrigger, type DropdownSkin } from "./dropdown.styles.js";

// Shared Dropdown shell. The structure (the trigger plus a floating menu of
// action rows, each with an optional leading icon glyph, a label, and an
// optional trailing keyboard shortcut, with hairline separators between groups
// and red-tinted destructive rows), the public boolean-prop API, the
// controlled/uncontrolled open state, the trigger/select close handlers, the
// web-only dismiss backdrop, the disabled handling, and accessibility all live
// here once. A platform file supplies only its skin (the menu card shape/fill/
// border, the separators, the row sizing, and the press feedback) and calls
// createDropdown.
//
// The trigger defaults to an outline button labelled by `trigger`. Pass
// `children` to supply a CUSTOM trigger instead (e.g. an avatar account chip in
// a topbar): the children render in place of the button, inside a Pressable that
// toggles the menu. Either way the menu rows still come from `items`.
//
// Overlay note: the open menu renders as a floating card positioned absolutely
// below the trigger (the wrapper is `relative`), so it overflows its container
// (e.g. a docs card or the playground stage) instead of growing it, with no
// portal/Modal. On the web, an UNCONTROLLED menu also lays down a transparent
// full-viewport backdrop so a press anywhere off the menu dismisses it; a
// controlled `open` menu and native get no backdrop (native would use a Modal).
//
// There are no visual style axes on the menu itself, so there is no boolean-prop
// precedence to resolve; the per-item `destructive` flag is the only variant and
// it is scoped to its own row.

export interface DropdownItem {
  label: string;
  /** Optional leading glyph rendered before the label (a single character). */
  icon?: string;
  /** Optional trailing keyboard shortcut, right-aligned and muted. */
  shortcut?: string;
  /** Red-tinted row for destructive actions (e.g. Delete). */
  destructive?: boolean;
  /** Dimmed, non-interactive row: skips onSelect and renders at reduced opacity. */
  disabled?: boolean;
  /** Draw a hairline separator above this row to start a new group. */
  separatorBefore?: boolean;
}

export interface DropdownProps {
  /** Label for the default outline trigger button. Omit when supplying a custom
   *  trigger via `children`. */
  trigger?: string;
  /** A custom trigger rendered in place of the default outline button, e.g. an
   *  avatar account chip. It is wrapped in a Pressable that toggles the menu;
   *  the menu itself still comes from `items`. */
  children?: ReactNode;
  /** Optional muted section heading rendered above the rows (e.g. "Actions"). */
  label?: string;
  /** The menu rows, top to bottom. */
  items: DropdownItem[];
  /** Controlled open state. Omit for uncontrolled (the trigger opens/closes it). */
  open?: boolean;
  /** Fired when the open state changes (trigger press, select, etc.). */
  onOpenChange?: (open: boolean) => void;
  /** Fired with the selected item and its index when a row is pressed. */
  onSelect?: (item: DropdownItem, index: number) => void;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// The menu's width floor. A menu under a small trigger (e.g. an outline button)
// stays at least this wide; a wider trigger (an account chip) sets the width.
const MENU_MIN_WIDTH = 200;

// A transparent full-viewport layer behind the open menu (web only): a press off
// the menu dismisses it. `position: fixed` is not in RN's ViewStyle type but
// react-native-web honors it; cast through unknown. zIndex sits below the menu's
// z-50 so the menu and its items stay clickable above the backdrop.
const DISMISS_BACKDROP = {
  position: "fixed",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: 40,
} as unknown as StyleProp<ViewStyle>;

// The menu card is positioned absolutely below the trigger on every platform; the
// skin owns the card's shape/fill/shadow, this owns the anchoring.
const MENU_ANCHOR: ViewStyle = { position: "absolute", top: "100%", left: 0, zIndex: 50, marginTop: 4 };

/** Build a Dropdown component from a platform skin. */
export function createDropdown(skin: DropdownSkin) {
  return function Dropdown(props: DropdownProps) {
    const { trigger, children, label, items, open: openProp, onOpenChange, onSelect, style } = props;
    const { tokens, dark } = useTheme();
    // Uncontrolled by default (Headless-UI style): the trigger opens/closes the
    // menu and a select closes it; a controlled `open` prop overrides this.
    const [internalOpen, setInternalOpen] = useState(false);
    const open = openProp ?? internalOpen;
    const setOpen = (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };

    // Match the menu width to the trigger (and let longer rows grow past it), so a
    // wide trigger like a topbar account chip gets a menu of the same width.
    // Measured via the wrapper's layout; the menu is absolute, so it never feeds
    // back into this width.
    const [triggerWidth, setTriggerWidth] = useState(0);

    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    return (
      // self-start keeps the trigger from stretching; relative anchors the menu.
      <View
        style={[wrapper, style]}
        onLayout={(e) => setTriggerWidth(e.nativeEvent.layout.width)}
      >
        {children != null ? (
          <Pressable
            style={customTrigger}
            onPress={() => setOpen(!open)}
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
          >
            {children}
          </Pressable>
        ) : (
          <Button outline small onPress={() => setOpen(!open)}>
            {trigger}
          </Button>
        )}

        {open && openProp === undefined && Platform.OS === "web" ? (
          <Pressable accessible={false} onPress={() => setOpen(false)} style={DISMISS_BACKDROP} />
        ) : null}

        {open ? (
          <View
            style={[
              MENU_ANCHOR,
              skin.menuCard(tokens),
              { minWidth: Math.max(triggerWidth, MENU_MIN_WIDTH) },
            ]}
          >
            {label ? (
              <Text style={skin.menuLabel(tokens)}>
                {label}
              </Text>
            ) : null}
            {items.map((item, index) => (
              <View key={`${item.label}-${index}`}>
                {item.separatorBefore && skin.separator ? (
                  <View style={skin.separator(tokens)} />
                ) : null}
                <Pressable
                  style={({ pressed }) => [
                    skin.itemRow,
                    // iOS/web tint the row on press here; Android uses the ripple instead.
                    skin.itemPressed != null && pressed ? skin.itemPressed(tokens) : null,
                    skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
                    item.disabled ? { opacity: skin.disabledOpacity } : null,
                  ]}
                  onPress={item.disabled ? undefined : () => { onSelect?.(item, index); setOpen(false); }}
                  disabled={item.disabled}
                  android_ripple={ripple}
                  accessibilityRole="menuitem"
                  accessibilityState={{ disabled: item.disabled }}
                >
                  {item.icon ? (
                    <Text style={[skin.itemTextType, skin.itemTextColor(tokens, dark, !!item.destructive)]}>
                      {item.icon}
                    </Text>
                  ) : null}
                  <Text style={[skin.itemTextType, skin.itemTextColor(tokens, dark, !!item.destructive)]}>
                    {item.label}
                  </Text>
                  {item.shortcut ? (
                    <Text style={skin.shortcut(tokens)}>
                      {item.shortcut}
                    </Text>
                  ) : null}
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  };
}
