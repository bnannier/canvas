---
"@nannier/canvas": minor
---

CodeBlock: full feature build-out. In-kit syntax highlighting (ts/tsx/js/jsx,
json, bash, css, html, python) driven by `language`; long lines scroll
horizontally instead of truncating; the copy chip writes the clipboard itself
(navigator.clipboard on web, the new optional `expo-clipboard` peer on native)
with a Copied check state and header/chrome hosting; new capabilities:
`highlightLines`, unified `diff` mode (markers out of selection, copy yields the
post-change code), `collapsible` with a controllable `expanded` state, `tabs`
with a controllable `active` index, terminal transcript mode with a custom
`prompt`, `startLine`, `compact` density, `attached` top edge, and selectable
code text on native. Exports `CodeBlockTab`, `tokenize`, and `syntaxColor`.
