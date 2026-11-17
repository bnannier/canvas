import { describe, expect, test } from "bun:test";
import { DETAIL_SPECS } from "../docs/src/core/data/detail-specs";
import { initialKnobs, knobKey, knobProps } from "../docs/src/ui/detail/knobs";
import { readPlaygroundProps, writePlaygroundProps } from "../docs/src/ui/detail/playground-link";
import { ICON_NAMES } from "../src/atoms/icon/icon";

const glyphs = ICON_NAMES.map(icon => icon.key);
const button = DETAIL_SPECS.button.knobs;

describe("shareable playground configuration", () => {
  test("round-trips every catalog control, including explicit empty and false values", () => {
    for (const spec of Object.values(DETAIL_SPECS)) {
      const state = initialKnobs(spec.knobs);
      expect(readPlaygroundProps(writePlaygroundProps(state), spec.knobs, glyphs)).toEqual(state);
      for (const knob of spec.knobs) {
        if (knob.kind !== "axis") continue;
        for (const value of knob.options) {
          const edit = { [knobKey(knob)]: value };
          expect(readPlaygroundProps(writePlaygroundProps(edit), spec.knobs, glyphs)).toEqual(edit);
        }
      }
    }
  });

  test("preserves text and reserved URL characters through URL encoding", () => {
    const edits = { "@Intent": "outline", "@Size": null, disabled: false, children: 'Save & share + 50% #? / "你好" 💛', iconLeft: "" };
    const url = new URL("https://example.test/components/button");
    url.searchParams.set("props", writePlaygroundProps(edits)!);
    expect(readPlaygroundProps(new URL(url.href).searchParams.get("props")!, button, glyphs)).toEqual(edits);
  });

  test("ignores malformed, duplicate and non-object query data", () => {
    for (const raw of [undefined, "{", "null", "[]", "true", '"text"', ['{}', '{}']]) {
      expect(readPlaygroundProps(raw, button, glyphs)).toEqual({});
    }
  });

  test("rejects unsupported keys and wrong types without discarding valid controls", () => {
    expect(readPlaygroundProps('{"@Intent":"imaginary","disabled":"true","loading":true,"children":{"code":"alert(1)"},"iconLeft":"badGlyph","onPress":"run()","__proto__":{"polluted":true}}', button, glyphs)).toEqual({ loading: true });
    expect(readPlaygroundProps('{"value":999999}', [{ kind: "number", prop: "value", min: 0, max: 100, value: 0 }], glyphs)).toEqual({});
  });

  test("stable serialization and reset", () => {
    expect(writePlaygroundProps({ children: "", disabled: false, "@Size": null })).toBe(writePlaygroundProps({ "@Size": null, disabled: false, children: "" }));
    expect(writePlaygroundProps({})).toBe("{}");
  });

  test("explicit edits retain empty text and false flags over authored defaults", () => {
    const knobs = [{ kind: "text" as const, prop: "value", value: "initial" }, { kind: "boolean" as const, prop: "checked", value: false }];
    expect(knobProps(knobs, { value: "", checked: false }, true)).toEqual({ value: "", checked: false });
  });
});
