---
"@nannier/canvas": patch
---

The docs frame their pages in Dark Factory's frosted shell: an inset panel fixed to the viewport, 12 / 16 px from the window on phones, 20 / 28 on tablets and 28 / 56 on desktops (capped at 1340 wide), with its 22 px top corners, palette shadow and corner wedges, around the sidebar, the top bar and the page scroller, on the web, iOS and Android. The frame does not clip, since a rounded clip around the frosted chrome made Chromium drop tiles; the chrome that reaches its corners rounds itself. Docs and tooling only; nothing in the package changes.
