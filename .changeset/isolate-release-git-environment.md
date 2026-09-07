---
"@nannier-com/canvas": patch
---

Clear inherited repository-selection variables from release subprocesses so their explicit working directory remains authoritative. Isolate release test fixtures from Git hook environments and verify that adversarial inherited settings cannot modify another repository's configuration, refs, index, staged content or remote.
