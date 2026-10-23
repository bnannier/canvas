// The style foundation's public surface, name by name. src/index.ts re-exports this
// file, never the internal hub (./index.ts), so a helper a skin needs stays internal
// until someone lists it here: adding a name is an API decision, and `bun run
// check:api` (tools/api/manifest.ts) holds every name to a classification and a docs
// page. Components keep importing their primitives and helpers from ./index.ts.
//
// test/public-api.test.ts holds the snapshot. The kit's own helpers that the hub once
// published by accident, and the deprecated aliases they had become, were removed by the
// owner's decision of 2026-10-23 (nothing consumed them).

export {
  baseColors,
  type BreakpointKey,
  breakpoints,
  colorsByScheme,
  type ColorScheme,
  colorsFor,
  type ColorTokens,
  darkColors,
  darkGlass,
  glassByScheme,
  type GlassTokens,
  lightColors,
  lightGlass,
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
export { type Hue, statusHues, type StatusTone } from "./status-hue.js";
export { statusColors, type StatusColors, type StatusColorTone } from "./status.js";
export {
  type Surface,
  ThemeProvider,
  type ThemeProviderProps,
  type ThemeTokenOverrides,
  type ThemeValue,
  useTheme,
} from "./theme.js";
// The viewport tier.
export {
  BreakpointOverride,
  formFactor,
  type FormFactor,
  responsive,
  type Responsive,
  useBreakpoint,
  useFormFactor,
  useResponsive,
} from "./responsive.js";
export {
  type ContainerBreakpoint,
  type ContainerBreakpointOptions,
  type MeasuredWidth,
  useContainerBreakpoint,
  useContainerWidth,
  useMeasuredWidth,
} from "./container.js";
export { alpha, channelsOf, composite, contrastRatio, inkOn, mixOklab, relativeLuminance } from "./color.js";
export {
  type FontFaces,
  type FontWeightKey,
  type ThemeFonts,
  typeface,
} from "./fonts.js";
export {
  Text,
  TextInput,
} from "./text.js";
export {
  type LayoutStyle,
  type MeasureProps,
  type SizingKey,
} from "./sizing.js";
// motion.ts also holds the hover and float tunables (HOVER, HOVER_EASING, FLOAT,
// FLOAT_EASING), which stay internal so a tuned value never becomes API.
export {
  useReducedMotion,
} from "./motion.js";
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
  type TextInputProps,
  type TextProps,
  type TextStyle,
  View,
  type ViewProps,
  type ViewStyle,
} from "./primitives.js";
export {
  type OverlayHost,
  OverlayProvider,
  type OverlayProviderProps,
  type OverlayViewportInsets,
  useOverlayHost,
} from "./portal.js";
export { liquidGlassAvailable } from "./glass-surface/liquid-glass.js";
// The Modal-side bridge for the Android sibling blur target (the contexts and the
// per-platform host stay internal; the bridge is public so an app hosting its own RN
// Modal can give its frost surfaces the same page blur the kit's sheets get).
export { GlassModalBlurTarget } from "./glass-surface/glass-surface.shared.js";
// A page's own blur plane on Android: a backdrop that the glass surfaces above it frost.
export { useGlassBlurPlane, GlassBlurPlane, GlassBlurScope, type GlassBlurPlaneHandle, type GlassBlurPlaneProps, type GlassBlurScopeProps } from "./glass-surface/glass-blur-plane.js";
