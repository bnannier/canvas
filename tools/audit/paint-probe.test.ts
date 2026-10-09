// The in-page paint reader (e2e/support/audit-probes.ts `collectPaint`) that a state's row
// and a page's section are measured with before they are photographed, run over a DOM built
// here (bun's preloaded happy-dom, test/setup.ts) with the boxes and computed styles a browser
// would report, and read through the margin it feeds (tools/audit/web-capture.ts
// `paintedMargin`). happy-dom lays nothing out, so every element is given its box on screen,
// its layout size and its padding box, as Chromium reports them for the Card page's Raised
// example and a page section around it.
import { afterEach, describe, expect, it } from "bun:test";
import { collectPaint } from "../../e2e/support/audit-probes.ts";
import { paintedMargin } from "./web-capture.ts";

/** Every property the reader reads, at a browser's computed defaults, so happy-dom reports each one. */
const DEFAULTS =
  "display: block; position: static; overflow-x: visible; overflow-y: visible; visibility: visible; opacity: 1; transform: none; filter: none; perspective: none; contain: none; box-shadow: none; outline-style: none; outline-width: 0px; outline-offset: 0px;";
const RAISED = "rgba(121, 100, 214, 0.22) 0px 30px 54px -24px";

type Edges = [left: number, top: number, right: number, bottom: number];

/** An element with a computed style and the box a browser reports for it; `layout` is its size before transforms. */
function el(style: string, [left, top, right, bottom]: Edges, children: Element[] = [], layout?: { width: number; height: number }): HTMLElement {
  const node = document.createElement("div");
  node.setAttribute("style", `${DEFAULTS} ${style}`);
  const width = right - left;
  const height = bottom - top;
  node.getBoundingClientRect = () => ({ left, top, right, bottom, width, height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;
  const size = layout ?? { width, height };
  for (const [key, value] of Object.entries({ offsetWidth: size.width, offsetHeight: size.height, clientWidth: size.width, clientHeight: size.height, clientLeft: 0, clientTop: 0 })) {
    Object.defineProperty(node, key, { configurable: true, value });
  }
  for (const child of children) node.appendChild(child);
  return node;
}

/** Read `root` as the capture does, attached to the document, and the margin its paint needs. */
function measure(root: HTMLElement) {
  document.body.appendChild(root);
  const paint = collectPaint(root);
  return { paint, ...paintedMargin(paint) };
}

afterEach(() => {
  document.body.replaceChildren();
});

// A section 942 px wide, its raised card 24 px inside it.
const SECTION: Edges = [265, 73, 1207, 192];
const CARD: Edges = [289, 97, 1183, 168];

describe("the paint reader", () => {
  it("reads a raised card's shade in a section: 6 px past each side, 36 px below, none above", () => {
    const card = el(`box-shadow: ${RAISED};`, CARD);
    card.textContent = "Lifted above the page";
    const { paint, margin, by } = measure(el("", SECTION, [card]));
    expect(paint.box).toEqual({ left: 265, top: 73, right: 1207, bottom: 192 });
    expect(paint.casters).toEqual([
      { node: '<div> "Lifted above the page"', box: { left: 289, top: 97, right: 1183, bottom: 168 }, scale: { x: 1, y: 1 }, boxShadow: RAISED, outline: null, transformed: false, clip: null },
    ]);
    expect(margin).toEqual({ top: 0, right: 6, bottom: 36, left: 6 });
    expect(by.bottom).toBe('<div> "Lifted above the page" box-shadow 0px 30px 54px -24px');
  });

  it("cuts a shade to the overflow that clips it inside the element, and lets an absolutely placed card escape a clip below its containing block", () => {
    const clipped = el("overflow-x: hidden; overflow-y: hidden;", SECTION, [el(`box-shadow: ${RAISED};`, CARD)]);
    expect(measure(clipped).margin).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    document.body.replaceChildren();
    // The wrapper clips, but the card's containing block is the positioned section above it.
    const escaping = el("position: relative;", SECTION, [el("overflow-x: hidden; overflow-y: hidden;", SECTION, [el(`position: absolute; box-shadow: ${RAISED};`, CARD)])]);
    expect(measure(escaping).margin).toEqual({ top: 0, right: 6, bottom: 36, left: 6 });
    document.body.replaceChildren();
    // A positioned wrapper is its containing block, so it clips it.
    const held = el("position: relative;", SECTION, [el("position: relative; overflow-x: hidden; overflow-y: hidden;", SECTION, [el(`position: absolute; box-shadow: ${RAISED};`, CARD)])]);
    expect(measure(held).margin).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    document.body.replaceChildren();
    // Clipped on one axis only: the shade still reaches past the sides.
    const across = el("overflow-x: visible; overflow-y: hidden;", SECTION, [el(`box-shadow: ${RAISED};`, CARD)]);
    expect(measure(across).margin).toEqual({ top: 0, right: 6, bottom: 0, left: 6 });
  });

  it("holds a fixed card to the clips of the transformed element that contains it", () => {
    const contained = el("overflow-x: hidden; overflow-y: hidden; transform: translateZ(0px);", SECTION, [el(`position: fixed; box-shadow: ${RAISED};`, CARD)]);
    expect(measure(el("", SECTION, [contained])).margin).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it("takes in a hover lift: the card a transform moved 2 px above the section's top, its shade scaled with it", () => {
    // Pressed flush to the section's top, lifted 2 px (matrix(1, 0, 0, 1, 0, -2)) with the raised shade.
    const lifted = el(`transform: translateY(-2px); box-shadow: ${RAISED};`, [289, 71, 1183, 142]);
    expect(measure(el("", [265, 73, 1207, 192], [lifted])).margin).toEqual({ top: 2, right: 6, bottom: 10, left: 6 });
    document.body.replaceChildren();
    // A lifted box with no shade of its own is reached by the move alone.
    const { margin, by } = measure(el("", [265, 73, 1207, 192], [el("transform: translateY(-2px);", [289, 71, 1183, 142])]));
    expect(margin).toEqual({ top: 2, right: 0, bottom: 0, left: 0 });
    expect(by.top).toBe("<div> moved by a transform");
    document.body.replaceChildren();
    // Scaled 1.5 across and 2 down (a 100 px tall card laid out at 50): its shade's lengths with it.
    const scaled = el(`transform: scale(1.5, 2); box-shadow: ${RAISED};`, [289, 97, 1183, 197], [], { width: 596, height: 50 });
    const read = measure(el("", [289, 97, 1183, 197], [scaled]));
    expect(read.paint.casters[0]!.scale).toEqual({ x: 1.5, y: 2 });
    expect(read.margin).toEqual({ top: 0, right: 45, bottom: 120, left: 45 });
  });

  it("reads nothing that does not paint, but what a hidden element holds and shows", () => {
    const gone = el(`display: none; box-shadow: ${RAISED};`, CARD);
    const faded = el("opacity: 0;", CARD, [el(`box-shadow: ${RAISED};`, CARD)]);
    const hidden = el(`visibility: hidden; box-shadow: ${RAISED};`, CARD, [el(`visibility: visible; outline-style: solid; outline-width: 2px; outline-offset: 2px;`, [289, 97, 1183, 192])]);
    const { paint, margin } = measure(el("", SECTION, [gone, faded, hidden]));
    expect(paint.casters.map((c) => [c.boxShadow, c.outline])).toEqual([["none", { width: 2, offset: 2 }]]);
    expect(margin).toEqual({ top: 0, right: 0, bottom: 4, left: 0 });
  });
});
