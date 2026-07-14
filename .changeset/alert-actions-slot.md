---
"@nannier/canvas": minor
---

Add an `actions` footer slot to `Alert`. It renders below the body, owns the top
separation from the description, and lays its buttons out in a row, so a call site
passes the buttons directly (`actions={<Button primary small>Upgrade plan</Button>}`)
instead of hand-rolling a `<View style={{ marginTop, flexDirection, gap }}>` wrapper.
Pass a fragment for more than one action; `children` still renders for freeform
content. This closes the last styling escape hatch in the Alert docs (the action-row
wrapper the "No styling escape hatches" directive points at).
