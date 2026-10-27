import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderInks } from "../tools/v4/derive-inks.ts";

// The token table reads the solved text inks as literals (src/style/solved-inks.ts), so a
// change to a neutral, a status colour, the accent or a bed that moves an ink must
// regenerate the file: `bun run tokens:inks`.

describe("the solved text inks", () => {
  it("are what the solver writes for the current token sources", () => {
    expect(readFileSync(join(import.meta.dir, "../src/style/solved-inks.ts"), "utf-8")).toBe(renderInks());
  });
});
