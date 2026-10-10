// The platform reference catalog (PLATFORM-REFERENCES.md) held to the code. A row says,
// for a docs component, whether iOS and Android ship a control for its job and how the
// component treats the platforms; tools/skins/divergence.ts reads, per platform build,
// whether the component draws a look of its own there or only takes another component's
// platform build as a part (check:skins holds the docs' platform-skin registry to the same
// read, and the last test here ties the two). The design language ties row and code
// together (item 3 in CLAUDE.md): a component keeps a native shape only on a platform that
// ships a real control for its job, and everywhere else its native skin is the web skin.
// So:
//
// 1. Every docs component has a row, read through the one reader (tools/skins/references.ts).
// 2. A native look of the component's own (a skin or data of its own, or a form the reader
//    cannot classify) stands on a platform whose cell is a none note only where ONE_JOB
//    records the different control that platform uses for the job (item 5), or where
//    TRANSITIONAL names the audit turn that aliases it to the web skin.
// 3. A cell that cites a control on a platform where the component's own skin is the web
//    skin stands only where NO_NATIVE_SHAPE says why no native shape is owed there.
// 4. Treatment is Shared exactly when no platform builds a look of the component's own
//    (an injected part may still differ), and Missing exactly for the backlog rows.
// 5. Every entry of the three lists is still called for: one the code or the catalog has
//    moved past fails, so the turn that aliases a skin also deletes its TRANSITIONAL entry.
//
// A part is judged at its own row: the platform Button a Dialog injects answers to the
// button row, and a Dropdown built from the Dropdown's own skin to the dropdown row.

import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { COMPONENTS } from "../docs/src/core/data/components.ts";
import type { Category, ComponentDoc } from "../docs/src/core/data/types.ts";
import { componentSkins, isOwnLook, type Platform } from "../tools/skins/divergence.ts";
import { referenceKeyFor, referenceRows, type ReferenceRow } from "../tools/skins/references.ts";
import { registeredSkins } from "../tools/skins/registry.ts";

const ROOT = join(import.meta.dir, "..");
const PLATFORMS: readonly Platform[] = ["iOS", "Android"];
const BOTH: readonly Platform[] = PLATFORMS;

/**
 * One job, different control (design-language item 5): the platform has no control for
 * the component's job, so its cell is a none note, and the native build draws the control
 * that platform uses for that job instead. Keyed by reference row, then platform: the
 * substitute and where it was decided. The K8c entries are the owner's "keep" verdicts
 * (audit/DECISIONS.md, K8c).
 */
const ONE_JOB: Record<string, Partial<Record<Platform, string>>> = {
  checkbox: { iOS: "iOS has no checkbox: a one-setting Checkbox renders the iOS switch (its Switch part), and a selection the edit-mode selection circle (item 5)" },
  radio: { iOS: "iOS has no radio button: a single choice is a checkmark list, the inline picker of a grouped form (item 5)" },
  listbox: { iOS: "iOS has no listbox: a chosen row takes the iOS list's trailing checkmark, in single and multi select alike (item 5)" },
  autocomplete: { iOS: "iOS has no combo box: a text field with a menu of suggestions under it (K8c, kept)" },
  carousel: { iOS: "iOS has no carousel: paged cards with the page control's dots, as in the App Store (K8c, kept)" },
  "filter-panel": { iOS: "iOS has no filter panel: a sheet of grouped rows that mark a chosen filter with the trailing checkmark (K8c, kept)" },
  "action-sheet": { Android: "Material 3 has no action sheet: the actions sit in a modal bottom sheet with its drag handle (K8c, kept)" },
};

/**
 * Native skins of their own on platforms whose cell is a none note, each awaiting the
 * audit turn that aliases it to the web skin (audit/DECISIONS.md: K8b aliases both native
 * skins; K8c gives the owner's per-component "alias" verdicts). `turn` is the docs
 * component whose turn does it; that turn deletes the entry.
 */
