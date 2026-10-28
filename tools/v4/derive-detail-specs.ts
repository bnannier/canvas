// Writes the component detail pages' hand-off specs (docs/src/core/data/detail-specs.ts)
// and the section of every component (docs/src/core/data/detail-sections.ts) from the
// vendored v4 design hand-off, so the knobs, sizes, states, anatomy and keyboard tables a
// detail page shows are the hand-off's own and not a second copy someone keeps in step.
//
//   bun run v4:specs            write both files
//   bun run v4:specs --check    fail when a committed file is not what this writes
//
// The hand-off is an HTML prototype, not source. Its kit (tools/v4/handoff/cv-kit*.js)
// registers one spec per component through `CVK.def(slug, { k, sz, st, an, ap, kb, ... })`
// and its docs data (canvas-docs.js) carries the sections ("rooms"). Both are plain
// browser scripts that only assign to `window`, so they run here in a bare VM context in
// the order "Canvas v4.0.0 Component.dc.html" loads them; nothing of theirs is rendered.
//
// Where the hand-off and the repository disagree on an API, the repository wins
// (tools/v4/README.md). test/detail-specs.test.ts holds every knob, size, state and
// anatomy prop written here to a real prop of the component's extracted props; a knob the
// repository has no prop for is dropped below with its reason, and the reason is written
// into the generated file beside the spec, never dropped silently.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const REPO = join(import.meta.dir, "..", "..");
const HANDOFF = join(REPO, "tools", "v4", "handoff");
const PAGE = "Canvas v4.0.0 Component.dc.html";
const SPECS_OUT = join(REPO, "docs", "src", "core", "data", "detail-specs.ts");
const SECTIONS_OUT = join(REPO, "docs", "src", "core", "data", "detail-sections.ts");
const CHECK = process.argv.includes("--check");

// The props interface each component's knobs drive, where the hand-off names none: the
// React Native primitives the kit re-exports take React Native's own props.
const PRIMITIVE_PROPS: Record<string, string> = {
  view: "react-native:ViewProps",
  text: "react-native:TextProps",
  pressable: "react-native:PressableProps",
  "text-input": "react-native:TextInputProps",
  "scroll-view": "react-native:ScrollViewProps",
};

// React Native's TextInput has no `disabled` prop: a field is turned off with
// `editable={false}` beside `aria-disabled` (src/atoms/text-input/text-input.md).
const TEXT_INPUT_DISABLED =
  "React Native's TextInput has no `disabled` prop; the repository disables one with `editable={false}` and `aria-disabled` (the TextInput page's Do).";

// Hand-off knobs (by slug, then the knob's prop name) the repository's API has no prop for,
// each with its reason. They are written to the spec's `dropped` list.
const DROPPED_KNOBS: Record<string, Record<string, string>> = {
  chat: {
    streaming:
      "ChatMessage takes streaming as a field of its `message` data (ChatMessageData.streaming), not as a prop of its own.",
  },
  "text-input": {
    disabled: TEXT_INPUT_DISABLED,
  },
  "drag-drop": {
    locked:
      "DragDropProvider has no locked mode; the repository locks one item with `disabled` on its Draggable, or a zone with `disabled` on its DropZone.",
  },
};

// Hand-off anatomy demo props the repository's component has no prop for.
const DROPPED_ANATOMY: Record<string, Record<string, string>> = {
  input: {
    helper:
      "Input has no helper line of its own; the helper or error text under a field is Field's (`<Field helper>`).",
  },
};

// Hand-off States-row entries that are neither an interaction state nor a prop.
const DROPPED_STATES: Record<string, Record<string, string>> = {
  "text-input": { disabled: TEXT_INPUT_DISABLED },
};

// Text knobs on a prop that takes a React node hosted in a View, which React Native renders
// a bare string under only inside a text element: the knob's text renders in the named kit
// element (`<View><Text>View</Text></View>`). By slug, then the knob's prop.
/**
 * Sample text the owner rewrote: the hand-off's slogan "Light as material" became "Made of
 * light" (2026-10-28), so a knob that prints the slogan prints the owner's.
 */
const OWNER_TEXT: Record<string, string> = { "Light as material": "Made of light" };

