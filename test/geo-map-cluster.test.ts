import { describe, it, expect } from "bun:test";
import {
  CLUSTER_GAP,
  NO_LINKS,
  geoMapLinkage,
  geoClusterThreshold,
  geoMapClusters,
  geoMapPeak,
  geoMapClusterBubbles,
  geoClusterOfPoint,
  geoClusterLabel,
  geoClusterRows,
  geoZoomAnnouncement,
} from "../src/charts/geo-map/geo-map.cluster.ts";
import { MAX_ZOOM_LEVEL } from "../src/charts/geo-map/geo-map.camera.ts";
import { MIN_RADIUS, type GeoMapPoint } from "../src/charts/geo-map/geo-map.shared.tsx";

// Clustering, proven with no renderer. Every distance pinned below was measured
// through the kit's own projection at the generated 2000-wide viewBox, so a change
// to the projection or the box fails these rather than silently re-grouping the map.

const P = (label: string, lat: number, lng: number, count: number): GeoMapPoint => ({ label, lat, lng, count });

// Measured: London-Paris 20.5, Paris-Brussels 15.7, Brussels-Amsterdam 9.7 all sit
// under the 32-unit gap; Amsterdam-Berlin 40.7, Rome-Berlin 66.7 and London-Madrid
// 72.4 all sit above it.
const EUROPE = [
  P("London", 51.5072, -0.1276, 5170),
  P("Paris", 48.8566, 2.3522, 3100),
  P("Brussels", 50.8503, 4.3517, 900),
  P("Amsterdam", 52.3676, 4.9041, 1400),
  P("Berlin", 52.52, 13.405, 2650),
  P("Madrid", 40.4168, -3.7038, 1800),
  P("Rome", 41.9028, 12.4964, 1200),
];

// Measured: every pair under 10 units, so this is one bubble at world zoom that
// splits only as the map is driven in.
const BAY = [
  P("San Francisco", 37.7749, -122.4194, 4820),
  P("Oakland", 37.8044, -122.2712, 1100),
  P("San Jose", 37.3382, -121.8863, 2400),
  P("Sacramento", 38.5816, -121.4944, 700),
];

// The fixture test/geo-map.test.tsx uses. Its closest pair is Lagos-Nairobi at
// 192.5 units against a 32-unit gap.
const FIXTURE = [
  P("London", 51.5072, -0.1276, 5170),
  P("New York", 40.7128, -74.006, 6310),
  P("Tokyo", 35.6895, 139.6917, 3110),
  P("Sao Paulo", -23.5505, -46.6333, 2140),
  P("Sydney", -33.8688, 151.2093, 1260),
  P("Lagos", 6.5244, 3.3792, 980),
  P("Nairobi", -1.2921, 36.8219, 610),
];

const labelsOf = (points: readonly GeoMapPoint[], level: number) =>
  geoMapClusters(points, geoMapLinkage(points), level)
    .map((c) => c.members.map((i) => points[i].label).sort().join("+"))
    .sort();

describe("geoMapLinkage (pure)", () => {
  it("returns one link per merge, so n places yield n-1 links", () => {
    expect(geoMapLinkage(EUROPE)).toHaveLength(EUROPE.length - 1);
    expect(geoMapLinkage(BAY)).toHaveLength(BAY.length - 1);
  });

  it("has nothing to merge on an empty or single-place map", () => {
    expect(geoMapLinkage([])).toEqual([]);
    expect(geoMapLinkage([EUROPE[0]])).toEqual([]);
  });

  it("orders links by length, which is what lets one cut serve every zoom", () => {
    const links = geoMapLinkage(EUROPE);
    for (let i = 1; i < links.length; i += 1) {
      expect(links[i].distance).toBeGreaterThanOrEqual(links[i - 1].distance);
    }
  });

  it("measures in projected units, pinned to the real geography", () => {
    const links = geoMapLinkage([EUROPE[0], EUROPE[1]]);
    expect(links[0].distance).toBeCloseTo(20.5, 1); // London-Paris
  });
});

