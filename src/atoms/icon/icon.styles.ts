import { type IconSkin } from "./icon.shared.js";

// Per-OS Icon skins. Icon is a "Shared" treatment: an outline glyph is platform-neutral
// (SF Symbols on iOS, Material Symbols on Android, and Radix on the web are all outline
// system glyphs with no native control to adopt), so there is nothing per-OS to vary.
// The iOS, Android, and web skins are therefore identical — one look on every platform.
//
// A single glyph is a bare SVG with no surrounding box (the stroke 1.75 / rounded caps /
// 24x24 grid presentation lives in icon.shared.tsx), so the skin carries only the `set`
// gallery layout. The gallery cell label color is theme-driven and applied in shared;
// the skin's setLabel holds only its type.

// The gallery grid: full width, glyphs flowing left-to-right and wrapping.
// (w-full flex-row flex-wrap)
// One gallery cell: a fixed-width column centering the glyph over its label.
// (items-center gap-1.5 rounded-lg px-1 py-2.5; the 80px width stays inline.)
export const webSkin: IconSkin = {
  setGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  setCell: {
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  setLabel: {},
};

// Shared treatment: iOS and Android reuse the web skin verbatim (one look everywhere).
export const iosSkin: IconSkin = webSkin;
export const androidSkin: IconSkin = webSkin;
