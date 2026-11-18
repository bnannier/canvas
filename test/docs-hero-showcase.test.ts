import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { chooseReplacement, entryDirection, flightFrame } from "../docs/src/brand/hero-showcase-motion";

const samples = [0, 0.2, 0.49, 0.5, 0.8, 0.999999];
const randomSequence = (...values: number[]) => {
  let index = 0;
  return () => values[index++ % values.length]!;
};

it("gives each chart export exactly one center specimen", () => {
  const chartIndex = readFileSync(new URL("../src/charts/index.ts", import.meta.url), "utf8");
  const showcase = readFileSync(new URL("../docs/src/brand/hero-showcase-charts.tsx", import.meta.url), "utf8");
  const chartSlugs = Array.from(chartIndex.matchAll(/^export \* from "\.\/([a-z-]+)\/\1\.js";$/gm), match => match[1]).sort();
  const pool = showcase.match(/export const HERO_CHART_KINDS = \[([\s\S]+?)\] as const;/)?.[1] ?? "";
  const poolSlugs = Array.from(pool.matchAll(/"([a-z-]+)"/g), match => match[1]).sort();
  const specimenSlugs = Array.from(showcase.matchAll(/case "([a-z-]+)":/g), match => match[1]).sort();
  expect(chartSlugs.length).toBeGreaterThan(0);
  expect(poolSlugs).toEqual(chartSlugs);
  expect(specimenSlugs).toEqual(chartSlugs);
});

describe("individual hero replacements", () => {
  it("can retire the opening artwork so every later arrival demonstrates a live component", () => {
    for (const from of [0, 1, 2, 3, 4]) for (const draw of samples) {
      const flight = chooseReplacement([from], [5], -1, () => draw, 1)!;
      expect(flight.to).toBeGreaterThanOrEqual(1);
      expect(flight.to).toBeLessThan(5);
      expect(flight.to).not.toBe(from);
    }
    expect(chooseReplacement([1], [2], -1, () => 0, 1)).toBeNull();
  });
  it("replaces exactly one item with a different compatible variant, without changing its neighbours", () => {
    const pools = [
      ["revenue chart", "bar chart", "gauge"],
      ["tabs", "input", "breadcrumb", "OTP"],
      ["avatar", "badge"],
      ["switch"],
    ];
    const counts = pools.map(pool => pool.length);
    const selected = Object.freeze([1, 2, 0, 0]);
    const reached = new Set<number>();
    for (const slotDraw of samples) for (const variantDraw of samples) {
      const flight = chooseReplacement(selected, counts, -1, randomSequence(slotDraw, variantDraw, 0));
      expect(flight).not.toBeNull();
      if (!flight) throw new Error("The fixture has eligible replacements");
      expect(flight.from).toBe(selected[flight.slot]!);
      expect(flight.to).not.toBe(flight.from);
      expect(pools[flight.slot]![flight.to]).toBeDefined();
      reached.add(flight.slot);
      const next = selected.map((value, slot) => slot === flight.slot ? flight.to : value);
      expect(next.filter((value, slot) => value !== selected[slot])).toHaveLength(1);
    }
    expect([...reached].sort()).toEqual([0, 1, 2]);
    expect(selected).toEqual([1, 2, 0, 0]);
  });

  it("can reach every alternate variant and both directions without repeating the last slot", () => {
    const selected = [0, 1, 2, 3];
    const reached = new Map<number, Set<number>>();
    const directions = new Set<number>();
    for (const slotDraw of samples) for (const variantDraw of samples) for (const directionDraw of [0, 0.999999]) {
      const flight = chooseReplacement(selected, [4, 4, 4, 4], 1, randomSequence(slotDraw, variantDraw, directionDraw));
      if (!flight) throw new Error("The fixture has eligible replacements");
      expect(flight.slot).not.toBe(1);
      expect(flight.to).not.toBe(selected[flight.slot]);
      const variants = reached.get(flight.slot) ?? new Set<number>();
      variants.add(flight.to);
      reached.set(flight.slot, variants);
      directions.add(flight.direction);
    }
    for (const slot of [0, 2, 3]) expect([...reached.get(slot)!].sort()).toEqual([0, 1, 2, 3].filter(value => value !== selected[slot]));
    expect([...directions].sort()).toEqual([-1, 1]);
  });

  it("keeps a sole eligible position rotating, including when it was the previous position", () => {
    for (const draw of samples) {
      const flight = chooseReplacement([0, 1, 0], [1, 3, 0], 1, () => draw);
      expect(flight?.slot).toBe(1);
      expect(flight?.from).toBe(1);
      expect([0, 2]).toContain(flight!.to);
    }
  });

  it("does not schedule a flight without an alternate specimen", () => {
    const shouldNotDraw = () => { throw new Error("No random choice is needed"); };
    expect(chooseReplacement([], [], -1, shouldNotDraw)).toBeNull();
    expect(chooseReplacement([0, 0], [1, 0], 0, shouldNotDraw)).toBeNull();
  });
});

