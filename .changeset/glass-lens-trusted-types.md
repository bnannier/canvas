---
"@nannier/canvas": patch
---

Fix the web glass lens blanking the page under a Trusted Types CSP

`glass-lens.ts` injected its SVG filter defs by assigning markup strings to
`innerHTML`. Under a `require-trusted-types-for 'script'` Content-Security-Policy,
Chromium throws a `TypeError` on that assignment, and because the shared
`#cds-glass-lens` def is injected at module-import time the throw escaped the
module factory before React could mount: every consumer serving that CSP rendered
a blank page instead of an app. The published docs site did exactly that.

Both defs are now built as DOM nodes with `createElementNS` and `setAttribute`,
which touches no Trusted Types sink and needs no policy, so the lens renders
identically under every CSP. The filter geometry moved from markup-string builders
to pure spec builders (`sizedLensFilterSpec`, `sharedLensFilterSpec`) that describe
the tree; rendered output, rim geometry, and the displacement-map data URI are
unchanged. Kit source is now linted against every Trusted Types sink so this class
of failure cannot reach a release again.
