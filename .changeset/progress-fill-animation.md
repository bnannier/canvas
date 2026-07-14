---
"@nannier/canvas": minor
---

Progress: the determinate fill now animates.

- The determinate bar **eases to each new `value` instead of jumping**, so a bar
  wired to real progress (an upload, a download) fills smoothly — matching iOS
  `UIProgressView` (`setProgress:animated:`), Material 3's animated indicator,
  and the shadcn/Radix web bar. It is positioned by `translateX` (a transform, so
  it runs off-thread on native and, unlike an animated width, is not frozen under
  the Android New Architecture; the web uses the JS driver). The Material 3
  segmented anatomy (active indicator, 4dp gap, inactive track, stop indicator)
  animates from the same value, and a static percent-width fill paints the value
  until the first layout so there is no empty flash. Reduce Motion snaps instead
  of easing, since the fill is information-bearing.
