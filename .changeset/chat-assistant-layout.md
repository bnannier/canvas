---
"@nannier/canvas": minor
---

Chat: the default Chat returns to the v4 hand-off's look, and the Claude desktop window layout moves behind a new `assistant` prop.

- Default (no `assistant`): the conversation card with its thread 16 in and messages 14 apart, 14 / 1.55 replies, the user bubble in the accent's soft wash at the 16 corner with its trailing bottom corner tucked to 4, 9 by 13 in, and the composer's sunken field under a hairline (the 16 corner on the field border, 6 in and 12 at the start, the draft and a 32 px round send button 8 apart, a paperclip attach action).
- `assistant` (on Chat, ChatThread, ChatMessage and ChatComposer): the layout measured on the Claude desktop window: one centered column whose composer box is 768 wide at most, replies at 15 / 21 inset 20 from the composer and the user bubble 16, a neutral `muted` user bubble at its own 10 corner, turns that change speaker 40 apart and a turn's blocks 20 apart, a raised 44 px composer at its own 12 corner with a bare add icon and a send control that stays quiet until there is a draft, the `meta` model line, and 12 px gutters below 480 wide. Its corners are the new web shape roles `assistantBubble` (10) and `assistantComposer` (12); the hand-off's `composer` and `bubble` stay 16 and `bubbleTail` (4) returns.
- `flush` keeps meaning only "drop the card frame"; combine it with `assistant` for a conversation that sits on its host's fill, as the Wizard `assistant` example does.

Consumers that relied on the desktop layout Chat drew by default since 4.3 pass `assistant` to keep it. Minor justification: a new public option on an existing component (`Chat assistant`).
