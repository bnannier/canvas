---
"@nannier/canvas": patch
---

FloatingLabel's JSDoc (a deprecated export) states its contract: what it renders and never renders, its defaults, both timings, Reduce Motion, the floated first frame, the right-to-left scale origin, its geometry and what assistive technology gets. It also says truly why its colour tint runs on the JS driver: React Native 0.86's native driver, with its default feature flags, writes a frame onto the native view's props, and Android's text view takes its colour only through the paragraph's attributed text, so the native driver would not repaint the label (read from React Native's source, not yet confirmed on a device). The motion module's native-driver gate now names the tint as its one exception. Comments only; nothing behaves differently.
