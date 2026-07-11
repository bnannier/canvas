import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { View, Text, Pressable, useTheme, useControllableState, controlRipple, pressDim, palette, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { Icon } from "../icon/icon.js";

// Shared Chip shell. The interactive/removable pill, so no call site hand-composes
// a `borderRadius + backgroundColor + padding` Pressable to build a filter chip,
// tag, or token. A Chip carries an optional leading icon and label, becomes
// tappable with `onPress` (a filter toggle), and grows a trailing "×" remove
// button with `onRemove`.
//
// A chip is a LOW-emphasis tag, not a call to action, so it never wears a saturated
// button fill: every chip renders a SOFT tint (a light wash + subtle border + strong
// text; the reverse in dark), the same recipe Badge's status pills use, so the two
// read as one system. Two orthogonal axes drive the look:
//   - Color: the tint's hue. A semantic status (success / warning / error / info /
//     neutral) OR a free-form palette hue (red … rose, gray). Omit for the neutral tag.
//   - Emphasis: `outline` drops the fill for a border-only chip; `primary` is the
//     brand-accent (indigo) tint and the state a selectable chip lights up to.
//
// Chip is a "Light" platform treatment: one structure and semantic colors (here),
// with per-OS touches limited to the label type and shape (in the skin).

// Chromatic hues backed by the Tailwind palette; each renders a soft tinted tag.
export type Hue =
  | "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald"
  | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "fuchsia"
  | "purple" | "pink" | "rose";

// Literal-hue props, scanned in this order (first match wins) after the status names.
const HUES: Hue[] = [
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan",
  "sky", "blue", "indigo", "violet", "fuchsia", "purple", "pink", "rose",
];

export interface ChipSkin {
  /** Pill shape + padding + gap (the one, compact size). */
  base: ViewStyle;
  /** Label type. */
  labelType: TextStyle;
  /** Remove "×" glyph size. */
  removeSize: number;
}

export interface ChipProps {
  /** The chip label. */
  children?: ReactNode;
  /** A leading element (e.g. an `<Icon />` or a small `<Avatar />`). An `<Icon />` is
   *  auto-tinted to the chip's label color unless it sets its own color. */
  icon?: ReactNode;
  /** A trailing element (e.g. a chevron for a menu trigger). Rendered after the label. */
  trailing?: ReactNode;
  /** Makes the whole chip tappable (e.g. toggling a filter). */
  onPress?: () => void;
  /** Adds a trailing "×" remove button firing this handler. */
  onRemove?: () => void;
  /**
   * Turns the chip into a filter toggle that owns its own selected state: pressing
   * it lights up to the active tint (its color's fill, or the brand `primary` indigo
   * when the chip has no color) and back. Selection is controlled via `selected`,
   * uncontrolled via `defaultSelected`. Give it an `outline` base so the unselected
   * (border-only) and selected (filled) states read apart.
   */
  selectable?: boolean;
  /** Selected state for a selectable chip (CONTROLLED). Omit for uncontrolled use. */
  selected?: boolean;
  /** Initial selected state for an uncontrolled selectable chip. */
  defaultSelected?: boolean;
  /** Fired with the next selected state when a selectable chip is pressed. */
  onSelectedChange?: (selected: boolean) => void;
  // Color axis (pick one; default the neutral tag). Two families, both a soft tint:
  //  - Semantic status (matches Badge): success / warning / error / info / neutral.
  success?: boolean;
  warning?: boolean;
  error?: boolean;
  info?: boolean;
  neutral?: boolean;
  //  - Free-form palette hues, plus `gray` for an explicit neutral tag.
  red?: boolean;
  orange?: boolean;
  amber?: boolean;
  yellow?: boolean;
  lime?: boolean;
  green?: boolean;
  emerald?: boolean;
  teal?: boolean;
  cyan?: boolean;
  sky?: boolean;
  blue?: boolean;
  indigo?: boolean;
  violet?: boolean;
  fuchsia?: boolean;
  purple?: boolean;
  pink?: boolean;
  rose?: boolean;
  gray?: boolean;
  // Emphasis (orthogonal to color). `outline` is border-only; `primary` is the
  // brand-accent (indigo) tint and the selectable "on" look. `secondary` is the
  // default neutral tag (kept for back-compat; same as passing no color).
  secondary?: boolean;
  primary?: boolean;
  outline?: boolean;
  // A chip has ONE compact size, so there is no size axis.
  disabled?: boolean;
  accessibilityLabel?: string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For layout composition only (not styling). */
  style?: StyleProp<ViewStyle>;
}

// The three colors a chip paints with: container fill, border, and label/glyph text.
interface Appearance {
  bg: string;
  border: string;
  text: string;
}

// The chosen hue from the color axis. Status names alias a hue (matching Badge);
// literal hues resolve to themselves. `neutral`/`gray` carry no hue but flag the
// muted-gray tag. Status names are scanned first so a semantic intent wins.
function colorOf(p: ChipProps): { hue: Hue | null; mutedGray: boolean } {
  if (p.success) return { hue: "green", mutedGray: false };
  if (p.warning) return { hue: "amber", mutedGray: false };
  if (p.error) return { hue: "red", mutedGray: false };
  if (p.info) return { hue: "blue", mutedGray: false };
  if (p.neutral) return { hue: null, mutedGray: true };
  for (const h of HUES) if ((p as Record<string, unknown>)[h]) return { hue: h, mutedGray: false };
  if (p.gray) return { hue: null, mutedGray: true };
  return { hue: null, mutedGray: false };
}

// A chromatic hue's soft tint: a light 50 fill + 200 border + 700 text in light, a
// deep 950 fill + 800 border + 400 text in dark (Badge's status recipe). `outline`
// drops the fill for a border-only chip in the same hue.
function hueTint(hue: Hue, dark: boolean, outline: boolean): Appearance {
  if (outline) {
    return dark
      ? { bg: "transparent", border: palette[`${hue}-700`], text: palette[`${hue}-400`] }
      : { bg: "transparent", border: palette[`${hue}-300`], text: palette[`${hue}-700`] };
  }
  return dark
    ? { bg: palette[`${hue}-950`], border: palette[`${hue}-800`], text: palette[`${hue}-400`] }
    : { bg: palette[`${hue}-50`], border: palette[`${hue}-200`], text: palette[`${hue}-700`] };
}

// The neutral (uncolored) chip: the default soft-secondary tag, a muted-gray tag
// (`gray`/`neutral`), or a border-only outline. Neutral stays on the scheme-aware
// semantic tokens (always legible) rather than the fixed palette.
function neutralTint(tokens: ColorTokens, outline: boolean, mutedGray: boolean): Appearance {
  if (outline) return { bg: "transparent", border: tokens.border, text: tokens.foreground };
  if (mutedGray) return { bg: tokens.muted, border: tokens.border, text: tokens["muted-foreground"] };
  return { bg: tokens.secondary, border: tokens.border, text: tokens["secondary-foreground"] };
}

/** Build a Chip from a platform skin. */
export function createChip(skin: ChipSkin) {
  return function Chip(props: ChipProps) {
    const { children, icon, trailing, onPress, onRemove, disabled, accessibilityLabel, testID, style } = props;
    const { tokens, dark } = useTheme();

    // A selectable chip is a filter toggle that owns its selected state (controlled
    // via `selected`, uncontrolled via `defaultSelected`). It is "selectable" when
    // asked explicitly or when any selection prop is passed.
    const selectable =
      props.selectable === true ||
      props.selected !== undefined ||
      props.defaultSelected !== undefined ||
      props.onSelectedChange !== undefined;
    const [selectedState, setSelected] = useControllableState<boolean>(
      props.selected,
      props.defaultSelected ?? false,
      props.onSelectedChange,
    );

    const { hue, mutedGray } = colorOf(props);
    const accent = props.primary === true; // brand-accent (indigo) tone / the "active" look
    const outline = props.outline === true;
    const selectedActive = selectable && selectedState;
    // A tappable chip reports its toggle/active state to AT (see the Pressable below).
    const isSelected = selectable ? selectedState : accent;

    // Resolve the paint. A selected filter chip lights up to a filled tint of its
    // color (or brand indigo when it has none); otherwise the color axis + `outline`
    // pick the tint, and `primary` maps to the indigo accent.
    let appearance: Appearance;
    if (selectedActive) {
      appearance = hueTint(hue ?? "indigo", dark, false);
    } else if (hue) {
      appearance = hueTint(hue, dark, outline);
    } else if (accent) {
      appearance = hueTint("indigo", dark, outline);
    } else {
      appearance = neutralTint(tokens, outline, mutedGray);
    }

    const handlePress = () => {
      if (selectable) setSelected(!selectedState);
      onPress?.();
    };

    const container: StyleProp<ViewStyle> = [
      skin.base,
      { backgroundColor: appearance.bg, borderColor: appearance.border },
      disabled ? { opacity: 0.5 } : null,
      style,
    ];

    // Auto-tint a leading/trailing `<Icon />` to the chip's label color so a bare
    // `<Icon check />` matches its chip's hue without the caller threading the color.
    // An Icon that sets its own `color` (or a semantic color boolean, which wins
    // inside Icon) keeps it; a non-Icon node (an Avatar) ignores the injected color.
    const tint = (node: ReactNode): ReactNode =>
      isValidElement(node)
        ? cloneElement(node as ReactElement<Record<string, unknown>>, {
            color: (node.props as Record<string, unknown>).color ?? appearance.text,
          })
        : node;

    const inner = (
      <>
        {tint(icon)}
        {children != null ? (
          <Text style={[skin.labelType, { color: appearance.text }]}>
            {children}
          </Text>
        ) : null}
        {tint(trailing)}
        {onRemove ? (
          <Pressable
            onPress={onRemove}
            disabled={disabled}
            accessibilityRole="button"
            // Name the specific chip, not a bare "Remove", when the label is a string.
            accessibilityLabel={typeof children === "string" ? `Remove ${children}` : "Remove"}
            // Grow the ~14px glyph toward a ~44pt target; bias the slop away from the label (left).
            hitSlop={{ top: 15, bottom: 15, left: 8, right: 15 }}
          >
            {/* The "×" rides the chip's label color so it matches every hue. */}
            <Icon x size={skin.removeSize} color={appearance.text} />
          </Pressable>
        ) : null}
      </>
    );

    // Tappable chip (a filter toggle): the whole pill is the Pressable, kept even when
    // disabled so it holds its button role + disabled state (a plain View would drop
    // both). The remove button, when present, is a nested Pressable with its own handler.
    if (onPress || selectable) {
      return (
        <Pressable
          onPress={handlePress}
          disabled={disabled}
          testID={testID}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          // Toggle state to AT: the active/selected chip reads as pressed. Announce
          // it natively via accessibilityState.selected and on the web via
          // aria-pressed (RNW drops accessibilityState at the DOM), the dual alias
          // the Switch uses.
          accessibilityState={{ selected: isSelected, disabled: !!disabled }}
          aria-pressed={isSelected}
          // The compact pill is only ~22pt tall; grow its whole tap target toward ~44pt.
          hitSlop={11}
          // Android shows a ripple state layer on press; iOS/web keep the opacity dim.
          android_ripple={controlRipple(tokens)}
          style={({ pressed }) => [container, pressDim(pressed, 0.85)]}
        >
          {inner}
        </Pressable>
      );
    }

    return (
      <View style={container} testID={testID} accessibilityLabel={accessibilityLabel}>
        {inner}
      </View>
    );
  };
}
