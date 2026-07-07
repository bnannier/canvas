import { type ReactElement, useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { useTheme, type ColorTokens } from "../../style/index.js";
import { type Tone, TONE_TOKEN } from "./spinner.styles.js";

// Shared Spinner shell. Uses React Native's primitives DIRECTLY (no engine
// className layer) and reads the active brand tokens via useTheme, so the arc/
// spoke color follows light/dark and the glass surface. The shared structure
// (size/tone precedence, the continuous-rotation animation, accessibility) lives
// here once; a platform file supplies only its rendered shape (a SpinnerSkin) and
// calls createSpinner. The web skin keeps the current ActivityIndicator look; the
// iOS skin draws the ring of fading spokes (UIActivityIndicatorView); the Android
// skin draws the single sweeping arc (M3 CircularProgressIndicator).

export interface SpinnerProps {
  // Size (pick one; default sits between small and large).
  small?: boolean;
  large?: boolean;
  // Tone (pick one; default is the foreground arc color).
  primary?: boolean;
  muted?: boolean;
  foreground?: boolean;
  /** Accessible description of what is loading. */
  accessibilityLabel?: string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
}

// Tone precedence when more than one is passed: first match wins.
function toneOf(p: SpinnerProps): Tone {
  if (p.primary) return "primary";
  if (p.muted) return "muted";
  if (p.foreground) return "foreground";
  return "foreground";
}

// Three distinct diameters (px) so each size axis value renders a different
// spinner. Precedence within the size axis: large > small > default (first
// match wins). Kept identical to the original component.
function sizeOf(p: SpinnerProps): number {
  if (p.large) return 32;
  if (p.small) return 16;
  return 20;
}

// What a platform skin owns: how it draws the spinner for a given diameter and
// color. `rotate` is the shared Animated spin value (0..1, mapped to 0..360deg by
// the skin if it spins the whole shape). The skin returns a ready-to-mount node.
export interface SpinnerSkin {
  render: (args: {
    size: number;
    color: string;
    rotate: Animated.Value;
    tokens: ColorTokens;
  }) => ReactElement;
  /**
   * Whether this skin consumes the shared rotation value. When `false`, the
   * shell skips starting the perpetual rotation loop (e.g. the web
   * ActivityIndicator animates itself and never reads `rotate`, so driving an
   * Animated.Value for it would be a wasted, never-stopping per-instance timer).
   * Defaults to `true`.
   */
  spins?: boolean;
}

/** Build a Spinner component from a platform skin. */
export function createSpinner(skin: SpinnerSkin) {
  return function Spinner(props: SpinnerProps) {
    const { accessibilityLabel, testID } = props;
    const { tokens } = useTheme();
    const tone = toneOf(props);
    const size = sizeOf(props);
    const color = tokens[TONE_TOKEN[tone]];

    // One continuous rotation per ~900ms, looping forever. The skins that spin a
    // drawn shape (iOS spokes, Android arc) interpolate this 0..1 value to
    // 0..360deg; the web ActivityIndicator animates itself and ignores it.
    // The loop runs on the JS driver (useNativeDriver:false) on every platform: the
    // native driver's looping is unreliable (Animated.loop + useNativeDriver:true runs
    // one pass then freezes on react-native-web, and does not loop under the New
    // Architecture on iOS). A 900ms spinner is cheap on the JS thread.
    const rotate = useRef(new Animated.Value(0)).current;
    const spins = skin.spins !== false;
    useEffect(() => {
      // Skins that animate themselves (the web ActivityIndicator) never read
      // `rotate`; starting a loop for them would spin an Animated.Value forever
      // with no subscriber in the render tree. Only loop when the skin spins.
      if (!spins) return;
      const loop = Animated.loop(
        Animated.timing(rotate, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      );
      loop.start();
      return () => loop.stop();
    }, [rotate, spins]);

    return (
      <Animated.View
        testID={testID}
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel ?? "Loading"}
        style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      >
        {skin.render({ size, color, rotate, tokens })}
      </Animated.View>
    );
  };
}
