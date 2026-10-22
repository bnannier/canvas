// Run the CI validation workflow locally, before a push, the way GitHub runs it: the
// jobs of .github/workflows/validate.yml in Linux runner containers through act
// (https://github.com/nektos/act) on a local Docker Engine. Pushing a change that this
// fails spends GitHub build minutes on a result a laptop could have given first.
//
// Usage: bun run ci:local [-- --job check] [-- --keep]
//
// What runs, and what cannot:
//   - check, e2e (all four shards) and starter run as written, in one act run, so their
//     artifacts pass between jobs as on GitHub.
//   - native (iOS on a macOS runner, Android on a KVM emulator) cannot run in a Linux
//     container on this machine; it is left out and reported, never silently passed.
//     Run scripts/native-smoke.mjs on the host for those (tools/native/README.md).
//
// The workflow act runs is a generated copy with these mechanical differences, each one a
// local-runner necessity rather than a change of what is tested:
//   1. a `workflow_dispatch` trigger, since act cannot select a job inside a workflow
//      reached through `workflow_call`;
//   2. no `native` job (above);
//   3. checkout steps without `ref: ${{ github.sha }}`. act copies the local working tree
//      instead of cloning only when a checkout's literal `ref` text equals github.ref, so a
//      SHA pin always clones from GitHub, which does not have an unpushed commit. The tree
//      must be clean, so the copy is exactly HEAD, the commit the pin names.
//   4. the e2e matrix runs at most (Docker CPUs / 4) shards at once. Each GitHub shard has
//      a 4-vCPU machine for its 4 Playwright workers; four shards sharing one 8-CPU VM
//      starved each other past the 60 s test timeout.
//   5. upload/download-artifact pinned to v4 (see localWorkflow).
//
// Runner: catthehacker/ubuntu:act-latest (act's medium image) in linux/arm64. GitHub's
// ubuntu-latest is x86_64, but Bun's x86_64 build crashes under Rosetta, so the containers
// run arm64 Linux: same OS, filesystem (ext4 walk order) and fonts, different CPU. act
// rebuilds PATH after a step adds to it (setup-bun does) without the image's own entries,
// losing node, so the image's PATH is passed explicitly. act also puts every job on the
// Docker host network by default, where concurrent e2e shards collide on the docs server's
// port (4173); on GitHub each job has a machine of its own, so here each gets a bridge.
import { execFileSync, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGE = "catthehacker/ubuntu:act-latest";
const PLATFORM = "linux/arm64";
const LOCAL_ONLY_JOBS = ["native"];

function fail(message) {
  console.error(`ci:local: ${message}`);
  process.exit(1);
}

function have(command, args) {
  return spawnSync(command, args, { stdio: "ignore" }).status === 0;
}

/** The workflow act runs: validate.yml with the local-runner differences above. */
export function localWorkflow(source, { shardsAtOnce = 2 } = {}) {
  const trigger = "on:\n  workflow_call:\n";
  if (!source.includes(trigger)) throw new Error("validate.yml no longer starts with a workflow_call trigger");
  let workflow = source.replace(trigger, "on:\n  workflow_dispatch:\n  workflow_call:\n");
  for (const job of LOCAL_ONLY_JOBS) {
    const start = workflow.indexOf(`\n  ${job}:\n`);
    if (start < 0) throw new Error(`validate.yml has no ${job} job to leave out`);
    const next = workflow.slice(start + 1).search(/\n  [a-z0-9-]+:\n/);
    let end = next < 0 ? workflow.length : start + 1 + next;
    // Keep the comment block (after the last blank line) that introduces the next job.
    const blank = workflow.lastIndexOf("\n\n", end);
    if (next >= 0 && blank > start) end = blank;
    workflow = workflow.slice(0, start) + workflow.slice(end);
  }
  const e2e = workflow.indexOf("\n  e2e:\n");
  const strategy = e2e < 0 ? -1 : workflow.indexOf("\n    strategy:\n", e2e);
  if (strategy < 0) throw new Error("validate.yml has no e2e matrix to pace");
  const at = strategy + "\n    strategy:\n".length;
  workflow = `${workflow.slice(0, at)}      max-parallel: ${shardsAtOnce}\n${workflow.slice(at)}`;
  const pinned = /( +- uses: actions\/checkout@v\d+)\n +with:\n +ref: \$\{\{ github\.sha \}\}\n/g;
  return workflow.replace(pinned, "$1\n")
    // Workaround for an act limitation, not a change of what is tested: act's artifact
    // server (0.2.89, still master) rejects upload-artifact@v7 and download-artifact@v8
    // (nektos/act#6022, #6114; fixes open as #6115 and #6174). v4 takes the same name,
    // path, retention-days and if-no-files-found inputs and round-trips under act. Drop
    // this once act ships the fix.
    .replace(/actions\/upload-artifact@v\d+/g, "actions/upload-artifact@v4")
    .replace(/actions\/download-artifact@v\d+/g, "actions/download-artifact@v4");
}

function main() {
  const args = process.argv.slice(2);
  const job = args.includes("--job") ? args[args.indexOf("--job") + 1] : undefined;
  if (!have("act", ["--version"])) fail("act is not installed (brew install act)");
  if (!have("docker", ["info"])) fail("no Docker Engine is reachable (colima start, or another Docker runtime)");
  const dirty = execFileSync("git", ["status", "--porcelain"], { cwd: repo, encoding: "utf8" }).trim();
  if (dirty) fail("commit or set aside your changes first: act copies the working tree, which must be exactly HEAD");

  const work = fs.mkdtempSync(path.join(os.tmpdir(), "canvas-ci-local-"));
  const workflow = path.join(work, "validate-local.yml");
  const cpus = Number(execFileSync("docker", ["info", "--format", "{{.NCPU}}"], { encoding: "utf8" }).trim()) || 4;
  const shardsAtOnce = Math.max(1, Math.floor(cpus / 4));
  fs.writeFileSync(workflow, localWorkflow(fs.readFileSync(path.join(repo, ".github/workflows/validate.yml"), "utf8"), { shardsAtOnce }));
  const imagePath = execFileSync("docker", ["run", "--rm", "--platform", PLATFORM, IMAGE, "printenv", "PATH"], { encoding: "utf8" }).trim();
  const head = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: repo, encoding: "utf8" }).trim();
  console.log(`ci:local: validating ${head} in ${PLATFORM} ${IMAGE} containers, ${shardsAtOnce} e2e shard(s) at a time${job ? ` (job ${job})` : ""}`);
  const run = spawnSync("act", ["workflow_dispatch", "-W", workflow, ...(job ? ["-j", job] : []),
    "--container-architecture", PLATFORM, "-P", `ubuntu-latest=${IMAGE}`, "--container-daemon-socket", "-",
    "--network", "bridge", "--artifact-server-path", path.join(work, "artifacts"), "--concurrent-jobs", "2",
    "--env", `PATH=${imagePath}`],
  { cwd: repo, stdio: "inherit" });
  if (!args.includes("--keep")) fs.rmSync(work, { recursive: true, force: true });
  console.log(`ci:local: not run here (needs a macOS runner or a KVM emulator): ${LOCAL_ONLY_JOBS.join(", ")}`);
  process.exit(run.status ?? 1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
