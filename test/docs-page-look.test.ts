import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PAGE_LOOK,
  blurredEllipse,
  gradientLine,
  lookFor,
  orbEllipse,
  orbGradient,
  orbGradientAt,
  shellBox,
  shellTier,
  wedgeGeometry,
  type PageLookName,
} from "../docs/src/shell/page-look.ts";

// The docs' page look (docs/src/shell/page-look.ts) is held to the df-argus-shell reference
// card (tools/native/liquid-motion.md) and to Dark Factory's own geometry, recorded in
// tools/native/reference/df-argus-shell/probe-geometry.json.

const probe = JSON.parse(readFileSync(join(import.meta.dir, "../tools/native/reference/df-argus-shell/probe-geometry.json"), "utf8")) as Record<
  string,
  { ellipses: { fill: string; opacity: string; x: number; y: number; w: number; h: number }[] }
>;

// Dark Factory's own `gradientPoints` (Ui/Components/src/primitives/Gradient.tsx), in unit
// coordinates, as the reference the px line is checked against.
function dfGradientPoints(angleDeg: number, width: number, height: number) {
  const w = width > 0 ? width : 1;
  const h = height > 0 ? height : 1;
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  const length = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a));
  return {
    start: { x: (w / 2 - (dx * length) / 2) / w, y: (h / 2 - (dy * length) / 2) / h },
    end: { x: (w / 2 + (dx * length) / 2) / w, y: (h / 2 + (dy * length) / 2) / h },
  };
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const SIZES = [
  [1440, 900],
  [768, 1024],
  [390, 844],
] as const;

