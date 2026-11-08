---
"@nannier/canvas": minor
---

Chat, Wizard, Dialog, Steps and Textarea can now lay out a conversation like the Claude desktop window, and the same pieces serve a planning modal and a ticket drawer.

- Chat: `flush` drops the card frame so the conversation sits on its host's fill; `meta` names the answering model in a muted line under the composer. Replies read at 15 / 21, 20 in from the composer's edge, with list items on the line rhythm and paragraphs 12 apart; consecutive activity folds into one expandable line; turns that change speaker sit 40 apart and a turn's blocks 20 apart, author lines appear only when the app names an author or provider, activity lines align with the reply text, the composer is one 44 px box 768 wide at most, and the send control stays quiet until there is a draft.
- Wizard: `assistant` gives a full-height 287 px sidebar of step rows, a 44 px top bar with the title, status and actions, no footer band, and an unpadded body for a flush Chat.
- Dialog: `toolbar` (with `banded`) makes the header a 44 px top bar; `headerActions` places actions before the close action.
- Steps: `rows` (with `vertical`) draws each step as a 32 px sidebar row, the current one filled and done ones checked.
- Textarea: `composer` sets a chat composer's 15 / 20 metrics.
- Web corner radii: the composer 12 and the user bubble 10.

Minor justification: new public options on existing components (`Chat flush` and `meta`, `Wizard assistant`, `Dialog toolbar` and `headerActions`, `Steps rows`, `Textarea composer`). Without them, components keep their layout; Chat's spacing, reply size and send control follow the reference everywhere.
