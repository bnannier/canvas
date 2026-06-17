---
"@olympusoss/canvas": minor
---

Fix Spinner freezing after one rotation on the web (react-native-web).

`Animated.loop(Animated.timing(..., { useNativeDriver: true }))` runs a single
iteration and then freezes on react-native-web: there is no native animated
module, so `loop()` takes the native-loop path whose per-iteration restart never
fires, and the value parks at its end. The Spinner's continuous rotation hit this,
so its iOS and Android skins (which spin the drawn shape by interpolating the loop
value) stopped after one turn when rendered on the web. The web ActivityIndicator
skin was unaffected because it animates itself and ignores the value.

The loop now gates `useNativeDriver` on the new exported `supportsNativeDriver`
constant (`Platform.OS !== "web"`): native keeps the off-thread driver, web falls
back to the JS loop that iterates correctly. `supportsNativeDriver` is exported for
any consumer driving their own looping `Animated` values across web and native.
