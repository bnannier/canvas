---
"@nannier/canvas": patch
---

A controlled component whose parent clears its value to `undefined` keeps showing the last value the parent gave, as React's own controlled input does, instead of jumping back to the value it mounted with (a cleared Listbox or Calendar selection showed its first selection again). It stays controlled, and switching a component between controlled and uncontrolled after it mounts now warns once in development, either way.
