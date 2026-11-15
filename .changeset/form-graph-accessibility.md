---
"@nannier/canvas": minor
---

Add accessible validation and description props to Select and Autocomplete, and native accessibility hints across the field family. This additive public capability allows applications to describe invalid selections and provide native reading guidance without replacing the controls.

Field now associates helper/error messages and required/error state with its single supported control even when the control owns its label, while preserving explicit child overrides. Select announces its current display value alongside its purpose. FlowEditor exposes incoming/outgoing relationships, edge labels, and rework status on its existing node controls, including read-only graphs.
