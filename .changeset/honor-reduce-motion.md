---
"@olympusoss/canvas": minor
---

Honor the OS "Reduce Motion" accessibility setting (WCAG 2.3.3).

New `useReducedMotion()` hook reads the system preference cross-platform (iOS Reduce Motion, Android Remove Animations, and the web `prefers-reduced-motion` query via react-native-web's `AccessibilityInfo`) and tracks live changes. The kit's decorative animations now respect it:

- **Skeleton** holds its shimmer still (the muted shape alone reads as loading).
- **Accordion** and **Collapsible** snap open/closed (no chevron ease, no height transition).
- **Carousel** jumps to a slide instead of animating the scroll.

Essential, information-bearing motion is intentionally left running: the **Spinner** rotation and **indeterminate Progress** bar are the only signal that work is ongoing, which WCAG 2.3.3 exempts. The hook is exported for app code that needs the same gate.
