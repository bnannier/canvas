---
"@nannier/canvas": minor
---

Add `Field`, the form row that owns the message no control renders on its own.

New user-visible capability (the reason this is a minor, not a patch): nothing in the kit could
display a validation message. Every field family already owns its label, but helper and error text
had no home, so callers hand-stacked a `Text` under an `Input` and drifted on the caption scale,
the destructive tone, and the announcement. `Field` owns that slot: `helper` for the muted hint,
`error` for the message, and `error` replaces `helper` in place so the row never changes height and
nothing below it jumps.

The load-bearing behavior is label delegation. When the row wraps a single field-family control
(`Input`, `Textarea`, `Select`, `Autocomplete`) that carries no label of its own, `Field` hands the
label and `required` down to it rather than drawing one alongside, so each platform still places it
per its own contract: a static title above on web and iOS, the Material 3 in-container floating
label on Android. A label rendered beside such a control could never float, which is exactly the
Android divergence this avoids. Any other child (a `Switch`, a group) keeps the static label above.
Delegation needs all three conditions — one element child, a label-owning control, and no label of
its own — so two children, a plain view, or a control that already names itself all fall back
safely rather than being clobbered.

`Field` also delegates the error STATE, not just the text, so the control paints its destructive
border while the row paints the message under it; an errored field that showed red text under a
neutral box read as unfinished. The message is wired to the control with `aria-describedby` and
announced with `role="alert"`, which the hand-off's own Field does not do.

This supersedes 93dd68a9 ("remove Field and Fieldset"), and deliberately so. That removal was right
about the component it removed: the old `Field` wrapped `Input` directly and carried a `rows`
display mode that `DescriptionList` had already absorbed. This is a different component with a
different reason to exist — the message slot and the label delegation, neither of which the removed
one had. `Fieldset` stays removed.
