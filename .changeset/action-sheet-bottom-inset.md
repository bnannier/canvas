---
"@nannier/canvas": patch
---

ActionSheet: the bottom-anchored stack now keeps an 8px gap from the bottom edge on iOS and web (paddingVertical on the skin stack). On web the safe-area inset is 0, so the Cancel card no longer sits flush against the viewport edge; on iOS the gap composes with the home-indicator inset, matching the detached floating sheet. Android stays flush per the Material 3 bottom-sheet idiom.
