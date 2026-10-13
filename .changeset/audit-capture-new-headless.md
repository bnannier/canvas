---
"@nannier/canvas": patch
---

The component audit's web capture runs Chromium in its new headless mode. The old headless shell it used leaves a backdrop blur over scrolled content unrendered, so every web glass photograph the audit took showed the kit's frost without its blur, and the glass contrast read off them was not the material's (found in the GlassSurface turn). The capture now refuses to start in a browser that still drops the blur: a frosted panel over scrolled text must leave at most a fifth of the bare text's sharpness (`e2e/audit/backdrop-check.ts`, measured at about 0.6 in the old shell and 0.03 in the new mode). Repository tooling only; nothing in the package changes.
