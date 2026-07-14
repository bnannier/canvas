import { useEffect, useId, useRef, useState } from "react";
import { type Role } from "react-native";
import { View, Text, Pressable, useTheme, useControllableState, useEscapeKey, AnchoredOverlay, GlassSurface, FOCUS_RESET, type StyleProp, type ViewProps, type ViewStyle } from "../../style/index.js";

// React Native's Role union omits the valid ARIA "listbox" role, so the command
// list container casts it. The value is correct on both web (DOM role) and native.
const LISTBOX = "listbox" as Role;
import { Icon, type IconName } from "../../atoms/icon/icon.js";
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
// In BARE mode (no `trigger`) this is the OPEN, inline palette card on its own:
// no Modal, no scrim. `open` (default true) gates whether the card renders, so
// the docs playground can show the palette in its open state. In TRIGGER mode the
// floating palette card is portaled below the collapsed trigger through
// AnchoredOverlay (like Dropdown/Popover/RowMenu), so it escapes the trigger's
// stacking context and is never overpainted by a later sibling or clipped by an
// ancestor; it falls back to the inline absolute anchor with no OverlayProvider.
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
  /** Optional leading Canvas glyph, named from the kit icon set (e.g. `"file"`,
   *  `"folder"`, `"save"`). Rendered through the `Icon` atom. */
  icon?: IconName;
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
  /** Flat index of the highlighted row (CONTROLLED), counted across all groups. Omit for uncontrolled use. */
  active?: number;
  /** Initial highlighted row for uncontrolled use (hovering a row moves it). */
  defaultActive?: number;
  /** Controlled open state. Omit for uncontrolled (the search trigger toggles it). */
  open?: boolean;
  /** Render the palette open initially for uncontrolled use (selecting a row closes it). */
  defaultOpen?: boolean;
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
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

