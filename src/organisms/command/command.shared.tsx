import { useState } from "react";
import { type Role } from "react-native";
import { View, Text, Pressable, useTheme, GlassSurface, type StyleProp, type ViewStyle } from "../../style/index.js";

// React Native's Role union omits the valid ARIA "listbox" role, so the command
// list container casts it. The value is correct on both web (DOM role) and native.
const LISTBOX = "listbox" as Role;
import { Icon } from "../../atoms/icon/icon.js";
import { Kbd } from "../../atoms/kbd/kbd.js";
import { type CommandSkin } from "./command.styles.js";
import * as s from "./command.styles.js";

// Shared Command shell. The structure, the public boolean-prop API, the data
// shapes, the controlled/uncontrolled open state, the flat active-index walk, the
// select/close handlers, and the trigger/footer composition all live here once. A
// platform file supplies only its skin (the search-row + result-row shape,
// density, type, the active-row highlight, and the press-feedback mode) and calls
// createCommand.
//
// Command: a Cmd+K style command palette rendered as a floating card. A search
// row sits at the top (a leading magnifier glyph + a muted placeholder), then
// one or more groups of result rows. Each group can carry an optional uppercase
// heading; each row is a leading icon glyph + a label + an optional trailing
// shortcut rendered as a Kbd cap. The active row (a flat index across all
// groups) is highlighted with the accent surface.
//
// This is the OPEN, INLINE palette card on its own: no full-screen portal,
// Modal, or backdrop. `open` (default true) gates whether the card renders, so
// the docs playground can show the palette in its open state.
//
// Command is a "Light" platform treatment: ONE structure with small per-OS
// touches (row density/height, type, and press feedback). The panel material
// (GlassSurface), the card shell, the trigger, the group heading, the footer, and
// the Kbd caps are shared and identical across platforms; only the search row and
// the result rows are re-skinned.
//
// Style is configured through semantic boolean props (Canvas's only styling
// API); there are no string-enum props.

export interface CommandItem {
  /** The row's primary text. */
  label: string;
  /** Optional leading glyph (e.g. an emoji or single character). */
  icon?: string;
  /** Optional trailing keyboard shortcut, rendered in a Kbd cap. */
  shortcut?: string;
}

export interface CommandGroup {
  /** Optional uppercase section heading above the group's rows. */
  heading?: string;
  /** The rows in this group. */
  items: CommandItem[];
}

export interface CommandProps {
  /** Placeholder shown in the (non-editable, display-only) search row. */
  placeholder?: string;
  /** Grouped result rows. */
  groups?: CommandGroup[];
  /** Flat index of the highlighted row, counted across all groups. */
  active?: number;
  /** Controlled open state. Omit for uncontrolled (the search trigger toggles it). */
  open?: boolean;
  /** Fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Render a collapsed full-width search trigger above the palette (a search
   * glyph + "Search..." + a trailing kbd cap). The palette card still renders
   * inline below the trigger (gated by `open`), mirroring how Dropdown shows
   * its trigger plus the open menu in the docs.
   */
  trigger?: boolean;
  /**
   * Append a footer hint bar below the list (↑ ↓ to navigate, ↵ to select,
   * esc to close).
   */
  footer?: boolean;
  /** Called with the chosen item and its flat index when a row is pressed. */
  onSelect?: (item: CommandItem, index: number) => void;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

/** Build a Command component from a platform skin. */
export function createCommand(skin: CommandSkin) {
  return function Command(props: CommandProps) {
    const {
      placeholder = "Type a command or search...",
      groups = [],
      active = 0,
      open: openProp,
      trigger,
      footer,
      onOpenChange,
      onSelect,
      style,
    } = props;
    const { tokens } = useTheme();

    // Uncontrolled by default: in trigger mode the palette starts closed and the
    // collapsed search trigger toggles it; the bare card (no trigger) starts open.
    const [internalOpen, setInternalOpen] = useState(() => !trigger);
    const open = openProp ?? internalOpen;
    const setOpen = (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };

    // In trigger mode the collapsed search button is always shown; the palette
    // card below it is still gated by `open`. Otherwise the bare card is gated by
    // `open` and renders nothing when closed.
    if (!trigger && !open) return null;

    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    // Walk a flat counter across every group so `active` indexes the whole list.
    let flat = -1;

    const card = open ? (
      <GlassSurface style={[s.card(tokens), trigger ? s.cardFloating : null]}>
        <View style={skin.searchRow(tokens)}>
          <Text style={skin.searchGlyph(tokens)}>🔍</Text>
          <Text style={skin.searchPlaceholder(tokens)}>{placeholder}</Text>
        </View>

        <View role={LISTBOX}>
        {groups.map((group, gi) => (
          <View key={`group-${gi}`} role="group" aria-label={group.heading ?? undefined}>
            {group.heading != null ? <Text style={s.groupHeading(tokens)}>{group.heading}</Text> : null}
            {group.items.map((item, ii) => {
              flat += 1;
              const index = flat;
              const isActive = index === active;
              return (
                <Pressable
                  key={`item-${gi}-${ii}`}
                  style={({ pressed }) => [
                    skin.rowBase,
                    // The active row always takes the brand accent highlight. The
                    // press feedback then varies per OS: web (no ripple, no dim)
                    // tints the row with the same accent fill; iOS dims to ~0.8
                    // opacity; Android shows the android_ripple state layer.
                    isActive || (pressed && skin.ripple == null && skin.rowPressedOpacity == null)
                      ? skin.rowAccent(tokens)
                      : null,
                    skin.rowPressedOpacity != null && pressed ? { opacity: skin.rowPressedOpacity } : null,
                  ]}
                  onPress={() => {
                    onSelect?.(item, index);
                    setOpen(false);
                  }}
                  android_ripple={ripple}
                  role="option"
                  aria-selected={isActive}
                >
                  {item.icon != null ? <Text style={skin.rowIcon(tokens)}>{item.icon}</Text> : null}
                  <Text style={skin.rowLabel(tokens)}>{item.label}</Text>
                  {item.shortcut != null ? <Kbd>{item.shortcut}</Kbd> : null}
                </Pressable>
              );
            })}
          </View>
        ))}
        </View>

        {footer ? (
          <View style={s.footerBar(tokens)}>
            <View style={s.footerHint}>
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <Text style={s.footerText(tokens)}>to navigate</Text>
            </View>
            <View style={s.footerHint}>
              <Kbd>↵</Kbd>
              <Text style={s.footerText(tokens)}>to select</Text>
            </View>
            <View style={s.footerHint}>
              <Kbd>esc</Kbd>
              <Text style={s.footerText(tokens)}>to close</Text>
            </View>
          </View>
        ) : null}
      </GlassSurface>
    ) : null;

    if (!trigger) return card;

    return (
      <View style={[s.triggerWrapper, open ? s.triggerWrapperLifted : null, style]}>
        <Pressable style={s.triggerRow(tokens)} onPress={() => setOpen(!open)}>
          <Icon search muted size={14} />
          <Text style={s.triggerLabel(tokens)}>Search...</Text>
          <Kbd style={s.triggerKbd}>⌘K</Kbd>
        </Pressable>
        {card}
      </View>
    );
  };
}
