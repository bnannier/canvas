---
"@olympusoss/canvas": minor
---

Add optional interaction props across components so each can demonstrate a click:

- Overlays (Dropdown, Select, Combobox, Command, Popover, Tooltip, RowMenu) are
  now uncontrolled by default: the trigger opens/closes them and a select closes
  them. A controlled `open` is still honored, and each gains `onOpenChange`.
- Alert: `dismissible` + `onDismiss` (renders a trailing dismiss control).
- DataTable: `onRowPress(row, index)` (pressable rows).
- Stepper: `onStepPress(index)` (pressable step circles).
- Feed: `onItemPress(index)` (pressable rows).
- Avatar: `onPress` (pressable avatar).
- Card: `onPress` (pressable surface).

All additions are optional and backward-compatible; existing controlled usage and
default rendering are unchanged.
