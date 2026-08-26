import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { GeoMap } from "../src/charts/geo-map/geo-map.tsx";
import { bubbleAt, bubbleRadius, geoMapAccessibleName, geoMapBubbles, GEO_MAP_ASPECT } from "../src/charts/geo-map/geo-map.shared.tsx";
import { geoMapClusterBubbles, geoMapClusters, geoMapLinkage, geoMapPeak } from "../src/charts/geo-map/geo-map.cluster.ts";
import { formatCompact } from "../src/charts/shared/chart-math.ts";
import { WORLD_VIEW_BOX } from "../src/charts/geo-map/geo-map.world.ts";

// GeoMap: behavior, the data-carrying accessible name, and the selection
// payload. The harness stubs react-native-svg, so nothing about the land path
// or the drawn circles is assertable from the DOM; the geometry is proven
// through the pure helpers below and in test/geo-map-projection.test.ts.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const imgLabel = (c: HTMLElement) => c.querySelector('[role="img"]')?.getAttribute("aria-label") ?? "";

// happy-dom has no ResizeObserver, so RNW's onLayout never fires on its own and
// the map stays unmeasured (no Svg, no flag, no hit layer). Fire the layout
// handler RNW attaches to the host node, mirroring a browser reporting a width.
function fireLayout(el: Element, width: number) {
  const h = (el as unknown as { __reactLayoutHandler?: (e: unknown) => void }).__reactLayoutHandler;
  if (typeof h !== "function") throw new Error("no __reactLayoutHandler on the map (RNW layout hook absent)");
  const height = width / GEO_MAP_ASPECT;
  act(() => h({ nativeEvent: { layout: { x: 0, y: 0, width, height, left: 0, top: 0 } }, timeStamp: 1 }));
}

const POINTS = [
  { label: "London", lat: 51.5072, lng: -0.1276, count: 5170 },
  { label: "New York", lat: 40.7128, lng: -74.006, count: 6310 },
  { label: "Tokyo", lat: 35.6895, lng: 139.6917, count: 3110 },
  { label: "Sao Paulo", lat: -23.5505, lng: -46.6333, count: 2140 },
  { label: "Sydney", lat: -33.8688, lng: 151.2093, count: 1260 },
  { label: "Lagos", lat: 6.5244, lng: 3.3792, count: 980 },
  { label: "Nairobi", lat: -1.2921, lng: 36.8219, count: 610 },
];

describe("bubbleRadius (pure)", () => {
  it("encodes the count as AREA, so the radius follows the square root", () => {
    // Four times the count is twice the radius, hence four times the disc.
    expect(bubbleRadius(100, 100) / bubbleRadius(25, 100)).toBeCloseTo(2, 10);
    expect(bubbleRadius(400, 400) / bubbleRadius(100, 400)).toBeCloseTo(2, 10);
    // A half-count bubble is sqrt(2) narrower, not half as wide.
    expect(bubbleRadius(50, 100) / bubbleRadius(100, 100)).toBeCloseTo(Math.SQRT1_2, 10);
  });

  it("floors tiny, zero, negative and malformed counts at the minimum radius", () => {
    const floor = bubbleRadius(0, 100);
    expect(floor).toBeGreaterThan(0);
    expect(bubbleRadius(1, 1_000_000)).toBe(floor);
    expect(bubbleRadius(-5, 100)).toBe(floor);
    expect(bubbleRadius(NaN, 100)).toBe(floor);
    expect(bubbleRadius(10, 0)).toBe(floor);
    // The floor never SHRINKS a bubble the data has earned.
    expect(bubbleRadius(100, 100)).toBeGreaterThan(floor);
  });
});

