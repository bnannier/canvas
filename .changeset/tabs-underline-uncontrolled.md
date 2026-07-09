---
"@olympusoss/canvas": patch
---

Fix the default underline Tabs not switching on press. The underline variant called `onChange` directly instead of the controllable-state setter, so an uncontrolled (or `defaultActive`-seeded) underline Tabs never updated its own active tab. It now uses the same `setActive` path as the pills and vertical variants, so pressing a tab moves the underline and still fires `onChange`.