const TRANSITIONAL: Record<string, { item: "K8b" | "K8c"; turn: string; on: readonly Platform[] }> = {
  breadcrumb: { item: "K8b", turn: "Breadcrumb", on: BOTH },
  "input-otp": { item: "K8b", turn: "InputOTP", on: BOTH },
  "action-panels": { item: "K8b", turn: "ActionPanel", on: BOTH },
  "empty-state": { item: "K8b", turn: "EmptyState", on: BOTH },
  feeds: { item: "K8b", turn: "Feed", on: BOTH },
  "media-objects": { item: "K8b", turn: "MediaObject", on: BOTH },
  stats: { item: "K8b", turn: "Stats", on: BOTH },
  command: { item: "K8b", turn: "Command", on: BOTH },
  steps: { item: "K8b", turn: "Steps", on: BOTH },
  "stepper-control": { item: "K8c", turn: "Stepper", on: ["Android"] },
  accordion: { item: "K8c", turn: "Accordion", on: ["Android"] },
  card: { item: "K8c", turn: "Card", on: ["iOS"] },
  collapsible: { item: "K8c", turn: "Collapsible", on: ["Android"] },
  "description-lists": { item: "K8c", turn: "DescriptionList", on: ["Android"] },
  form: { item: "K8c", turn: "Form", on: ["Android"] },
  "grid-lists": { item: "K8c", turn: "GridList", on: ["Android"] },
  board: { item: "K8c", turn: "Board", on: BOTH },
  "data-table": { item: "K8c", turn: "DataTable", on: ["Android"] },
  "drag-drop": { item: "K8c", turn: "Drag & drop", on: BOTH },
};

/**
 * Cells that cite a platform control where the component's own skin is the web skin:
 * why no native shape is owed there. Keyed by reference row, then platform.
 */
const NO_NATIVE_SHAPE: Record<string, Partial<Record<Platform, string>>> = {
  divider: {
    iOS: "SwiftUI's Divider is a single hairline rule, which the web skin draws",
    Android: "the Material 3 divider is a single hairline rule, which the web skin draws",
  },
  icon: {
    iOS: "SF Symbols is a glyph library, not a control with a shape: the kit draws its own outline glyphs at one stroke on every platform",
    Android: "Material Symbols is a glyph library, not a control with a shape: the kit draws its own outline glyphs at one stroke on every platform",
  },
  typography: {
    iOS: "type is Dark Factory's Manrope at its dense sizes on every platform (design-language item 4)",
    Android: "type is Dark Factory's Manrope at its dense sizes on every platform (design-language item 4)",
  },
  charts: { iOS: "Swift Charts styles its marks in the app's own colors and type, so the chart family draws one skin on every platform" },
  text: { iOS: "a label is styled text with no shape of its own: React Native's Text renders through the platform's own text system, in the typography row's type" },
  image: { iOS: "an image view shows an image with no frame or chrome of its own: React Native's Image renders through the platform's own image view" },
  "scroll-view": { iOS: "React Native's ScrollView is the platform's own scroll view, with its system-drawn indicators" },
  "text-input": {
    iOS: "React Native's TextInput is the platform's own text field (UITextField, UITextView) with no kit skin; the field that keeps the iOS shape is the input row's",
    Android: "React Native's TextInput is the platform's own text field (EditText) with no kit skin; the field that keeps the Material 3 shape is the input row's",
  },
};

const GROUP: Record<Category, string> = { Atoms: "atoms", Molecules: "molecules", Organisms: "organisms", Charts: "charts" };

const rows = referenceRows(readFileSync(join(ROOT, "PLATFORM-REFERENCES.md"), "utf8"));
const keys = new Set(rows.map((row) => row.key));
const skins = componentSkins(join(ROOT, "src"));
const built = rows.filter((row) => row.build === "Built");
const rowOf = (key: string): ReferenceRow | undefined => rows.find((row) => row.key === key);
const componentsOf = (key: string): ComponentDoc[] => COMPONENTS.filter((c) => referenceKeyFor(c.slug, c.category, keys) === key);
const skinsOfDoc = (c: ComponentDoc) => skins.find((s) => s.group === GROUP[c.category] && s.dir === (c.dir ?? c.slug));
const cellOf = (row: ReferenceRow, platform: Platform) => (platform === "iOS" ? row.ios : row.android);

