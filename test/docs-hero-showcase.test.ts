import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { HeroShowcaseSequence, entryDirection, flightFrame } from "../docs/src/brand/hero-showcase-motion";
import { COMPONENTS } from "../docs/src/core/data/components";

it("covers the included component checklist and excludes Layout and Foundations", () => {
  const source = (file: string) => readFileSync(new URL(`../docs/src/brand/${file}.tsx`, import.meta.url), "utf8");
  const literals = (text: string) => Array.from(text.matchAll(/"([a-z-]+)"/g), match => match[1]!);
  const list = (file: string, name: string) => literals(source(file).match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`))?.[1] ?? "");
  const aliases: Record<string, string> = {
    segments: "button-group", otp: "input-otp", avatars: "avatar", "badge-group": "badge",
    stacked: "stacked-bar", create: "button", favorite: "button", export: "button", launch: "button", "avatar-menu": "avatar", bookmark: "button",
  };
  const controls = literals(source("hero-showcase-panels").match(/export const HERO_SURROUNDING_KINDS = \{([\s\S]*?)\} as const/)?.[1] ?? "").map(kind => aliases[kind] ?? kind);
  const covered = new Set([
    ...list("hero-showcase-charts", "HERO_CHART_KINDS"),
    ...list("hero-showcase-data", "HERO_DATA_KINDS"),
    ...list("hero-showcase-overlays", "HERO_OVERLAY_KINDS"),
    ...list("hero-showcase-forms-navigation", "HERO_FORM_NAV_CENTER"),
    ...list("hero-showcase-forms-navigation", "HERO_FORM_NAV_SMALL"),
    ...controls, "skeleton",
  ]);
  expect([...covered].sort()).toEqual(COMPONENTS.filter(component => component.section !== "Layout" && component.section !== "Foundations").map(component => component.slug).sort());
});

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

describe("shuffled hero replacements", () => {
  it("visits every location and every specimen before repeating a cycle", () => {
    for (const seed of [1, 17, 421]) {
      let state = seed;
      const sequence = new HeroShowcaseSequence(() => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 0x100000000;
      });
      const counts = [61, 9, 9, 10, 11, 9];
      const selected = counts.map(() => 0);
      const visits = counts.map(() => [] as number[]);
      const positions: number[] = [];
      let previous = -1;
      for (let i = 0; i < 6 * 60 * 2; i++) {
        const flight = sequence.next(selected, counts, previous)!;
        expect(flight.slot).not.toBe(previous);
        expect(flight.from).toBe(selected[flight.slot]!);
        expect(flight.to).not.toBe(flight.from);
        expect(flight.to).toBeGreaterThan(0);
        expect(flight.to).toBeLessThan(counts[flight.slot]!);
        positions.push(flight.slot);
        visits[flight.slot]!.push(flight.to);
        selected[flight.slot] = flight.to;
        previous = flight.slot;
      }
      for (let i = 0; i < positions.length; i += 6) {
        expect([...positions.slice(i, i + 6)].sort()).toEqual([0, 1, 2, 3, 4, 5]);
      }
      for (const [slot, variants] of visits.entries()) {
        const poolSize = counts[slot]! - 1;
        for (let i = 0; i + poolSize <= variants.length; i += poolSize) {
          expect(new Set(variants.slice(i, i + poolSize)).size).toBe(poolSize);
        }
      }
    }
  });

  it("handles an empty pool and retires a sole opening specimen", () => {
    const sequence = new HeroShowcaseSequence(() => 0);
    expect(sequence.next([], [], -1)).toBeNull();
    expect(sequence.next([0, 0], [1, 0], -1)).toBeNull();
    expect(sequence.next([0, 0, 0], [1, 2, 0], -1)).toMatchObject({ slot: 1, from: 0, to: 1 });
    expect(sequence.next([0, 1, 0], [1, 2, 0], 1)).toBeNull();
  });

  it("continues rotating when only one location has alternatives", () => {
    const sequence = new HeroShowcaseSequence(() => 0.999);
    let selected = 0;
    for (let i = 0; i < 10; i++) {
      const flight = sequence.next([selected], [3], 0)!;
      expect(flight.slot).toBe(0);
      expect(flight.to).not.toBe(selected);
      selected = flight.to;
    }
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