const TEXT_ELEMENTS: Record<string, Record<string, string>> = {
  view: { children: "Text" },
  pressable: { children: "Text" },
  reveal: { children: "Typography" },
  emblem: { children: "Typography" },
  "app-frame": { header: "Typography" },
};

// The props that show an overlay open in place on the page's specimens (the playground,
// Sizes, States and Anatomy), the way the hand-off draws every overlay open inside its
// frame, and the example props that would undo it (`omit`). A dialog is an `embedded`
// specimen, which a `trigger` would turn back into a live modal; a popover is its
// `inline` card. Drawer and ActionSheet present through a native Modal over the window,
// so their specimens keep the trigger that opens them.
const SPECIMEN_PROPS: Record<string, { props: Record<string, boolean>; omit?: string[] }> = {
  dialog: { props: { open: true, embedded: true }, omit: ["trigger"] },
  "alert-dialog": { props: { open: true, embedded: true }, omit: ["trigger"] },
  wizard: { props: { open: true, embedded: true } },
  popover: { props: { inline: true }, omit: ["trigger"] },
};

// Knobs the repository spells as something other than a prop of the same name.
// Icon's `name` knob picks a glyph, which the repository names with one boolean per glyph
// (`<Icon sparkles />`, IconGlyphProps), so it is a `glyph` knob.
const GLYPH_KNOBS: Record<string, string> = { icon: "name" };
// Row & Column's `tag` knob picks which export renders, Row or Column, so it is a
// `component` knob over those exports.
const COMPONENT_KNOBS: Record<string, string> = { "row-column": "tag" };

type Raw = Record<string, unknown>;
interface HandoffKit {
  spec(slug: string): { k?: string; sz?: string; st?: string; an?: string[]; ap?: Raw; kb?: string };
  KB: Record<string, [string, string][]>;
}
interface HandoffDocs {
  rooms: { room: string; slugs: string[] }[];
  c: Record<string, { main?: { n?: string } }>;
}

/** The hand-off's kit and docs data, loaded the way its component page loads them. */
function loadHandoff(): { kit: HandoffKit; docs: HandoffDocs } {
  const page = readFileSync(join(HANDOFF, PAGE), "utf8");
  const scripts = [...page.matchAll(/<script src="\.\/([^"]+\.js)"><\/script>/g)]
    .map((m) => m[1])
    .filter((file) => file === "canvas-docs.js" || file.startsWith("cv-"));
  const window: Record<string, unknown> = {};
  window.window = window;
  const context = vm.createContext(window);
  for (const file of scripts) vm.runInContext(readFileSync(join(HANDOFF, file), "utf8"), context, { filename: file });
  return { kit: window.CVK as HandoffKit, docs: window.CV_DOCS as HandoffDocs };
}

type Option = string | null;
type Knob =
  | { kind: "axis"; label: string; options: Option[] }
  | { kind: "boolean"; prop: string; value: boolean }
  | { kind: "text"; prop: string; value: string; element?: string }
  | { kind: "number"; prop: string; min: number; max: number; value: number }
  | { kind: "enum"; prop: string; options: string[]; value: string }
  | { kind: "icon"; prop: string; value: string }
  | { kind: "glyph"; value: string }
  | { kind: "component"; options: string[]; value: string };

const option = (o: string): Option => (o === "-" ? null : o);

/**
 * The hand-off's knob DSL (K.knobs in cv-kit.js), one `;`-separated token per knob:
 * `@Group:a|-|b` an axis of booleans ("-" passes none), `flag?` / `flag?1` a boolean off
 * or on, `name^=glyph` an icon slot, `n#min..max=v` a number, `n:a|b=a` an enum, and
 * `n=Value` text. A token the DSL does not match is an error, not a skip.
 */
