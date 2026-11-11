---
"@nannier/canvas": patch
---

FlowEditor: the iOS and Android builds now draw the web look (neither platform ships a node-graph editor, so no native shape is owed; the toolbar still uses each platform's Button and Select), and an edge's label is a true capsule drawn over the canvas instead of an SVG rectangle, in the same place, size and inks.
