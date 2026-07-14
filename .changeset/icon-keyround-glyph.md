---
"@bnannier/canvas": patch
---

Rename the `Icon` credential glyph prop from `key` to `keyRound` (lucide's own name
for it). The old `key` boolean was unreachable: React reserves `key` as a special
prop, so `<Icon key />` (or a dynamic `{...{ key: true }}` spread) never rendered the
glyph and, when spread, logged a React "`key` is not a prop" warning. `keyRound` has
no such collision. The docs Input OTP nav item, the only consumer, now uses it.
