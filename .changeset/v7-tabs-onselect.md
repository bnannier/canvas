---
"@olympusoss/canvas": major
---

`Tabs` now fires `onSelect` (was `onChange`) when the active tab changes, matching
`TabBar` and `ButtonGroup`, which already expose `active` + `onSelect` for the same
concept. Migrate by renaming the handler: `<Tabs onChange={...}>` becomes
`<Tabs onSelect={...}>`. The controlled `active` / uncontrolled `defaultActive`
props are unchanged.
