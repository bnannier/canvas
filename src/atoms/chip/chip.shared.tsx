import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { View, Text, Pressable, RippleClip, StyleSheet, cornerRadii, useHugStyle, useControllableState, surfaceRipple, pressDim, statusColors, type StatusColorTone, type Hue, type ColorTokens, type LayoutStyle, type StyleProp, type ViewStyle, type TextStyle, GlassPane, paneStyle, paneRipple, alpha, isGlass } from "../../style/index.js";
import { composite, contrastRatio, oklchHex, oklchOf } from "../../style/color.js";
import { useSpaceActivation } from "../../style/use-space-activation.js";
import { useChipGroup } from "./chip-context.js";
import { reachSlop, useClipSlop } from "../../style/clip-slop.js";
import { inlineSide, rowSeam, slopSides } from "../../style/touch-seam.js";
import { leastLine, styleBox, styleInsets, useSeededMinTargetSlop } from "../../style/touch-target-seed.js";
import { useHover } from "../../style/hover.js";
import { primaryText } from "../../style/primary-text.js";
import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { Icon } from "../icon/icon.js";

// Shared Chip shell. The interactive/removable pill, so no call site hand-composes
// a `borderRadius + backgroundColor + padding` Pressable to build a filter chip,
// tag, or token. A Chip carries an optional leading icon and label, becomes
// tappable with `onPress` (a filter toggle), and grows a trailing "×" remove
// button with `onRemove`.
//
// The look is the Canvas v4 hand-off's chip (`K.def('chip')`): the neutral chip is the
// raised neutral pill inside its hairline, and a coloured chip is its SOFT pill (the
// color's wash under the color's ink, the recipe Alert and every toned surface share).
// Two orthogonal axes drive the look:
//   - Color: a semantic status (success / warning / error / info, from statusColors,
//     so a success chip and a success badge are one state; neutral is the muted tag)
//     OR a free-form palette hue (red … rose, gray). Omit for the neutral tag.
//   - Emphasis: `outline` drops the fill for the field-border edge around the color's
//     ink; `primary` is the solid accent. A selected filter chip is the accent's soft
//     wash in the accent ink, whatever its color.
//
// Chip is a "Light" platform treatment: one structure and semantic colors (here),
// with the per-OS look in the skin: label type, shape, and the Android M3 anatomy
// (32dp sizing, icon-side insets, the idle outline, the tonal selected filter chip and
// its checkmark).

// Chromatic hues backed by the Tailwind palette; each renders a soft tinted tag.
// The union itself lives beside `palette` in the style layer, since Badge, Alert and
// this file all speak it.
export type { Hue };

// Literal-hue props, scanned in this order (first match wins) after the status names.
const HUES: Hue[] = [
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan",
  "sky", "blue", "indigo", "violet", "fuchsia", "purple", "pink", "rose",
];