describe("geoMapBubbles (pure)", () => {
  it("places every point in the generated viewBox, sized against the largest count", () => {
    const bubbles = geoMapBubbles(POINTS);
    expect(bubbles).toHaveLength(POINTS.length);
    for (const b of bubbles) {
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.x).toBeLessThanOrEqual(WORLD_VIEW_BOX.width);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.y).toBeLessThanOrEqual(WORLD_VIEW_BOX.height);
    }
    // The largest count owns the largest bubble; the smallest, the smallest.
    const largest = bubbles[1].r; // New York, 6310
    expect(Math.max(...bubbles.map((b) => b.r))).toBe(largest);
    expect(bubbles[6].r).toBe(Math.min(...bubbles.map((b) => b.r))); // Nairobi, 610
  });

  it("puts each place in the hemisphere its coordinates name", () => {
    const [london, newYork, tokyo, saoPaulo, sydney] = geoMapBubbles(POINTS);
    const midX = WORLD_VIEW_BOX.width / 2;
    const midY = WORLD_VIEW_BOX.height / 2;
    expect(newYork.x).toBeLessThan(midX); // west
    expect(newYork.y).toBeLessThan(midY); // north
    expect(tokyo.x).toBeGreaterThan(midX);
    expect(tokyo.y).toBeLessThan(midY);
    expect(saoPaulo.x).toBeLessThan(midX);
    expect(saoPaulo.y).toBeGreaterThan(midY); // south
    expect(sydney.x).toBeGreaterThan(midX);
    expect(sydney.y).toBeGreaterThan(midY);
    // Greenwich sits a hair west of the central meridian.
    expect(london.x).toBeLessThan(midX);
    expect(midX - london.x).toBeLessThan(1);
  });

  it("treats non-finite coordinates as the map's origin rather than drawing NaN", () => {
    const [bad] = geoMapBubbles([{ label: "Nowhere", lat: NaN, lng: Infinity, count: 10 }]);
    expect(bad.x).toBe(WORLD_VIEW_BOX.width / 2);
    expect(bad.y).toBe(WORLD_VIEW_BOX.height / 2);
    expect(Number.isFinite(bad.r)).toBe(true);
  });

  it("sizes an all-zero map at the floor instead of dividing by zero", () => {
    const bubbles = geoMapBubbles([
      { label: "A", lat: 10, lng: 10, count: 0 },
      { label: "B", lat: -10, lng: -10, count: 0 },
    ]);
    expect(bubbles[0].r).toBe(bubbles[1].r);
    expect(Number.isFinite(bubbles[0].r)).toBe(true);
  });
});

describe("bubbleAt (pure)", () => {
  const bubbles = [
    { x: 100, y: 100, r: 40 },
    { x: 120, y: 100, r: 8 },
    { x: 600, y: 300, r: 20 },
  ];

  it("hits the bubble a press lands on", () => {
    expect(bubbleAt(bubbles, 600, 300, 1)).toBe(2);
    expect(bubbleAt(bubbles, 100, 100, 1)).toBe(0);
  });

  it("gives a small bubble drawn over a large one its own target", () => {
    // 120,100 is inside the big bubble too, but the small one's center is right
    // there, so the nearest center wins and the small bubble stays reachable.
    expect(bubbleAt(bubbles, 120, 100, 1)).toBe(1);
  });

  it("returns null for empty ocean, which is what clears the selection", () => {
    expect(bubbleAt(bubbles, 400, 40, 1)).toBeNull();
    expect(bubbleAt([], 100, 100, 1)).toBeNull();
  });

  it("gives a bubble smaller than a fingertip a finger-sized target", () => {
    const tiny = [{ x: 200, y: 200, r: 1 }];
    // 6px off a 1px bubble is a miss on the disc but a hit on the target.
    expect(bubbleAt(tiny, 206, 200, 1)).toBe(0);
    expect(bubbleAt(tiny, 260, 200, 1)).toBeNull();
  });

  it("tests in px, so the same press resolves differently as the map scales", () => {
    const one = [{ x: 500, y: 260, r: 30 }];
    // At half scale the bubble is drawn at 250,130 with a 15px radius.
    expect(bubbleAt(one, 250, 130, 0.5)).toBe(0);
    expect(bubbleAt(one, 500, 260, 0.5)).toBeNull();
  });
});

