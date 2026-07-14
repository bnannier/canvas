---
"@nannier/canvas": patch
---

Make the ActionPanel toggle flip on press. The `toggle` affordance forwarded a controlled `checked` to its Switch, so it never flipped. A new `defaultChecked` prop is forwarded to the Switch for uncontrolled use, so the toggle self-manages (the on/off state lives in the Switch atom) while `checked` still supports controlled use and `onToggle` still fires.
