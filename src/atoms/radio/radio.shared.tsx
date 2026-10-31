import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { forwardRef, type ReactNode } from "react";
import { useComposedRefs } from "../../style/use-composed-refs.js";
import { useSpaceActivation } from "../../style/use-space-activation.js";
import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, surfaceRipple, RippleClip, cornerRadii, type ColorTokens, type ViewStyle, type TextStyle, type LayoutStyle, GlassPane, paneStyle, paneRipple, legibleWash, withInnerFill } from "../../style/index.js";
import { contrastStyle } from "../../style/glass-surface/glass-surface.shared.js";
import { InkProvider } from "../../style/ink.js";
import { primaryText } from "../../style/primary-text.js";
import { useHover } from "../../style/hover.js";
import { Icon } from "../icon/icon.js";
import { useRadioGroup } from "./radio-context.js";

// Shared Radio shell. Uses React Native's primitives DIRECTLY and reads the active
// brand tokens via so colors follow light/dark and the glass surface. The
// shared structure (the mark + label row, the size precedence, accessibility, the
// controlled checked/selected alias, the onChange handler) lives here once; a
// platform file supplies only its skin (how the choice is marked, its sizing, the list
// a group forms, press feedback) and calls createRadio. Every skin is hand-drawn from
// the brand tokens, so no platform default color ever leaks in.
//
// On the web and Android a radio is a circular control that marks the chosen option in
// the accent: the web's ring thickens around a hollow center, Android's rings a dot. iOS has no radio button, so its skin marks the
// choice the way an iOS picker does: the label leads and the chosen row carries a
// trailing check, and a RadioGroup's options form one inset-grouped list (the
// design language's "one job, different control"). The group (one selected option at
// a time) is RadioGroup's job; standalone, this component renders one control in the
// state it is told to (controlled).

