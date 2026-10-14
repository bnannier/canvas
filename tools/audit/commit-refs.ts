// The commits the audit's records cite (a finding's Fix commit, a summary's "(07810caa)",
// a decision's commit) must be commits of the branch they are read on. A turn that lands by
// cherry-pick gives every commit a new SHA on main, so the records it wrote on its branch
// cite commits main never contains; they resolve until git collects them and then name
// nothing. This finds every such reference while the objects still exist, which is when a
// turn merges.
//
// It reads audit/**/*.md but not audit/turns/: a turn record's Commit column names where a
// capture ran, which may be a turn branch's commit, as its run ids do. Only a commit whose
// object is present can be checked, so it bites in the full clone a turn merges in (the
// pre-push hook runs it there); CI's shallow checkout holds none of the cited commits and
// passes them by.

import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * A commit a record may cite: 7 to 40 hex digits with at least one letter, not part of a
 * longer hex run, a run id (`-web-468c75f`), a colour (`#f8f7fe`) or a UUID's first group.
 */
const SHA = /(?<![-0-9a-f#])(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}(?![0-9a-f-])/g;

/**
 * The environment a git call takes to address the repository at its `cwd` and no other:
 * git exports the variables that locate a repository to its hooks (a pre-push from a
 * worktree carries GIT_DIR), and a child git follows them over its working directory.
 */
export function repoEnv(env: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const locators = new Set(["GIT_DIR", "GIT_WORK_TREE", "GIT_COMMON_DIR", "GIT_INDEX_FILE", "GIT_OBJECT_DIRECTORY", "GIT_ALTERNATE_OBJECT_DIRECTORIES", "GIT_PREFIX"]);
  return Object.fromEntries(Object.entries(env).filter(([key]) => !locators.has(key)));
}

function git(repo: string, args: string[], input?: string): { ok: boolean; out: string } {
  const result = spawnSync("git", args, { cwd: repo, encoding: "utf8", input, env: repoEnv(), maxBuffer: 64 * 1024 * 1024 });
  return { ok: result.status === 0, out: result.stdout ?? "" };
}

function markdownFiles(dir: string, skip: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (path === skip) continue;
    if (statSync(path).isDirectory()) out.push(...markdownFiles(path, skip));
    else if (name.endsWith(".md")) out.push(path);
  }
  return out;
}

/**
 * Every commit an audit record under `auditDir` cites that HEAD's history does not
 * contain, as messages naming the file and the commit's subject.
 */
export function unreachableCommitRefs(repo: string, auditDir: string): string[] {
  const cited = new Map<string, Set<string>>();
  for (const file of markdownFiles(auditDir, join(auditDir, "turns"))) {
    for (const token of readFileSync(file, "utf8").match(SHA) ?? []) {
      if (!cited.has(token)) cited.set(token, new Set());
      cited.get(token)!.add(relative(repo, file));
    }
  }
  if (!cited.size) return [];
  const tokens = [...cited.keys()];
  // One batch call types every token: a commit prints "<sha> commit <size>", anything
  // else (no such object, a blob, an ambiguous prefix) is not a citation to check.
  const types = git(repo, ["cat-file", "--batch-check"], tokens.join("\n") + "\n").out.trim().split("\n");
  const reachable = new Set(git(repo, ["rev-list", "HEAD"]).out.split("\n").filter(Boolean));
  const errors: string[] = [];
  tokens.forEach((token, i) => {
    const [full, type] = (types[i] ?? "").split(" ");
    if (type !== "commit" || reachable.has(full)) return;
    const subject = git(repo, ["log", "-1", "--format=%s", full]).out.trim();
    for (const file of [...cited.get(token)!].sort()) {
      errors.push(
        `${file} cites commit ${token} ("${subject}"), which is not in HEAD's history: name the commit as it landed (a turn merges by rebasing its branch onto main and fast-forwarding, so its SHAs survive; a cherry-pick gives them new ones)`,
      );
    }
  });
  return errors;
}
