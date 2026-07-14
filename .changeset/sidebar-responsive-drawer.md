---
"@nannier/canvas": minor
---

Sidebar is now responsive. Add `responsive` (opt-in, off by default) and the sidebar renders as its
usual accordion rail on desktop, but at and below the `lg` breakpoint (1024px) it becomes a
start-edge (left, RTL-aware) **navigation drawer** that drills through the same `sections` one level
at a time, with the `header`/`footer` slots pinned above and below. Drive the drawer's open state
with `open` / `defaultOpen` / `onOpenChange` from your own hamburger; tune it with `drawerBreakpoint`,
`drawerWidth`, and `drawerContentInsetBottom` (clearance for chrome that paints over the drawer, e.g.
a native tab bar). A bare `<Sidebar>` is unchanged at every width.

The `Drawer`'s `left` / `right` panels now **slide in** on the start/end edge (React Native's Modal
can only slide vertically, so side edges previously faded); the slide mirrors under RTL and is gated
by Reduce Motion. `bottom` sheets are unchanged.
