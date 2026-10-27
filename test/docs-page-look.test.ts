import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { FOOTER, GRAIN, SCROLLBAR, SHELL, grainOpacity, grainSvg, pageColor, shellTier } from "../docs/src/shell/page-look.ts";
import { PALETTES, colorsFor } from "../src/style/tokens.ts";

// The docs' page (docs/src/shell/page-look.ts) is the v4 hand-off's flat page: the scheme's
// `background`, whatever the palette, held to the hand-off's own `--bg` (tools/v4/handoff),
// with the hand-off's grain over it, its scrollbars and its shell geometry, each held to the
// values the vendored page declares (the `v4-page` card).

const HANDOFF = join(import.meta.dir, "../tools/v4/handoff");

/** The hand-off's `--bg` values, as its pages declare them. */
function handoffBackgrounds(): Set<string> {
  const found = new Set<string>();
  for (const file of readdirSync(HANDOFF)) {
    if (!/\.(html|js|css)$/.test(file)) continue;
    for (const m of readFileSync(join(HANDOFF, file), "utf8").matchAll(/--bg:\s*(#[0-9a-fA-F]{6})/g)) found.add(m[1]!.toLowerCase());
  }
  return found;
}

describe("the docs page look", () => {
  it("paints the scheme's background in every palette", () => {
    for (const scheme of ["light", "dark"] as const) {
      const page = pageColor(colorsFor("violet", scheme));
      for (const palette of PALETTES) {
        const tokens = colorsFor(palette, scheme);
        expect(pageColor(tokens), `${palette} ${scheme}`).toBe(tokens.background);
        expect(pageColor(tokens), `${palette} ${scheme}`).toBe(page);
      }
    }
  });

  it("is the hand-off's own page colour in both schemes", () => {
    expect([...handoffBackgrounds()].sort()).toEqual([pageColor(colorsFor("violet", "dark")), pageColor(colorsFor("violet", "light"))].map((c) => c.toLowerCase()).sort());
  });

  it("tiers the shell at Canvas's form factors", () => {
    expect(shellTier(390)).toBe("phone");
    expect(shellTier(640)).toBe("phone");
    expect(shellTier(641)).toBe("tablet");
    expect(shellTier(1024)).toBe("tablet");
    expect(shellTier(1025)).toBe("desktop");
  });
});

/** The vendored section page the shell values are read from. */
const PAGE = readFileSync(join(HANDOFF, "Canvas v4.0.0 Controls.dc.html"), "utf8");
const IMAGES = join(import.meta.dir, "../docs/assets/images");

/** A custom property's value in the dark (`[data-ion]{`) or light (`[data-scheme="light"]{`) block. */
function declared(name: string, scheme: "dark" | "light"): string {
  const block = scheme === "dark" ? PAGE.slice(PAGE.indexOf("[data-ion]{")) : PAGE.slice(PAGE.indexOf('[data-ion][data-scheme="light"]{'));
  const m = block.slice(0, block.indexOf("}")).match(new RegExp(`--${name}:([^;]+);`));
  if (!m) throw new Error(`--${name} not declared for ${scheme}`);
  return m[1]!;
}

/** Every attribute of every element in an SVG document, numbers parsed. */
function svgAttributes(svg: string): string[] {
  return [...svg.matchAll(/<(\w+)([^>]*)>/g)].flatMap(([, tag, attrs]) =>
    [...attrs!.matchAll(/([\w:-]+)='([^']*)'/g)].map(([, k, v]) => `${tag}.${k}=${v !== "" && !Number.isNaN(Number(v)) ? Number(v) : v}`),
  );
}

describe("the grain", () => {
  it("is the hand-off's noise SVG", () => {
    const uri = declared("grain", "dark").match(/^url\("data:image\/svg\+xml,(.+)"\)$/)![1]!;
    expect(svgAttributes(grainSvg())).toEqual(svgAttributes(decodeURIComponent(uri)));
  });

  it("lies over the page at the hand-off's opacity, tile and stacking order", () => {
    expect(grainOpacity("dark")).toBe(Number(declared("grain-o", "dark")));
    expect(grainOpacity("light")).toBe(Number(declared("grain-o", "light")));
    const layer = PAGE.match(/<div style="([^"]*background-image:var\(--grain\)[^"]*)"/)![1]!;
    expect(layer).toContain("position:fixed;inset:0;pointer-events:none");
    expect(layer).toContain(`z-index:${GRAIN.zIndex}`);
    expect(layer).toContain(`background-size:${GRAIN.tile}px ${GRAIN.tile}px`);
    expect(layer).not.toContain("mix-blend-mode");
  });

  it("is baked: the committed PNGs are the bake of this table", async () => {
    const manifest = JSON.parse(readFileSync(join(IMAGES, "grain.bake.json"), "utf8"));
    expect(manifest.svg).toBe(grainSvg());
    expect(manifest.grain).toEqual(JSON.parse(JSON.stringify(GRAIN)));
    expect(Object.keys(manifest.files).sort()).toEqual(GRAIN.scales.map((s) => (s === 1 ? "grain.png" : `grain@${s}x.png`)).sort());
    for (const [name, want] of Object.entries(manifest.files) as [string, { scale: number; sha256: string }][]) {
      const { data, info } = await sharp(readFileSync(join(IMAGES, name))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      expect([info.width, info.height], name).toEqual([GRAIN.tile * want.scale, GRAIN.tile * want.scale]);
      expect(createHash("sha256").update(data).digest("hex"), name).toBe(want.sha256);
    }
  });
});

describe("the scrollbars", () => {
  it("take the hand-off's thumb washes in both schemes", () => {
    for (const scheme of ["dark", "light"] as const) {
      expect(SCROLLBAR.thumb[scheme]).toBe(declared("sb", scheme).replace(/;?--sb-h.*/, ""));
      expect(SCROLLBAR.thumbHover[scheme]).toBe(declared("sb-h", scheme));
    }
  });

  it("take the hand-off's WebKit geometry", () => {
    expect(PAGE).toContain(`::-webkit-scrollbar{width:${SCROLLBAR.size}px;height:${SCROLLBAR.size}px}`);
    expect(PAGE).toContain(`border-radius:${SCROLLBAR.radius}px;border:${SCROLLBAR.inset}px solid transparent;background-clip:padding-box`);
    expect(PAGE).toContain("*{scrollbar-width:thin;scrollbar-color:var(--sb) transparent}");
  });
});

describe("the shell geometry", () => {
  it("is the hand-off's", () => {
    expect(PAGE).toContain(`<nav style="position:sticky;top:0;z-index:40;height:0;display:flex;justify-content:center;align-items:flex-start;padding:0 ${SHELL.navSide}px">`);
    expect(PAGE).toContain(`<div style="margin-top:${SHELL.navTop}px;display:flex`);
    expect(PAGE).toContain(`<div style="max-width:${SHELL.frameMax}px;margin:0 auto;padding:0 ${SHELL.gutter}px;display:grid;grid-template-columns:{{ railCols }};gap:${SHELL.railGap}px`);
    expect(PAGE).toMatch(new RegExp(`<aside style="[^"]*margin-top:${SHELL.railTop}px`));
    expect(PAGE).toMatch(new RegExp(`<section id="controls"[^>]*padding:${SHELL.contentTop}px 0 0`));
    expect(PAGE).toContain(`railCols:this.state.vw<${SHELL.railMinWidth}?'minmax(0,1fr)':'${SHELL.railWidth}px minmax(0,1fr)'`);
  });
});

describe("the footer frame", () => {
  it("is the hand-off's", () => {
    expect(PAGE).toContain(`<footer style="max-width:${SHELL.frameMax}px;margin:0 auto;padding:${FOOTER.top}px ${FOOTER.side}px ${FOOTER.bottom}px">`);
    expect(PAGE).toContain(`<div style="border-top:1px solid var(--ln);padding-top:${FOOTER.ruleGap}px;`);
  });
});
