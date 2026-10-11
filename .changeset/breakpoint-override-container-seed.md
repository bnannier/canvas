---
"@nannier/canvas": patch
---

A container measurement's pre-measurement seed now follows a `BreakpointOverride`. `useContainerBreakpoint` with `seedViewport` resolves its map from the active viewport bucket, and `useContainerWidth` falls back to the window width clamped into that bucket, so Row `stacks` and spans, Grid, Form, DataTable, DescriptionList, GridList, Tabs, Steps and Navbar paint their first frame in the simulated tier under an override (a docs preview's phone, a test pinning a tier) instead of the real window's. Without an override nothing changes: the window already sits in its own bucket. A window that reports no width (0, as a hidden iframe does) still seeds 0 under any bucket, so nothing is sized against a guess. The seed is still withheld until hydration, and the measured width still wins once it lands.

The viewport tier's contract is stated in its JSDoc: the form factor is the window's width alone on every platform (a narrow desktop window is the phone tier, a landscape phone usually the tablet tier, and there is no separate desktop-OS tier), and `BreakpointOverride` pins the tier, not the geometry, so a drawer or a phone sheet under it lays out against the real window.
