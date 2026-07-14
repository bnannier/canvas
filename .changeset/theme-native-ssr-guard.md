---
"@olympusoss/canvas": patch
---

Guard the theme/surface/density helpers against a missing `document`. `getTheme`,
`setTheme`, `toggleTheme`, `getSurface`, `setSurface`, `getDensity`, and `setDensity`
read and write `document.documentElement`, but they are exported to every platform,
so calling one on native or during web SSR threw. They now check for a document
first: off the web the getters return the default (`"light"` / `"solid"` /
`"regular"`) and the setters no-op, matching the existing guard on `token()`.