export function parseKnobs(dsl: string, slug: string): Knob[] {
  const out: Knob[] = [];
  for (const raw of dsl.split(";")) {
    const t = raw.trim();
    if (!t) continue;
    let m: RegExpMatchArray | null;
    if ((m = t.match(/^@([^:]+):(.+)$/))) out.push({ kind: "axis", label: m[1], options: m[2].split("|").map(option) });
    else if ((m = t.match(/^(\w+)\?(1?)$/))) out.push({ kind: "boolean", prop: m[1], value: m[2] === "1" });
    else if ((m = t.match(/^(\w+)\^=?(.*)$/))) out.push({ kind: "icon", prop: m[1], value: m[2] });
    else if ((m = t.match(/^(\w+)#(-?[\d.]+)\.\.(-?[\d.]+)=(-?[\d.]+)$/))) out.push({ kind: "number", prop: m[1], min: +m[2], max: +m[3], value: +m[4] });
    else if ((m = t.match(/^(\w+):([^=]+)=(.*)$/))) out.push({ kind: "enum", prop: m[1], options: m[2].split("|"), value: m[3] });
    else if ((m = t.match(/^(\w+)=(.*)$/))) out.push({ kind: "text", prop: m[1], value: m[2] });
    else throw new Error(`${slug}: the knob token "${t}" is not in the hand-off's knob DSL`);
  }
  return out;
}

/** A size row: `small|-|large` names boolean props, `size:16|24|32` values of one prop. */
export function parseSizes(sz: string): { prop?: string; options: Option[] } {
  const m = sz.match(/^(\w+):(.+)$/);
  return m ? { prop: m[1], options: m[2].split("|").map(option) } : { options: sz.split("|").map(option) };
}

/**
 * An anatomy demo value as data: a string, number or boolean as written, an icon slot
 * (`{ icon }`) as written, and an element the prototype pre-rendered to HTML
 * (`{ el: "Button", html }`) as the component it names and its label text.
 */
// The hand-off's prototype loads the docs' images from `docs/public/<file>`, relative to
// itself; the docs app serves that folder at its root, as its examples do (`/ada-lovelace.jpg`).
const HANDOFF_ASSETS = "docs/public/";

/** A hand-off value with its asset path made the docs app's own. */
function asset<T>(value: T): T {
  return (typeof value === "string" && value.startsWith(HANDOFF_ASSETS) ? `/${value.slice(HANDOFF_ASSETS.length)}` : value) as T;
}

function anatomyValue(slug: string, prop: string, value: unknown): unknown {
  if (value === null || typeof value !== "object") return asset(value);
  const v = value as Raw;
  if (typeof v.icon === "string" && Object.keys(v).length === 1) return { icon: v.icon };
  if (typeof v.el === "string") {
    const text = String(v.html ?? "").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
    return text ? { element: v.el, children: text } : { element: v.el };
  }
  throw new Error(`${slug}: the anatomy prop "${prop}" holds a value of a shape this script does not port`);
}

/** A States row, less the entries the repository has no prop for (recorded as `state.<name>`). */
function states(slug: string, st: string, dropped: { knob: string; reason: string }[]): Option[] {
  const out: Option[] = [];
  for (const entry of st.split("|").map(option)) {
    const reason = entry === null ? undefined : DROPPED_STATES[slug]?.[entry];
    if (reason) dropped.push({ knob: `state.${entry}`, reason });
    else out.push(entry);
  }
  return out;
}

function build() {
  const { kit, docs } = loadHandoff();
  const sections = docs.rooms.map((r) => ({ title: r.room, slugs: [...r.slugs] }));
  const specs: Record<string, unknown> = {};
  const kbKeys = new Set<string>();
  for (const { title, slugs } of sections) {
    for (const slug of slugs) {
      const s = kit.spec(slug);
      const propsInterface = docs.c[slug]?.main?.n ?? PRIMITIVE_PROPS[slug];
      if (!propsInterface) throw new Error(`${slug}: the hand-off names no props interface and none is mapped`);
      const dropped: { knob: string; reason: string }[] = [];
      const knobs: Knob[] = [];
      for (const k of parseKnobs(s.k ?? "", slug)) {
        if ("prop" in k && DROPPED_KNOBS[slug]?.[k.prop]) {
          dropped.push({ knob: k.prop, reason: DROPPED_KNOBS[slug][k.prop] });
        } else if ("prop" in k && GLYPH_KNOBS[slug] === k.prop) {
          knobs.push({ kind: "glyph", value: k.kind === "icon" ? k.value : String((k as { value: unknown }).value) });
        } else if (k.kind === "enum" && COMPONENT_KNOBS[slug] === k.prop) {
          knobs.push({ kind: "component", options: k.options, value: k.value });
        } else if (k.kind === "text" && TEXT_ELEMENTS[slug]?.[k.prop]) {
          knobs.push({ ...k, element: TEXT_ELEMENTS[slug][k.prop] });
        } else if (k.kind === "enum") {
          knobs.push({ ...k, options: k.options.map(asset), value: asset(k.value) });
        } else if (k.kind === "text") {
          knobs.push({ ...k, value: asset(OWNER_TEXT[k.value] ?? k.value) });
        } else {
          knobs.push(k);
        }
      }
      const anatomyProps: Raw = {};
      for (const [prop, value] of Object.entries(s.ap ?? {})) {
        const reason = DROPPED_ANATOMY[slug]?.[prop];
        if (reason) dropped.push({ knob: `anatomy.${prop}`, reason });
        else anatomyProps[prop] = anatomyValue(slug, prop, value);
      }
      const keyboard = s.kb ?? "none";
      kbKeys.add(keyboard);
      specs[slug] = {
        section: title,
        propsInterface,
        knobs,
        ...(dropped.length ? { dropped } : {}),
        ...(s.sz ? { sizes: parseSizes(s.sz) } : {}),
        ...(s.st ? { states: states(slug, s.st, dropped) } : {}),
        anatomy: { parts: [...(s.an ?? [])], props: anatomyProps },
        ...(SPECIMEN_PROPS[slug] ? { specimen: SPECIMEN_PROPS[slug] } : {}),
        keyboard,
      };
    }
  }
  // Every spec's keys must be real, and every slug the tables name a component.
  for (const [table, entries] of [["DROPPED_KNOBS", DROPPED_KNOBS], ["DROPPED_ANATOMY", DROPPED_ANATOMY], ["DROPPED_STATES", DROPPED_STATES], ["TEXT_ELEMENTS", TEXT_ELEMENTS], ["SPECIMEN_PROPS", SPECIMEN_PROPS]] as const) {
    for (const slug of Object.keys(entries)) if (!specs[slug]) throw new Error(`${table} names "${slug}", which no hand-off section lists`);
  }
  // The keyboard tables are the hand-off's K.KB (cv-kit.js, with `tooltip` and `toast`
  // added by cv-kit-overlays.js), as written.
  const patterns: Record<string, [string, string][]> = {};
  for (const [key, rows] of Object.entries(kit.KB)) patterns[key] = rows.map(([a, b]) => [a, b]);
  for (const key of kbKeys) if (!patterns[key]) throw new Error(`no keyboard table for the hand-off's "${key}" pattern`);
  return { sections, specs, patterns };
}

const HEADER = "/* @generated by tools/v4/derive-detail-specs.ts. DO NOT EDIT. Run `bun run v4:specs`. */";
const json = (v: unknown) => JSON.stringify(v);

function renderSpecs({ specs, patterns }: ReturnType<typeof build>): string {
  const patternKeys = Object.keys(patterns);
  const patternRows = patternKeys
    .map((key) => `  ${json(key)}: [${patterns[key].map((row) => json(row)).join(", ")}],`)
    .join("\n");
  const specRows = Object.entries(specs)
    .map(([slug, spec]) => {
      const { knobs, ...rest } = spec as { knobs: unknown[] };
      const fields = Object.entries(rest).map(([k, v]) => `    ${k}: ${json(v)},`);
      const knobLines = knobs.length ? `[\n${knobs.map((k) => `      ${json(k)},`).join("\n")}\n    ]` : "[]";
      return `  ${json(slug)}: {\n    knobs: ${knobLines},\n${fields.join("\n")}\n  },`;
    })
    .join("\n");
  return `${HEADER}
// The v4 hand-off's per-component detail specs (tools/v4/handoff/cv-kit*.js, \`CVK.def\`),
// typed. The knobs drive the detail page's playground; each one names a real prop of the
// component's \`propsInterface\` (test/detail-specs.test.ts), and a hand-off knob the
// repository has no prop for is listed under \`dropped\` with its reason.
import type { Section } from "./detail-sections";

/** One option of an axis, a size row or a state row: a prop name, or null for "none passed". */
export type SpecOption = string | null;

export type Knob =
  /** A pick-one axis of boolean props (\`null\` passes none of them). */
  | { kind: "axis"; label: string; options: readonly SpecOption[] }
  | { kind: "boolean"; prop: string; value: boolean }
  /** A text, rendered inside the kit \`element\` where the prop hosts it in a View. */
  | { kind: "text"; prop: string; value: string; element?: string }
  | { kind: "number"; prop: string; min: number; max: number; value: number }
  /** One of a fixed set of values for one prop. */
  | { kind: "enum"; prop: string; options: readonly string[]; value: string }
  /** An Icon element in a ReactNode slot, by glyph name ("" for none). */
  | { kind: "icon"; prop: string; value: string }
  /** Icon's own glyph: one boolean per glyph (IconGlyphProps), by name. */
  | { kind: "glyph"; value: string }
  /** Which of the component's exports renders (Row or Column). */
  | { kind: "component"; options: readonly string[]; value: string };

export type AnatomyValue = string | number | boolean | { icon: string } | { element: string; children?: string };

export type KeyboardPatternKey = ${patternKeys.map(json).join(" | ")};

export interface DetailSpec {
  /** The hand-off section (room) the component belongs to. */
  section: Section;
  /** The props interface the knobs drive: an extracted kit interface, or \`react-native:<Name>\` for a primitive. */
  propsInterface: string;
  knobs: readonly Knob[];
  /** Hand-off knobs (and \`anatomy.<prop>\` demo props, \`state.<name>\` States entries) the repository has no prop for, with the reason. */
  dropped?: readonly { knob: string; reason: string }[];
  /** The Sizes row: boolean props, or the values of one \`prop\`. */
  sizes?: { prop?: string; options: readonly SpecOption[] };
  /** The States row: interaction states (hover, focus, pressed) or state props. */
  states?: readonly SpecOption[];
  /** The Anatomy figure: its numbered parts, and the props its demo renders with. */
  anatomy: { parts: readonly string[]; props: Readonly<Record<string, AnatomyValue>> };
  /** The props that show an overlay open in place on every specimen, and the example props that would undo them. */
  specimen?: { props: Readonly<Record<string, boolean>>; omit?: readonly string[] };
  keyboard: KeyboardPatternKey;
}

/** Each keyboard pattern as [keys, effect] rows (the hand-off's K.KB). */
export const KEYBOARD_PATTERNS: Record<KeyboardPatternKey, readonly (readonly [string, string])[]> = {
${patternRows}
};

/** Every component's detail spec, by URL slug, in the hand-off's section order. */
export const DETAIL_SPECS: Record<string, DetailSpec> = {
${specRows}
};
`;
}

function renderSections({ sections }: ReturnType<typeof build>): string {
  const rows = sections.map((s) => `  { title: ${json(s.title)}, slugs: ${json(s.slugs)} },`).join("\n");
  const sectionOf = sections.flatMap((s) => s.slugs.map((slug) => `  ${json(slug)}: ${json(s.title)},`)).join("\n");
  return `${HEADER}
// The v4 hand-off's sections (canvas-docs.js \`rooms\`): the eight groups the docs file
// every component under, in the hand-off's order. Kept apart from detail-specs.ts so the
// components registry, which every page loads, carries only this.

export type Section = ${sections.map((s) => json(s.title)).join(" | ")};

/** Each section and its components' URL slugs, in the hand-off's order. */
export const SECTIONS: readonly { title: Section; slugs: readonly string[] }[] = [
${rows}
];

/** The section of every component, by URL slug. */
export const SECTION_OF: Readonly<Record<string, Section>> = {
${sectionOf}
};
`;
}

function main() {
  const data = build();
  const outputs: [string, string][] = [
    [SPECS_OUT, renderSpecs(data)],
    [SECTIONS_OUT, renderSections(data)],
  ];
  const stale: string[] = [];
  for (const [file, content] of outputs) {
    let existing: string | null = null;
    try {
      existing = readFileSync(file, "utf8");
    } catch {
      existing = null;
    }
    if (existing === content) continue;
    if (CHECK) stale.push(file.slice(REPO.length + 1));
    else writeFileSync(file, content);
  }
  if (CHECK && stale.length) {
    console.error(`v4:specs --check: ${stale.join(", ")} not what tools/v4/derive-detail-specs.ts writes. Run \`bun run v4:specs\`.`);
    process.exit(1);
  }
  const count = Object.keys(data.specs).length;
  console.log(`v4:specs${CHECK ? " --check" : ""}: ${count} component specs, ${data.sections.length} sections, ${Object.keys(data.patterns).length} keyboard patterns.`);
}

if (import.meta.main) main();