/** Each build of the row's components that draws a look of its own on a platform, with why. */
function ownLooks(key: string, platform: Platform): { component: string; build: string; why: string }[] {
  return componentsOf(key).flatMap((c) =>
    Object.entries(skinsOfDoc(c)?.exportReasons ?? {}).flatMap(([build, byPlatform]) => {
      const own = (byPlatform[platform] ?? []).filter(isOwnLook);
      return own.length ? [{ component: c.name, build, why: own.map((r) => r.text).join("; ") }] : [];
    }),
  );
}
const describeLooks = (looks: ReturnType<typeof ownLooks>): string => looks.map((l) => `${l.build} (${l.why})`).join(", ");

describe("the platform reference catalog", () => {
  it("has a row for every docs component, and every built row is some docs component's", () => {
    expect(rows.filter((row, i) => rows.findIndex((other) => other.key === row.key) !== i).map((row) => `PLATFORM-REFERENCES.md:${row.line} ${row.key} is a second row`)).toEqual([]);
    expect(COMPONENTS.filter((c) => referenceKeyFor(c.slug, c.category, keys) === null).map((c) => c.slug)).toEqual([]);
    expect(built.filter((row) => componentsOf(row.key).length === 0).map((row) => `PLATFORM-REFERENCES.md:${row.line} ${row.key}`)).toEqual([]);
    for (const c of COMPONENTS) expect(skinsOfDoc(c), `${c.slug} has a source directory`).toBeDefined();
  });

  it("cites a control or states a none note in every native cell of a built row", () => {
    const loose = built.flatMap((row) => PLATFORMS.filter((p) => cellOf(row, p).kind === "text").map((p) => `PLATFORM-REFERENCES.md:${row.line} ${row.key} ${p}: ${cellOf(row, p).text}`));
    expect(loose).toEqual([]);
  });

  it("tags Shared exactly the rows whose own skin is the web skin on every platform, and Missing exactly the backlog", () => {
    const wrong = rows.flatMap((row) => {
      if (row.build !== "Built") return row.treatment === "Missing" ? [] : [`PLATFORM-REFERENCES.md:${row.line} ${row.key} is a backlog row (${row.build.split(":")[0]}) tagged ${row.treatment}`];
      if (row.treatment === "Missing") return [`PLATFORM-REFERENCES.md:${row.line} ${row.key} is built but tagged Missing`];
      const own = PLATFORMS.flatMap((p) => ownLooks(row.key, p).map((l) => `${p}: ${l.build} (${l.why})`));
      if (row.treatment === "Shared" && own.length) return [`PLATFORM-REFERENCES.md:${row.line} ${row.key} is tagged Shared but draws a look of its own: ${own.join("; ")}`];
      if (row.treatment !== "Shared" && !own.length) return [`PLATFORM-REFERENCES.md:${row.line} ${row.key} is tagged ${row.treatment} but its own skin is the web skin on every platform: tag it Shared`];
      return [];
    });
    expect(wrong).toEqual([]);
  });

  it("lets a native look of a component's own stand only where its cell cites the platform's control, a one-job substitute, or a transitional turn", () => {
    const offenders = built.flatMap((row) =>
      PLATFORMS.flatMap((p) => {
        const looks = ownLooks(row.key, p);
        if (!looks.length || cellOf(row, p).kind !== "none") return [];
        if (ONE_JOB[row.key]?.[p] || TRANSITIONAL[row.key]?.on.includes(p)) return [];
        return [
          `PLATFORM-REFERENCES.md:${row.line} ${row.key}: ${p} ships no control for the job, yet the ${p} build draws a look of its own: ${describeLooks(looks)}. ` +
            `Alias the ${p} skin to the web skin, cite the ${p} control in the row, or record the substitute in ONE_JOB.`,
        ];
      }),
    );
    expect(offenders).toEqual([]);
  });

  it("lets a cell cite a control where the component draws the web skin only with the reason no native shape is owed", () => {
    const offenders = built.flatMap((row) =>
      PLATFORMS.flatMap((p) => {
        if (cellOf(row, p).kind !== "link" || ownLooks(row.key, p).length || NO_NATIVE_SHAPE[row.key]?.[p]) return [];
        return [
          `PLATFORM-REFERENCES.md:${row.line} ${row.key}: the row cites ${cellOf(row, p).url} on ${p}, yet the ${p} build's own skin is the web skin. ` +
            `Keep the control's shape in the ${p} skin, correct the cell to a none note if ${p} has no control for this job, or record in NO_NATIVE_SHAPE why no native shape is owed.`,
        ];
      }),
    );
    expect(offenders).toEqual([]);
  });

  it("keeps ONE_JOB, TRANSITIONAL and NO_NATIVE_SHAPE to entries the code and the catalog still call for", () => {
    const stale: string[] = [];
    for (const [key, byPlatform] of Object.entries(ONE_JOB)) {
      const row = rowOf(key);
      if (!row) {
        stale.push(`ONE_JOB.${key}: no such row`);
        continue;
      }
      for (const p of Object.keys(byPlatform) as Platform[]) {
        if (cellOf(row, p).kind !== "none") stale.push(`ONE_JOB.${key}.${p}: the row cites a ${p} control, so no substitute is needed`);
        else if (!ownLooks(key, p).length) stale.push(`ONE_JOB.${key}.${p}: the ${p} build draws the web skin, so there is no substitute to record`);
        if (TRANSITIONAL[key]?.on.includes(p)) stale.push(`ONE_JOB.${key}.${p}: also TRANSITIONAL; a substitute is kept, not aliased`);
      }
    }
    for (const [key, entry] of Object.entries(TRANSITIONAL)) {
      const row = rowOf(key);
      if (!row) {
        stale.push(`TRANSITIONAL.${key}: no such row`);
        continue;
      }
      for (const p of entry.on) {
        const looks = ownLooks(key, p);
        if (cellOf(row, p).kind !== "none") stale.push(`TRANSITIONAL.${key}.${p}: the row cites a ${p} control, so the ${p} skin is not transitional`);
        else if (!looks.length) stale.push(`TRANSITIONAL.${key}.${p}: the ${p} build already draws the web skin; delete the entry (${entry.item}, ${entry.turn}'s turn)`);
        else if (!looks.some((l) => l.component === entry.turn)) stale.push(`TRANSITIONAL.${key}.${p}: ${entry.turn} is not the docs component that draws it (${describeLooks(looks)})`);
      }
    }
    for (const [key, byPlatform] of Object.entries(NO_NATIVE_SHAPE)) {
      const row = rowOf(key);
      if (!row) {
        stale.push(`NO_NATIVE_SHAPE.${key}: no such row`);
        continue;
      }
      for (const p of Object.keys(byPlatform) as Platform[]) {
        if (cellOf(row, p).kind !== "link") stale.push(`NO_NATIVE_SHAPE.${key}.${p}: the row cites no ${p} control`);
        else if (ownLooks(key, p).length) stale.push(`NO_NATIVE_SHAPE.${key}.${p}: the ${p} build draws a look of its own, so the row's control is matched there`);
      }
    }
    expect(stale).toEqual([]);
  });

  it("is judged on the builds the docs three-up shows", () => {
    // check:skins holds the registry to the divergence read; here, every native look the
    // catalog is judged on is one the docs preview renders under its platform's label.
    const registry = registeredSkins(readFileSync(join(ROOT, "docs/src/core/platform-skins.ts"), "utf8"));
    const table = { iOS: registry.ios, Android: registry.android } as const;
    const unshown = built.flatMap((row) => PLATFORMS.flatMap((p) => ownLooks(row.key, p).filter((l) => !table[p].has(l.build)).map((l) => `${row.key} ${p}: ${l.build}`)));
    expect(unshown).toEqual([]);
  });
});
