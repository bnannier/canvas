---
"@olympusoss/canvas": patch
---

Improve dark-mode contrast. Structural and state tokens in the dark theme sat
almost on top of the surfaces they paint over, so borders, dividers, hover
fills, and selected rows were nearly invisible. Dark `--border` and `--input`
move to 22% lightness, `--secondary`/`--muted`/`--accent` to 20%, and the
elevated `--sidebar-accent`/`--sidebar-border` to 24%; the dark focus `--ring`
is lightened so the focus indicator keeps a visible edge on dark surfaces.

Selected and active states in the combobox, command palette, and sidebar now
use a primary-tinted highlight, so a selected row reads as distinct from a
plain neutral hover instead of looking identical to it.

The contrast gate now parses the live dark tokens and asserts that borders and
state fills stay perceptibly different from their surfaces, so this class of
regression is caught automatically.
