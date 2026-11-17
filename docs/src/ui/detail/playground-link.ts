import type { Knob } from "../../core/data/detail-specs";
import { knobKey, type KnobState, type KnobValue } from "./knobs";

/** Query values are data, never executable JSX. Only this component's controls apply. */
export function readPlaygroundProps(raw: string | string[] | undefined, knobs: readonly Knob[], glyphs: readonly string[]): KnobState {
  if (typeof raw !== "string") return {};
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return {}; }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const input = parsed as Record<string, unknown>;
  const edits: Record<string, KnobValue> = {};
  for (const knob of knobs) {
    const key = knobKey(knob);
    if (!Object.prototype.hasOwnProperty.call(input, key)) continue;
    const value = input[key];
    let valid = false;
    switch (knob.kind) {
      case "axis":
        valid = (value === null || typeof value === "string") && knob.options.includes(value);
        break;
      case "enum":
      case "component":
        valid = typeof value === "string" && knob.options.includes(value);
        break;
      case "icon":
      case "glyph":
        valid = typeof value === "string" && (value === "" || glyphs.includes(value));
        break;
      case "boolean":
        valid = typeof value === "boolean";
        break;
      case "number":
        valid = typeof value === "number" && Number.isFinite(value) && value >= knob.min && value <= knob.max;
        break;
      case "text":
        valid = typeof value === "string";
        break;
    }
    if (valid) edits[key] = value as KnobValue;
  }
  return edits;
}

/** Stable order, retaining explicit false/null/empty edits. An empty object resets edits. */
export function writePlaygroundProps(edits: KnobState): string {
  const entries = Object.entries(edits).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}
