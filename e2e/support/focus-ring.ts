// Focus-ring pixel checks, shared by the scroll-focus spec (Chromium), the keyboard
// journeys (Chromium, Firefox and WebKit) and the audit's focus state recipes
// (e2e/support/state-recipes.ts), which find the node drawing the ring in the page and
// so hand over an element handle rather than a locator.
import type { Page } from "@playwright/test";

/** Anything with a box on the page: a Locator, or an ElementHandle. */
export interface Framed {
  boundingBox(): Promise<{ x: number; y: number; width: number; height: number } | null>;
}

/** Normalize token colors to the browser's computed spelling, retaining authored alpha. */
export const rgb = (color: string) => {
  if (/^rgba?\(/.test(color)) return color;
  if (!/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(color)) throw new Error(`Unsupported ring color: ${color}`);
  const hex = color.slice(1);
  const full = hex.length <= 4 ? [...hex].map(c => c + c).join("") : hex;
  const channels = [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16));
  const alpha = full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1;
  return alpha === 1 ? `rgb(${channels.join(", ")})` : `rgba(${channels.join(", ")}, ${alpha})`;
};
// Whether the ring shows along each side of `frame`, read from the pixels: a computed
// outline proves nothing when a parent clips it or the scrolled content paints over it.
// The page decodes a screenshot of the frame's edges and looks for ring-coloured pixels
// along the middle of every side, within 6 px of the frame's edge on either side.
export async function ringShows(page: Page, frame: Framed, color: string) {
  const box = await frame.boundingBox();
  if (!box) throw new Error("the frame has no box");
  const pad = 6;
  const clip = { x: box.x - pad, y: box.y - pad, width: box.width + pad * 2, height: box.height + pad * 2 };
  const png = (await page.screenshot({ clip })).toString("base64");
  // Photograph the same backdrop with only matching ring paints suppressed. This
  // measures the actual bed (including glass, gradients and ancestors), rather than
  // assuming a flat theme background. Keep geometry, focus and every other paint.
  const hidden = await page.evaluate((color) => {
    const paints: { node: HTMLElement | SVGElement; style: string | null }[] = [];
    for (const node of document.querySelectorAll<HTMLElement | SVGElement>("*")) {
      const style = getComputedStyle(node);
      const properties = ["outline-color", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color"]
        .filter(property => style.getPropertyValue(property) === color);
      const shadow = style.boxShadow;
      const shadowColors: string[] = shadow.match(/rgba?\([^)]*\)/g) ?? [];
      const matchingShadow = shadowColors.includes(color);
      if (!properties.length && !matchingShadow) continue;
      paints.push({ node, style: node.getAttribute("style") });
      for (const property of properties) node.style.setProperty(property, "transparent", "important");
      if (matchingShadow) node.style.setProperty("box-shadow", shadow.split(color).join("transparent"), "important");
    }
    const key = `__canvasRingPaints${Date.now()}`;
    Object.assign(window, { [key]: paints });
    return key;
  }, rgb(color));
  let backdrop: string;
  try {
    backdrop = (await page.screenshot({ clip })).toString("base64");
  } finally {
    await page.evaluate((key) => {
      const saved = window as unknown as Record<string, { node: Element; style: string | null }[]>;
      for (const { node, style } of saved[key]!) {
        if (style === null) node.removeAttribute("style");
        else node.setAttribute("style", style);
      }
      delete saved[key];
    }, hidden);
  }
  return page.evaluate(async ({ png, backdrop, pad, color, clip }) => {
    const decode = async (source: string) => {
      const image = new Image();
      image.src = `data:image/png;base64,${source}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, canvas.width, canvas.height);
    };
    const { data, width, height } = await decode(png);
    const bed = (await decode(backdrop)).data;
    const channels = (color.match(/[\d.]+/g) ?? []).map(Number);
    const alpha = channels[3] ?? 1;
    const near = (x: number, y: number) => {
      const i = (y * width + x) * 4;
      let difference = 0;
      let error = 0;
      for (let channel = 0; channel < 3; channel++) {
        const expected = channels[channel]! * alpha + bed[i + channel]! * (1 - alpha);
        error += Math.abs(data[i + channel]! - expected);
        difference += Math.abs(data[i + channel]! - bed[i + channel]!);
      }
      // A missing/clipped ring cannot pass just because its bed resembles the ink.
      // Fully painted pixels must match source-over compositing, including alpha.
      return difference >= 6 && error < 12;
    };
    const band = Math.round(pad * 2 * (width / clip.width));
    // Nine in ten points along the middle three fifths of a side hold a ring pixel.
    const side = (horizontal: boolean, far: boolean) => {
      const length = horizontal ? width : height;
      const depthLimit = horizontal ? height : width;
      let points = 0;
      let hits = 0;
      for (let t = Math.round(length * 0.2); t < Math.round(length * 0.8); t++, points++) {
        for (let d = 0; d < band; d++) {
          const depth = far ? depthLimit - 1 - d : d;
          if (horizontal ? near(t, depth) : near(depth, t)) {
            hits++;
            break;
          }
        }
      }
      return hits >= points * 0.9;
    };
    return { top: side(true, false), right: side(false, true), bottom: side(true, true), left: side(false, false) };
  }, { png, backdrop, pad, color: rgb(color), clip });
}
export const ALL_SIDES = { top: true, right: true, bottom: true, left: true };

/** A keyboard stop whose focus showed no cue in the ring colour, in words a failure prints. */
export interface RinglessStop {
  stop: string;
  outline: string;
}

/** A keyboard stop whose focus drew its ring border twice, one just inside the other. */
export interface DoubledStop {
  stop: string;
  /** The two nodes that drew it, as tag and box. */
  borders: [string, string];
}

// The cue reader the sweep installs in the page, by the name it is called by.
const CUE = "__canvasFocusCue";

/** What the cue reader says of the stop Tab landed on: out of the page, passed over, or read. */
type Reading = { out?: true; id?: number; skipped?: true; shown?: boolean; doubled?: [string, string] | null; stop?: string; outline?: string };

/**
 * Walk every keyboard stop in the docs page's content with Tab, and return the stops whose
 * focus shows no cue in `color` (the look's `ring`, as `rgb()`), with the number walked,
 * and the stops whose focus drew a ring border twice: two nodes whose boxes lie within
 * 3 px of each other on every side, both newly bordered in `color` (a field's box that
 * kept its state border while an overlay drew it again just inside, a 2 px ring that
 * reads as a rendering fault).
 *
 * A cue is an outline that draws (the browser's `auto` ring, or a style with a width) or a
 * border with a width, in `color`, that the stop's focus brought: on the stop itself, or
 * on a node whose box touches it, which covers a field's box, a frame around a scrollport,
 * a slider's knob and a code field's active cell. What every node showed with nothing
 * focused is read first, so a border that is `color` at rest (a checked control) is no
 * cue. A focus state lands in a React commit after the focus moves, so each stop waits
 * for its cue before it counts as ringless. The walk starts at the top of the page's
 * scroller and ends where focus leaves it or comes back round; a stop inside a Don't
 * specimen, which shows its anti-pattern on purpose, or a detail specimen that pins a
 * ring-coloured state, is passed over.
 */
export async function ringlessStops(page: Page, color: string): Promise<{ stops: number; ringless: RinglessStop[]; doubled: DoubledStop[] }> {
  // Blur dispatches the event synchronously, but React commits its visual state after
  // that event. Collect rest in a later task, once that commit can remove the old cue;
  // otherwise an initially focused field's ring is mistaken for a resting border.
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await page.evaluate(({ color, name }) => {
    const scroller = document.querySelector("[data-page-scroll]");
    if (!(scroller instanceof HTMLElement)) throw new Error("the page has no [data-page-scroll] scroller to walk");
    // Bit 1: an outline that draws in the colour; bit 2: a border with a width in it.
    const cue = (node: Element) => {
      const style = getComputedStyle(node);
      const outline = style.outlineColor === color && style.outlineStyle !== "none"
        && (style.outlineStyle === "auto" || parseFloat(style.outlineWidth) > 0);
      const border = (["Top", "Right", "Bottom", "Left"] as const).some((side) =>
        style[`border${side}Color`] === color && style[`border${side}Style`] !== "none" && parseFloat(style[`border${side}Width`]) > 0);
      return (outline ? 1 : 0) | (border ? 2 : 0);
    };
    // Only a border is subtracted at rest: a checked control's border is the ring colour
    // with nothing focused, while an outline in it at rest is a pinned focus specimen
    // (InteractionOverride focused), whose ring is exactly the cue the sweep looks for.
    const rest = new WeakMap([...scroller.querySelectorAll("*")].map((node) => [node, cue(node) & 2]));
    // Each stop's number, so the walk knows when focus has come back round.
    const ids = new WeakMap<Element, number>();
    let next = 0;
    const read = (): Reading => {
      const stop = document.activeElement;
      if (!stop || stop === scroller || !scroller.contains(stop)) return { out: true };
      if (!ids.has(stop)) ids.set(stop, ++next);
      const describe = () => {
        const row = stop.closest("[data-platform-row]")?.getAttribute("data-platform-row");
        const label = stop.getAttribute("aria-label") ?? (stop.textContent ?? "").trim().slice(0, 40);
        return `${stop.tagName.toLowerCase()}${stop.getAttribute("role") ? ` role=${stop.getAttribute("role")}` : ""} "${label}"${row ? ` in the ${row} row` : ""}`;
      };
      // A Don't specimen shows its anti-pattern on purpose, and a detail specimen that pins a
      // ring-coloured state (focus, or held open; docs/src/ui/detail/frame.tsx `stageData`)
      // draws that edge at rest, so neither can show a new cue.
      if (stop.closest("[data-dont-specimen], [data-pinned-ring]")) return { id: ids.get(stop), skipped: true, stop: describe() };
      const box = stop.getBoundingClientRect();
      const touches = (node: Element) => {
        const r = node.getBoundingClientRect();
        return r.right >= box.left - 4 && r.left <= box.right + 4 && r.bottom >= box.top - 4 && r.top <= box.bottom + 4;
      };
      // The stop is in the scroller too: each node once, so no node pairs with itself. Only a
      // node that touches the stop can show its cue, so the box is read before the style.
      const brought = [...new Set([stop, ...scroller.querySelectorAll("*")])].filter(touches)
        .map((node) => ({ node, cue: cue(node) & ~(rest.get(node) ?? 0) }))
        .filter(({ cue }) => cue !== 0);
      // A field built with `systemFocus` (src/style/text.tsx) keeps the platform's own focus
      // outline instead of the themed ring, by its documented contract: the browser's `auto`
      // ring on the stop itself is that cue, in the system's colour rather than `ring`.
      const shown = brought.length > 0 || getComputedStyle(stop).outlineStyle === "auto";
      // Two ring borders on one box: nodes whose edges all lie within 3 px of each other.
      const bordered = brought.filter(({ cue }) => (cue & 2) !== 0).map(({ node }) => ({ node, r: node.getBoundingClientRect() }));
      let doubled: [string, string] | null = null;
      const where = ({ node, r }: { node: Element; r: DOMRect }) =>
        `${node.tagName.toLowerCase()} ${Math.round(r.width)}x${Math.round(r.height)} at ${Math.round(r.left)},${Math.round(r.top)}`;
      for (let i = 0; i < bordered.length && !doubled; i++) {
        for (let j = i + 1; j < bordered.length && !doubled; j++) {
          const a = bordered[i]!.r;
          const b = bordered[j]!.r;
          if (Math.abs(a.left - b.left) <= 3 && Math.abs(a.top - b.top) <= 3 && Math.abs(a.right - b.right) <= 3 && Math.abs(a.bottom - b.bottom) <= 3) {
            doubled = [where(bordered[i]!), where(bordered[j]!)];
          }
        }
      }
      const style = getComputedStyle(stop);
      return { id: ids.get(stop), shown, doubled, stop: describe(), outline: `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}` };
    };
    // A focus state lands in a React commit after the focus moves, so a stop that shows no
    // cue yet is read again every 16 ms until it shows one or a second has passed. The wait
    // runs in the page and answers once, so a stop costs the walk one round trip besides its
    // Tab: polling from the test (waitForFunction, then reading its value) cost four, and on
    // the CI runner they took the Calendar page's 354 stops a look past the test's minute.
    // It polls on a timer, not on frames, so a renderer that stops drawing cannot stall it.
    Object.assign(window, {
      [name]: () => new Promise<Reading>((resolve) => {
        const deadline = performance.now() + 1_000;
        const poll = () => {
          const reading = read();
          if (reading.out || reading.skipped || reading.shown || performance.now() >= deadline) resolve(reading);
          else setTimeout(poll, 16);
        };
        poll();
      }),
    });
    scroller.setAttribute("tabindex", "-1");
    scroller.focus({ preventScroll: true });
  }, { color, name: CUE });

  // The stop's reading once its cue has landed, or a second after Tab when it never does.
  const settled = () => page.evaluate((name) => (window as unknown as Record<string, () => Promise<Reading>>)[name]!(), CUE);
  const seen = new Set<number>();
  const ringless: RinglessStop[] = [];
  const doubled: DoubledStop[] = [];
  for (;;) {
    await page.keyboard.press("Tab");
    const reading = await settled();
    if (reading.out || seen.has(reading.id!)) break;
    seen.add(reading.id!);
    if (seen.size > 1_000) throw new Error("the walk passed 1,000 stops without leaving the page: a keyboard trap");
    if (!reading.skipped && !reading.shown) ringless.push({ stop: reading.stop!, outline: reading.outline! });
    if (!reading.skipped && reading.doubled) doubled.push({ stop: reading.stop!, borders: reading.doubled });
  }
  return { stops: seen.size, ringless, doubled };
}
