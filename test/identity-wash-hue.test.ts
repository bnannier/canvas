import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { WASH_HUES, washHue } from "../src/style/identity-hue.ts";

// A stock initials disc takes the hue the v4 hand-off draws for the same name. The hand-off
// computes it in cv-kit-code.js (`hash` and `K.hueOf`); this test evaluates those two lines
// from the vendored source and holds washHue to them, so a re-vendored hand-off that changes
// its hues or hash fails here instead of drifting silently.

function handoffHueOf(): (name: string) => number {
  const source = readFileSync(resolve(import.meta.dir, "../tools/v4/handoff/cv-kit-code.js"), "utf8");
  const hash = source.match(/const hash=s=>\{[^\n]*?return h;\};/)?.[0];
  const hueOf = source.match(/K\.hueOf=n=>\[[^\]]*\]\[hash\(n\)%\d+\];/)?.[0];
  if (!hash || !hueOf) throw new Error("cv-kit-code.js no longer defines hash and K.hueOf in the expected form");
  return new Function(`const K={};${hash}${hueOf}return K.hueOf;`)() as (name: string) => number;
}

const NAMES = [
  "Rachel Chen", "Liang Bao", "Marcus Allen", "Kira Tran", "Ada Ito", "Rachel Tanaka", "Liang Kim",
  "Kira Okafor", "Marcus Singh", "Noor Novak", "Sofia Bao", "Tomas Lund", "Omar Malik", "Priya Haddad",
  "Ada Lovelace", "Grace Hopper", "Alan Turing", "Kevin Turner", "RC", "AO", "Zoë Ångström", "李雷",
];

test("a stock disc resolves every name to the hand-off's K.hueOf hue", () => {
  const hueOf = handoffHueOf();
  for (const name of NAMES) expect({ name, hue: washHue(name) }).toEqual({ name, hue: hueOf(name) });
});

test("the wash hues are the hand-off's eight, in its order", () => {
  const source = readFileSync(resolve(import.meta.dir, "../tools/v4/handoff/cv-kit-code.js"), "utf8");
  const hues = source.match(/K\.hueOf=n=>\[([^\]]*)\]/)?.[1]?.split(",").map(Number);
  expect([...WASH_HUES]).toEqual(hues!);
});
