import { Platform } from "react-native";

// Whether the platform has React Native's native animated module, and therefore
// whether `useNativeDriver: true` is safe to pass.
//
// react-native-web ships no native animated module, and that does more than emit the
// "useNativeDriver is not supported" warning: it BREAKS `Animated.loop`. loop() chooses
// its iteration strategy from the RAW `useNativeDriver` flag, so `true` sends it down the
// native-loop path whose per-iteration restart is driven by a native onEnd callback that
// never fires on web. The loop runs exactly one pass and then freezes at the end value
// (requestAnimationFrame keeps ticking, but the animation has torn down its own frame
// chain). With the flag false, loop() takes the JS `restart()` recursion, which reschedules
// itself via requestAnimationFrame and iterates correctly.
//
// Gate every looping animation's `useNativeDriver` on this constant: native (iOS/Android)
// keeps the off-thread driver for jank-free 60fps loops; web falls back to the JS driver
// that actually loops. Platform.OS is fixed per bundle, so this is evaluated once.
export const supportsNativeDriver: boolean = Platform.OS !== "web";
