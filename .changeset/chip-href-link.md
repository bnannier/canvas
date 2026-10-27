---
"@nannier/canvas": minor
---

Adds Chip's `href` and `hrefAttrs` props (justification for the minor: a new public option, a chip that is a link). A chip with `href` is one link to its destination: a real anchor on the web, so middle-click and open-in-new-tab work and assistive tech hears a link, with `hrefAttrs` forwarding `target`, `rel` and `download`; natively it pairs with an `onPress` that navigates through the app's router, as Button's `href` does. `onPress` now receives the press event, so a web app routing on the client can take the click. A hovering pointer turns a link chip's ink and edge to the accent (the Canvas v4 hand-off's component chips) instead of brightening it. While `disabled` the anchor is dropped, and `href` is ignored on a selectable chip or a ChipGroup option, which stay toggles.
