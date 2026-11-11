---
"@nannier/canvas": minor
---

Chat, Wizard, Dialog, Steps and Textarea can now lay out a conversation like the Claude desktop window, and the same pieces serve a planning modal and a ticket drawer.

- Chat: `flush` drops the card frame so the conversation sits on its host's fill; consecutive activity folds into one expandable line; author lines appear only when the app names an author or provider. The Claude desktop layout itself (the 768 column, 15 / 21 replies, the 40 / 20 turn rhythm, the 44 px composer with its quiet send control and the `meta` model line) is Chat `assistant`, described in its own changeset.
- Wizard: `assistant` gives a full-height 287 px sidebar of step rows, a 44 px top bar with the title and status, `previous` and the actions in a bar under the conversation, and an unpadded body for an `assistant flush` Chat.
- Dialog: `toolbar` (with `banded`) makes the header a 44 px top bar; `headerActions` places actions before the close action.
- Steps: `rows` (with `vertical`) draws each step as a 32 px sidebar row, the current one filled and done ones checked.
- Textarea: `composer` sets a chat composer's 15 / 20 metrics.

Minor justification: new public options on existing components (`Chat flush` and `meta`, `Wizard assistant`, `Dialog toolbar` and `headerActions`, `Steps rows`, `Textarea composer`). Without them, components keep their layout.
