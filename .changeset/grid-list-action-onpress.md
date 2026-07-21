---
"@nannier/canvas": patch
---

GridList: tile actions fire. `GridListAction` gains an optional `onPress`, wired to the rendered action button, so a people card's "Message" / "View" buttons can actually run a handler; previously the action row rendered dead buttons with no way to attach one.