export interface RadioProps {
  /**
   * This option's value within a RadioGroup. When the radio sits inside a
   * `<RadioGroup>`, its checked state and selection are driven by the group
   * matching this value; ignored for a standalone radio.
   */
  value?: string | number;
  /** Whether this control is the selected option (controlled; standalone use). */
  checked?: boolean;
  /** Alias for `checked`, for callers that think in terms of "selected". */
  selected?: boolean;
  /** Fired on press with the next checked value (always true for a radio). Web keyboard activation supports Space on release and Enter; RadioGroup also handles arrows. */
  onChange?: (checked: boolean, event: GestureResponderEvent) => void;
  /** E2E hook forwarded to the pressable row. */
  testID?: string;
  /** Label text (the option's title) shown beside the control. */
  children?: ReactNode;
  /**
   * Optional muted secondary line rendered under the label, for the common
   * title-plus-description option (a plan picker, a settings choice). Supplying it
   * builds the stacked title/description layout inside the control, so the caller
   * never hand-composes a Row + Column + two Typography nodes per option.
   */
  description?: ReactNode;
  /**
   * Render the whole control as a selectable option CARD: the mark
   * <!-- only: web -->
   * (the ring, or the
   * trailing check on iOS)
   * <!-- /only -->
   * <!-- only: ios -->
   * (the trailing check)
   * <!-- /only -->
   * <!-- only: android -->
   * (the ring)
   * <!-- /only -->
   * plus the title and description sit inside Card chrome
   * (bordered, padded), and the ENTIRE card is the tap target. When this radio is the
   * chosen option, the card takes Card's own `selected` treatment (a primary border and
   * a soft primary tint), so the whole tile reads as chosen, not just the mark. Pairs
   * with `description` for a plan/tier picker, and is still group-wired through `value`
   * inside a `<RadioGroup>`.
   */
  card?: boolean;
  /**
   * A trailing detail on the title's line (a version, a price, a status pill): a string
   * is set in the small mono meta type in the subtle ink, a node (a `Badge`) as it is.
   * The title takes the row, so in a full-width option the detail sits at its end; in a
   * `row` group's hugging option it follows the title.
   */
  meta?: ReactNode;
  /**
   * A `card` tile's icon (a kit `Icon` with no tone of its own): the tile stacks the icon
   * and the mark on one line above the title and description. The icon takes the accent
   * text ink while the option is chosen and the subtle ink otherwise. Ignored without
   * `card`.
   */
  icon?: ReactNode;
  // Size (pick one; default is the 18px control on the web).
  small?: boolean;
  large?: boolean;
  /** Dim the control and block presses. */
  disabled?: boolean;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

export type Size = "small" | "default" | "large";

// Size precedence when more than one is passed: first match wins.
export function sizeOf(p: RadioProps): Size {
  if (p.small) return "small";
  if (p.large) return "large";
  return "default";
}

/** A radio button: a circular control that marks the chosen option in the accent. */
export interface RingMark {
  kind: "ring";
  /** The circular control. `checked` swaps the neutral border for primary. `nudge` aligns the ring to a label's first line. */
  ring: (tokens: ColorTokens, size: Size, checked: boolean, nudge: boolean) => ViewStyle;
  /** The centered fill dot, rendered only when checked; null where the chosen ring is hollow. */
  dot: ((tokens: ColorTokens, size: Size) => ViewStyle) | null;
  /** An unchosen ring's look under a hovering pointer (the web's soft accent ring); omit for none. */
  hover?: (tokens: ColorTokens) => ViewStyle;
}

/** A checkmark row (iOS, which has no radio button): the label leads and the chosen option carries a trailing check. */
export interface CheckMark {
  kind: "check";
  /** The trailing check glyph shown on the chosen option: its color, size, and the width of the column it ends. */
  glyph: (tokens: ColorTokens, size: Size) => { color: string; size: number; width: number };
}

/** The inset-grouped list a RadioGroup's options form on a platform whose single choice is a checkmark list. */
export interface RadioListSkin {
  /** The section around the options (the list's fill, corner and clip). */
  section: (tokens: ColorTokens) => ViewStyle;
  /** The hairline drawn between two rows. */
  separator: (tokens: ColorTokens) => ViewStyle;
  /** A row's insets inside the section. */
  cell: ViewStyle;
  /** The row highlight while pressed. */
  cellPressed: (tokens: ColorTokens) => ViewStyle;
}

// The only thing a platform skin owns: how the chosen option is marked, the label
// styles for a given state and size, the list a group forms (if any), plus the
// press/disabled feedback. Everything else is the shell.
export interface RadioSkin {
  /** How the control marks the chosen option: a ring and dot, or a trailing check. */
  mark: RingMark | CheckMark;
  /** The label text beside the mark. */
  label: (tokens: ColorTokens, size: Size, disabled: boolean) => TextStyle;
  /** The muted secondary description line, rendered under the label when present. */
  description: (tokens: ColorTokens, size: Size, disabled: boolean) => TextStyle;
  /** A string `meta`'s type: the small mono meta line in the subtle ink. */
  meta: (tokens: ColorTokens) => TextStyle;
  /**
   * The `card` mode chrome: the whole control wrapped as a selectable Card surface
   * (bordered + padded, per-OS radius/curve), derived from the kit Card skin. When
   * `checked`, it applies Card's own `selected` treatment (primary border + soft tint).
   */
  card: (tokens: ColorTokens, checked: boolean) => ViewStyle;
  /** The space between the mark and the text. */
  rowGap: number;
  /** The space between a group's options: plain rows, and card tiles. */
  groupGap: { plain: number; card: number };
  /**
   * The inset-grouped list a RadioGroup's plain options form (iOS's inline picker), or
   * null where a group stays a stack of controls (the web and Android).
   */
  list: RadioListSkin | null;
  /** Opacity applied to the row when disabled. */
  disabledOpacity: number;
  /** iOS/web dim the row on press; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over the ring; null on iOS/web. */
  ripple: ((tokens: ColorTokens) => { color: string; borderless: boolean; radius?: number }) | null;
}

// The pressable row: control beside an optional label, control top-aligned so a
// multi-line label hangs from the ring's first line. The skin sets the gap.
const ROW: ViewStyle = { flexDirection: "row", alignItems: "flex-start" };

// A checkmark row: the text takes the row and the check trails at its end, centered on
// the row the way iOS centers a cell's accessory beside a two-line title.
const CHECK_ROW: ViewStyle = { flexDirection: "row", alignItems: "center" };
const CHECK_TEXT: ViewStyle & TextStyle = { flexGrow: 1 };
// The check ends its column, and keeps it on an unchosen row, so choosing an option never
// reflows its label.
const CHECK_CELL: ViewStyle = { flexShrink: 0, flexDirection: "row", justifyContent: "flex-end" };
const CHECK_HIDDEN: ViewStyle = { opacity: 0 };

// Stacks the title over its description beside the ring, the description right under it
// (the line heights carry the spacing). `flexShrink` lets a long description wrap within
// the row instead of forcing the row wider.
const TEXT_COLUMN: ViewStyle = { flexShrink: 1, minWidth: 0 };

// A title with a trailing `meta`: the title takes the line's free width (so a full-width
// option ends with the detail) and the detail centres on it, 8 after.
const TITLE_LINE: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8 };
const TITLE_GROWS: TextStyle = { flexGrow: 1, flexShrink: 1 };
const META_CELL: ViewStyle = { flexShrink: 0 };

