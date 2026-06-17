import { Platform } from "react-native";

// Whether the platform has React Native's native animated module, and therefore whether
// `useNativeDriver: true` engages an off-thread animation. True on iOS/Android, false on
// web (react-native-web ships no native animated module). Use it to gate the driver on a
// ONE-SHOT animation (a fade or move that plays once): native runs it off-thread, web falls
// back to the JS driver.
//
// DO NOT use it for `Animated.loop`. The native driver does NOT loop reliably:
//   - On react-native-web there is no native module, so loop() takes the native-loop path
//     (it branches on the raw `useNativeDriver` flag) whose per-iteration restart is driven
//     by a native onEnd callback that never fires. The loop runs one pass, then freezes.
//   - Under the New Architecture on iOS the native loop likewise does not advance, so a
//     `useNativeDriver: true` loop sits frozen at its start value.
// Every `Animated.loop` must therefore pass `useNativeDriver: false`, which takes loop()'s JS
// `restart()` recursion (a self-rescheduling requestAnimationFrame) and iterates everywhere.
// A slow looping background animation is cheap on the JS thread, so this costs nothing real.
//
// Platform.OS is fixed per bundle, so this is evaluated once.
export const supportsNativeDriver: boolean = Platform.OS !== "web";
