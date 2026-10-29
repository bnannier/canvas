---
"@nannier/canvas": minor
---

CodeBlock gains `unbadged`, a new public option that keeps the header bar and `language` highlighting but draws no trailing language badge beside the copy chip, for a `filename` that already names the language (the hand-off's playground bar is "JSX · ButtonProps" and a Copy button only). Justification for the minor: a new component prop.

Colour correction, carried in the same release: a tsx or jsx snippet now takes the hand-off's component-page highlighter (Component.dc.html `hl`) instead of the ts grammar. Only a Capitalised tag name is painted, in the accent text ink, with the brackets and slash neutral; an attribute name is cyan only before its `=`; strings stay mint and comments the subtle ink; keywords, numbers, function names, lowercase tags, bare boolean attributes and children text are the code ink. So `<Button>Save changes</Button>` reads as one label after one accent name instead of a cyan `<Button>Save` beside a white `changes`. The ts and js grammar and the other languages keep their rules.
