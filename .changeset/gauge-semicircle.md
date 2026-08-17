---
"@nannier/canvas": minor
---

Gauge: the chart is now the hand-off's semicircle anatomy. The full-circle ring with the value and label centered inside is replaced by a 180 degree top semicircular arc (muted track plus a tone-colored value arc with rounded caps), the percent readout sitting in the open center of the semicircle, and the label below the graphic. The readout (and the accessible name with it) now rounds to a whole percent, matching the hand-off; the arc still fills by the exact fractional value. Minor because it changes the user-visible rendered look of a shipped chart to the design hand-off's geometry. The API is unchanged: `value`, `label`, `testID`, `style`, and the tone axis (default primary; precedence success > warning > destructive) all work as before. The graphic keeps its fixed 120 width; per-instance sizing remains a separate, deferred item.