// A `card` tile with an `icon`: the icon and the mark share the top line at its ends, the
// title and description under them (the Controls page's plan tiles, `c-radio`:
// `display:flex;flex-direction:column;gap:14px` around a `justify-content:space-between`
// head row).
const STACKED_TILE: ViewStyle = { flexDirection: "column", alignItems: "stretch", gap: 14 };
const TILE_HEAD: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "space-between" };

/** Build a Radio component from a platform skin.
 * @ref Ref to the interactive radio row, preserving group navigation. Typed as a React Native View. On web, React Native Web exposes its DOM host; focus() and blur() move browser focus. Native host behavior depends on the platform and React Native version. Calling focus() does not activate the control or call accessibility focus APIs.
 */
export function createRadio(skin: RadioSkin) {
  const Radio = forwardRef<View, RadioProps>(function Radio(props, ref) {
    const { checked, selected, onChange, children, description, card, meta, style } = props;
    const tileIcon = card ? props.icon : undefined;
    const size = sizeOf(props);
    const theme = useMaterialTheme({ static: true, layer: "control" });
    const { tokens } = theme;
    // The ring is a small mark inside content, not a surface: it draws the skin's own ring
    // and dot in every mode, glass included, with no pane and no rim (the owner's GS-5
    // decision), and takes the contrasting border under Increase Contrast. A card-mode radio
    // is a CONTENT-layer pane like a selectable Card, tinted while checked.
    // Whether the control carries any text at all (title and/or description).
    const hasText = children != null || description != null || meta != null;

    // Inside a RadioGroup the group owns selection: this radio reads checked from
    // the group matching its `value`, and pressing it tells the group to select
    // that value. Standalone, it stays a controlled radio driven by checked/
    // selected. The group can also disable the whole set.
    const group = useRadioGroup();
    const inGroup = group != null && props.value !== undefined;
    const isChecked = inGroup ? group.value === props.value : !!(checked ?? selected);
    const disabled = !!props.disabled || !!group?.disabled;
    // A plain option inside a group that forms a list (iOS) is one of the section's rows:
    // it takes the cell insets and the row highlight. A card stays its own tile.
    const cell = group?.list && !card ? skin.list : null;
    const { mark } = skin;

    const handlePress = (event: GestureResponderEvent) => {
      if (inGroup) group.select(props.value as string | number, event);
      onChange?.(true, event);
    };
    const keyboard = useSpaceActivation(disabled, handlePress);
    // The web rings an unchosen ring while a pointer hovers the row; the row never moves,
    // so it is its own hover target (src/style/hover.tsx).
    const { hovered, target: hoverTarget } = useHover(mark.kind === "ring" && mark.hover != null && !disabled);

    // Card mode: the whole control renders inside selectable Card chrome and the entire
    // card is the tap target. The chrome (border + tint) tracks isChecked, so choosing
    // an option lights its whole tile the way `<Card selected>` does. The chrome rides
    // the Pressable itself; only the outer layout `style` moves to the RippleClip wrapper.
    const cardChrome = card ? skin.card(tokens, isChecked) : null;

    // Ripple (Android): a card uses a bounded surface ripple over the whole tile (clipped
    // to the rounded corners by the RippleClip parent); a plain radio uses the skin's
    // borderless ring ripple. iOS/web ignore android_ripple and keep the pressedOpacity dim.
    // The card's pane is a child of the Pressable: where it renders, the ripple draws in the
    // foreground, over it (`paneRipple`).
    const ripple = paneRipple(cardChrome != null ? theme : false, card ? surfaceRipple(tokens) : skin.ripple ? skin.ripple(tokens) : undefined);

    // Roving-focus wiring from the group (web arrow-key nav): the group makes only
    // the selected radio a tab stop and the arrows move + select. `ref` passes
    // explicitly; `focusable`/`tabIndex`/`onKeyDown` ride through a cast (RN's
    // Pressable types omit onKeyDown). Undefined for a standalone radio.
    const roving = inGroup ? group.itemProps?.(props.value as string | number) : undefined;
    const hostRef = useComposedRefs<View>(roving?.ref, ref);
    const rovingProps = roving
      ? { focusable: roving.focusable, tabIndex: roving.tabIndex }
      : {};

    const rowBox = [mark.kind === "check" ? CHECK_ROW : ROW, { gap: skin.rowGap }, cell ? cell.cell : null, tileIcon != null ? STACKED_TILE : null];
    const glyph = mark.kind === "check" ? mark.glyph(tokens, size) : null;
    // The ring, before the text (or at the end of a stacked tile's head). A stacked tile's
    // ring needs no nudge: it centres on the head line, not on the title.
    const ringMark = mark.kind === "ring" ? (
      <View style={[contrastStyle(theme, mark.ring(tokens, size, isChecked, hasText && tileIcon == null)), hovered && !isChecked && mark.hover ? mark.hover(tokens) : null]}>
        {isChecked && mark.dot ? <View style={mark.dot(tokens, size)} /> : null}
      </View>
    ) : null;
    const control = (
      <Pressable
        ref={hostRef}
        {...hoverTarget}
        {...(rovingProps as object)}
        {...({ ...keyboard, onKeyDown: (event: Parameters<typeof keyboard.onKeyDown>[0]) => {
          keyboard.onKeyDown(event);
          if (!event.defaultPrevented) roving?.onKeyDown(event);
        } } as object)}
        onPress={handlePress}
        disabled={disabled}
        testID={props.testID}
        // Icon-only (no text): grow the small ring's tap target toward ~44pt. With a
        // label, a card (whose whole padded tile is the target) or a list cell (a
        // full-width row at the platform's row height), the control is already a generous
        // target, so leave it. A cell's slop would also be cut by the section's clip and
        // reach into the neighboring rows.
        hitSlop={!hasText && !card && cell == null ? 8 : undefined}
        accessibilityRole="radio"
        accessibilityState={{ checked: isChecked, disabled: !!disabled }}
        aria-checked={isChecked}
        android_ripple={ripple}
        style={({ pressed }) => [
          // Card mode: the pressable IS the card surface (border, radius, fill, padding),
          // its whole box handed to paneStyle so a resting border becomes padding under glass
          // and a checked card's primary border stays, a state border over its pane.
          cardChrome ? paneStyle(theme, [rowBox, cardChrome, tileIcon != null ? STACKED_TILE : null], isChecked) : rowBox,
          disabled ? { opacity: skin.disabledOpacity } : null,
          // A list row highlights while pressed (the iOS cell highlight, an ink tint over
          // glass); anywhere else the skin's own dim.
          cell && pressed ? withInnerFill(theme, cell.cellPressed(tokens), "firm") : null,
          !cell && skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
          // In card mode the outer layout `style` rides the RippleClip wrapper (the
          // outermost node), so the clip and the caller's layout stay in lockstep.
          card ? null : style,
        ]}
      >
        {cardChrome ? <GlassPane layer="content" shape={cardChrome} stateBorder={isChecked} tint={isChecked ? legibleWash(theme, "selection", { layer: "content" }) : undefined} /> : null}
        {tileIcon != null ? (
          // The stacked tile's head: its icon in the option's ink, the mark at the end.
          <View style={TILE_HEAD}>
            <InkProvider ink={isChecked ? primaryText(tokens) : tokens["subtle-foreground"] ?? tokens["muted-foreground"]}>{tileIcon}</InkProvider>
            {ringMark}
          </View>
        ) : ringMark}
        {hasText ? (
          description != null || meta != null ? (
            <View style={[TEXT_COLUMN, mark.kind === "check" || meta != null ? CHECK_TEXT : null]}>
              {meta != null ? (
                <View style={TITLE_LINE}>
                  {children != null ? <Text style={[skin.label(tokens, size, !!disabled), TITLE_GROWS]}>{children}</Text> : null}
                  <View style={META_CELL}>{typeof meta === "string" || typeof meta === "number" ? <Text style={skin.meta(tokens)}>{meta}</Text> : meta}</View>
                </View>
              ) : children != null ? <Text style={skin.label(tokens, size, !!disabled)}>{children}</Text> : null}
              {description != null ? <Text style={skin.description(tokens, size, !!disabled)}>{description}</Text> : null}
            </View>
          ) : (
            <Text style={[skin.label(tokens, size, !!disabled), mark.kind === "check" ? CHECK_TEXT : null]}>{children}</Text>
          )
        ) : null}
        {glyph ? (
          // The row's checked state already names the choice, so the glyph is hidden
          // from assistive technology (it would otherwise join the row's name).
          <View aria-hidden importantForAccessibility="no-hide-descendants" style={[CHECK_CELL, { width: glyph.width }, isChecked ? null : CHECK_HIDDEN]}>
            <Icon check decorative size={glyph.size} color={glyph.color} />
          </View>
        ) : null}
      </Pressable>
    );

    // A card wraps the pressable in RippleClip so its bounded Android ripple is clipped to
    // the card's rounded corners (on iOS/web RippleClip is a transparent layout passthrough
    // that still owns the outer `style`). A plain radio returns the pressable unchanged.
    return card ? (
      <RippleClip shape={cornerRadii(cardChrome)} style={style}>
        {control}
      </RippleClip>
    ) : (
      control
    );
  });
  Radio.displayName = "Radio";
  return Radio;
}
