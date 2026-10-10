import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Glob } from "bun";
import { axis, MEASURE, pick } from "../src/style/axis.ts";
import { widths } from "../src/style/tokens.ts";
import { characterizeAll, FIXTURE, type Characterization } from "../tools/axes/characterize.ts";
import { SUBJECTS } from "../tools/axes/registry.ts";
import { NOT_AXES } from "../tools/axes/not-axes.ts";
import { resolverSites, siteKey } from "../tools/axes/resolver-sites.ts";

// Axis precedence, as data. A component resolves each axis of its semantic booleans to one
// member when a call site passes several (CLAUDE.md, "Semantic prop styling", Conflicts).
// src/style/axis.ts declares an axis as an ordered list and `pick` resolves it; until every
// component reads its axes from such a table, each resolves them with code of its own.
//
// This file is the characterization the move to tables is proven against. tools/axes/
// registry.ts lists every resolver in the kit and test/fixtures/axes.json records, for each,
// what it returns for no member, for each member alone and for each pair, called in both
// prop orders. A migration (a component's resolver becomes `pick(TABLE, props)`) points its
// registry entry at the new code and leaves the fixture alone: the record holding unchanged
// is the proof the migration changed nothing a call site can see. A change meant to move a
// precedence (the owner's normalization: the smaller size wins, the most urgent status
// wins) re-records with `bun run axes:record` in the commit that makes it, and the
// fixture's diff is the list of pairs whose result changes.

const ROOT = join(import.meta.dir, "..");

describe("the axis primitive", () => {
  it("declares members in precedence order, resolving to themselves", () => {
    const size = axis(["small", "large"], "base");
    expect(size.members).toEqual(["small", "large"]);
    expect(size.values).toEqual({ small: "small", large: "large" });
    expect(size.fallback).toBe("base");
    expect(Object.isFrozen(size) && Object.isFrozen(size.members) && Object.isFrozen(size.values)).toBe(true);
  });

  it("declares valued members in the record's key order, the way `widths` declares the measure", () => {
    const size = axis({ small: 96, large: 200 }, 140);
    expect(size.members).toEqual(["small", "large"]);
    expect(size.values).toEqual({ small: 96, large: 200 });
    expect(size.fallback).toBe(140);
  });

  it("falls back to null when no fallback is given", () => {
    expect(axis(["padLoose", "pad", "padTight"]).fallback).toBeNull();
    expect(axis({ chart1: "chart-1" }).fallback).toBeNull();
  });

  it("picks the highest-precedence member the props set, whatever order they are passed in", () => {
    const size = axis(["small", "large"], "base");
    type Props = { small?: boolean; large?: boolean };
    expect(pick(size, {} as Props)).toBe("base");
    expect(pick(size, { large: true } as Props)).toBe("large");
    expect(pick(size, { small: true, large: true } as Props)).toBe("small");
    expect(pick(size, { large: true, small: true } as Props)).toBe("small");
  });

  it("reads a member as set when its prop is truthy, as an `if` does", () => {
    const tone = axis({ destructive: "error", error: "error", warning: "warning" }, "neutral");
    type Props = { destructive?: boolean; error?: boolean; warning?: boolean };
    expect(pick(tone, { destructive: false, warning: true } as Props)).toBe("warning");
    expect(pick(tone, { destructive: undefined, error: true } as Props)).toBe("error");
    expect(pick(tone, { error: true, warning: true } as Props)).toBe("error");
  });
});

// The first resolver on a table: `stepOf` resolves through MEASURE, and the record's
// "Measure.step" holds it to the loop it replaced.
describe("the measure axis", () => {
  it("is the width scale's steps in their declaration order, narrowest first", () => {
    expect(MEASURE.members).toEqual(Object.keys(widths));
    const caps = MEASURE.members.map((step) => widths[step]);
    expect(caps).toEqual([...caps].sort((a, b) => a - b));
    expect(MEASURE.fallback).toBeNull();
  });
});

describe("the characterization", () => {
  const recorded = JSON.parse(readFileSync(join(ROOT, FIXTURE), "utf8")) as Characterization;
  const current = characterizeAll(SUBJECTS);

  it("covers the resolvers the record covers, and no others", () => {
    expect(Object.keys(current).sort()).toEqual(Object.keys(recorded).sort());
  });

  it("every resolver returns what the record holds, for no member, each member and each pair", () => {
    for (const id of Object.keys(recorded)) expect(current[id], id).toEqual(recorded[id]!);
  });

  it("holds a catalog axis to its rule for every pair", () => {
    const catalogs = Object.entries(current).filter(([, record]) => record.kind === "catalog");
    expect(catalogs.map(([id]) => id)).toEqual(["Icon.glyph"]);
    for (const [id, record] of catalogs) expect(record.kind === "catalog" && record.violations, id).toEqual([]);
  });
});

describe("every hand-rolled resolver is characterized", () => {
  const sites = [...new Glob("src/**/*.{ts,tsx}").scanSync(ROOT)]
    .filter((file) => !file.endsWith(".d.ts"))
    .sort()
    .flatMap((file) => resolverSites(file, readFileSync(join(ROOT, file), "utf8")));
  const subjects = new Map(SUBJECTS.map((s) => [s.resolver, s]));

  it("finds the kit's resolvers", () => {
    expect(sites.length).toBeGreaterThan(0);
  });

  it("each is in the registry, or listed as no axis in tools/axes/not-axes.ts", () => {
    const missing = sites.filter((site) => !subjects.has(siteKey(site)) && !(siteKey(site) in NOT_AXES));
    expect(missing.map((site) => `${siteKey(site)}:${site.line} [${site.members.join(", ")}]`)).toEqual([]);
  });

  it("the registry lists every member a resolver tests", () => {
    const short: string[] = [];
    for (const site of sites) {
      const entry = subjects.get(siteKey(site));
      const members = new Set<string>(entry?.members ?? []);
      const unlisted = entry ? site.members.filter((m) => !members.has(m)) : [];
      if (unlisted.length > 0) short.push(`${entry!.id}: ${unlisted.join(", ")}`);
    }
    expect(short).toEqual([]);
  });

  it("every exception still names a resolver", () => {
    const found = new Set(sites.map(siteKey));
    expect(Object.keys(NOT_AXES).filter((key) => !found.has(key))).toEqual([]);
  });

  it("every registry entry names a resolver its file declares", () => {
    const absent = SUBJECTS.filter((s) => {
      const [file, name] = s.resolver.split("#");
      try {
        return !new RegExp(`\\b(?:function|const)\\s+${name}\\b`).test(readFileSync(join(ROOT, file!), "utf8"));
      } catch {
        return true;
      }
    });
    expect(absent.map((s) => `${s.id}: ${s.resolver}`)).toEqual([]);
  });
});