describe("the docs page look", () => {
  it("draws the CSS 165 deg line Dark Factory computes, at any size", () => {
    for (const [w, h] of [...SIZES, [1280, 800], [2560, 1440], [1, 1]] as const) {
      const line = gradientLine(PAGE_LOOK.angle, w, h);
      const df = dfGradientPoints(PAGE_LOOK.angle, w, h);
      expect(line.x1 / w).toBeCloseTo(df.start.x, 9);
      expect(line.y1 / h).toBeCloseTo(df.start.y, 9);
      expect(line.x2 / w).toBeCloseTo(df.end.x, 9);
      expect(line.y2 / h).toBeCloseTo(df.end.y, 9);
    }
  });

  it("places and sizes the orbs as Dark Factory's /roster does, in every theme at every width", () => {
    for (const look of ["blush", "mint", "dark"] as const) {
      for (const [w, h] of SIZES) {
        const recorded = probe[`${look}-${w}`]!.ellipses;
        PAGE_LOOK.orbs.forEach((orb, i) => {
          const { cx, cy, a, b } = orbEllipse(orb, w, h);
          const dfOrb = recorded[i]!;
          expect(dfOrb.fill).toBe(PAGE_LOOK.palettes[look].orbs[i]);
          expect(Number(dfOrb.opacity)).toBe(orb.opacity);
          // The probe rounded each box to whole pixels.
          expect(Math.abs(cx - a - dfOrb.x)).toBeLessThanOrEqual(1);
          expect(Math.abs(cy - b - dfOrb.y)).toBeLessThanOrEqual(1);
          expect(Math.abs(a * 2 - dfOrb.w)).toBeLessThanOrEqual(1);
          expect(Math.abs(b * 2 - dfOrb.h)).toBeLessThanOrEqual(1);
        });
      }
    }
  });

  it("computes the blurred ellipse exactly: the closed-form column integral agrees with a brute-force convolution", () => {
    const [a, b, sigma] = [30, 18, 9];
    const brute = (x: number, y: number) => {
      let sum = 0;
      const step = 0.5;
      for (let u = -a; u <= a; u += step) {
        for (let v = -b; v <= b; v += step) {
          if ((u * u) / (a * a) + (v * v) / (b * b) > 1) continue;
          sum += Math.exp(-((x - u) ** 2 + (y - v) ** 2) / (2 * sigma * sigma)) * step * step;
        }
      }
      return sum / (2 * Math.PI * sigma * sigma);
    };
    for (const [x, y] of [[0, 0], [30, 0], [0, 18], [25, 15], [45, 10], [10, 40]] as const) {
      expect(Math.abs(blurredEllipse(x, y, a, b, sigma, 400) - brute(x, y))).toBeLessThan(0.004);
    }
    // A huge ellipse: full coverage inside, half on the edge.
    expect(blurredEllipse(0, 0, 2000, 2000, 50)).toBeCloseTo(1, 4);
    expect(blurredEllipse(2000, 0, 2000, 2000, 50)).toBeCloseTo(0.5, 2);
  });

  it("draws each orb's blur as a radial gradient within 2 colour levels of the exact blur, in every palette at every width", () => {
    // The gradient's iso-lines keep one aspect ratio where the blur's grow rounder far out;
    // measured, that costs at most about 0.044 of coverage (the tablet's tall orb2). Over
    // the bare page, the colour it paints is off by the coverage error times the orb's
    // opacity times how far the orb's colour sits from the page under it.
    for (const [w, h] of SIZES) {
      PAGE_LOOK.orbs.forEach((orb, i) => {
        const { a, b } = orbEllipse(orb, w, h);
        const gradient = orbGradient(a, b, orb.blur);
        let worst = 0;
        for (let gx = 0; gx <= 24; gx++) {
          for (let gy = 0; gy <= 24; gy++) {
            const x = (gx / 24) * gradient.rx;
            const y = (gy / 24) * gradient.ry;
            worst = Math.max(worst, Math.abs(blurredEllipse(x, y, a, b, orb.blur, 120) - orbGradientAt(gradient, x, y)));
          }
        }
        expect(worst, `${w}x${h} orb${i + 1} coverage`).toBeLessThan(0.05);
        for (const look of ["blush", "mint", "dark"] as PageLookName[]) {
          const palette = PAGE_LOOK.palettes[look];
          const orbColor = rgb(palette.orbs[i]!);
          const reach = Math.max(...palette.stops.flatMap((stop) => rgb(stop).map((c, k) => Math.abs(c - orbColor[k]!))));
          expect(worst * orb.opacity * reach, `${w}x${h} orb${i + 1} ${look} colour levels`).toBeLessThan(2);
        }
        // The gradient reaches far enough that its rim paints nothing.
        expect(blurredEllipse(gradient.rx, 0, a, b, orb.blur)).toBeLessThan(0.002);
        expect(blurredEllipse(0, gradient.ry, a, b, orb.blur)).toBeLessThan(0.002);
      });
    }
  });

  it("insets the shell per tier as the card does, and caps it at 1340 centred", () => {
    expect(shellTier(390)).toBe("phone");
    expect(shellTier(640)).toBe("phone");
    expect(shellTier(641)).toBe("tablet");
    expect(shellTier(1024)).toBe("tablet");
    expect(shellTier(1025)).toBe("desktop");
    expect(shellBox("desktop", 1440)).toEqual({ left: 50, top: 56, width: 1340 });
    expect(shellBox("desktop", 1280)).toEqual({ left: 28, top: 56, width: 1224 });
    expect(shellBox("tablet", 768)).toEqual({ left: 20, top: 28, width: 728 });
    expect(shellBox("phone", 390)).toEqual({ left: 12, top: 16, width: 366 });
  });

  it("lays the wedges out as Dark Factory's ShellDecor does", () => {
    // The tall fade-in wedge on the right edge: 12% wide and the full shell tall.
    const tall = wedgeGeometry(PAGE_LOOK.wedges[0]!, 1340, 2580);
    expect(tall.points).toBe(`${1340},0 ${1340},2580 ${1340 - 160.8},2580`);
    // "to bottom": straight down the box's middle.
    expect(tall.line.x1).toBeCloseTo(1340 - 80.4, 9);
    expect(tall.line.x2).toBeCloseTo(1340 - 80.4, 9);
    expect(tall.line.y1).toBeCloseTo(0, 9);
    expect(tall.line.y2).toBeCloseTo(2580, 9);
    // A bottom-left wedge, 204 by 150, its gradient to the top right corner.
    const corner = wedgeGeometry(PAGE_LOOK.wedges[5]!, 1340, 2580);
    expect(corner.points).toBe(`0,${2580 - 150} 0,2580 204,2580`);
  });

  it("carries Dark Factory's page-look values: the snapshot in tools/darkfactory/theme.json", () => {
    const theme = JSON.parse(readFileSync(join(import.meta.dir, "../tools/darkfactory/theme.json"), "utf8"));
    const canon = (color: string) => color.replace(/\s+/g, "").toLowerCase();
    for (const look of ["blush", "mint", "dark"] as const) {
      const df = theme.palettes[look];
      const ours = PAGE_LOOK.palettes[look];
      expect(ours.stops.map(canon)).toEqual([df.bg1, df.bg2, df.bg3].map(canon));
      expect(ours.orbs.map(canon)).toEqual([df.orb1, df.orb2].map(canon));
      expect(canon(ours.shell)).toBe(canon(df.shell));
      expect(canon(ours.shadow)).toBe(canon(df.shadow));
      expect(canon(ours.accent2)).toBe(canon(df.accent2));
    }
    PAGE_LOOK.orbs.forEach((orb, i) => {
      const df = theme.materials.orbs[i];
      const pct = (v: string | undefined) => (v === undefined ? undefined : parseFloat(v) / 100);
      expect([orb.width, orb.height, orb.left, orb.top, orb.right, orb.bottom, orb.opacity, orb.blur]).toEqual([pct(df.width), pct(df.height), pct(df.left), pct(df.top), pct(df.right), pct(df.bottom), df.opacity, df.blur]);
    });
    expect(PAGE_LOOK.shell.radius).toBe(theme.materials.shell.radius);
    expect(PAGE_LOOK.wedges.map((w) => ({ ...w, fadeIn: w.fadeIn ?? undefined }))).toEqual(theme.wedges.map((w: Record<string, unknown>) => ({ ...w, fadeIn: w.fadeIn ?? undefined })));
  });

  it("paints the one dark look whichever light palette is chosen", () => {
    expect(lookFor("dark", "mint")).toBe("dark");
    expect(lookFor("dark", "blush")).toBe("dark");
    expect(lookFor("light", "mint")).toBe("mint");
    expect(lookFor("light", "blush")).toBe("blush");
  });
});