export interface ChipSkin {
  /** Container shape, height and gap (the one, compact size). */
  base: ViewStyle;
  /** Per-side horizontal insets: beside text, beside an icon (a leading icon, the selected
   *  check, a trailing element), and beside the remove control. The shell resolves
   *  paddingStart/End from it. */
  sidePadding: { text: number; icon: number; remove: number };
  /** Label type. */
  labelType: TextStyle;
  /** The trailing count's type. */
  countType: TextStyle;
  /** The remove control's box (its disc, or the bare glyph). */
  removeSize: number;
  /** The remove "x" glyph inside that box. */
  removeGlyph: number;
  /** The remove disc's fill; omit for a bare glyph. */
  removeDisc?: string;
  /** Remove-button hitSlop, sized so glyph + slop reaches the platform's minimum
   *  touch target (44pt iOS / 48dp Android), biased away from the label: `left` is the
   *  side toward the label (the start; the shell mirrors it in a right-to-left layout). */
  removeHitSlop: { top: number; bottom: number; left: number; right: number };
  /** The minimum a tappable chip's touch area grows to, measured from the chip (M3's 48dp
   *  on Android): the shortfall is made up on each side, so a chip wider than the minimum
   *  reaches no further sideways. Wins over `bodyHitSlop`. */
  bodyMinTarget?: number;
  /** A tappable chip's fixed touch slop on every side, where the skin sets no
   *  `bodyMinTarget` (web and iOS: 11, which clears 44pt around the 25pt pill; the web
   *  drops hitSlop). */
  bodyHitSlop?: number;
  /** The selected filter chip's leading check: its size, and whether it replaces a
   *  leading icon (M3) or leads only a chip that has none (the hand-off's web chip). */
  selectedCheck: { size: number; replacesIcon: boolean };
  /** A selected chip keeps an accent edge (the web); M3 drops the outline. */
  selectedEdge?: boolean;
  /** M3: an idle neutral chip is the bare container inside its field-border outline. Omit
   *  for the raised neutral fill inside the hairline. */
  outlined?: boolean;
  /** M3: a neutral chip's leading icon takes the accent ink. */
  accentIcon?: boolean;
  /** A hovering pointer brightens the chip by this factor (the web). */
  hoverBrightness?: number;
  /** The disabled chip's opacity. */
  disabledOpacity: number;
}

