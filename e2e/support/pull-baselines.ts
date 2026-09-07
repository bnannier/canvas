#!/usr/bin/env bun
/**
 * Download the screenshot baselines a `Visual baselines` workflow run produced.
 *
 *   bun run e2e:baselines:pull <run-id>
 *
 * They are minted on a Linux runner because that is the only place the comparison
 * happens (see .github/workflows/visual-baselines.yml). This fetches them, replaces
 * the local set, and leaves the result staged in the working tree for a person to
 * look at. It commits nothing: reviewing what moved IS the point of the exercise, and
 * a job that rewrote its own baselines would turn every regression into a new one.
 */
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Standard rather than Bun's import.meta.dir: this file is typechecked with the rest
// of the e2e tree, which has no Bun types.
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const OUT = join(HERE, "..", "visual", "__screenshots__");

const runId = process.argv[2];
if (!runId) {
  console.error(
    "Usage: bun run e2e:baselines:pull <run-id>\n\n" +
      "Start a run with:  gh workflow run 'Visual baselines — canvas'\n" +
      "Find its id with:  gh run list --workflow visual-baselines.yml --limit 1",
  );
  process.exit(1);
}

const run = (command: string, args: string[]) =>
  execFileSync(command, args, { stdio: "inherit", cwd: REPO });

// Replace rather than merge, so a rename shows up as one file gone and one added
// instead of both sitting there. Note the limit: the runner checks out the committed
// baselines and --update-snapshots only rewrites the ones a test actually produced, so
// a baseline for a DELETED component rides back unchanged rather than disappearing.
// Delete it alongside the component; nothing here can tell it apart from a file that
// simply did not change.
if (existsSync(OUT)) rmSync(OUT, { recursive: true });

run("gh", ["run", "download", runId, "-n", "visual-baselines", "-D", OUT]);

console.log(`\nBaselines written to ${OUT}.`);
console.log("Review them (`git status`, `git diff --stat`) before committing.");