describe("geoClusterThreshold (pure)", () => {
  it("halves with every zoom level, because a fixed on-screen gap covers half the world", () => {
    expect(geoClusterThreshold(0)).toBe(CLUSTER_GAP);
    expect(geoClusterThreshold(1)).toBe(CLUSTER_GAP / 2);
    expect(geoClusterThreshold(2)).toBe(CLUSTER_GAP / 4);
  });

  it("is exactly zero at the deepest zoom, so ANY data separates fully", () => {
    // Without this, places closer than the floor would share a bubble forever.
    expect(geoClusterThreshold(MAX_ZOOM_LEVEL)).toBe(0);
    expect(geoClusterThreshold(MAX_ZOOM_LEVEL + 5)).toBe(0);
  });

  it("treats a malformed level as the whole world", () => {
    expect(geoClusterThreshold(NaN)).toBe(CLUSTER_GAP);
    expect(geoClusterThreshold(-3)).toBe(CLUSTER_GAP);
  });
});

describe("geoMapClusters (pure)", () => {
  it("merges places whose bubbles would collide and leaves distant ones alone", () => {
    expect(labelsOf(EUROPE, 0)).toEqual(
      ["Amsterdam+Brussels+London+Paris", "Berlin", "Madrid", "Rome"].sort(),
    );
  });

  it("splits that group as the map is driven in, and never re-forms it", () => {
    // The user-visible behaviour: one European bubble becomes four.
    expect(labelsOf(EUROPE, 0)).toHaveLength(4);
    expect(labelsOf(EUROPE, MAX_ZOOM_LEVEL)).toHaveLength(EUROPE.length);
    expect(labelsOf(BAY, 0)).toEqual(["Oakland+Sacramento+San Francisco+San Jose"]);
    expect(labelsOf(BAY, MAX_ZOOM_LEVEL)).toHaveLength(BAY.length);
  });

  it("only ever REFINES: every group at one zoom sits inside exactly one group below", () => {
    // The anti-flicker guarantee, asserted as the structural property it is. No
    // place may migrate between groups, and no split may re-form.
    for (const points of [EUROPE, BAY, FIXTURE]) {
      const links = geoMapLinkage(points);
      for (let level = 0; level < MAX_ZOOM_LEVEL; level += 1) {
        const coarse = geoMapClusters(points, links, level);
        const fine = geoMapClusters(points, links, level + 1);
        for (const child of fine) {
          const hosts = coarse.filter((parent) => child.members.every((m) => parent.members.includes(m)));
          expect(hosts).toHaveLength(1);
        }
      }
    }
  });

  it("is order-independent: shuffling the input yields the same grouping", () => {
    // This is what distinguishes real single-link clustering from a sequential
    // greedy pass, which would pass every other test here.
    const shuffled = [EUROPE[4], EUROPE[0], EUROPE[6], EUROPE[2], EUROPE[5], EUROPE[3], EUROPE[1]];
    for (let level = 0; level <= MAX_ZOOM_LEVEL; level += 1) {
      expect(labelsOf(shuffled, level)).toEqual(labelsOf(EUROPE, level));
    }
  });

  it("puts every place in exactly one group and conserves the total at every zoom", () => {
    const links = geoMapLinkage(EUROPE);
    const total = EUROPE.reduce((s, p) => s + p.count, 0);
    for (let level = 0; level <= MAX_ZOOM_LEVEL; level += 1) {
      const clusters = geoMapClusters(EUROPE, links, level);
      expect(clusters.flatMap((c) => c.members).sort((a, b) => a - b)).toEqual(EUROPE.map((_, i) => i));
      expect(clusters.reduce((s, c) => s + c.count, 0)).toBe(total);
    }
  });

  it("is the un-clustered map when nothing links, so the degenerate case is today's map", () => {
    const clusters = geoMapClusters(FIXTURE, NO_LINKS, 0);
    expect(clusters).toHaveLength(FIXTURE.length);
    clusters.forEach((c, i) => expect(c.members).toEqual([i]));
  });

  it("separates even coincident places at the deepest zoom, whatever the geography", () => {
    const twins = [P("A", 10, 10, 5), P("B", 10, 10, 9)];
    expect(geoMapClusters(twins, geoMapLinkage(twins), 0)).toHaveLength(1);
    expect(geoMapClusters(twins, geoMapLinkage(twins), MAX_ZOOM_LEVEL)).toHaveLength(2);
  });

  it("never merges across the antimeridian", () => {
    // Suva and Nuku'alofa are neighbours on the globe and 1929 units apart on this
    // projection, so the seam must not fold them together.
    const pacific = [P("Suva", -18.1416, 178.4419, 400), P("Nuku'alofa", -21.1394, -175.2018, 200)];
    expect(geoMapClusters(pacific, geoMapLinkage(pacific), 0)).toHaveLength(2);
  });

  it("weights the centroid by count, so the bubble sits on its data", () => {
    const pair = [P("Tokyo", 35.6895, 139.6917, 1000), P("Yokohama", 35.4437, 139.638, 1)];
    const [only] = geoMapClusters(pair, geoMapLinkage(pair), 0);
    const solo = geoMapClusters([pair[0]], [], 0)[0];
    expect(only.members).toHaveLength(2);
    expect(Math.hypot(only.x - solo.x, only.y - solo.y)).toBeLessThan(1);
  });

  it("falls back to the plain mean when every count is zero rather than dividing by zero", () => {
    const empty = [P("A", 10, 10, 0), P("B", 10, 11, 0)];
    const [only] = geoMapClusters(empty, geoMapLinkage(empty), 0);
    expect(Number.isFinite(only.x)).toBe(true);
    expect(Number.isFinite(only.y)).toBe(true);
    expect(only.count).toBe(0);
  });

  it("treats a negative or malformed count as zero, exactly as bubbleRadius does", () => {
    const odd = [P("A", 10, 10, -5), P("B", 10, 10.1, Number.NaN), P("C", 10, 10.2, 7)];
    const [only] = geoMapClusters(odd, geoMapLinkage(odd), 0);
    expect(only.count).toBe(7);
    expect(only.lead).toBe(2);
  });

  it("names a group after its largest place, ties going to the earlier one", () => {
    const tie = [P("First", 10, 10, 100), P("Second", 10, 10.1, 100)];
    expect(geoMapClusters(tie, geoMapLinkage(tie), 0)[0].lead).toBe(0);
  });

  it("leaves the map's own test fixture as seven separate places at every zoom", () => {
    // The regression guard for test/geo-map.test.tsx: its closest pair is 192.5
    // units apart against a 32-unit gap, so clustering can never disturb it.
    const links = geoMapLinkage(FIXTURE);
    for (let level = 0; level <= MAX_ZOOM_LEVEL; level += 1) {
      expect(geoMapClusters(FIXTURE, links, level)).toHaveLength(FIXTURE.length);
    }
  });
});

