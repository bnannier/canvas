---
"@nannier/canvas": minor
---

Restore real Android frost blur for the glass surface mode under expo-blur 57+.

expo-blur 57 replaced the behind-the-view Android blur with an explicit
`BlurTargetView` named by ref, and pointing a frost at an ancestor target
hard-crashes Android (libhwui render-node cycle, RenderThread SIGSEGV), so the
kit had been rendering the Android frost fill-only. `OverlayProvider` now mounts
its page content inside a `BlurTargetView` on Android and hands that ref to its
overlay outlet, a genuine native sibling, so every portaled frost surface
(menus, dropdowns, selects, popovers, command, toasts) blurs the page again.
RN-Modal surfaces (Drawer, ActionSheet) render in their own native window and
re-publish the outermost provider's target through the new exported
`GlassModalBlurTarget` bridge, so sheets blur the page behind them too.
In-content shells (navbars, sidebar, inline dialogs) intentionally stay
fill-only: any target enclosing them would be an ancestor. Web and iOS render
through an unchanged code path, and expo-blur remains an optional peer (without
it, or on expo-blur < 57, nothing changes).
