---
"@nannier/canvas": patch
---

A Grid in a container whose width is a fraction of a pixel (a cell of another grid) keeps all its columns on one row: the cells now split the measured width less the half pixel its whole-px rounding may add, where three cells cut from a rounded-up 325 overflowed a 324.66 px row and the last one wrapped.
