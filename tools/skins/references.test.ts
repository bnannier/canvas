import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Glob } from "bun";
import { classifyCell, referenceKeyFor, referenceRows } from "./references.ts";

const ROOT = resolve(import.meta.dir, "../..");

describe("the reference catalog reader", () => {
  it("classifies a cited control, a none note and plain text", () => {
    expect(classifyCell("[badge (Web)](https://catalyst.tailwindui.com/docs/badge)")).toEqual({ kind: "link", text: "badge (Web)", url: "https://catalyst.tailwindui.com/docs/badge" });
    // A URL with parentheses is written in angle brackets; a trailing parenthetical is the note.
    expect(classifyCell("[popover (iOS 27)](<https://example.com/symbols?g=Popovers%2520(iPad%2520Only)>) (iPad only)")).toEqual({
      kind: "link",
      text: "popover (iOS 27)",
      url: "https://example.com/symbols?g=Popovers%2520(iPad%2520Only)",
      note: "iPad only",
    });
    expect(classifyCell("(none: iOS has no checkbox (macOS only))")).toEqual({ kind: "none", text: "iOS has no checkbox (macOS only)" });
    expect(classifyCell("see the input row")).toEqual({ kind: "text", text: "see the input row" });
  });

  it("reads each row with its line, and names the line of one it cannot read", () => {
    const table = [
      "# Catalog",
      "",
      "| Component | Treatment | Build | iOS (iOS 27 UI Kit / HIG) | Android (Material 3) | Web |",
      "|---|---|---|---|---|---|",
      "| stepper-control (+/-) | Full | Built | [s (iOS 27)](https://a) | (none: no stepper) | [s (Web)](https://b) |",
    ].join("\n");
    const [row] = referenceRows(table);
    expect(row).toMatchObject({ key: "stepper-control", component: "stepper-control (+/-)", treatment: "Full", build: "Built", line: 5 });
    expect(row.android).toEqual({ kind: "none", text: "no stepper" });
    expect(() => referenceRows(`${table}\n| broken | Full |`)).toThrow("PLATFORM-REFERENCES.md:6: too few cells");
  });

  it("maps a slug to its own row, an aliased row or the charts row", () => {
    const keys = new Set(["button", "stepper-control", "icon-tile", "overlays", "charts"]);
    expect(referenceKeyFor("button", "Atoms", keys)).toBe("button");
    expect(referenceKeyFor("stepper", "Atoms", keys)).toBe("stepper-control");
    expect(referenceKeyFor("emblem", "Atoms", keys)).toBe("icon-tile");
    expect(referenceKeyFor("drawer", "Organisms", keys)).toBe("overlays");
    expect(referenceKeyFor("line-chart", "Charts", keys)).toBe("charts");
    expect(referenceKeyFor("board", "Organisms", keys)).toBeNull();
    // An alias whose row is gone maps to nothing rather than falling back to the slug.
    expect(referenceKeyFor("stepper", "Atoms", new Set(["stepper"]))).toBeNull();
  });

  it("is the only reader of the catalog", () => {
    // The coverage report once read the table with a parser of its own, with no aliases and
    // no charts row, and reported 48 row-less components where there were 18. Every module
    // that reads the catalog's file hands it to referenceRows.
    const readers: string[] = [];
    const offenders: string[] = [];
    const files = ["scripts", "tools", "test", "docs/scripts", "e2e"].flatMap((dir) => [...new Glob(`${dir}/**/*.{ts,tsx,mjs}`).scanSync(ROOT)]);
    for (const file of files) {
      const source = readFileSync(resolve(ROOT, file), "utf8");
      if (!/\(\s*(?:join\([^)]*,\s*)?["'`]PLATFORM-REFERENCES\.md["'`]/.test(source)) continue;
      readers.push(file);
      if (!/\breferenceRows\(/.test(source) || !/from\s+["'][./]*(?:tools\/)?skins\/references\.ts["']/.test(source)) offenders.push(file);
    }
    expect(readers.length).toBeGreaterThan(2);
    expect(offenders).toEqual([]);
  });
});
