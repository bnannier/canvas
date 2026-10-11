---
"@nannier/canvas": patch
---

ThemeProvider no longer remounts the app when `ssrBreakpoint` is set or cleared. It wrapped its tree in the server-breakpoint context only while the prop was set, so an app that dropped the prop after hydration changed the element type above it and lost all of its state. The context is now always provided, carrying the prop or, when it is omitted, the nearest parent provider's assumption, so a nested ThemeProvider still inherits it.
