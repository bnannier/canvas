---
"@nannier-com/canvas": patch
---

The web CSS hand-off no longer paints Stats and EmptyState with iOS values.

An iOS fragment had been pasted inside the web block of `styles/tokens/platforms.css`,
several lines below the correct web declarations, where the cascade silently replaced
them. A web surface reading the hand-off got the iOS Stats card (12px radius, 18px
inset, no shadow, 12px gap, SF tracking) instead of the web one (8px, 20px, shadow-sm,
14px), the iOS EmptyState corner instead of the web one, and `--p-min-target: 44px` on
the one platform whose minimum is zero. The iOS block, meanwhile, declared none of
them and inherited the values that had been misfiled into web, so both blocks resolved
to plausible numbers and nothing failed. Each side now declares its own.

Two smaller repairs in the same layer: the spacing scale ships its top five steps
(`--space-36` through `--space-64`), which `src/style/tokens.ts` has always carried and
the CSS stopped short of; and the Android block no longer declares `--p-nav-rule` twice.

The Icon stroke weight now comes from one exported constant that the native menu-glyph
raster generator reads too, so the baked PNGs beside a live Icon cannot drift to a
second weight.