describe("geoMapAccessibleName (pure)", () => {
  const fmt = (v: number) => String(v);

  it("leads with the title, then the biggest places by count", () => {
    const name = geoMapAccessibleName(POINTS, "Active installs", fmt);
    expect(name).toStartWith("Active installs: 7 places. New York 6310, London 5170, Tokyo 3110");
  });

  it("counts the places it did not name in a +N more tail", () => {
    expect(geoMapAccessibleName(POINTS, "Installs", fmt)).toEndWith(", +2 more");
    // Five or fewer places are all named, so there is no tail.
    expect(geoMapAccessibleName(POINTS.slice(0, 5), "Installs", fmt)).not.toContain("more");
  });

  it("falls back to a generic head with no title, and says so when empty", () => {
    expect(geoMapAccessibleName(POINTS.slice(0, 2), undefined, fmt)).toStartWith("World map: 2 places.");
    expect(geoMapAccessibleName([], "Installs", fmt)).toBe("Installs: no places");
  });

  it("formats every named count through formatValue and reads NaN as zero", () => {
    const name = geoMapAccessibleName([{ label: "Lagos", lat: 6.5, lng: 3.4, count: 1200 }], "Reach", (v) => `${v} users`);
    expect(name).toContain("Lagos 1200 users");
    expect(geoMapAccessibleName([{ label: "X", lat: 0, lng: 0, count: NaN }], "R", fmt)).toContain("X 0");
  });
});

describe("GeoMap", () => {
  it("folds the data into the plot's accessible name", () => {
    const { container } = ui(<GeoMap title="Active installs" points={POINTS} />);
    const name = imgLabel(container);
    expect(name).toContain("Active installs: 7 places.");
    expect(name).toContain("New York 6.3k");
    expect(name).toContain("+2 more");
  });

  it("names the root group after the title, and omits the group without one", () => {
    const { container } = ui(<GeoMap title="Active installs" points={POINTS} />);
    expect(container.querySelector('[role="group"]')?.getAttribute("aria-label")).toBe("Active installs chart");
    cleanup();
    const bare = ui(<GeoMap points={POINTS} />);
    expect(bare.container.querySelector('[role="group"]')).toBeNull();
    expect(imgLabel(bare.container)).toStartWith("World map: 7 places.");
  });

  it("forwards testID to the root", () => {
    const { container } = ui(<GeoMap testID="installs-map" points={POINTS} />);
    expect(container.querySelector('[data-testid="installs-map"]')).not.toBeNull();
  });

  it("renders with no bubbles for empty data", () => {
    const { container } = ui(<GeoMap title="Installs" points={[]} />);
    expect(imgLabel(container)).toBe("Installs: no places");
  });

  it("flags the label and formatted count of an uncontrolled selection", () => {
    const { container } = ui(<GeoMap title="Installs" defaultSelected={1} points={POINTS} formatValue={(v) => `${v} installs`} />);
    fireLayout(container.querySelector('[role="img"]')!, 480);
    expect(screen.getByText("New York")).toBeTruthy();
    expect(screen.getByText("6310 installs")).toBeTruthy();
  });

  it("follows a controlled selection and never moves on its own", () => {
    const { container, rerender } = ui(<GeoMap title="Installs" selected={0} points={POINTS} />);
    fireLayout(container.querySelector('[role="img"]')!, 480);
    expect(screen.getByText("London")).toBeTruthy();
    rerender(
      <ThemeProvider>
        <GeoMap title="Installs" selected={2} points={POINTS} />
      </ThemeProvider>,
    );
    expect(screen.getByText("Tokyo")).toBeTruthy();
    expect(screen.queryByText("London")).toBeNull();
  });

  it("reports the pressed bubble's index, and clears on empty ocean", () => {
    let picked: number | null | undefined;
    const { container } = ui(<GeoMap title="Installs" points={POINTS} onSelect={(i) => { picked = i; }} />);
    const plot = container.querySelector('[role="img"]')!;
    fireLayout(plot, 480);

    // The hit layer is the last child of the measured plot; press it where the
    // map draws Tokyo (viewBox units scaled to the rendered 480px width).
    const hit = plot.lastElementChild!;
    const scale = 480 / WORLD_VIEW_BOX.width;
    const tokyo = geoMapBubbles(POINTS)[2];
    fireEvent.click(hit, { offsetX: tokyo.x * scale, offsetY: tokyo.y * scale });
    expect(picked).toBe(2);
    expect(screen.getByText("Tokyo")).toBeTruthy();

    // A press on open ocean off West Africa clears it.
    fireEvent.click(hit, { offsetX: 480 * 0.47, offsetY: (480 / GEO_MAP_ASPECT) * 0.62 });
    expect(picked).toBeNull();
    expect(screen.queryByText("Tokyo")).toBeNull();
  });

  it("toggles a second press on the already-selected bubble back off", () => {
    let picked: number | null | undefined;
    const { container } = ui(<GeoMap title="Installs" points={POINTS} onSelect={(i) => { picked = i; }} />);
    const plot = container.querySelector('[role="img"]')!;
    fireLayout(plot, 480);
    const hit = plot.lastElementChild!;
    const scale = 480 / WORLD_VIEW_BOX.width;
    const sydney = geoMapBubbles(POINTS)[4];
    fireEvent.click(hit, { offsetX: sydney.x * scale, offsetY: sydney.y * scale });
    expect(picked).toBe(4);
    fireEvent.click(hit, { offsetX: sydney.x * scale, offsetY: sydney.y * scale });
    expect(picked).toBeNull();
  });

  it("holds the projection's aspect ratio, so the map never stretches", () => {
    expect(GEO_MAP_ASPECT).toBe(WORLD_VIEW_BOX.width / WORLD_VIEW_BOX.height);
    const { container } = ui(<GeoMap title="Installs" points={POINTS} />);
    const plot = container.querySelector('[role="img"]') as HTMLElement;
    // react-native-web writes the ratio as the CSS `<width> / <height>` pair.
    expect(plot.style.aspectRatio).toBe(`${GEO_MAP_ASPECT} / 1`);
  });
});

