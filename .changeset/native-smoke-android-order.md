---
"@nannier/canvas": patch
---

The Android native smoke builds its release before the emulator boots, so the build no longer starves the idling emulator, and a failed instrumentation build now leaves evidence: Gradle runs it with `--stacktrace`, and the passive host diagnostics record free disk space and inodes on the filesystems the build writes to.
