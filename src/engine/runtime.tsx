// Engine runtime: the React Native bindings around the pure resolver.
// A ThemeProvider supplies the active color scheme and token map; useStyles
// turns a className into a resolved RN style for the current theme and viewport
// (desktop-first responsive); Box/Text/Pressable are the styled primitives
// components compose from.

import { type ReactNode, createContext, useContext, useMemo } from "react";
import {
  View,
  Text as RNText,
  Pressable as RNPressable,
  Image as RNImage,
  TextInput as RNTextInput,
  ScrollView as RNScrollView,
  useWindowDimensions,
  useColorScheme,
  type ViewProps,
  type TextProps as RNTextProps,
  type PressableProps as RNPressableProps,
  type PressableStateCallbackType,
  type ImageProps as RNImageProps,
  type TextInputProps as RNTextInputProps,
  type ScrollViewProps as RNScrollViewProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
} from "react-native";
import { resolve, type InteractionState, type RNStyle } from "./resolve.js";
import { colorsByScheme, type ColorScheme, type ColorTokens } from "./tokens.js";

interface ThemeValue {
  scheme: ColorScheme;
  tokens: ColorTokens;
  dark: boolean;
}

const ThemeContext = createContext<ThemeValue | null>(null);
const FALLBACK: ThemeValue = { scheme: "light", tokens: colorsByScheme.light, dark: false };

export interface ThemeProviderProps {
  /** Force a color scheme. Omit to follow the OS appearance. */
  scheme?: ColorScheme;
  children: ReactNode;
}

export function ThemeProvider({ scheme, children }: ThemeProviderProps) {
  const system = useColorScheme();
  const active: ColorScheme = scheme ?? (system === "dark" ? "dark" : "light");
  const value = useMemo<ThemeValue>(
    () => ({ scheme: active, tokens: colorsByScheme[active], dark: active === "dark" }),
    [active],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext) ?? FALLBACK;
}

/** Resolve a className string to an RN style for the active theme and viewport. */
export function useStyles(className: string, state?: InteractionState): RNStyle {
  const { tokens, dark } = useTheme();
  const { width } = useWindowDimensions();
  return useMemo(
    () => resolve(className, { tokens, width, dark, state }),
    [className, tokens, dark, width, state?.hover, state?.active, state?.focus, state?.disabled],
  );
}

// --- styled primitives ------------------------------------------------------

export interface BoxProps extends ViewProps {
  className?: string;
}

export function Box({ className = "", style, ...rest }: BoxProps) {
  const resolved = useStyles(className);
  return <View style={[resolved as StyleProp<ViewStyle>, style]} {...rest} />;
}

export interface TextProps extends RNTextProps {
  className?: string;
}

export function Text({ className = "", style, ...rest }: TextProps) {
  const resolved = useStyles(className);
  return <RNText style={[resolved as StyleProp<TextStyle>, style]} {...rest} />;
}

export interface PressableProps extends RNPressableProps {
  className?: string;
}

export function Pressable({ className = "", style, disabled, ...rest }: PressableProps) {
  const base = useStyles(className, { disabled: !!disabled });
  const pressedStyle = useStyles(className, { active: true, disabled: !!disabled });
  return (
    <RNPressable
      disabled={disabled}
      style={(state: PressableStateCallbackType) => [
        (state.pressed ? pressedStyle : base) as StyleProp<ViewStyle>,
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    />
  );
}

export interface ImageProps extends RNImageProps {
  className?: string;
}

// A styled Image: className carries sizing/radius/aspect; source, resizeMode,
// accessibilityLabel, onLoad, etc. pass through as normal RN ImageProps.
export function Image({ className = "", style, ...rest }: ImageProps) {
  const resolved = useStyles(className);
  return <RNImage style={[resolved as StyleProp<ImageStyle>, style]} {...rest} />;
}

export interface TextInputProps extends RNTextInputProps {
  className?: string;
}

// A low-level styled TextInput: a thin className wrapper over RN's TextInput.
// value/onChangeText/placeholder/placeholderTextColor/editable/multiline all flow
// through unchanged, preserving controlled-input semantics. This is the bare
// primitive; reach for the Input or Textarea COMPONENTS for a real form field
// (semantic props, the focus border, and the react-native-web outline reset).
export function TextInput({ className = "", style, ...rest }: TextInputProps) {
  const resolved = useStyles(className);
  return <RNTextInput style={[resolved as StyleProp<TextStyle>, style]} {...rest} />;
}

export interface ScrollProps extends RNScrollViewProps {
  /** Styles the scroll FRAME (the clipped viewport): height, max-height, border. */
  className?: string;
  /**
   * Styles the inner content container via contentContainerStyle: padding, gap,
   * min-height, and centering (justify/items) of the scrolled children. This is
   * the prop you usually want for spacing, NOT className.
   */
  contentClassName?: string;
}

// A styled ScrollView. ScrollView has two distinct style surfaces and Scroll
// exposes both: `className` styles the scroll frame (the clipped viewport) and
// `contentClassName` styles the inner content container (where padding/gap/
// centering belong). Named `Scroll`, not `ScrollView`, to mirror Box-not-View.
export function Scroll({
  className = "",
  contentClassName = "",
  style,
  contentContainerStyle,
  ...rest
}: ScrollProps) {
  const resolved = useStyles(className);
  const resolvedContent = useStyles(contentClassName);
  return (
    <RNScrollView
      style={[resolved as StyleProp<ViewStyle>, style]}
      contentContainerStyle={[resolvedContent as StyleProp<ViewStyle>, contentContainerStyle]}
      {...rest}
    />
  );
}