export interface ChipProps {
  /** The chip label. */
  children?: ReactNode;
  /** A dimmed trailing count, set in the mono face. */
  count?: number | string;
  /** Pin a chip within an app-owned host layout. */
  start?: boolean;
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
   * it lights up (to the accent's soft wash, inside an accent edge on the web and iOS)
   * and back. Selection is controlled via `selected`, uncontrolled via `defaultSelected`.
   */
  selectable?: boolean;
  /** Selected state for a selectable chip (CONTROLLED). Omit for uncontrolled use. */
  selected?: boolean;
  /** Initial selected state for an uncontrolled selectable chip. */
  defaultSelected?: boolean;
  /** Fired with the next selected state when a selectable chip is pressed. */
  onSelectedChange?: (selected: boolean) => void;
  /**
   * The chip's option value inside a ChipGroup: the chip is one option of the pick-one
   * set, selected when the group's value is this one, and reads as a radio. Ignored
   * outside a group.
   */
  value?: string | number;
  // Color axis (pick one; default the neutral tag). Two families, both a soft tint:
  //  - Semantic status (matches Badge): success / warning / error / info / neutral.
  success?: boolean;
  warning?: boolean;
  /** The danger tone. This is the name the intent axis uses across the kit (Button,
   *  AlertDialog, and every chart) and the one the design hand-off uses here too. */
  destructive?: boolean;
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
  // Emphasis (orthogonal to color). `outline` is border-only; `primary` is the solid
  // accent. `secondary` is the raised neutral fill (the default on the web and iOS; on
  // Android it fills the otherwise bare outlined chip).
  secondary?: boolean;
  primary?: boolean;
  outline?: boolean;
  // A chip has ONE compact size, so there is no size axis.
  disabled?: boolean;
  /** Keep resting opacity while pressed, preserving the reference filter treatment. */
  steadyPress?: boolean;
  accessibilityLabel?: string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** For layout composition only (not styling). */
  style?: LayoutStyle;
}

// The three colors a chip paints with: container fill, border, and label/glyph text,
// plus what its glass pane takes under glass: a coloured chip's wash as the pane's tint
// (in place of the control tint, so the ink reads as it does in solid mode), or a solid
// selected chip's brand color.
interface Appearance {
  bg: string;
  border: string;
  text: string;
  glassTint?: string;
  brand?: string;
}

// The chosen color from the color axis: a status tone, a palette hue, or the muted-gray
// flag. Status names are scanned first so a semantic intent wins.
export function colorOf(p: ChipProps): { tone: StatusColorTone | null; hue: Hue | null; mutedGray: boolean } {
  if (p.success) return { tone: "success", hue: null, mutedGray: false };
  if (p.warning) return { tone: "warning", hue: null, mutedGray: false };
  if (p.destructive) return { tone: "error", hue: null, mutedGray: false };
  if (p.info) return { tone: "info", hue: null, mutedGray: false };
  if (p.neutral) return { tone: null, hue: null, mutedGray: true };
  for (const h of HUES) if ((p as Record<string, unknown>)[h]) return { tone: null, hue: h, mutedGray: false };
  if (p.gray) return { tone: null, hue: null, mutedGray: true };
  return { tone: null, hue: null, mutedGray: false };
}

// The hand-off's outline edge, the field border, around whatever ink the chip carries.
function outlineOf(tokens: ColorTokens, text: string): Appearance {
  return { bg: "transparent", border: tokens["field-border"] ?? tokens.input, text };
}

// A status tone's soft pill (statusColors): the wash under the ink, or for `outline` the
// field-border edge around the ink.
function toneTint(tokens: ColorTokens, tone: StatusColorTone, outline: boolean): Appearance {
  const { ink, wash } = statusColors(tokens, tone);
  return outline ? outlineOf(tokens, ink) : { bg: wash, border: "transparent", text: ink, glassTint: wash };
}

// The hand-off's free-hue chip (cv-kit-code.js, the `CH` colour flags): each hue is an
// oklch angle, its pill oklch(0.70 0.15 h) at 16% inside the same colour at 30%, under an
// ink that is oklch(0.64 0.17 h) mixed 72% with the foreground. Where that ink falls under
// 4.5:1 on the wash over the page (the light page's greens and blues, by a few tenths) it
// is walked in oklch lightness at its own hue until it clears, the rule the solved inks
// follow (CLAUDE.md design language item 1); it then clears a content pane and a control
// puck too (test/glass-controls.test.tsx). The three Canvas hues the hand-off does not
// name take Tailwind's own angles (emerald 163, sky 237, fuchsia 322).
export const HUE_ANGLE: Record<Hue, number> = {
  "red": 25, "orange": 50, "amber": 80, "yellow": 95, "lime": 125, "green": 150, "emerald": 163, "teal": 185, "cyan": 205,
  "sky": 237, "blue": 245, "indigo": 270, "violet": 290, "fuchsia": 322, "purple": 305, "pink": 350, "rose": 10,
};
export const HUE_CHIP = { l: 0.7, c: 0.15, wash: 0.16, edge: 0.3, ink: { l: 0.64, c: 0.17, mix: 0.72 } } as const;
const HUE_INKS = new Map<string, { wash: string; edge: string; ink: string }>();
export function hueChip(hue: Hue, tokens: ColorTokens, dark: boolean): { wash: string; edge: string; ink: string } {
  const key = `${hue}:${tokens.background}:${tokens.foreground}:${dark ? 1 : 0}`;
  const hit = HUE_INKS.get(key);
  if (hit) return hit;
  const h = HUE_ANGLE[hue];
  const base = oklchHex(HUE_CHIP.l, HUE_CHIP.c, h);
  const wash = alpha(base, HUE_CHIP.wash);
  const [lt, ct] = oklchOf(tokens.foreground) ?? [dark ? 1 : 0, 0, 0];
  const m = HUE_CHIP.ink.mix;
  const c = HUE_CHIP.ink.c * m + ct * (1 - m);
  let l = HUE_CHIP.ink.l * m + lt * (1 - m);
  let ink = oklchHex(l, c, h);
  const bed = composite(wash, tokens.background);
  while (contrastRatio(ink, bed) < 4.5 && l > 0 && l < 1) {
    l = Math.round((l + (dark ? 0.01 : -0.01)) * 1000) / 1000;
    ink = oklchHex(l, c, h);
  }
  const chip = { wash, edge: alpha(base, HUE_CHIP.edge), ink };
  HUE_INKS.set(key, chip);
  return chip;
}

function hueTint(tokens: ColorTokens, hue: Hue, dark: boolean, outline: boolean): Appearance {
  const { wash, edge, ink } = hueChip(hue, tokens, dark);
  if (outline) return outlineOf(tokens, ink);
  return { bg: wash, border: edge, text: ink, glassTint: wash };
}

// The neutral (uncolored) chip, as the hand-off's renderer and its colour-flag override
// draw it: the raised neutral fill inside the hairline in the foreground ink; `neutral`
// (the `mute` tone) that fill with no edge in the muted ink, and `gray` the same inside the
// hairline the chip already had; `secondary` the higher raised fill with no edge; a
// selectable chip at rest the bare container inside the field border; `outline` that
// border-only look. On a skin whose idle chip is the bare container (M3) the neutral chip
// is that container inside the field-border outline, and `secondary` fills it with no edge.
function neutralTint(tokens: ColorTokens, outline: boolean, muted: "neutral" | "gray" | null, outlined: boolean, secondary: boolean, selectable: boolean): Appearance {
  if (outline) return outlineOf(tokens, tokens.foreground);
  if (muted) return { bg: tokens.secondary, border: muted === "gray" ? (outlined ? tokens["field-border"] ?? tokens.input : tokens.border) : "transparent", text: tokens["muted-foreground"] };
  if (outlined) return secondary ? { bg: tokens.secondary, border: "transparent", text: tokens.foreground } : outlineOf(tokens, tokens.foreground);
  if (secondary) return { bg: tokens["surface-raised"] ?? tokens.secondary, border: "transparent", text: tokens.foreground };
  if (selectable) return outlineOf(tokens, tokens.foreground);
  return { bg: tokens.secondary, border: tokens.border, text: tokens.foreground };
}

// The solid accent (`primary`): the accent under its foreground ink, brand-tinted glass
// under glass.
function solidTint(tokens: ColorTokens): Appearance {
  return { bg: tokens.primary, border: "transparent", text: tokens["primary-foreground"], brand: tokens.primary };
}

// A selected filter chip, whatever its color: the accent's soft wash in the accent ink,
// inside an accent edge where the skin keeps one (a state edge, so it stays over a pane).
function selectedTint(tokens: ColorTokens, edge: boolean): Appearance {
  const wash = tokens["primary-soft"] ?? tokens["info-soft"] ?? tokens.accent;
  return { bg: wash, border: edge ? tokens.primary : "transparent", text: primaryText(tokens), glassTint: wash };
}

/** Build a Chip from a platform skin. */
export function createChip(skin: ChipSkin) {
  return function Chip(props: ChipProps) {
    const { children, icon, trailing, onPress, onRemove, accessibilityLabel, testID, style } = props;
    // An option of a ChipGroup: the group owns its selection, its disabled flag and its
    // roving tab stop.
    const group = useChipGroup();
    const option = group != null && props.value !== undefined ? group : null;
    const disabled = props.disabled === true || option?.disabled === true;
    const selectable =
      option != null ||
      props.selectable === true ||
      props.selected !== undefined ||
      props.defaultSelected !== undefined ||
      props.onSelectedChange !== undefined;
    // Removing metadata does not make its body an action surface.
    const staticMaterial = !(onPress || selectable);
    const theme = useMaterialTheme({ static: staticMaterial, layer: "control" });
    const { tokens, dark } = theme;
    // Under glass the chip is a CONTROL-layer puck: a GlassPane paints the material
    // behind its content (a coloured chip washes it with its color), and the pill drops
    // its fill and hairline (the pane's material and rim carry them). The pressable
    // shell keeps its tap, ripple and dim over it.
    // HUG: content width inside a stretching Column, content-sized in a Row.
    const naturalHug = useHugStyle();
    const hug = [naturalHug, props.start ? { alignSelf: "flex-start" as const } : null];
    const { hovered, target: hoverTarget } = useHover(skin.hoverBrightness != null);
    // A tappable chip's touch area grows to the skin's minimum where it sets one (Android):
    // the pill's own shortfall, measured, and seeded from its padding and border around one
    // label line so it is in place before the first layout (src/style/touch-target-seed.ts).
    const tappable = onPress != null || selectable;
    const bodyMin = tappable ? skin.bodyMinTarget ?? null : null;
    // The Android pill clips (its skin sets overflow hidden), and React Native hit-tests a
    // clipping view only inside its own bounds plus its own slop, so around a remove glyph
    // the pill carries the part of the glyph's slop (the 48dp close target) and the body's
    // that reaches past it, measured (src/style/clip-slop.ts). A tappable pill with no
    // remove glyph is itself the pressable, whose own slop needs no help. The same frames
    // place a body beside the glyph, which reaches the pill's own minimum target.
    const pillClips = (StyleSheet.flatten(skin.base) as ViewStyle).overflow === "hidden";
    const pillClip = useClipSlop(onRemove != null && (pillClips || bodyMin != null));

    // A selectable chip is a filter toggle that owns its selected state (controlled
    // via `selected`, uncontrolled via `defaultSelected`). It is "selectable" when
    // asked explicitly or when any selection prop is passed.
    const [selectedState, setSelected] = useControllableState<boolean>(
      props.selected,
      props.defaultSelected ?? false,
      props.onSelectedChange,
    );

    const { tone, hue, mutedGray } = colorOf(props);
    const accent = props.primary === true; // the solid accent
    const outline = props.outline === true;
    const selectedActive = option ? option.value === props.value : selectable && selectedState;
    const surfaced = !outline || selectedActive;
    // The selected filter chip leads with a checkmark: on M3 it replaces any leading icon,
    // on the web and iOS it leads only a chip with no icon of its own.
    const selectedCheck = selectedActive && (skin.selectedCheck.replacesIcon || icon == null) ? skin.selectedCheck.size : undefined;
    // A tappable chip reports its toggle/active state to AT (see the Pressable below).
    const isSelected = selectable ? selectedState : accent;

    // Resolve the paint. A selected filter chip lights up to the accent's soft wash;
    // otherwise the color axis + `outline` pick the tint, and `primary` is the solid
    // accent (an outlined `primary` keeps the accent ink inside the outline edge).
    let appearance: Appearance;
    if (selectedActive) {
      appearance = selectedTint(tokens, !!skin.selectedEdge);
    } else if (tone) {
      appearance = toneTint(tokens, tone, outline);
    } else if (hue) {
      appearance = hueTint(tokens, hue, dark, outline);
    } else if (accent) {
      appearance = outline ? outlineOf(tokens, primaryText(tokens)) : solidTint(tokens);
    } else {
      appearance = neutralTint(tokens, outline, mutedGray ? (props.neutral ? "neutral" : "gray") : null, !!skin.outlined, props.secondary === true, selectable);
    }

    const handlePress = () => {
      if (option) option.select(props.value as string | number);
      else if (selectable) setSelected(!selectedState);
      onPress?.();
    };

    // A group option is a radio: checked when chosen, the group's one tab stop when it is
    // the chosen (or first enabled) chip, its arrow keys the group's, and Space activates
    // it on release (RNW's responder handles Space for button roles only). A chip on its
    // own stays a toggle button (aria-pressed).
    const roving = option?.itemProps?.(props.value as string | number);
    const keyboard = useSpaceActivation(disabled || option == null, () => handlePress());
    const semantics = option
      ? {
          ...(roving ? { ref: roving.ref, focusable: roving.focusable, tabIndex: roving.tabIndex } : null),
          accessibilityRole: "radio" as const,
          accessibilityState: { checked: selectedActive, disabled },
          "aria-checked": selectedActive,
          onKeyDown: (event: Parameters<typeof keyboard.onKeyDown>[0]) => {
            keyboard.onKeyDown(event);
            if (!event.defaultPrevented) roving?.onKeyDown(event);
          },
          onKeyUp: keyboard.onKeyUp,
          onBlur: keyboard.onBlur,
        }
      : {
          accessibilityRole: "button" as const,
          accessibilityState: { selected: isSelected, disabled },
          "aria-pressed": isSelected,
        };

    // An icon-bearing side pads tighter than a text side, and the remove control's side
    // tighter still on the web; the shell resolves the per-side insets here. The selected
    // checkmark and a trailing element count as icons on their sides.
    const hasLeading = icon != null || selectedCheck != null;
    const trailingInset = onRemove != null ? skin.sidePadding.remove : trailing != null ? skin.sidePadding.icon : skin.sidePadding.text;

    const chrome: StyleProp<ViewStyle> = [
      skin.base,
      // The borderWidth stays when an edge is transparent, so the box never shifts between states.
      { backgroundColor: appearance.bg, borderColor: appearance.border },
    ];
    const liquid = surfaced && !staticMaterial;
    const puck = liquid && isGlass(theme);
    // A selected chip's accent edge is a state edge: it stays a border over the pane.
    const stateEdge = selectedActive && !!skin.selectedEdge;
    // The pill's whole box, its per-side insets included, so that under glass paneStyle
    // turns the resting border into padding on top of them.
    const box: StyleProp<ViewStyle> = [
      chrome,
      { paddingStart: hasLeading ? skin.sidePadding.icon : skin.sidePadding.text, paddingEnd: trailingInset },
    ];
    const container: StyleProp<ViewStyle> = [
      surfaced || theme.increasedContrast ? paneStyle(theme, box, stateEdge) : box,
      disabled && !liquid ? { opacity: skin.disabledOpacity } : null,
      // The hover brightens the chip; a filter would cut a glass pane off from the backdrop
      // it samples, so a puck brightens nothing.
      hovered && !disabled && !puck && skin.hoverBrightness != null ? { filter: `brightness(${skin.hoverBrightness})` } : null,
      hug,
      style,
    ];
    // The least box the pill renders at: its padding and border around one label line, and
    // around a remove glyph the glyph and the gap before it.
    const pill = StyleSheet.flatten(container) as ViewStyle;
    const pillGap = typeof pill.gap === "number" ? pill.gap : 0;
    const frameBox = styleBox(pill);
    const leastPill = {
      width: (frameBox.width ?? 0) + (onRemove ? skin.removeSize + pillGap : 0),
      height: frameBox.height != null && pill.height != null ? frameBox.height : (frameBox.height ?? 0) + Math.max(children != null ? leastLine(skin.labelType.lineHeight ?? 0) : 0, onRemove ? skin.removeSize : 0),
    };
    const pillTarget = useSeededMinTargetSlop(bodyMin, bodyMin == null ? undefined : leastPill);

    // Auto-tint a leading/trailing `<Icon />` to the chip's label color so a bare
    // `<Icon check />` matches its chip's hue without the caller threading the color.
    // An Icon that sets its own `color` (or a semantic color boolean, which wins
    // inside Icon) keeps it; a non-Icon node (an Avatar) ignores the injected color.
    const tint = (node: ReactNode, ink = appearance.text): ReactNode =>
      isValidElement(node)
        ? cloneElement(node as ReactElement<Record<string, unknown>>, {
            color: (node.props as Record<string, unknown>).color ?? ink,
          })
        : node;
    // M3 draws a neutral chip's leading icon in the accent ink.
    const leadInk = skin.accentIcon && !tone && !hue && !accent && !selectedActive ? primaryText(tokens) : appearance.text;

    // The chip's content minus the remove control: the leading check/icon, the
    // label, and any trailing element.
    const pane = surfaced ? <GlassPane static={staticMaterial} layer="control" shape={skin.base} tint={appearance.glassTint} brand={appearance.brand} /> : null;
    const bodyContent = (
      <>
        {selectedCheck != null ? (
          // The selected filter chip's leading checkmark, riding the label color.
          // Decorative: the Pressable already reports the selected state
          // (accessibilityState.selected / aria-pressed).
          <Icon check decorative size={selectedCheck} color={appearance.text} />
        ) : (
          tint(icon, leadInk)
        )}
        {children != null ? (
          <Text style={[skin.labelType, { color: appearance.text }]}>
            {children}
          </Text>
        ) : null}
        {props.count == null ? null : <Text style={[skin.countType, { color: appearance.text }]}>{String(props.count)}</Text>}
        {tint(trailing)}
      </>
    );

    // The remove glyph's slop, biased away from the label on the start side (mirrored in a
    // right-to-left layout, where the label sits to its right).
    const removeBias = inlineSide("start") === "left"
      ? skin.removeHitSlop
      : { ...skin.removeHitSlop, left: skin.removeHitSlop.right, right: skin.removeHitSlop.left };
    // The tappable body's touch area. With no remove glyph the body is the pill: the pill's
    // measured slop, or the skin's fixed one. Beside a remove glyph the body answers for the
    // pill: it reaches the pill's own minimum target from where it sits in it (reachSlop,
    // src/style/clip-slop.ts), before the first layout from the pill's padding and border.
    const bodyFrame = pillClip.frame("body");
    const pillFrame = pillClip.frame();
    const shortfall = slopSides(pillTarget.hitSlop);
    const insets = styleInsets(pill);
    // A fixed-height pill centers its body: the body sits half the pill's spare height in.
    const centered = typeof pill.height === "number" ? (pill.height - leastLine(skin.labelType.lineHeight ?? 0)) / 2 : null;
    const bodyReach = bodyMin == null
      ? skin.bodyHitSlop
      : onRemove == null
        ? pillTarget.hitSlop
        : bodyFrame != null && pillFrame != null
          ? reachSlop(pillFrame, bodyFrame, pillTarget.hitSlop)
          : {
              top: (centered ?? insets.top) + shortfall.top,
              bottom: (centered ?? insets.bottom) + shortfall.bottom,
              [inlineSide("start")]: insets.start + shortfall[inlineSide("start")],
              [inlineSide("end")]: insets.end + shortfall[inlineSide("end")],
            };
    // A pressable body and the remove glyph sit the pill's gap apart, and React Native gives
    // a point both slops admit to the later sibling, the glyph: the seam between them is
    // split (src/style/touch-seam.ts), so a tap on the label never removes the chip.
    const [bodySlop, removeSlop] = tappable && onRemove
      ? rowSeam(bodyReach, removeBias, pillGap)
      : [bodyReach, removeBias];

    // The trailing "×" remove control, a button in its own right.
    const removeButton = onRemove ? (
      <Pressable
        onPress={onRemove}
        disabled={disabled}
        style={[
          { width: skin.removeSize, height: skin.removeSize, alignItems: "center", justifyContent: "center", borderRadius: 9999 },
          skin.removeDisc ? { backgroundColor: skin.removeDisc } : null,
          liquid && disabled ? { opacity: skin.disabledOpacity } : null,
        ]}
        accessibilityRole="button"
        // Name the specific chip, not a bare "Remove", when the label is a string.
        accessibilityLabel={typeof children === "string" ? `Remove ${children}` : "Remove"}
        // Grow the glyph to the platform minimum target (44pt iOS, 48dp
        // Android per the M3 input-chip close target); per-skin values,
        // biased away from the label, and split with a pressable body beside it.
        hitSlop={removeSlop}
        {...pillClip.measure("remove")}
      >
        {/* The "×" rides the chip's label color so it matches every hue. */}
        <Icon x size={skin.removeGlyph} color={appearance.text} />
      </Pressable>
    ) : null;

    // Interactive AND removable: the pill is a plain View shell (its appearance and
    // padding), holding TWO sibling buttons — the toggle body and the remove "×" —
    // so neither nests inside the other (a role="button" inside role="button" is
    // invalid on the web, and a nested remove press would bubble to the toggle).
    // The shell's own gap (from skin.base) separates them; the body reuses that gap
    // for its icon/label row. The press feedback + ripple move onto the toggle body.
    if (tappable && onRemove) {
      const bodyGap = (skin.base as { gap?: number }).gap;
      const measurePill = pillClip.measure().onLayout;
      return (
        <View
          style={container}
          testID={testID}
          hitSlop={pillClips ? pillClip.slop({ body: bodySlop, remove: removeSlop }) : undefined}
          onLayout={measurePill == null && pillTarget.onLayout == null ? undefined : (event) => {
            measurePill?.(event);
            pillTarget.onLayout?.(event);
          }}
        >
          {pane}
          <Pressable
            {...pillClip.measure("body")}
            {...hoverTarget}
            onPress={handlePress}
            disabled={disabled}
            {...(semantics as object)}
            accessibilityLabel={accessibilityLabel}
            hitSlop={bodySlop}
            android_ripple={surfaceRipple(tokens)}
            style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: bodyGap }, liquid && disabled ? { opacity: skin.disabledOpacity } : null, props.steadyPress ? null : pressDim(pressed, 0.85)]}
          >
            {bodyContent}
          </Pressable>
          {removeButton}
        </View>
      );
    }

    // Tappable chip (a filter toggle) with no remove control: the whole pill is the
    // Pressable, kept even when disabled so it holds its button role + disabled state.
    if (tappable) {
      return (
        // The whole-pill ripple is clipped to the rounded chip by this RippleClip parent
        // (Android only). A bounded android_ripple is the pressable's own rectangular-masked
        // background, which its own overflow:"hidden" cannot clip. See src/style/ripple-clip.
        <RippleClip shape={cornerRadii(container)} hitSlop={bodySlop} style={hug}>
          <Pressable
            onLayout={pillTarget.onLayout}
            {...hoverTarget}
            onPress={handlePress}
            disabled={disabled}
            testID={testID}
            // Toggle state to AT: the active/selected chip reads as pressed. Announce
            // it natively via accessibilityState.selected and on the web via
            // aria-pressed (RNW drops accessibilityState at the DOM), the dual alias
            // the Switch uses; a ChipGroup option reads as a checked radio instead.
            {...(semantics as object)}
            accessibilityLabel={accessibilityLabel}
            // The compact chip is short: its touch area grows to the minimum (Android) or by
            // the skin's fixed slop (iOS), the same area its RippleClip admits.
            hitSlop={bodySlop}
            // Android shows a BOUNDED ripple state layer on press (the M3 chip state layer
            // fills the container), clipped to the rounded outline by the RippleClip parent;
            // iOS/web keep the opacity dim. The pill's pane is a child of this Pressable, so
            // where it renders the ripple draws in the foreground, over it (`paneRipple`).
            android_ripple={paneRipple(surfaced ? theme : false, surfaceRipple(tokens))}
            style={({ pressed }) => [container, !liquid ? props.steadyPress ? null : pressDim(pressed, 0.85) : null]}
          >
            {({ pressed }) => <>
              {pane}
              <View style={[
                { flexDirection: "row", alignItems: "center", gap: skin.base.gap, flexShrink: 1 },
                liquid && disabled ? { opacity: skin.disabledOpacity } : null,
                liquid ? props.steadyPress ? null : pressDim(pressed, 0.85) : null,
              ]}>{bodyContent}</View>
            </>}
          </Pressable>
        </RippleClip>
      );
    }

    // Static chip (not tappable): a View; a remove "×" here is a lone button in a
    // non-interactive container, so there is no nesting to resolve.
    return (
      <View style={container} testID={testID} accessibilityLabel={accessibilityLabel} hitSlop={pillClip.slop({ remove: removeSlop })} {...pillClip.measure()}>
        {pane}
        {bodyContent}
        {removeButton}
      </View>
    );
  };
}
