---
"@bnannier/canvas": minor
---

Sidebar gains an app-navigation shell: a collapsible mini icon-rail
(`collapsed`/`defaultCollapsed`/`collapsible`/`onToggleCollapse`), collapsible accordion sections
(`collapsible`/`defaultOpen` per section, one-open-at-a-time with the section owning the active
row auto-opening, controllable via `openSections`/`independentSections`), pinned `header`/`footer`
slots with an internal scroll region, id-based `active` matching, and an inert `href` passthrough
on items. Fully backward-compatible: existing `sections`/`items`, active-by-label/index, and the
density/frame axes are unchanged (a slot-less Sidebar renders exactly as before). Per-OS skins
extended (web accent, iOS capsule, Android M3 rail).
