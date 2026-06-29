import { useEffect, useState } from "react";
import {
  LayoutAnimation,
  Modal,
  BackHandler,
  Platform,
  type Role,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from "react-native";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  useTheme,
  useResponsive,
  useReducedMotion,
  supportsNativeDriver,
  enableAndroidLayoutAnimations,
  GlassSurface,
  type StyleProp,
  type ViewStyle,
} from "../../style/index.js";

// React Native's Role union omits the valid ARIA "listbox" role, so the command
// list container casts it. The value is correct on both web (DOM role) and native.
const LISTBOX = "listbox" as Role;
import { Icon } from "../../atoms/icon/icon.js";
import { Kbd } from "../../atoms/kbd/kbd.js";
import { type CommandSkin } from "./command.styles.js";
import * as s from "./command.styles.js";

// LayoutAnimation drives the reveal's width expand; on old-arch Android it must be enabled (a no-op
// on iOS, web, and the New Architecture). Evaluated once per bundle.
enableAndroidLayoutAnimations();

// Shared Command shell. The structure, the public API, the data shapes, the
// controlled/uncontrolled open state, the flat active-index walk, the select/close
// handlers, and the trigger/footer composition all live here once. A platform file
// supplies only its skin (search-row + result-row shape, density, type, active-row
// highlight, press feedback) and calls createCommand.
//
// Command is a Cmd+K command palette. It has two modes:
//   - DISPLAY mode (default, backward compatible): a static search row (a magnifier
//     glyph + a muted placeholder) over pre-filtered `groups`, the floating 420 card
//     used in the docs playground. `active` highlights a row.
//   - SEARCH mode (opt in by passing `value` + `onValueChange`): the search row is a
//     real editable field; the caller filters its own data and passes the matching
//     `groups`; rows can carry a `description` second line; an `emptyLabel` shows when
//     there are no results; the result list scrolls; web gets arrow/enter/esc keyboard
//     navigation over the flat list.
//
// Presentation: by default the card renders INLINE (gated by `open`; fills its parent
// in search mode for a full-screen native search screen). Pass `overlay` to self-present
// as a responsive Modal: a centered palette on desktop, a bottom sheet on mobile, with a
// scrim, escape/`onRequestClose`, and Android hardware-back closing it (the same engine
// the kit Drawer uses).
//
// Command is a "Light" platform treatment: ONE structure with small per-OS touches
// (row density/height, type, press feedback). The GlassSurface material, the card shell,
// the trigger, the group heading, the footer, and the Kbd caps are shared; only the
// search row and the result rows are re-skinned. Style is configured through semantic
// boolean props; there are no string-enum props.

export interface CommandItem {
  /** The row's primary text. */
  label: string;
  /** Optional muted second line under the label (search results). */
  description?: string;
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
  /** Placeholder shown in the search row. */
  placeholder?: string;
  /** Grouped result rows (pre-filtered by the caller in search mode). */
  groups?: CommandGroup[];
  /** Flat index of the highlighted row, counted across all groups (display mode). */
  active?: number;
  /** Controlled open state. Omit for uncontrolled (the search trigger toggles it). */
  open?: boolean;
  /** Fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Render a collapsed full-width search trigger above the palette (display mode). */
  trigger?: boolean;
  /** Append a footer hint bar below the list (arrows to navigate, enter, esc). */
  footer?: boolean;
  /** Called with the chosen item and its flat index when a row is pressed. */
  onSelect?: (item: CommandItem, index: number) => void;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;

  // ----- Search mode (opt in: supply value + onValueChange) -----
  /** The editable field's value. Supplying onValueChange turns the search row editable. */
  value?: string;
  /** Fired as the field text changes. Its presence enables search mode. */
  onValueChange?: (value: string) => void;
  /** Focus the field on mount (search mode). */
  autoFocus?: boolean;
  /** Shown (one centered muted row) when search mode has no results. */
  emptyLabel?: string;

