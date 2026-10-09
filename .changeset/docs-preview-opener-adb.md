---
"@nannier/canvas": patch
---

The docs preview opener finds `adb` the way Expo CLI finds the Android SDK (`$ANDROID_HOME`, then `$ANDROID_SDK_ROOT`, then the default SDK location, then `PATH`), so an Android Preview link works from a dev server whose `PATH` has no platform-tools, and its failure page reads "Make sure an Android emulator is booted" with the platform's own capitalization. The opener's shell-quoting tests now require zsh rather than skipping without it, and CI installs zsh before the unit tests, so the check that a pasted command survives zsh's `?` glob runs there too. Repository tooling and docs only; nothing in the package changes.
