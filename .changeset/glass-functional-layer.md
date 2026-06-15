---
"@olympusoss/canvas": minor
---

Glass surface mode now follows Apple's Liquid Glass model: the functional layer only

`surface="glass"` is now the material for the FUNCTIONAL layer — overlays
(popovers, menus, dropdowns, selects, comboboxes, dialogs, alert dialogs, sheets,
drawers, command) plus navbars and sidebars go translucent — while content
surfaces (cards, lists, tables, calendars, charts) stay SOLID, per Apple's guidance
not to use Liquid Glass in the content layer.

Mechanically, glass now swaps only the `popover` token translucent (the `card`
token stays opaque), and the navbar/sidebar shells paint that same functional-layer
material in glass mode. Canvas does not hand-paint glass effects per component:
real iOS Liquid Glass is the OS's automatic, system-rendered material, while
Canvas's `glass` mode is its own cross-platform glassmorphism for the functional
layer.
