---
"@nannier/canvas": patch
---

An anchored card opened from inside another anchored card that is still waiting for its placement (both open at mount) now waits with it. The inner card renders in the overlay outlet, outside the outer card's view, so for the outer card's frame or two of measuring it showed and reached screen readers while the trigger it belongs to was still invisible and hidden. The readiness hold now holds a card while any logical ancestor holds, and the card takes its modal hold, its keyboard bridge and its focus entry only once it is shown. Nothing changes for a card whose ancestors are shown, which is every card opened by a user.
