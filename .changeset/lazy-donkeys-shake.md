---
"@nannier-com/canvas": patch
---

Two corrections to changes made earlier in this batch, both found by reviewing them
adversarially rather than by a user hitting them.

**Autocomplete.** Escape closed the option list and left the field in a state it could
not get out of: the caret stayed in the input, so the focus handler that opens the list
could never fire again, and clicking the field it was already focused in did nothing.
Recovery meant typing another character or finding the chevron. ArrowDown now reopens,
which is the standard combobox key and the other half of the Escape contract, and a
press on an already-focused field reopens it too. Escape is also gated on the list
being open, so a closed field no longer reports a spurious close to a controlled parent.

The chevron's touch target is reverted. It is 7pt wide, which is genuinely too small,
but the editable text is its immediate neighbour: a symmetric 18pt of hit slop took the
last 18pt of the field, which is exactly where you tap to put the caret at the end of
what you typed. A too-small target is better than one that steals its neighbour's. The
measurement and the reason are recorded in the touch-target coverage test; fixing it
properly means widening the control, which is a layout decision of its own.

**Badge.** A named status badge took `role="img"` so its label had a role to sit on.
That is right for a bare dot standing in for a word, and wrong for a badge that also
renders text, because img is a leaf role: it would have replaced the visible text in
the accessibility tree with the label. A badge with text and an explicit label is a
group now, which accepts a name and keeps its children readable. All three cases are
covered by tests.
