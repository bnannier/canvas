---
"@olympusoss/canvas": minor
---

Trading charts, part 2. `LineChart` gains the price-chart idiom: a
`baseline` value (e.g. previous close) drawn as a dashed reference line that
also extends the y domain, automatic gain/loss toning for a single series
(success above the baseline, destructive below; explicit tone props still
win), and a `fade` boolean painting a soft gradient under each line.
