---
"@nannier/canvas": patch
---

Container measurement stops breaking hydration in server-rendered apps.

`useContainerWidth` fell back to the window width before the first layout, and
`useContainerBreakpoint({ seedViewport: true })` seeded from it the same way.
On a server render there is no window, so the fallback resolved to 0 and a
`Grid` shipped its cells with no width; on the client the window is available
during the hydration render, so the very same cells resolved an explicit pixel
width. React reported a hydration mismatch and, as it warns, did not patch the
attributes up.

Both now withhold the window value for one render, so the hydration pass is
byte-identical to the server markup and the real width lands in the commit
immediately after. This is the contract `ThemeProvider`'s `ssrScheme` already
gives the colour axis. Client-only apps are unaffected: they see the fallback
from their first commit exactly as before.
