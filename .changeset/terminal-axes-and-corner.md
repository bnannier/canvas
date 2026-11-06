---
"@nannier/canvas": patch
---

Characterize the terminal variants the kit's design rules check: Textarea's prompt metrics now resolve through `metricsOf` (terminal, then dense), CodeBlock's `transcript` and Drawer's `terminal` are members of their recorded axes, and the Drawer terminal screen's 12 corner is a declared kit corner (`terminalScreen`) instead of a bare number. No rendered value changes.
