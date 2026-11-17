import { isValidElement } from "react";
import type { DocExample, ExampleScope, PropGroup } from "../../core/scope";
import type { DetailSpec, Knob } from "../../core/data/detail-specs";
import { initialKnobs, knobKey, type KnobState, type KnobValue } from "./knobs";

type Found = { name: string; props: Record<string, unknown> };

/** Inspect authored elements without mounting controls or calling component hooks. */
function firstElement(node: unknown, names: readonly string[], scope: ExampleScope): Found | undefined {
  if (Array.isArray(node)) {
    for (const child of node) { const found = firstElement(child, names, scope); if (found) return found; }
    return undefined;
  }
  if (!isValidElement(node)) return undefined;
  const props = node.props as Record<string, unknown>;
  const name = names.find(name => (scope as unknown as Record<string, unknown>)[name] === node.type);
  if (name) return { name, props };
  if (node.type === scope.Stateful && typeof props.children === "function") {
    return firstElement(props.children(props.initial, () => {}), names, scope);
  }
  for (const child of Object.values(props)) { const found = firstElement(child, names, scope); if (found) return found; }
  return undefined;
}

function text(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const values = value.map(text);
    return values.every(value => value !== undefined) ? values.join("") : undefined;
  }
  return isValidElement(value) ? text((value.props as { children?: unknown }).children) : undefined;
}

function defaultValue(knob: Exclude<Knob, { kind: "axis" | "component" | "glyph" }>, props: Record<string, unknown>, groups: readonly PropGroup[]): unknown {
  const value = props[knob.prop] ?? props[`default${knob.prop[0].toUpperCase()}${knob.prop.slice(1)}`];
  if (value !== undefined) return value;
  const documented = groups.flatMap(group => group.props).find(prop => prop.name === knob.prop)?.default;
  if (documented !== undefined) {
    try { return JSON.parse(documented); } catch { /* A computed default is not a literal. */ }
  }
  return undefined;
}

/** Knob labels start from the source the playground actually renders, including Stateful's initial values. */
export function exampleKnobs(scope: ExampleScope, spec: DetailSpec, examples: readonly DocExample[], groups: readonly PropGroup[] = []): KnobState {
  const state: Record<string, KnobValue> = { ...initialKnobs(spec.knobs) };
  const selector = spec.knobs.find(knob => knob.kind === "component");
  const names = selector?.kind === "component" ? selector.options : [spec.propsInterface.replace(/^react-native:/, "").replace(/Props$/, "")];
  let found: Found | undefined;
  for (const example of examples) {
    found = firstElement(example.render(scope), names, scope);
    if (found) break;
  }
  if (!found) return state;
  const { name, props } = found;
  for (const knob of spec.knobs) {
    const key = knobKey(knob);
    if (knob.kind === "component") { state[key] = name; continue; }
    if (knob.kind === "axis") { state[key] = knob.options.find(option => option != null && props[option] === true) ?? null; continue; }
    if (knob.kind === "glyph") { state[key] = scope.ICON_NAMES?.find(glyph => props[glyph.key] === true)?.key ?? knob.value; continue; }
    const value = defaultValue(knob, props, groups);
    if (knob.kind === "boolean") { state[key] = typeof value === "boolean" ? value : false; continue; }
    if (knob.kind === "text") { const label = text(value); state[key] = label ?? (value === undefined ? "" : state[key]); continue; }
    if (knob.kind === "icon") {
      if (typeof value === "string") state[key] = value;
      else if (isValidElement(value)) state[key] = scope.ICON_NAMES?.find(glyph => (value.props as Record<string, unknown>)[glyph.key] === true)?.key ?? "";
      else state[key] = "";
      continue;
    }
    if (typeof value === "number" || typeof value === "string") state[key] = value;
    if (name === "Progress" && knob.prop === "value" && typeof value === "number") state[key] = value * 100;
    if (name === "Progress" && knob.prop === "segments" && value === undefined) state[key] = 0;
    if (name === "InputOTP" && knob.prop === "groups") state[key] = typeof value === "number" && value > 0 ? Math.ceil(Number(props.length ?? 6) / value) : 1;
  }
  return state;
}
