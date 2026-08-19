# Vendored hand-off (colour cards)

A verbatim copy of the files `check-render-parity` needs to render the design hand-off's own colour
guideline cards: `styles.css`, `tokens/*.css`, and the three `guidelines/colors-*.html` cards.

**This copy exists so CI can run the check at all, and it is the weaker of the two legs.** A
vendored snapshot lives behind this commit, which is the exact property that let the `--ring` error
survive: two files that agree with each other prove nothing about the design source. A green run
against this copy proves only that the kit has not drifted from the snapshot.

The authoritative leg reads the real export:

    bun run check-render --handoff ~/Downloads/templates/canvas-react

**Refresh this copy whenever the hand-off changes**, by re-copying those files from the export. That
refresh is where the real comparison happens; do not hand-edit anything here.
