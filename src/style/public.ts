// The style foundation's public surface, name by name. src/index.ts re-exports this
// file, never the internal hub (./index.ts), so a helper a skin needs stays internal
// until someone lists it here: adding a name is an API decision, and `bun run
// check:api` (tools/api/manifest.ts) holds every name to a classification and a docs
// page. Components keep importing their primitives and helpers from ./index.ts.
//
// The list is exactly what the hub's `export *` published before it was split out
// (test/public-api.test.ts holds the snapshot), so it still carries the kit's own
// helpers. Each keeps working: the owner retires them as deprecated aliases (audit K12-2),
// tagged `@deprecated` on their specifiers below, and the generated /foundation reference
// lists every one with what to use instead. Those the manifest still records as internal
// by accident are the later Foundations turns' to retire.

export {
  baseColors,
  brandColors,
  type BrandColors,
  type BreakpointKey,
  breakpoints,
  colorsByScheme,
  type ColorScheme,
  colorsFor,
  type ColorTokens,
  darkColors,
  darkGlass,
  fontSize,
  fontWeight,
  glassByScheme,
  type GlassTokens,
  letterSpacing,
  lightColors,
  lightGlass,
  lineHeight,
  mintColors,
  palette,
  type Palette,
  type PlatformKey,
  radius,
  shape,
  type ShapeTokens,
  spacing,
  type WidthKey,
  widths,
} from "./tokens.js";
export { type Hue, HUE_WASH, statusHues, type StatusTone } from "./status-hue.js";
export { statusColors, type StatusColors, type StatusColorTone } from "./status.js";
export {
  type Surface,
  ThemeProvider,
  type ThemeProviderProps,
  type ThemeTokenOverrides,
  type ThemeValue,
  useTheme,
} from "./theme.js";
// The viewport tier. SsrBreakpointContext (the context behind ThemeProvider's
// `ssrBreakpoint`) and React Native's `useWindowDimensions` were published by accident
// beside it; each is a deprecated alias that keeps working until a major (audit K12-2 and
// its OD5). The tags sit on these specifiers only: the kit's own modules import the
// declarations untagged.
export {
  BreakpointOverride,
  formFactor,
  type FormFactor,
  responsive,
  type Responsive,
  /**
   * @deprecated Kit internals: pass ThemeProvider's `ssrBreakpoint` prop to set the
   * bucket a server render assumes. It keeps working until a major.
   */
  SsrBreakpointContext,
  useBreakpoint,
  useFormFactor,
  useResponsive,
  /**
   * @deprecated React Native's own hook, passed through: use `useBreakpoint` or
   * `useFormFactor` for window-level chrome, `useContainerWidth` or `useMeasuredWidth`
   * inside a component, or React Native's own `useWindowDimensions` for raw pixels. It
   * keeps working until a major.
   */
  useWindowDimensions,
} from "./responsive.js";
export {
  type ContainerBreakpoint,
  type ContainerBreakpointOptions,
  containerProbe,
  type MeasuredWidth,
  useContainerBreakpoint,
  useContainerWidth,
  useMeasuredWidth,
} from "./container.js";
export { customShadow, shadow, type ShadowLevel } from "./shadow.js";
// The kit's tabular figures, published by accident through the style hub; a deprecated
// alias since Typography took the `tabular` prop that sets them (audit K12-2 tabular),
// which keeps working until a major. The tag sits on this specifier only.
export {
  /**
   * @deprecated Kit internals: set figures read down a column or updated in place with
   * `Typography`'s `tabular` prop. It keeps working until a major.
   */
  tabularNums,
} from "./numerals.js";
// The touch-target helpers the kit's controls measure themselves with, published by
// accident through the style hub and once announced for an app's own pressable (2.59.0).
// Every kit control meets the platform minimum itself (44 pt on iOS, 48 dp on Android), a
// control the kit lacks belongs in the kit rather than in a hand-built Pressable (the
// "Dogfood the kit" law), so each is a deprecated alias with no replacement that keeps
// working until a major (audit K12-2). As below, the tags sit on these specifiers only.
export {
  /**
   * @deprecated Kit internals, with no replacement: the options of the touch area the
   * kit's controls extend for themselves. It keeps working until a major.
   */
  type MinTargetOptions,
  /**
   * @deprecated Kit internals, with no replacement: the kit's controls meet the platform
   * minimum touch target themselves (`Button`, an icon `Button` included, `Chip`, and
   * `Avatar`, `Card` and the list rows given `onPress`), and a control the kit lacks
   * belongs in the kit. It keeps working until a major.
   */
  minTargetSlop,
  /**
   * @deprecated Kit internals, with no replacement: the platform minimum the kit's
   * controls meet for themselves (`Button`, `Chip`, and `Avatar`, `Card` and the list rows
   * given `onPress`). It keeps working until a major.
   */
  platformMinTarget,
  /**
   * @deprecated Kit internals, with no replacement: the platform minimums (44 pt on iOS,
   * 48 dp on Android) the kit's controls meet for themselves (`Button`, `Chip`, and
   * `Avatar`, `Card` and the list rows given `onPress`). It keeps working until a major.
   */
  TOUCH_TARGET,
  /**
   * @deprecated Kit skin internals, with no replacement: the minimum a kit skin declares
   * for its own control. It keeps working until a major.
   */
  type TouchTargetSkin,
  /**
   * @deprecated Kit internals, with no replacement: the kit's controls extend their own
   * touch area to the platform minimum from their first frame (`Button`, an icon `Button`
   * included, `Chip`, and `Avatar`, `Card` and the list rows given `onPress`), and a
   * control the kit lacks belongs in the kit, not in a hand-built Pressable. It keeps
   * working until a major.
   */
  useMinTargetSlop,
} from "./touch-target.js";
export { alpha, channelsOf, composite, contrastRatio, inkOn, mixOklab, relativeLuminance } from "./color.js";
// From here on, every name tagged `@deprecated` is one of the kit's own helpers, published
// by accident through the style hub's `export *` before this list existed. Each is a
// deprecated alias that keeps working until a major (audit K12-2), and its tag names the
// kit component, prop or token to use, or says that nothing replaces it. As for the
// overlay and label machinery further down, the tags sit on these specifiers only: the
// internal hub re-exports the declarations untagged for the kit's own components.
export {
  /**
   * @deprecated Kit internals, with no replacement: the kit's components mirror themselves
   * in a right-to-left layout, and an app reads React Native's
   * `I18nManager.getConstants().isRTL`. It keeps working until a major.
   */
  isRTL,
} from "./rtl.js";
export {
  /**
   * @deprecated Kit internals: the monospace face the `mono` and `code` roles of
   * `Typography` set, so use `Typography` `mono`, or `code` for an inline code pill. It
   * keeps working until a major.
   */
  MONO_FONT,
} from "./mono.js";
export {
  type FontFaces,
  type FontWeightKey,
  type ResolvedFace,
  resolveFontFace,
  type ThemeFonts,
  typeface,
  weightKey,
} from "./fonts.js";
export {
  /**
   * @deprecated Kit internals: the kit's `Text` and `TextInput` apply the theme's
   * typefaces (ThemeProvider `fonts`) themselves, so use `Text`, or `Typography` for a
   * role of the type scale. It keeps working until a major.
   */
  fontStyle,
  Text,
  TextInput,
} from "./text.js";
export {
  /**
   * @deprecated Kit internals, with no replacement: the kit's own development warnings
   * for data it resolves silently. It keeps working until a major.
   */
  devWarn,
  /**
   * @deprecated Kit test internals, with no replacement: clears the kit's own development
   * warnings between tests. It keeps working until a major.
   */
  resetDevWarnings,
} from "./dev-warn.js";
export {
  CELL_AXIS,
  clampSpan,
  columnAxis,
  FILL,
  type FillOptions,
  GRID_CELL_AXIS,
  GRID_COLUMNS,
  HUG_IN_STRETCH_COLUMN,
  layoutAxis,
  type LayoutAxis,
  LayoutAxisProvider,
  type LayoutStyle,
  type MeasureProps,
  measureStyle,
  ROW_AXIS,
  type SizingKey,
  spanWidth,
  stepOf,
  useFillStyle,
  useHugStyle,
  useLayoutAxis,
  useMeasureStyle,
  useSizing,
} from "./sizing.js";
export {
  /**
   * @deprecated Kit internals, with no replacement: the kit's fields paint their own focus
   * state, and `Pressable`, `TextInput` and `ScrollView` carry the themed focus ring, which
   * an app never removes (WCAG 2.4.7). It keeps working until a major.
   */
  FOCUS_RESET,
} from "./focus-reset.js";
export {
  /**
   * @deprecated Kit internals, with no replacement: the bottom indicator `Input`, `Select`
   * and `Autocomplete` draw for their own focus and open states. It keeps working until a
   * major.
   */
  activeIndicator,
  /**
   * @deprecated Kit internals, with no replacement: the options of the bottom indicator
   * `Input`, `Select` and `Autocomplete` draw for themselves. It keeps working until a
   * major.
   */
  type ActiveIndicatorOptions,
} from "./active-indicator.js";
// The field label's machinery (the Android floating label, the label text with its
// required marker, and the slice of a field skin that places it) was published by
// accident the same way as the overlay machinery below; each name is a deprecated alias
// that keeps working until a major (audit K12-2). As there, the tags sit on these
// specifiers only and the internal hub re-exports the declarations untagged.
export {
  /**
   * @deprecated Kit internals: the label that Input, Textarea, Select and Autocomplete
   * float for you; pass their `label` and `required` props. It keeps working until a
   * major.
   */
  FloatingLabel,
  /**
   * @deprecated Kit skin internals: the label-placement slice of a field skin, with no
   * replacement. It keeps working until a major.
   */
  type FloatingLabelStyles,
  /**
   * @deprecated Kit internals: kit components hide their own decorative content, for
   * example Icon `decorative`. It keeps working until a major.
   */
  HIDDEN_FROM_A11Y,
  /**
   * @deprecated Kit internals: the label text and required marker that Input, Textarea,
   * Select, Autocomplete, Field, Stepper and PhoneInput render from their `label` and
   * `required` props. It keeps working until a major.
   */
  LabelContent,
} from "./floating-label.js";
// The press feedback the kit's controls show for themselves (the Android ripple, the iOS
// and web dim), published by accident the same way. A control the kit lacks belongs in
// the kit, so each is a deprecated alias with no replacement that keeps working until a
// major (audit K12-2); the tags sit on these specifiers only.
export {
  /**
   * @deprecated Kit internals, with no replacement: the borderless Android ripple the
   * kit's round and icon-sized controls show for themselves (an icon `Button`, `Avatar`
   * given `onPress`). It keeps working until a major.
   */
  controlRipple,
  /**
   * @deprecated Kit internals, with no replacement: the platform's disabled dim the kit's
   * controls take for themselves when `disabled`. It keeps working until a major.
   */
  platformDisabledDim,
  /**
   * @deprecated Kit internals, with no replacement: the iOS and web press dim the kit's
   * controls show for themselves (`Button`, `Chip`, and `Card` and the list rows given
   * `onPress`). It keeps working until a major.
   */
  pressDim,
  /**
   * @deprecated Kit internals, with no replacement: the Android clip the kit's rounded
   * surfaces put around their own ripple. It keeps working until a major.
   */
  rippleClip,
  /**
   * @deprecated Kit internals, with no replacement: the bounded Android ripple the kit's
   * surfaces show for themselves (`Card` and the list rows given `onPress`). It keeps
   * working until a major.
   */
  surfaceRipple,
} from "./ripple.js";
export { cornerRadii, RippleClip, type RippleClipProps, rippleClipWrapperStyle, splitElevation } from "./ripple-clip.js";
export {
  /**
   * @deprecated Kit internals, with no replacement: every kit control takes a controlled
   * value with its change callback (`value`, `checked`, `open` and the like) or a default
   * for uncontrolled use, and an app holds its own state with React's `useState`. It keeps
   * working until a major.
   */
  useControllableState,
} from "./use-controllable-state.js";
export {
  /**
   * @deprecated Kit internals, with no replacement: `Dialog`, `AlertDialog`, `Drawer`,
   * `ActionSheet`, `Popover` and the menus close on Escape themselves. It keeps working
   * until a major.
   */
  useEscapeKey,
} from "./use-escape-key.js";
export {
  /**
   * @deprecated Kit internals, with no replacement: the wheel travel `GeoMap` reads for
   * its zoom. It keeps working until a major.
   */
  normalizeWheelDelta,
  /**
   * @deprecated Kit internals, with no replacement: `GeoMap`'s wheel and trackpad pinch
   * zoom. It keeps working until a major.
   */
  useWheel,
  /**
   * @deprecated Kit internals, with no replacement: one wheel gesture as `GeoMap`'s zoom
   * reads it. It keeps working until a major.
   */
  type WheelGesture,
} from "./use-wheel.js";
export {
  /**
   * @deprecated Kit internals, with no replacement: the touch surface `GeoMap` claims from
   * the browser for its pinch zoom. It keeps working until a major.
   */
  GESTURE_SURFACE,
} from "./gesture-surface.js";
export {
  /**
   * @deprecated Kit internals, with no replacement: `Dialog`, `AlertDialog`, `Drawer`,
   * `ActionSheet`, `Sidebar` and every anchored card close on Android's back themselves.
   * It keeps working until a major.
   */
  useHardwareBack,
} from "./use-hardware-back.js";
export {
  /**
   * @deprecated Kit internals: the focus trap and return `Dialog` and `AlertDialog` apply
   * for you, so use `Dialog`. It keeps working until a major.
   */
  useDialogFocus,
  /**
   * @deprecated Kit internals: the focus move and return `Popover` applies for you, so use
   * `Popover`. It keeps working until a major.
   */
  usePopoverFocus,
} from "./use-dialog-focus.js";
export {
  /**
   * @deprecated Kit internals, with no replacement: the options of the arrow-key focus
   * `Tabs`, `RadioGroup` and `Listbox` move for themselves. It keeps working until a major.
   */
  type RovingFocusOptions,
  /**
   * @deprecated Kit internals, with no replacement: the props of one item in the arrow-key
   * focus `Tabs`, `RadioGroup` and `Listbox` move for themselves. It keeps working until a
   * major.
   */
  type RovingItemProps,
  /**
   * @deprecated Kit internals, with no replacement: the arrow keys, Home and End of `Tabs`,
   * `RadioGroup` and `Listbox`, which move focus and selection for themselves. It keeps
   * working until a major.
   */
  useRovingFocus,
} from "./use-roving-focus.js";
// motion.ts also holds the hover and float tunables (HOVER, HOVER_EASING, FLOAT,
// FLOAT_EASING), which stay internal so a tuned value never becomes API.
export {
  /**
   * @deprecated Kit internals, with no replacement: `Accordion` and `Collapsible` enable
   * React Native's layout animations on Android for themselves. It keeps working until a
   * major.
   */
  enableAndroidLayoutAnimations,
  /**
   * @deprecated Kit internals, with no replacement: a loop easing behind the kit's own
   * functional motion; shape an app's own easing with React Native's `Easing`. It keeps
   * working until a major.
   */
  holdThen,
  /**
   * @deprecated Kit internals, with no replacement: a loop easing behind the kit's own
   * functional motion (the `InputOTP` caret); shape an app's own easing with React
   * Native's `Easing`. It keeps working until a major.
   */
  keyframes,
  /**
   * @deprecated Kit internals, with no replacement: whether React Native's native
   * animated driver exists, false on the web; an app's own `Animated` code reads
   * `Platform.OS`. It keeps working until a major.
   */
  supportsNativeDriver,
  /**
   * @deprecated Kit internals, with no replacement: a loop easing behind the kit's own
   * functional motion (the `Skeleton` shimmer); shape an app's own easing with React
   * Native's `Easing`. It keeps working until a major.
   */
  thereAndBack,
  useReducedMotion,
} from "./motion.js";
export {
  createLoopChannel,
  type LoopChannel,
  type LoopChannelOptions,
  type LoopChannelState,
  type LoopTrack,
  LoopView,
  type LoopViewProps,
  trackAt,
  trackSamples,
  trackValueAt,
} from "./loop.js";
export { useIncreasedContrast, useReducedTransparency } from "./a11y-preferences.js";
export { useHoverCapable, usePointerCoarse } from "./pointer.js";
export {
  type ImageStyle,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  /**
   * @deprecated React Native's own StyleSheet, passed through, with no replacement in the
   * kit: Canvas components take semantic props, never styles, so an app built from them
   * needs none, and app-frame scaffolding the kit does not cover imports it from
   * react-native. It keeps working until a major.
   */
  StyleSheet,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  View,
  type ViewProps,
  type ViewStyle,
} from "./primitives.js";
export {
  insetOverlayBounds,
  intersectOverlayBounds,
  type OverlayBounds,
  type OverlayHost,
  OverlayProvider,
  type OverlayProviderProps,
  type OverlayViewportInsets,
  Portal,
  type PortalProps,
  useOverlayHost,
} from "./portal.js";
// AnchoredOverlay and its companions are the kit's own overlay machinery, published by
// accident before this list existed; each is a deprecated alias that keeps working until a
// major (audit K12-2). The tags sit on these specifiers only: the internal hub re-exports
// the declarations untagged for the kit's own components.
export {
  /**
   * @deprecated Kit internals: use `Popover` for a floating card of content, and
   * `Dropdown`, `Select` or `Autocomplete` for a menu or an option list. It keeps working
   * until a major.
   */
  AnchoredOverlay,
  /** @deprecated Kit internals: use `PopoverProps` with `Popover`. It keeps working until a major. */
  type AnchoredOverlayProps,
  /**
   * @deprecated Kit internals: the placement `Popover`, `Dropdown` and `Select` apply for
   * you. It keeps working until a major.
   */
  placeOverlay,
  /**
   * @deprecated Kit internals: the anchor a kit card's own decoration reads (Popover's
   * beak). It keeps working until a major.
   */
  useOverlayAnchor,
  /**
   * @deprecated Kit internals: the side a kit card's own decoration reads (Popover's
   * beak). It keeps working until a major.
   */
  useOverlaySide,
} from "./anchored-overlay.js";
// Entrance, the readiness hold an anchored card's owner applies, was published by
// accident the same way; both names are deprecated aliases that keep working until a
// major (audit K12-2). As above, the tags sit on these specifiers only and the internal
// hub re-exports the declarations untagged.
export {
  /**
   * @deprecated Kit internals: the readiness hold every anchored card (Popover,
   * Dropdown, Select, Autocomplete and the rest) applies to its own card until its
   * placement is measured, so use those components. It keeps working until a major.
   */
  Entrance,
  /**
   * @deprecated Kit internals: the props of the readiness hold every anchored card
   * (Popover, Dropdown, Select, Autocomplete and the rest) applies to its own card, so
   * use those components. It keeps working until a major.
   */
  type EntranceProps,
} from "./entrance.js";
export { GlassSurface } from "./glass-surface/glass-surface.js";
export { liquidGlassAvailable } from "./glass-surface/liquid-glass.js";
export {
  /**
   * @deprecated Kit internals, with no replacement: the fill a kit component paints inside
   * a glass surface (a hovered or selected row, a header band), which every component
   * paints for itself under ThemeProvider `glass`. It keeps working until a major.
   */
  innerFill,
  /**
   * @deprecated Kit internals, with no replacement: the roles of the fills a kit component
   * paints inside a glass surface for itself. It keeps working until a major.
   */
  type InnerFillRole,
  /**
   * @deprecated Kit internals, with no replacement: the strengths of the fills a kit
   * component paints inside a glass surface for itself. It keeps working until a major.
   */
  type InnerFillStrength,
  /**
   * @deprecated Kit internals, with no replacement: the glass under-fill of the kit's
   * inverse surfaces, `Tooltip`'s bubble and `Toast`. It keeps working until a major.
   */
  inverseDenseTint,
  /**
   * @deprecated Kit internals: whether the glass material paints right now; read
   * `surface`, `reducedTransparency` and `increasedContrast` from `useTheme`. It keeps
   * working until a major.
   */
  isGlass,
  /**
   * @deprecated Kit internals, with no replacement: a skin fill turned translucent inside
   * a glass surface, which every kit component does for itself under ThemeProvider
   * `glass`. It keeps working until a major.
   */
  withInnerFill,
} from "./glass-fill.js";
// GlassPane, the material a kit component paints behind its own content, and its companions
// were published by accident too; all four are deprecated aliases that keep working until a
// major (audit K12-2), tagged on these specifiers only as above.
export {
  /**
   * @deprecated Kit internals: every kit control, card and field paints its own material
   * on its layer under ThemeProvider `glass`, so use that component (`Card` for a content
   * pane, `Button`, `Chip` or `Input` for a control). It keeps working until a major.
   */
  GlassPane,
  /**
   * @deprecated Kit internals: use the props of the kit component that paints the material,
   * such as `CardProps` or `ButtonProps`. It keeps working until a major.
   */
  type GlassPaneProps,
  /**
   * @deprecated Kit internals, with no replacement: a no-op the kit kept for a text field
   * beside a GlassPane. It keeps working until a major.
   */
  PANE_SIBLING_INPUT,
  /**
   * @deprecated Kit internals, with no replacement: the surface style of a node that paints
   * a GlassPane behind its content, which every kit component sets for itself under
   * ThemeProvider `glass`. It keeps working until a major.
   */
  paneStyle,
} from "./glass-surface/glass-pane.js";
// The Modal-side bridge for the Android sibling blur target (the contexts and the
// per-platform host stay internal; the bridge is public so an app hosting its own RN
// Modal can give its frost surfaces the same page blur the kit's sheets get).
export { GlassModalBlurTarget } from "./glass-surface/glass-surface.shared.js";
// A page's own blur plane on Android: a backdrop that the glass surfaces above it frost.
export { useGlassBlurPlane, GlassBlurPlane, GlassBlurScope, type GlassBlurPlaneHandle, type GlassBlurPlaneProps, type GlassBlurScopeProps } from "./glass-surface/glass-blur-plane.js";
