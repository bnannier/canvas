---
"@nannier/canvas": patch
---

The component audit records three findings the GlassModalBlurTarget turn found in other components for their own turns: ActionSheet's header and a drawer-mode FilterPanel's chrome resolve their material around their Modal, so on Android they keep the solid recipe inside a frosted sheet or drawer (`audit/components/action-sheet.md`, `audit/components/filter-panel.md`), and GlassSurface's frost keeps an unreachable expo-blur `blurTarget` branch (`audit/foundation/glass-surface.md`). Repository docs only; nothing in the package changes.