// --- zoomable: aggregation that splits as the map is driven in ----------------
//
// The controlled `zoom` prop is what makes any of this reachable in a harness that
// can render no SVG at all: it drives the split end to end with no gesture code.

// Every pair here is under 10 viewBox units apart, so they are one bubble at world
// zoom. Measured: SF-Oakland 0.9, SF-San Jose 3.3, SF-Sacramento 8.6.
const BAY = [
  { label: "San Francisco", lat: 37.7749, lng: -122.4194, count: 4820 },
  { label: "Oakland", lat: 37.8044, lng: -122.2712, count: 1100 },
  { label: "San Jose", lat: 37.3382, lng: -121.8863, count: 2400 },
  { label: "Sacramento", lat: 38.5816, lng: -121.4944, count: 700 },
];

describe("GeoMap zoomable", () => {
  it("leaves an ordinary map exactly as it was", () => {
    // The behaviour-break guard for every consumer that never opts in: no
    // `zoomable`, nothing merges, and the accessible name is byte-identical.
    const plain = ui(<GeoMap title="Installs" points={BAY} />);
    expect(imgLabel(plain.container)).toBe(geoMapAccessibleName(BAY, "Installs", formatCompact));
    expect(imgLabel(plain.container)).not.toContain("group");
  });

  it("aggregates crowded places into one bubble and names the group after its largest", () => {
    const { container } = ui(<GeoMap zoomable title="Installs" points={BAY} defaultSelected={1} />);
    expect(imgLabel(container)).toContain("4 places in 1 group.");
    fireLayout(container.querySelector('[role="img"]')!, 480);
    // Oakland was selected, but the bubble drawn is the group, so the flag names
    // the group rather than claiming to be Oakland alone.
    expect(screen.getByText("San Francisco +3")).toBeTruthy();
  });

  it("splits that group as the zoom rises", () => {
    const { container, rerender } = ui(<GeoMap zoomable zoom={1} title="Installs" points={BAY} />);
    expect(imgLabel(container)).toContain("in 1 group.");
    rerender(
      <ThemeProvider>
        <GeoMap zoomable zoom={16} title="Installs" points={BAY} />
      </ThemeProvider>,
    );
    // At full zoom every place has its own bubble, so nothing is grouped at all.
    expect(imgLabel(container)).toContain("4 places.");
    expect(imgLabel(container)).not.toContain("group");
  });

  it("reports the pressed group's leading place, and every place inside it", () => {
    let picked: number | null | undefined;
    let places: number[] | undefined;
    const { container } = ui(
      <GeoMap
        zoomable
        title="Installs"
        points={BAY}
        onSelect={(i) => { picked = i; }}
        onSelectPlaces={(ids) => { places = ids; }}
      />,
    );
    const plot = container.querySelector('[role="img"]')!;
    fireLayout(plot, 480);

    const links = geoMapLinkage(BAY);
    const clusters = geoMapClusters(BAY, links, 0);
    const bubble = geoMapClusterBubbles(clusters, geoMapPeak(BAY, links))[0];
    const scale = 480 / WORLD_VIEW_BOX.width;
    fireEvent.click(plot.lastElementChild!, { offsetX: bubble.x * scale, offsetY: bubble.y * scale });

    // onSelect keeps its exact meaning, a POINT index, so no existing consumer
    // silently starts receiving something else; the members ride alongside.
    expect(picked).toBe(0);
    expect(places).toEqual([0, 1, 2, 3]);

    fireEvent.click(plot.lastElementChild!, { offsetX: 480 * 0.47, offsetY: (480 / GEO_MAP_ASPECT) * 0.62 });
    expect(picked).toBeNull();
    expect(places).toEqual([]);
  });

  it("zooms from the keyboard, because a pointer-free user has no wheel", () => {
    const seen: number[] = [];
    const { container } = ui(<GeoMap zoomable title="Installs" points={BAY} onZoomChange={(z) => seen.push(z)} />);
    const plot = container.querySelector('[role="img"]')!;
    fireEvent.keyDown(plot, { key: "+" });
    expect(seen).toEqual([2]);
    fireEvent.keyDown(plot, { key: "0" });
    expect(seen).toEqual([2, 1]);
  });

  it("leaves a key it cannot act on to the page", () => {
    // An arrow at 1x cannot pan, so swallowing it would break page scrolling; Tab
    // must always keep moving focus.
    const seen: number[] = [];
    const { container } = ui(<GeoMap zoomable title="Installs" points={BAY} onZoomChange={(z) => seen.push(z)} />);
    const plot = container.querySelector('[role="img"]')!;
    for (const key of ["ArrowRight", "ArrowDown", "Tab", "a"]) {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      fireEvent(plot, event);
      expect(event.defaultPrevented).toBe(false);
    }
    expect(seen).toEqual([]);
  });

  it("offers zoom controls that stop at the ends", () => {
    const { container } = ui(<GeoMap zoomable title="Installs" points={BAY} />);
    const labels = [...container.querySelectorAll("[aria-label]")].map((n) => n.getAttribute("aria-label"));
    expect(labels).toContain("Zoom in");
    expect(labels).toContain("Zoom out");
    expect(labels).toContain("Reset zoom");
    // At 1x there is nothing to zoom out of and nothing to reset.
    const out = container.querySelector('[aria-label="Zoom out"]')!;
    expect(out.getAttribute("aria-disabled") ?? out.getAttribute("disabled")).toBeTruthy();
  });

  it("shows no controls at all on a map that is not zoomable", () => {
    const { container } = ui(<GeoMap title="Installs" points={BAY} />);
    expect(container.querySelector('[aria-label="Zoom in"]')).toBeNull();
  });

  it("zooms on the wheel, about the pointer", () => {
    const seen: number[] = [];
    const { container } = ui(<GeoMap zoomable title="Installs" points={BAY} onZoomChange={(z) => seen.push(z)} />);
    const plot = container.querySelector('[role="img"]')! as HTMLElement;
    fireLayout(plot, 480);
    plot.getBoundingClientRect = () =>
      ({ x: 0, y: 0, width: 480, height: 480 / GEO_MAP_ASPECT, top: 0, left: 0, right: 480, bottom: 480 / GEO_MAP_ASPECT, toJSON: () => ({}) }) as DOMRect;

    const wheel = new WheelEvent("wheel", { deltaY: -320, cancelable: true, bubbles: true });
    Object.defineProperty(wheel, "clientX", { value: 240, configurable: true });
    Object.defineProperty(wheel, "clientY", { value: 120, configurable: true });
    fireEvent(plot, wheel);
    // One doubling of travel is one doubling of zoom.
    expect(seen).toEqual([2]);
    // happy-dom reports defaultPrevented for a passive listener too, so this can
    // only show the gesture was CLAIMED, never that the page did not scroll. That
    // half is verified in a real browser.
    expect(wheel.defaultPrevented).toBe(true);
  });

  it("accumulates wheel notches that arrive in one frame, as a trackpad sends them", () => {
    // Every handler reads the camera from a ref that setCamera writes ahead of the
    // next render. Without that, several events in one tick would each compute
    // from the same stale camera and collapse into a single step.
    const seen: number[] = [];
    const { container } = ui(<GeoMap zoomable title="Installs" points={BAY} onZoomChange={(z) => seen.push(z)} />);
    const plot = container.querySelector('[role="img"]')! as HTMLElement;
    fireLayout(plot, 480);
    plot.getBoundingClientRect = () =>
      ({ x: 0, y: 0, width: 480, height: 250, top: 0, left: 0, right: 480, bottom: 250, toJSON: () => ({}) }) as DOMRect;

    for (let i = 0; i < 2; i += 1) {
      const wheel = new WheelEvent("wheel", { deltaY: -320, cancelable: true, bubbles: true });
      Object.defineProperty(wheel, "clientX", { value: 240, configurable: true });
      Object.defineProperty(wheel, "clientY", { value: 120, configurable: true });
      fireEvent(plot, wheel);
    }
    expect(seen).toEqual([2, 4]);
  });

  it("hands back a wheel gesture it cannot act on, so the page keeps scrolling", () => {
    const seen: number[] = [];
    const { container } = ui(<GeoMap zoomable title="Installs" points={BAY} onZoomChange={(z) => seen.push(z)} />);
    const plot = container.querySelector('[role="img"]')! as HTMLElement;
    fireLayout(plot, 480);
    plot.getBoundingClientRect = () =>
      ({ x: 0, y: 0, width: 480, height: 250, top: 0, left: 0, right: 480, bottom: 250, toJSON: () => ({}) }) as DOMRect;

    // Already at 1x: scrolling further out changes nothing, so the notch is the
    // page's to keep.
    const wheel = new WheelEvent("wheel", { deltaY: 320, cancelable: true, bubbles: true });
    Object.defineProperty(wheel, "clientX", { value: 240, configurable: true });
    Object.defineProperty(wheel, "clientY", { value: 120, configurable: true });
    fireEvent(plot, wheel);
    expect(seen).toEqual([]);
    expect(wheel.defaultPrevented).toBe(false);
  });

  it("never binds a wheel listener on a map that is not zoomable", () => {
    const seen: number[] = [];
    const { container } = ui(<GeoMap title="Installs" points={BAY} onZoomChange={(z) => seen.push(z)} />);
    const plot = container.querySelector('[role="img"]')! as HTMLElement;
    fireLayout(plot, 480);
    plot.getBoundingClientRect = () =>
      ({ x: 0, y: 0, width: 480, height: 250, top: 0, left: 0, right: 480, bottom: 250, toJSON: () => ({}) }) as DOMRect;
    const wheel = new WheelEvent("wheel", { deltaY: -320, cancelable: true, bubbles: true });
    fireEvent(plot, wheel);
    expect(seen).toEqual([]);
    expect(wheel.defaultPrevented).toBe(false);
  });

  it("keeps the hit layer the last child of the plot, zoomable or not", () => {
    // chart-inspect resolves a mouse press through offsetX, which is TARGET-relative,
    // so the hit layer must stay empty AND last. A control rendered inside the plot
    // should fail this named test rather than read as a harness mystery.
    for (const node of [<GeoMap points={BAY} />, <GeoMap zoomable points={BAY} />]) {
      cleanup();
      const { container } = ui(node);
      const plot = container.querySelector('[role="img"]')!;
      fireLayout(plot, 480);
      expect(plot.lastElementChild!.childElementCount).toBe(0);
    }
  });
});
