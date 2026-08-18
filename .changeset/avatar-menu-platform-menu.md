---
"@nannier/canvas": patch
---

`AvatarMenu` opens its own platform's menu, and stands off by the hand-off's 6px.

The pill rendered per platform while the menu under it did not: `avatar-menu.shared.tsx` imported `Dropdown` from the barrel, and a bare import resolves the web module in a browser bundler, so the docs' iOS and Android rows opened the web menu. Measured on the page before the fix, all three rows reported the web row metrics (0 min-height, 6px/8px padding, 2px row radius) where the plain Dropdown page reported three distinct skins (44pt iOS rows, 48dp Android, web). `createAvatarMenu` now takes the Dropdown to render, and each avatar platform entry builds it from that platform's own dropdown skin, the same injection `createEmptyState(iosSkin, ButtonIOS)` already uses. On a device Metro resolved this correctly either way, so this was the web preview and any web consumer, not native.

The menu's standoff moves onto `DropdownSkin` as `menuGap` (4 on all three skins, the value the shell used to hard-code) and the account pill's menu is built at the hand-off's 6. It is skin-owned deliberately: a caller-facing pixel spacing prop on a public component is the re-spacing escape hatch the kit bans, and "6 instead of 4" has no honest boolean name.
