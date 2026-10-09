// The style foundation's public surface, name by name. src/index.ts re-exports this
// file, never the internal hub (./index.ts), so a helper a skin needs stays internal
// until someone lists it here: adding a name is an API decision, and `bun run
// check:api` (tools/api/manifest.ts) holds every name to a classification and a docs
// page. Components keep importing their primitives and helpers from ./index.ts.
//
// The list is exactly what the hub's `export *` published before it was split out
// (test/public-api.test.ts holds the snapshot), so it still carries the helpers the
// manifest records as internal by accident, until they move out as deprecated aliases.

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
export {
  BreakpointOverride,
  formFactor,
  type FormFactor,
  responsive,
  type Responsive,
  SsrBreakpointContext,
  useBreakpoint,
  useFormFactor,
  useResponsive,
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
export { tabularNums } from "./numerals.js";
export {
  type MinTargetOptions,
  minTargetSlop,
  platformMinTarget,
  TOUCH_TARGET,
  type TouchTargetSkin,
  useMinTargetSlop,
} from "./touch-target.js";
export { alpha, channelsOf, composite, contrastRatio, inkOn, mixOklab, relativeLuminance } from "./color.js";
export { isRTL } from "./rtl.js";
export { MONO_FONT } from "./mono.js";
export {
  type FontFaces,
  type FontWeightKey,
  type ResolvedFace,
  resolveFontFace,
  type ThemeFonts,
  typeface,
  weightKey,
} from "./fonts.js";
export { fontStyle, Text, TextInput } from "./text.js";
export { devWarn, resetDevWarnings } from "./dev-warn.js";
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
export { FOCUS_RESET } from "./focus-reset.js";
export { activeIndicator, type ActiveIndicatorOptions } from "./active-indicator.js";
export { FloatingLabel, type FloatingLabelStyles, HIDDEN_FROM_A11Y, LabelContent } from "./floating-label.js";
export { controlRipple, platformDisabledDim, pressDim, rippleClip, surfaceRipple } from "./ripple.js";
export { cornerRadii, RippleClip, type RippleClipProps, rippleClipWrapperStyle, splitElevation } from "./ripple-clip.js";
export { useControllableState } from "./use-controllable-state.js";
export { useEscapeKey } from "./use-escape-key.js";
export { normalizeWheelDelta, useWheel, type WheelGesture } from "./use-wheel.js";
export { GESTURE_SURFACE } from "./gesture-surface.js";
export { useHardwareBack } from "./use-hardware-back.js";
export { useDialogFocus, usePopoverFocus } from "./use-dialog-focus.js";
export { type RovingFocusOptions, type RovingItemProps, useRovingFocus } from "./use-roving-focus.js";
// motion.ts also holds the hover tunables (HOVER, HOVER_EASING), which stay internal so
// a tuned value never becomes API.
export { enableAndroidLayoutAnimations, holdThen, keyframes, supportsNativeDriver, thereAndBack, useReducedMotion } from "./motion.js";
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
export { AnchoredOverlay, type AnchoredOverlayProps, placeOverlay, useOverlayAnchor, useOverlaySide } from "./anchored-overlay.js";
export { Entrance, type EntranceProps } from "./entrance.js";
export { GlassSurface } from "./glass-surface/glass-surface.js";
export { liquidGlassAvailable } from "./glass-surface/liquid-glass.js";
export { innerFill, type InnerFillRole, type InnerFillStrength, inverseDenseTint, isGlass, withInnerFill } from "./glass-fill.js";
export { GlassPane, type GlassPaneProps, PANE_SIBLING_INPUT, paneStyle } from "./glass-surface/glass-pane.js";
// The Modal-side bridge for the Android sibling blur target (the contexts and the
// per-platform host stay internal; the bridge is public so an app hosting its own RN
// Modal can give its frost surfaces the same page blur the kit's sheets get).
export { GlassModalBlurTarget } from "./glass-surface/glass-surface.shared.js";
