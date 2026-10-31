import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderInks } from "../tools/v4/derive-inks.ts";

// The native table mirrors the hand-off formulas as literals. Regenerate after a
// reference token changes; background/contrast changes never alter these inks.

describe("the hand-off text inks", () => {
  it("are what the hand-off formulas write for the current token sources", () => {
    expect(readFileSync(join(import.meta.dir, "../src/style/solved-inks.ts"), "utf-8")).toBe(renderInks());
  });
});