/** Build a Command component from a platform skin. */
export function createCommand(skin: CommandSkin) {
  return function Command(props: CommandProps) {
    const {
      placeholder = "Type a command or search...",
      groups = [],
      open: openProp,
      trigger,
      footer,
      onOpenChange,
      onSelect,
      testID,
      style,
    } = props;
    const { tokens } = useTheme();

    // Controlled when `active` is provided, self-managed otherwise, so the
    // highlight follows hover instead of sitting frozen on the initial row.
    const [active, setActive] = useControllableState<number>(props.active, props.defaultActive ?? 0);

    // Uncontrolled by default: in trigger mode the palette starts closed and the
    // collapsed search trigger toggles it; the bare card (no trigger) starts
    // open. `defaultOpen` forces it open initially even in trigger mode.
    const [internalOpen, setInternalOpen] = useState(() => props.defaultOpen ?? !trigger);
    const open = openProp ?? internalOpen;
    const setOpen = (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };

    // The trigger view AnchoredOverlay measures to anchor (and portal) the card.
    const triggerRef = useRef<View>(null);

    // Escape dismisses the open TRIGGER-mode palette on web (no-op natively). The
    // bare inline card is left alone: it has no trigger to reopen it, so escape
    // would only strand it closed.
    useEscapeKey(!!trigger && open, () => setOpen(false));

    // Keyboard operability (the flat command-palette pattern the footer advertises):
    // the search row is the focusable driver, ArrowUp/Down move the highlighted
    // `active` row (clamped), and Enter selects it. Focus stays on the search row and
    // aria-activedescendant points at the active option, so a web screen reader
    // announces the moving highlight. Web-only in effect (natively there is no
    // onKeyDown and a View has no focus()), mirroring the Slider's own key handler.
    const flatItems = groups.flatMap((g) => g.items);
    const total = flatItems.length;
    const baseId = useId();
    const optionId = (i: number) => `${baseId}-opt-${i}`;
    const searchRef = useRef<View>(null);
    const onSearchKeyDown = (event: { key: string; preventDefault: () => void }) => {
      if (total === 0) return;
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setActive(Math.min(active + 1, total - 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          setActive(Math.max(active - 1, 0));
          break;
        case "Enter": {
          event.preventDefault();
          const item = flatItems[active];
          if (item) {
            onSelect?.(item, active);
            setOpen(false);
          }
          break;
        }
        default:
          return; // Escape is handled by useEscapeKey (trigger mode only).
      }
    };
    const searchKeyProps = { onKeyDown: onSearchKeyDown } as unknown as ViewProps;
    // Move focus into the palette when it opens via a trigger (a deliberate action);
    // never for the always-open bare card, which would steal focus on page load.
    useEffect(() => {
      if (!trigger || !open) return;
      const node = searchRef.current as unknown as { focus?: () => void } | null;
      node?.focus?.();
    }, [trigger, open]);

    // In trigger mode the collapsed search button is always shown; the palette
    // card below it is still gated by `open`. Otherwise the bare card is gated by
    // `open` and renders nothing when closed.
    if (!trigger && !open) return null;

    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    // Walk a flat counter across every group so `active` indexes the whole list.
    let flat = -1;

    // The card's inner content (search row + grouped result rows + optional
    // footer), WITHOUT the surface wrapper: the bare card wraps it in its own
    // GlassSurface, and in trigger mode AnchoredOverlay supplies the GlassSurface
    // (portaling the card over the page). The search magnifier is the kit `Icon`
    // (a template-tintable monochrome glyph) tinted muted-foreground — never a
    // color emoji (which ignores tint and renders full-color on device).
    const cardContent = (
      <>
        <View
          ref={searchRef}
          {...searchKeyProps}
          focusable={total > 0}
          accessibilityRole="search"
          accessibilityLabel={placeholder}
          aria-label={placeholder}
          // The search row drives the listbox highlight; point AT to the active row.
          {...({ "aria-activedescendant": total > 0 ? optionId(active) : undefined } as object)}
          style={[skin.searchRow(tokens), FOCUS_RESET]}
        >
          <Icon search muted decorative size={skin.searchGlyphSize} />
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
                  nativeID={optionId(index)}
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
                  onHoverIn={() => setActive(index)}
                  onPress={() => {
                    setActive(index);
                    onSelect?.(item, index);
                    setOpen(false);
                  }}
                  android_ripple={ripple}
                  role="option"
                  aria-selected={isActive}
                >
                  {item.icon != null ? <Icon {...{ [item.icon]: true }} size={skin.iconSize} decorative /> : null}
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
      </>
    );

    // Bare (trigger-less) mode: the card IS the root and carries the testID. The
    // early return above already gated it on `open`, so it renders open here; the
    // per-OS `cardShape` layers the iOS continuous corner over the shared card.
    if (!trigger) {
      return (
        <GlassSurface testID={testID} style={[s.card(tokens), skin.cardShape]}>
          {cardContent}
        </GlassSurface>
      );
    }

    // Trigger mode: the collapsed full-width search trigger, with the palette card
    // portaled below it through AnchoredOverlay (gap 12 = the old mt-3). When an
    // OverlayProvider hosts it the card floats OVER the page with an outside-tap
    // dismiss backdrop; with no provider it falls back to the inline absolute
    // anchor (s.cardFloating). The wrapper still lifts its own stacking context
    // while open for that inline-fallback case.
    return (
      <View ref={triggerRef} testID={testID} style={[s.triggerWrapper, open ? s.triggerWrapperLifted : null, style]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          aria-expanded={open}
          style={[s.triggerRow(tokens), { minHeight: skin.triggerMinHeight }]}
          onPress={() => setOpen(!open)}
        >
          <Icon search muted size={14} />
          <Text style={s.triggerLabel(tokens)}>Search...</Text>
          <Kbd keys="⌘ K" style={s.triggerKbd} />
        </Pressable>
        <AnchoredOverlay
          open={open}
          onDismiss={() => setOpen(false)}
          triggerRef={triggerRef}
          gap={12}
          cardStyle={[s.card(tokens), skin.cardShape]}
          inlineStyle={s.cardFloating}
        >
          {cardContent}
        </AnchoredOverlay>
      </View>
    );
  };
}
