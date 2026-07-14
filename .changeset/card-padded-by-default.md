---
"@bnannier/canvas": minor
---

Card now pads its surface by default when it has content, so a bare `<Card>Content</Card>`
reads right without remembering `padded` (the common case, and an easy thing to forget).
Pass the new `flush` prop for edge-to-edge content (a table, a nav bar, a text field with a
toolbar) or when you compose the self-padding `CardHeader`/`CardContent`. The data-driven
string-prop path (a childless `<Card title=... description=... />`) is unchanged: its own
rendered sections carry the padding, so the container stays bare. Existing `padded`,
`compact`, and `comfortable` cards are unaffected; `padded` is now just the explicit form of
the default.