  // ----- Presentation -----
  /** Self-present as a responsive Modal overlay: centered palette on desktop, bottom sheet on mobile. */
  overlay?: boolean;
  /** Bottom safe-area inset for the mobile overlay sheet. */
  safeBottom?: number;
  /**
   * Play an entrance reveal when the palette opens: the search field expands out of its magnifier
   * icon into the full-width bar (sliding left), then the results fade in. Honors Reduce Motion
   * (snaps). Opt in (search mode); display-mode usage is unaffected.
   */
  revealOnOpen?: boolean;
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
      value,
      onValueChange,
      autoFocus,
      emptyLabel,
      overlay,
      safeBottom = 0,
      revealOnOpen,
    } = props;
    const { tokens } = useTheme();
    const mobile = useResponsive({ base: false, md: true });
    const searchMode = onValueChange != null;

    // Uncontrolled by default: in trigger mode the palette starts closed and the
    // collapsed search trigger toggles it; the bare card (no trigger) starts open.
    const [internalOpen, setInternalOpen] = useState(() => !trigger);
    const open = openProp ?? internalOpen;
    const setOpen = (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };

    // Search mode keeps its own highlighted row; keep it in range as the results change.
    const flatItems = groups.flatMap((g) => g.items);
    const [selected, setSelected] = useState(0);
    useEffect(() => {
      setSelected((i) => Math.min(Math.max(0, i), Math.max(0, flatItems.length - 1)));
    }, [flatItems.length]);
    const highlight = searchMode ? selected : active;

    // Web keyboard nav over the flat result list. RN-Web surfaces the key via onKeyPress;
    // native soft keyboards do not, so this is a no-op there.
    const onKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (Platform.OS !== "web") return;
      const key = e.nativeEvent.key;
      const prevent = (e as unknown as { preventDefault?: () => void }).preventDefault;
      if (key === "Escape") {
        setOpen(false);
      } else if (key === "ArrowDown") {
        prevent?.();
        setSelected((i) => Math.min(i + 1, flatItems.length - 1));
      } else if (key === "ArrowUp") {
        prevent?.();
        setSelected((i) => Math.max(i - 1, 0));
      } else if (key === "Enter" && flatItems[selected] != null) {
        onSelect?.(flatItems[selected], selected);
        setOpen(false);
      }
    };

    // Android hardware back closes the open overlay (the Modal's onRequestClose covers
    // the gesture/escape; this covers the physical/gesture back button explicitly).
    useEffect(() => {
      if (!overlay || !open || Platform.OS !== "android") return;
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        setOpen(false);
        return true;
      });
      return () => sub.remove();
      // setOpen is derived from stable props; re-subscribing only on overlay/open is intended.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [overlay, open]);

    // Entrance reveal (opt in): the search field expands out of its magnifier icon into the
    // full-width bar (its width animates, right-anchored, so the bar grows leftward), then the input
    // and results fade in. One JS-driven Animated.Value (width is a layout prop, not native-driver
    // safe); replayed whenever the palette opens; snaps to the end when Reduce Motion is on.
    const reduced = useReducedMotion();
    // The reveal: start collapsed, then (next frame) animate the width to full under LayoutAnimation
    // (the kit's cross-platform layout animation; an Animated width did not update on Android Fabric).
    const [expanded, setExpanded] = useState(!revealOnOpen);
    useEffect(() => {
      if (!revealOnOpen || !open) return;
      setExpanded(false);
      const id = requestAnimationFrame(() => {
        if (supportsNativeDriver && !reduced) {
          LayoutAnimation.configureNext({ duration: 280, update: { type: LayoutAnimation.Types.easeInEaseOut } });
        }
        setExpanded(true);
      });
      return () => cancelAnimationFrame(id);
    }, [revealOnOpen, open, reduced]);

    const COLLAPSED_W = 52;

    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    // The card shape depends on the mode: overlay → palette (desktop) / sheet (mobile);
    // inline search → edge-to-edge fill; display → the floating 420 card.
    const cardStyle: StyleProp<ViewStyle> = overlay
      ? mobile
        ? s.cardSheet(tokens, safeBottom)
        : s.cardPalette(tokens)
      : searchMode
        ? [s.cardInline(tokens), style]
        : [s.card(tokens), trigger ? s.cardFloating : null, style];

    // Walk a flat counter across every group so the highlight indexes the whole list.
    let flat = -1;
    const list =
      groups.length === 0 && searchMode && emptyLabel != null ? (
        <View style={s.emptyState}>
          <Text style={s.emptyText(tokens)}>{emptyLabel}</Text>
        </View>
      ) : (
        <View role={LISTBOX}>
          {groups.map((group, gi) => (
            <View key={`group-${gi}`} role="group" aria-label={group.heading ?? undefined}>
              {group.heading != null ? <Text style={s.groupHeading(tokens)}>{group.heading}</Text> : null}
              {group.items.map((item, ii) => {
                flat += 1;
                const index = flat;
                const isActive = index === highlight;
                return (
                  <Pressable
                    key={`item-${gi}-${ii}`}
                    style={({ pressed }) => [
                      skin.rowBase,
                      // The active row takes the brand accent; press feedback then varies per OS:
                      // web tints with the same accent fill, iOS dims, Android ripples.
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
                    {item.description != null ? (
                      <View style={s.rowText}>
                        <Text style={[skin.rowLabel(tokens), { flexGrow: 0, flexBasis: "auto" }]} numberOfLines={1}>
                          {item.label}
                        </Text>
                        <Text style={s.rowDescription(tokens)} numberOfLines={1}>
                          {item.description}
                        </Text>
                      </View>
                    ) : (
                      <Text style={skin.rowLabel(tokens)}>{item.label}</Text>
                    )}
                    {item.shortcut != null ? <Kbd>{item.shortcut}</Kbd> : null}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      );

    // The kit Icon (not an emoji glyph) so the magnifier renders reliably and stays a Canvas
    // component; sized to the skin's search-glyph type.
    const glyph = <Icon search muted size={skin.searchGlyph(tokens).fontSize ?? 16} />;
    const fieldInput = searchMode ? (
      <TextInput
        value={value}
        onChangeText={onValueChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        placeholderTextColor={tokens["muted-foreground"]}
        autoFocus={autoFocus}
        returnKeyType="search"
        accessibilityLabel="Search"
        style={[
          skin.searchPlaceholder(tokens),
          {
            color: tokens.foreground,
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: "0%",
            // Strip the RN-Web default input outline; the card border frames it.
            ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : null),
          },
        ]}
      />
    ) : (
      <Text style={skin.searchPlaceholder(tokens)}>{placeholder}</Text>
    );

    // With revealOnOpen the field expands out of the magnifier: a RIGHT-anchored, clipped bar whose
    // width animates from a collapsed pill to the full width measured on the wrapper (so it grows
    // leftward), with the input fading in. Otherwise it is the plain full-width search row.
    const searchField = (
      <View
        style={[
          skin.searchRow(tokens),
          // The reveal: a right-anchored, clipped bar whose width snaps collapsed then expands to full
          // under LayoutAnimation, so the field grows leftward out of the magnifier.
          revealOnOpen ? { alignSelf: "flex-end", overflow: "hidden", width: expanded ? "100%" : COLLAPSED_W } : null,
        ]}
      >
        {glyph}
        {fieldInput}
      </View>
    );

    const card = (
      <GlassSurface style={cardStyle}>
        {searchField}

        {searchMode ? (
          <ScrollView style={overlay ? { flexGrow: 0, flexShrink: 1 } : { flex: 1 }} keyboardShouldPersistTaps="handled">
            {list}
          </ScrollView>
        ) : (
          list
        )}

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
    );

    // Overlay: self-present as a responsive Modal (centered desktop / bottom sheet mobile).
    if (overlay) {
      return (
        <Modal
          visible={open}
          transparent
          animationType={mobile ? "slide" : "fade"}
          onRequestClose={() => setOpen(false)}
          accessibilityViewIsModal
        >
          <Pressable accessible={false} style={s.overlayRoot(mobile)} onPress={() => setOpen(false)}>
            {/* Inner capture wrapper: taps on the card must not fall through to the scrim. */}
            <Pressable accessible={false} style={mobile ? { width: "100%" } : undefined} onPress={() => {}}>
              {card}
            </Pressable>
          </Pressable>
        </Modal>
      );
    }

    // Inline display / search: the bare card, gated by `open`.
    if (!trigger) return open ? card : null;

    // Trigger mode: the collapsed search button is always shown; the card floats below when open.
    return (
      <View style={[s.triggerWrapper, open ? s.triggerWrapperLifted : null, style]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          aria-expanded={open}
          style={s.triggerRow(tokens)}
          onPress={() => setOpen(!open)}
        >
          <Icon search muted size={14} />
          <Text style={s.triggerLabel(tokens)}>Search...</Text>
          <Kbd style={s.triggerKbd}>⌘K</Kbd>
        </Pressable>
        {open ? card : null}
      </View>
    );
  };
}
