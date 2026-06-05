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
  useWindowDimensions,
  useColorScheme,
  type ViewProps,
  type TextProps as RNTextProps,
  type PressableProps as RNPressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
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