describe("geoMapPeak / geoMapClusterBubbles (pure)", () => {
  const links = geoMapLinkage(EUROPE);
  const peak = geoMapPeak(EUROPE, links);

  it("normalises against the largest AGGREGATE, so it does not move as things split", () => {
    // London+Paris+Brussels+Amsterdam = 5170+3100+900+1400.
    expect(peak).toBe(10_570);
  });

  it("sizes a bubble from its own count alone, so a split elsewhere never resizes it", () => {
    const madridAt = (level: number) => {
      const clusters = geoMapClusters(EUROPE, links, level);
      const at = clusters.findIndex((c) => c.members.includes(5));
      return geoMapClusterBubbles(clusters, peak)[at].r;
    };
    // Madrid is a singleton at every level, so its radius must never move even
    // though the European group splits underneath it.
    for (let level = 1; level <= MAX_ZOOM_LEVEL; level += 1) expect(madridAt(level)).toBe(madridAt(0));
  });

  it("never grows a bubble as the map zooms in: a split can only take area away", () => {
    for (let level = 0; level < MAX_ZOOM_LEVEL; level += 1) {
      const coarse = geoMapClusters(EUROPE, links, level);
      const fine = geoMapClusters(EUROPE, links, level + 1);
      const coarseR = geoMapClusterBubbles(coarse, peak);
      const fineR = geoMapClusterBubbles(fine, peak);
      fine.forEach((child, i) => {
        const at = coarse.findIndex((parent) => child.members.every((m) => parent.members.includes(m)));
        expect(fineR[i].r).toBeLessThanOrEqual(coarseR[at].r + 1e-9);
      });
    }
  });

  it("conserves disc AREA across a split, so a group's ink equals its members'", () => {
    // r is proportional to sqrt(count/peak), so area is exactly linear in count.
    const coarse = geoMapClusters(EUROPE, links, 0);
    const fine = geoMapClusters(EUROPE, links, MAX_ZOOM_LEVEL);
    const coarseR = geoMapClusterBubbles(coarse, peak);
    const fineR = geoMapClusterBubbles(fine, peak);
    coarse.forEach((parent, i) => {
      const children = fine.map((c, j) => ({ c, r: fineR[j].r })).filter(({ c }) => c.members.every((m) => parent.members.includes(m)));
      // Skip any group with a child pinned at the floor: that is the one
      // deliberate departure from strict proportionality.
      if (children.some(({ r }) => r <= MIN_RADIUS) || coarseR[i].r <= MIN_RADIUS) return;
      const area = (r: number) => Math.PI * r * r;
      expect(children.reduce((s, { r }) => s + area(r), 0)).toBeCloseTo(area(coarseR[i].r), 6);
    });
  });
});

