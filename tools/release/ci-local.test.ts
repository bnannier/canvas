import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { localWorkflow } from "../../scripts/ci-local.mjs";

// scripts/ci-local.mjs runs validate.yml through act with only the differences a local
// runner needs (its header explains each). Any other difference would mean the local run
// tests something CI does not, so the copy is held to exactly these.
const source = readFileSync(new URL("../../.github/workflows/validate.yml", import.meta.url), "utf8");
const lines = (text: string) => text.split("\n").map((line) => line.replace(/(upload|download)-artifact@v\d+/, "$1-artifact@v*"));
/** The lines of `a` left after removing one occurrence of each line of `b`. */
function minus(a: string[], b: string[]) {
  const rest = [...b];
  return a.filter((line) => {
    const index = rest.indexOf(line);
    if (index < 0) return true;
    rest.splice(index, 1);
    return false;
  });
}

test("the local workflow is validate.yml with only the local-runner differences", () => {
  const local = localWorkflow(source, { shardsAtOnce: 2 });
  expect(minus(lines(local), lines(source))).toEqual(["  workflow_dispatch:", "      max-parallel: 2"]);
  expect(local).toMatch(/\n  e2e:\n[\s\S]*?\n    strategy:\n      max-parallel: 2\n/);
  const all = lines(source);
  const start = all.indexOf("  native:");
  const native = all.slice(start, all.indexOf("", start));
  const pins = Array.from({ length: 3 }, () => ["        with:", "          ref: ${{ github.sha }}"]).flat();
  expect(minus(lines(source), lines(local)).sort()).toEqual([...native, ...pins].sort());
  expect(local).not.toMatch(/(upload|download)-artifact@v(?!4\b)/);
});

test("the local workflow refuses a validate.yml it no longer understands", () => {
  expect(() => localWorkflow(source.replace("on:\n  workflow_call:\n", "on:\n  push:\n"))).toThrow("workflow_call");
  expect(() => localWorkflow(source.replace("\n  native:\n", "\n  native-smoke:\n"))).toThrow("no native job");
  expect(() => localWorkflow(source.replace("\n  e2e:\n", "\n  browsers:\n"))).toThrow("no e2e matrix");
});
