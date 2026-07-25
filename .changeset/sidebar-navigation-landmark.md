---
"@nannier/canvas": minor
---

Sidebar now declares itself as the navigation landmark, and GlassSurface accepts a `role`.

A sidebar of nav rows is the page's navigation, but the shell rendered as an
unlabelled stack of views, so every row inside it sat outside any landmark. Screen
reader users had no way to jump to the navigation or skip past it, and axe's `region`
rule flagged the contents. The shell now carries `role="navigation"` in both its plain
and header/footer forms.

That was only possible because `GlassSurface` took a closed set of props, so it has
gained an optional `role` that forwards to the root element, threaded through the web,
Android and iOS materials as well as the plain and degraded fallbacks. It is spelled
with React Native's universal `role` prop, which React Native Web renders as the
matching HTML element and native maps onto its own traits, so no per-platform branch is
involved. Reach for it on any glass surface that is a structural shell, for example
`role="banner"` on a top bar; leave it off decorative surfaces like popovers and menus,
which already carry a role of their own.

Both changes are additive and backward compatible: existing markup gains a landmark it
did not have, and no visual output or layout changes.
