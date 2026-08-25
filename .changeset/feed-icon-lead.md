---
"@nannier/canvas": minor
---

Feed: optional icon lead in the connector node.

Minor justification (new public capability): Feed items may lead with a kit icon
glyph in the connector node (icon over initials over dot); actor/action/target
untouched. `FeedItem.icon` names a glyph from the kit icon set
(`items={[{ icon: "shieldCheck", ... }]}`, typed `IconName`) and renders through
the `Icon` atom, muted and decorative at 16pt inside the existing 28pt node, so
an audit or automation stream no longer has to spell a system event as a pair of
initials. The avatar lead ignores `icon` and keeps leading with the person; items
that pass no `icon` render exactly as before.
