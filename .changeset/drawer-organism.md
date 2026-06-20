---
"@olympusoss/canvas": minor
---

Add a `Drawer` organism: a full-screen panel that slides in from an edge (`left`,
`right`, or a `bottom` sheet) over the whole app. It is the kit's full-screen portal
case, built on React Native's Modal (which react-native-web implements on the web), so
the same drawer renders on iOS, Android, and the web, distinct from the inline
Dialog/Overlay used for the docs previews. Drive it with controlled `open` /
`onOpenChange` or an uncontrolled `trigger`. The panel is an opaque card surface so a
full-screen takeover stays legible over page content.
