---
"@nannier/canvas": minor
---

The Navigation section cards' pieces (justification for the minor: new public options). Badge takes `tiny`, the 18 px pill at 400 10 px (precedence `token` > `tiny` > `small`). SidebarItem takes `badgeAccent`, a solid tiny accent tag such as "New", and Sidebar takes `account` (`SidebarAccount`: a name, an optional detail and an optional avatar source), the account card at the rail's foot. Tabs items take an `icon`, a leading glyph in the label's ink. TabBarItem takes `unread`, a dot over the glyph that also names the destination "unread". Steps takes `segmented`, equal columns each with a bar, a title and a status (precedence `progress` > `segmented` > `vertical`), and a step takes `progress`, an in-step bar on the current step. RowMenu takes `inline`, its menu drawn in place as a panel, and `inline links`, a grouped link list; its items take `shortcut`, `submenu`, `badge` and `meta` trailing hints.

Look changes on the hand-off's renderers: a SidebarItem's `meta` reads in the third ink in mono; a `block` underline Tabs row splits into equal columns; a Tabs count badge takes its tab's label ink; Pagination's gap is a quiet text ellipsis; the web TabBar floats 12 px off its container's sides and bottom; a vertical Steps title is 500 14 px over a 12 px description in the accent text ink on the current step.
