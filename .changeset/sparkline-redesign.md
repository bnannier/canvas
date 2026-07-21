---
"@nannier/canvas": patch
---

Sparkline: redesigned both variants to the standard sparkline anatomy. The bar strip now renders the series in a soft de-emphasis wash with the latest bar in the full accent, rounds each bar at the data end only (square at the baseline), and carries a 4px data-end radius. The `line` variant now draws the 2px trend line at full tone strength over a gradient area wash that fades to the baseline, and marks the latest point with an accent end dot; SVG gradient ids are minted per instance so multiple sparklines on one page cannot cross-contaminate colors. Line normalization also uses the series' true max (no more compression of sub-1 series), and a flat series renders mid-strip instead of hugging the bottom edge. No API changes.