describe("geoClusterOfPoint / geoClusterLabel / geoClusterRows (pure)", () => {
  const links = geoMapLinkage(EUROPE);
  const clusters = geoMapClusters(EUROPE, links, 0);
  const fmt = (v: number) => `${v}`;

  it("finds the group a place is drawn in, and reports none for no selection", () => {
    expect(geoClusterOfPoint(clusters, 0)).toBe(0); // London, in the merged group
    expect(geoClusterOfPoint(clusters, 4)).toBe(1); // Berlin, on its own
    expect(geoClusterOfPoint(clusters, null)).toBeNull();
    expect(geoClusterOfPoint(clusters, 99)).toBeNull();
  });

  it("names a single place after itself, exactly as today", () => {
    expect(geoClusterLabel(clusters[1], EUROPE)).toBe("Berlin");
    expect(geoClusterRows(clusters[1], EUROPE, fmt)).toEqual([{ value: "2650" }]);
  });

  it("names a group after its largest place and counts the rest", () => {
    expect(geoClusterLabel(clusters[0], EUROPE)).toBe("London +3");
  });

  it("lists a group's biggest members and summarises whatever will not fit", () => {
    const big = [
      P("A", 10, 10, 50), P("B", 10, 10.05, 40), P("C", 10, 10.1, 30),
      P("D", 10, 10.15, 20), P("E", 10, 10.2, 10), P("F", 10, 10.25, 5),
    ];
    const [only] = geoMapClusters(big, geoMapLinkage(big), 0);
    expect(only.members).toHaveLength(6);
    const rows = geoClusterRows(only, big, fmt);
    expect(rows.slice(0, 4)).toEqual([
      { label: "A", value: "50" }, { label: "B", value: "40" },
      { label: "C", value: "30" }, { label: "D", value: "20" },
    ]);
    // The tail is summarised, so the flag cannot grow without bound.
    expect(rows[4]).toEqual({ label: "+2 more", value: "15" });
  });
});

describe("geoZoomAnnouncement (pure)", () => {
  it("says the grouping out loud, because a screen-reader user cannot watch bubbles merge", () => {
    expect(geoZoomAnnouncement(1, 4, 7)).toBe("Zoom 1x. 7 places in 4 groups.");
    expect(geoZoomAnnouncement(16, 7, 7)).toBe("Zoom 16x. 7 places, none grouped.");
  });
});
