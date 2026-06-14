---
"@olympusoss/canvas": patch
---

Fix floating overlays painting beneath later sibling content when open

An open floating overlay (Popover, Dropdown, Combobox, RowMenu, the ButtonGroup
split menu, and the trigger-mode Command palette) could be covered by content
that follows it, because react-native-web gives every positioned View an
implicit stacking context: the overlay card's own `zIndex` was scoped inside its
`position: relative` anchor and could not rise above a later sibling. Each
overlay now lifts its anchor into its own stacking context while open, so the
trigger and the floating surface rise together above everything painted after
them. Closed overlays are unchanged.
