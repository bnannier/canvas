---
"@nannier/canvas": patch
---

On iOS 26 the Avatar's initials fallback now renders on Apple's real, interactive Liquid
Glass: a glass account chip that refracts the content behind it (vivid in a topbar over
the page) and responds to touch with the system press animation. It is wired only through
the iOS skin, so web and Android keep the solid muted circle unchanged, and GlassSurface
degrades to that solid fill when the app is in solid surface mode or Reduce Transparency
is on. GlassSurface gained an `interactive` prop (default false, backward compatible) that
turns on the native material's `isInteractive` behavior for glass that is itself a control.