describe("hero arrival and departure frames", () => {
  it("starts each arrival immediately without an invisible lead-in", () => {
    for (const direction of [-1, 1]) {
      expect(flightFrame(0.01, true, direction).opacity).toBeGreaterThan(0);
      expect(Math.abs(flightFrame(0.01, true, direction).distance)).toBeLessThan(Math.abs(flightFrame(0, true, direction).distance));
    }
  });
  it("brings side positions in from their own edge and sends them out across the scene", () => {
    for (const centerDirection of [-1, 1]) {
      for (const position of ["online", "glass"] as const) {
        const direction = entryDirection(position, centerDirection);
        expect(flightFrame(0, true, direction).distance).toBeLessThan(0);
        expect(flightFrame(1, false, direction).distance).toBeGreaterThan(0);
      }
      for (const position of ["segmented", "toast", "ship"] as const) {
        const direction = entryDirection(position, centerDirection);
        expect(flightFrame(0, true, direction).distance).toBeGreaterThan(0);
        expect(flightFrame(1, false, direction).distance).toBeLessThan(0);
      }
      expect(entryDirection("revenue", centerDirection)).toBe(centerDirection);
    }
  });
  it("starts with the old item at rest and ends with the replacement at the same resting position", () => {
    for (const direction of [-1, 1]) {
      const outgoingStart = flightFrame(0, false, direction);
      const incomingStart = flightFrame(0, true, direction);
      const outgoingEnd = flightFrame(1, false, direction);
      const incomingEnd = flightFrame(1, true, direction);
      expect(Math.abs(outgoingStart.distance)).toBe(0);
      expect(outgoingStart.opacity).toBe(1);
      expect(incomingStart.opacity).toBe(0);
      expect(incomingStart.distance * direction).toBeGreaterThan(0);
      expect(outgoingEnd.opacity).toBe(0);
      expect(outgoingEnd.distance * direction).toBeLessThan(0);
      expect(Math.abs(incomingEnd.distance)).toBe(0);
      expect(incomingEnd.opacity).toBe(1);
    }
  });

  it("moves continuously in one direction with bounded opacity, including clamped frame overshoot", () => {
    for (const incoming of [false, true]) for (const direction of [-1, 1]) {
      expect(flightFrame(-10, incoming, direction)).toEqual(flightFrame(0, incoming, direction));
      expect(flightFrame(10, incoming, direction)).toEqual(flightFrame(1, incoming, direction));
      let previous = flightFrame(0, incoming, direction);
      for (let frame = 1; frame <= 1000; frame++) {
        const next = flightFrame(frame / 1000, incoming, direction);
        expect(Number.isFinite(next.distance)).toBe(true);
        expect(next.opacity).toBeGreaterThanOrEqual(0);
        expect(next.opacity).toBeLessThanOrEqual(1);
        expect(next.distance * direction).toBeLessThanOrEqual(previous.distance * direction + 1e-8);
        expect(Math.abs(next.distance - previous.distance)).toBeLessThan(2);
        expect(Math.abs(next.opacity - previous.opacity)).toBeLessThan(0.01);
        if (incoming) expect(next.opacity).toBeGreaterThanOrEqual(previous.opacity);
        else expect(next.opacity).toBeLessThanOrEqual(previous.opacity);
        previous = next;
      }
    }
  });
});
