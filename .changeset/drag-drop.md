---
"@nannier/canvas": minor
---

Add a reusable drag-and-drop capability: `DragDropProvider`, `DropZone`, `Draggable`, and `DragHandle`. Wrap a surface in a `DragDropProvider`, mark droppable regions with `DropZone` (each with an `id`, a `label`, and an `onDrop`), make items draggable with `Draggable` (carrying arbitrary `data`), and drop a `DragHandle` grip inside each item. Items lift into a floating ghost that follows the finger and reorder position-aware, within a zone or across zones.

It is built entirely from React Native's own primitives (PanResponder for the gesture, Animated for the ghost, `measureInWindow` for layout), so the same code runs on iOS, Android, and the web through react-native-web with no `Platform.OS` branch and no web-only DOM or CSS. Because a drag is inherently a pointer gesture, the grip is also fully keyboard- and screen-reader-operable: it is a focusable button that grabs on Space/Enter, moves between zones and positions with the arrow keys, drops on Space/Enter, and cancels on Escape, announcing each step. A `Draggable` can be `disabled`, a `DropZone` can be `disabled` or `horizontal`.
