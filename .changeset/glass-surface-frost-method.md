---
"@nannier/canvas": patch
---

The internal frost no longer carries a code path for expo-blur 57's blur targets that nothing reached. On Android the kit's frost samples a capture plane only through `@nannier/canvas-blur`, which renders its own frost wherever a plane exists, and a surface that needs a plane and has none resolves its complete solid skin before any expo-blur view mounts, so the expo-blur view was never handed a target. It keeps the legacy blur method on expo-blur releases before 57, as before, and passes no method prop from 57. Nothing changes on screen on any platform.
