---
"@nannier-com/canvas": patch
---

`input` now meets the WCAG 3:1 control-boundary minimum in both schemes.

`input` and `border` shipped the same hairline value (`#e4e4e7` light,
`#27272a` dark). That is right for `border`, which separates two surfaces of
differing fill and is read against that difference, but wrong for `input`: it
is the boundary an unfilled control draws itself with, and WCAG 2.2 SC 1.4.11
holds exactly that to 3:1 against its surroundings. On the page background the
shared value measured 1.27:1 in light and 1.34:1 in dark, so an outline Button
or a bare text field had a silhouette the eye could not find, and an unchecked
switch hid its own thumb.

`input` becomes `#88888b` in light and `#747478` in dark, the lightest values
on the existing border hue that still clear 3:1 against all three surfaces a
control is placed on: the page, a card or popover, and a muted panel. `border`
is unchanged, so card edges, dividers and table rules keep their hairline
weight. Every control that reads `input` gains the visible boundary: Button
(outline), Input, Textarea, TextInput, Select, Autocomplete, Checkbox, Radio,
Switch, InputOTP, Stepper, Pagination and Avatar.

The iOS Switch keeps its hard-coded systemGray3 off-track. That constant is a
HIG fidelity match to the real UISwitch rather than a contrast choice, and it
still sits under the 3:1 floor; moving it is a platform question, not a token
one.
