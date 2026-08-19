/**
 * Compares the colours the kit ships against the colours the design hand-off actually PAINTS.
 *
 * This is the third leg. `validate-tokens` compares styles/tokens/colors.css to
 * src/style/tokens.ts, and `check-parity` compares the built types to a committed snapshot — both
 * of those have two sides living behind this commit, so both can only prove the kit is internally
 * consistent. That is precisely how the `--ring` error survived: the CSS and the JS agreed with
 * each other while both disagreed with the design source, and no check could see it. This one
 * renders the hand-off's own guideline cards and reads the pixels, so one side of the comparison is
 * an input nobody here can edit into agreement.
 *
 * Two legs, and the difference between them matters:
 *   --handoff <path>   renders the real export. This is the authority.
 *   (default)          renders the vendored copy under tools/render-parity/handoff/.
 * The vendored leg is what CI can run, but a vendored snapshot IS behind this commit, so a green
 * CI proves only that the kit has not drifted from the snapshot — not that it matches the live
 * design source. Refresh the vendor when the hand-off changes; that refresh is the real check.
 *
 * Usage:
 *   bun run check-render                                    # vendored leg
 *   bun run check-render --handoff ~/Downloads/…/canvas-react   # authoritative leg
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { lightColors, darkColors, type ColorTokens } from "../src/style/tokens.ts";
import { sampleCards, COLOR_CARDS, type ColorSample } from "../tools/render-parity/sample-colors.ts";

const ROOT = join(import.meta.dir, "..");
const VENDOR = join(ROOT, "tools", "render-parity", "handoff");
const BASELINE = join(ROOT, "tools", "render-parity", "baseline.json");

interface Baseline {
  note: string;
  /** `${scheme}.${token}` -> why the kit deliberately paints something else. */
  accepted: Record<string, { kitPaints: string; handoffPaints: string; reason: string }>;
}

const argv = process.argv;
const at = argv.indexOf("--handoff");
const explicit = at !== -1 ? argv[at + 1] : undefined;
const root = explicit ?? VENDOR;
const leg = explicit ? "authoritative (live export)" : "vendored snapshot";

if (!existsSync(root)) {
  if (explicit) {
    console.error(`Hand-off export not found at ${root}`);
    process.exit(1);
  }
  console.log("No vendored hand-off under tools/render-parity/handoff — nothing to check.");
  console.log("Vendor one, or run against the export: bun run check-render --handoff <path>");
  process.exit(0);
}

const baseline = existsSync(BASELINE)
  ? (JSON.parse(await readFile(BASELINE, "utf-8")) as Baseline)
  : { note: "", accepted: {} };

console.log(`Rendering the hand-off's colour cards — ${leg}`);
const light = await sampleCards(root, COLOR_CARDS, "light");
const dark = await sampleCards(root, COLOR_CARDS, "dark");

interface Row {
  scheme: "light" | "dark";
  token: string;
  card: string;
  handoff: string;
  kit: string;
}

function compare(samples: ColorSample[], kit: ColorTokens, scheme: "light" | "dark"): Row[] {
  const out: Row[] = [];
  for (const s of samples) {
    const kitValue = (kit as unknown as Record<string, string>)[s.token];
    if (!kitValue) continue; // the card paints something the kit has no token for
    if (kitValue.toLowerCase() !== s.hex) {
      out.push({ scheme, token: s.token, card: s.card, handoff: s.hex, kit: kitValue.toLowerCase() });
    }
  }
  return out;
}

const drift = [...compare(light, lightColors, "light"), ...compare(dark, darkColors, "dark")];
const compared = light.length + dark.length;
const unexplained = drift.filter((d) => !baseline.accepted[`${d.scheme}.${d.token}`]);
const explained = drift.filter((d) => baseline.accepted[`${d.scheme}.${d.token}`]);

console.log(`  ${compared} swatches sampled across ${COLOR_CARDS.length} cards, both schemes`);
console.log(`  matching: ${compared - drift.length}   accepted differences: ${explained.length}   drift: ${unexplained.length}`);

if (explained.length) {
  console.log("");
  for (const d of explained) {
    const b = baseline.accepted[`${d.scheme}.${d.token}`];
    console.log(`  ACCEPTED  ${d.scheme} ${d.token}: kit ${d.kit}, hand-off ${d.handoff} — ${b.reason}`);
  }
}

if (unexplained.length) {
  console.log("");
  for (const d of unexplained) {
    console.log(`  DRIFT     ${d.scheme} ${d.token.padEnd(22)} kit paints ${d.kit}, the hand-off paints ${d.handoff}  (${d.card})`);
  }
  console.log("");
  console.log("The hand-off is the authority. Change the kit to match, or record the difference in");
  console.log("tools/render-parity/baseline.json with the reason it is deliberate.");
  process.exit(1);
}

console.log("");
console.log(explicit
  ? "Render parity check passed against the live export."
  : "Render parity check passed against the vendored snapshot. This does NOT prove parity with the\nlive design source; re-run with --handoff <path> for that.");
