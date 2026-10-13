import { afterEach, describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unreachableCommitRefs } from "./commit-refs.ts";

// A turn that lands by cherry-pick leaves its records citing the branch's commits, which
// main never contains. The check names them while the objects still exist.

const repos: string[] = [];
afterEach(() => { for (const repo of repos.splice(0)) rmSync(repo, { recursive: true, force: true }); });

function git(repo: string, ...args: string[]): string {
  const result = spawnSync("git", args, { cwd: repo, encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout.trim();
}

/** A repo with one commit on main and one on a side branch main never merged. */
function repo(): { dir: string; onMain: string; offMain: string } {
  const dir = mkdtempSync(join(tmpdir(), "canvas-commit-refs-"));
  repos.push(dir);
  git(dir, "init", "-q", "-b", "main");
  writeFileSync(join(dir, "a.txt"), "a");
  git(dir, "add", "a.txt");
  git(dir, "commit", "-q", "-m", "On main");
  const onMain = git(dir, "rev-parse", "HEAD");
  git(dir, "checkout", "-q", "-b", "turn/x");
  writeFileSync(join(dir, "b.txt"), "b");
  git(dir, "add", "b.txt");
  git(dir, "commit", "-q", "-m", "Only on the turn branch");
  const offMain = git(dir, "rev-parse", "HEAD");
  git(dir, "checkout", "-q", "main");
  mkdirSync(join(dir, "audit", "turns"), { recursive: true });
  return { dir, onMain, offMain };
}

describe("commits the audit's records cite", () => {
  it("names a cited commit HEAD's history does not contain, with its subject", () => {
    const { dir, onMain, offMain } = repo();
    writeFileSync(join(dir, "audit", "x.md"), `| X-1 | low | source | fixed in ${onMain.slice(0, 8)} and (${offMain.slice(0, 8)}) | fixed | ${offMain.slice(0, 8)} |\n`);
    const errors = unreachableCommitRefs(dir, join(dir, "audit"));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain(`audit/x.md cites commit ${offMain.slice(0, 8)} ("Only on the turn branch")`);
  });

  it("passes commits on HEAD, run ids, colours, UUIDs and hex that names no commit", () => {
    const { dir, onMain, offMain } = repo();
    writeFileSync(join(dir, "audit", "x.md"), [
      `fixed in ${onMain.slice(0, 8)}`,
      `run 20261012-145840-web-${offMain.slice(0, 7)}`,
      "the fill #f8f7fe",
      `a link ${offMain.slice(0, 8)}-38fb-4afb-8836-36617e022f02`,
      "an old revision deadbeefcafe",
    ].join("\n"));
    expect(unreachableCommitRefs(dir, join(dir, "audit"))).toEqual([]);
  });

  it("leaves turn records alone, whose commits name where a capture ran", () => {
    const { dir, offMain } = repo();
    writeFileSync(join(dir, "audit", "turns", "x.md"), `| run | variants | web | t | \`${offMain.slice(0, 7)}\` | complete |\n`);
    expect(unreachableCommitRefs(dir, join(dir, "audit"))).toEqual([]);
  });
});
