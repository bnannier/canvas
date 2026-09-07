---
"@nannier-com/canvas": minor
---

New public API: the touch-target helpers, and five controls that now use them.

Minor justification: `TOUCH_TARGET`, `platformMinTarget()`, `minTargetSlop()`,
`useMinTargetSlop()` and the `TouchTargetSkin` shape are exported from the package
root, so an app building its own pressable can meet the platform minimum the same way
the kit does:

```tsx
const target = useMinTargetSlop(TOUCH_TARGET.ios);
<Pressable {...target} onPress={onPress}>…</Pressable>
```

Apple asks for 44pt and Material 3 for 48dp, and plenty of controls are smaller than
that on purpose: an icon square, a step circle, a chevron. Growing them would be the
wrong fix, because the minimum is about the area a finger can hit, not the area the
design should occupy. So the shape stays and the touch area grows: the skin declares
its platform's minimum, the shell measures what actually rendered, and hitSlop makes
up the shortfall symmetrically. Nothing moves.

Five controls that were short now reach it. The Autocomplete's chevron was the worst,
at 7pt wide. The Switch row is 28pt tall on iOS, the Steps circles are 32pt, the
RowMenu trigger is 32pt on iOS and 40dp on Android, and the CodeBlock copy chip is
26pt. None of them changes size or position.

The pattern was Button's alone; it moves to `src/style/touch-target.ts` so every
pressable can use it and so a coverage test has one thing to look for. That test
enumerates every component with a pressable and requires each to declare a target, or
to be listed with how else it reaches the minimum, or to be listed as a measured gap.
Fourteen components are in that last list today, each with the size measured in a real
browser against its own platform skin.
