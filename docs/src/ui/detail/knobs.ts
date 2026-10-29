import type { DetailSpec, Knob, SpecOption } from "../../core/data/detail-specs";

// The detail page's playground model, kept free of React so it is unit-tested on its own
// (test/detail-knobs.test.ts): the knob state a spec starts from, the props that state
// passes, and the JSX the hand-off's playground prints for them (cv-kit.js `K.code`).

/** One knob's value: an axis option or enum value (null for "none passed"), a flag, a text, a number. */
export type KnobValue = string | boolean | number | null;

/** Every knob's value, by `knobKey`. */
export type KnobState = Readonly<Record<string, KnobValue>>;

/**
 * A prop as the playground describes it before it renders: a literal, an Icon element by
 * glyph name, or another kit element by export name (an anatomy demo's slot content).
 */
export type PropValue = string | number | boolean | { icon: string } | { element: string; children?: string };

/** The props a knob state passes, in the order the JSX prints them. */
export type PropDescriptors = Readonly<Record<string, PropValue>>;

/** The key a knob's value is kept under: its prop, or its axis label for a pick-one axis. */
export function knobKey(knob: Knob): string {
  switch (knob.kind) {
    case "axis":
      return `@${knob.label}`;
    case "glyph":
      return "@glyph";
    case "component":
      return "@component";
    default:
      return knob.prop;
  }
}

/** The state a spec's knobs start from (the hand-off's `K.init`): each axis on its first option. */
export function initialKnobs(knobs: readonly Knob[]): KnobState {
  const state: Record<string, KnobValue> = {};
  for (const knob of knobs) state[knobKey(knob)] = knob.kind === "axis" ? knob.options[0] ?? null : knob.value;
  return state;
}

/** Which of the component's exports the playground renders: the `component` knob's pick, else the props interface's component. */
export function componentName(spec: DetailSpec, state: KnobState): string {
  const pick = spec.knobs.find((k) => k.kind === "component");
  if (pick) return String(state[knobKey(pick)] ?? pick.value);
  return spec.propsInterface.replace(/^react-native:/, "").replace(/Props$/, "");
}

/**
 * The props a knob state passes (the hand-off's `K.props`): a pick-one axis passes its
 * picked boolean, a flag passes itself when on (and `false` when it is on by default and
 * switched off), an icon slot an Icon element, Icon's own glyph its glyph boolean (first,
 * as the JSX reads it), and a text, number or enum knob its value unless empty (a text
 * knob with an `element` as that element holding the text).
 */
export function knobProps(knobs: readonly Knob[], state: KnobState): PropDescriptors {
  const glyph: Record<string, PropValue> = {};
  const props: Record<string, PropValue> = {};
  for (const knob of knobs) {
    const value = state[knobKey(knob)];
    switch (knob.kind) {
      case "axis":
        if (typeof value === "string") props[value] = true;
        break;
      case "boolean":
        if (value === true) props[knob.prop] = true;
        else if (knob.value) props[knob.prop] = false;
        break;
      case "icon":
        if (typeof value === "string" && value !== "") props[knob.prop] = { icon: value };
        break;
      case "glyph":
        if (typeof value === "string" && value !== "") glyph[value] = true;
        break;
      case "component":
        break;
      case "text":
        if (value !== "" && value != null) props[knob.prop] = knob.element ? { element: knob.element, children: String(value) } : value;
        break;
      default:
        if (value !== "" && value != null) props[knob.prop] = value;
    }
  }
  return { ...glyph, ...props };
}

/**
 * A Sizes or States cell's props: the playground's props with the row's own option applied.
 * A size option replaces every other option of its row; a size `prop` takes the option as
 * its value; a state that is a prop is switched on (hover, focus and pressed are pinned,
 * not passed, so they leave the props as they are).
 */
export function withOption(props: PropDescriptors, options: readonly SpecOption[], pick: SpecOption, prop?: string): PropDescriptors {
  if (prop) return pick == null ? props : { ...props, [prop]: Number.isNaN(Number(pick)) ? pick : Number(pick) };
  const next: Record<string, PropValue> = { ...props };
  for (const option of options) if (option != null) delete next[option];
  if (pick != null) next[pick] = true;
  return next;
}

/**
 * The props the page drives on a specimen: each knob's (an axis's options, a flag's, a
 * text's, a number's, an enum's or an icon slot's prop, and Icon's `glyphs` for its glyph
 * knob), the Sizes row's and the States row's, and the example props an overlay's
 * specimen leaves out (a dialog's `trigger`). The default example's props under these
 * names are dropped before the page's own are laid over them (frame.tsx `renderComponent`),
 * so a knob switched off is off and a size or state replaces the example's own.
 */
export function controlledProps(spec: DetailSpec, glyphs: readonly string[]): ReadonlySet<string> {
  const names = new Set<string>();
  for (const knob of spec.knobs) {
    switch (knob.kind) {
      case "axis":
        for (const option of knob.options) if (option != null) names.add(option);
        break;
      case "glyph":
        for (const glyph of glyphs) names.add(glyph);
        break;
      case "component":
        break;
      default:
        names.add(knob.prop);
    }
  }
  if (spec.sizes?.prop) names.add(spec.sizes.prop);
  else for (const option of spec.sizes?.options ?? []) if (option != null) names.add(option);
  for (const state of spec.states ?? []) if (state != null && !isPinnedState(state)) names.add(state);
  for (const prop of spec.specimen?.omit ?? []) names.add(prop);
  return names;
}

/** The interaction states a States cell pins rather than passes. */
export const PINNED_STATES = { hover: "hovered", focus: "focused", pressed: "pressed" } as const;

export type PinnedState = keyof typeof PINNED_STATES;

export function isPinnedState(state: SpecOption): state is PinnedState {
  return state != null && state in PINNED_STATES;
}

/** A prop value's JSX attribute text, or null for `children`. */
function attribute(name: string, value: PropValue): string {
  if (value === true) return name;
  if (value === false) return `${name}={false}`;
  if (typeof value === "number") return `${name}={${value}}`;
  if (typeof value === "string") return `${name}="${value}"`;
  // An icon slot prints the bare glyph: the host colours it (a Button's icon slots take its label ink).
  if ("icon" in value) return `${name}={<Icon ${value.icon} size={16} />}`;
  return `${name}={<${value.element}${value.children ? `>${value.children}</${value.element}>` : " />"}}`;
}

/**
 * The JSX the playground prints for a component and its props (the hand-off's `K.code`):
 * one line while it fits 80 columns, otherwise one attribute per line.
 */
export function jsxCode(name: string, props: PropDescriptors): string {
  const attributes: string[] = [];
  let children = "";
  for (const [key, value] of Object.entries(props)) {
    if (key === "children") {
      children = typeof value === "object" && "element" in value ? `<${value.element}>${value.children ?? ""}</${value.element}>` : String(value);
      continue;
    }
    attributes.push(attribute(key, value));
  }
  const open = `<${name}${attributes.length ? ` ${attributes.join(" ")}` : ""}`;
  const oneLine = open.length + (children ? children.length + name.length + 3 : 3) < 80;
  if (oneLine) return children !== "" ? `${open}>${children}</${name}>` : `${open} />`;
  const head = `<${name}\n${attributes.map((a) => `  ${a}`).join("\n")}\n`;
  return children !== "" ? `${head}>\n  ${children}\n</${name}>` : `${head}/>`;
}

/** The label a knob option shows: "default" for none passed, "none" for an empty icon. */
export function optionLabel(option: SpecOption): string {
  if (option == null) return "default";
  return option === "" ? "none" : option;
}
