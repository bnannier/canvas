import { afterAll, afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { accept, assertReleaseVersion, npmPublish, prepare, publish, publishOutput, readCandidate, restore, seal, verifyArtifacts, verifyPublishAuth } from "../../scripts/release.mjs";
import { preparePages } from "../../docs/scripts/prepare-pages.mjs";

const roots: string[] = [];
const root = () => { const dir = fs.mkdtempSync(path.join(os.tmpdir(), "canvas-release-")); roots.push(dir); return dir; };
const git = (cwd: string, ...args: string[]) => execFileSync("git", args, {
  cwd,
  encoding: "utf8",
  env: {
    ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_"))),
    HUSKY: "0",
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_CONFIG_NOSYSTEM: "1",
  },
  stdio: ["ignore", "pipe", "pipe"],
}).trim();
const write = (file: string, data: unknown) => fs.writeFileSync(file, JSON.stringify(data));
afterEach(() => { for (const dir of roots.splice(0)) fs.rmSync(dir, { recursive: true, force: true }); });
// A dispatch that authorizes a major exports RELEASE_MAJOR to every validation
// step, this suite included. Every case starts with no ambient authorization; the
// cases whose subject is the authorized path set the variable themselves.
const ambientMajor = process.env.RELEASE_MAJOR;
beforeEach(() => { delete process.env.RELEASE_MAJOR; });
afterAll(() => { if (ambientMajor === undefined) delete process.env.RELEASE_MAJOR; else process.env.RELEASE_MAJOR = ambientMajor; });

function fixture(bump = "patch", otherPackageBump?: string) {
  const dir = root();
  const remote = path.join(dir, "origin.git");
  const repo = path.join(dir, "repo");
  fs.mkdirSync(repo);
  git(dir, "init", "--bare", "--initial-branch=main", remote);
  git(repo, "init", "--initial-branch=main");
  git(repo, "config", "user.name", "Release test");
  git(repo, "config", "user.email", "release@example.test");
  git(repo, "config", "core.hooksPath", path.join(dir, "no-hooks"));
  git(repo, "remote", "add", "origin", remote);
  const { main, types, exports, peerDependencies, peerDependenciesMeta, "react-native": nativeEntry, files } = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf8"));
  write(path.join(repo, "package.json"), { name: "@nannier/canvas", version: "2.3.4", main, types, exports, "react-native": nativeEntry, peerDependencies, peerDependenciesMeta, files, scripts: { changeset: "changeset", "version-packages": "changeset version" } });
  fs.writeFileSync(path.join(repo, "CHANGELOG.md"), "# Changes\n");
  fs.mkdirSync(path.join(repo, ".changeset"));
  fs.copyFileSync(path.resolve(".changeset/config.json"), path.join(repo, ".changeset/config.json"));
  if (bump) fs.writeFileSync(path.join(repo, ".changeset/fix.md"), `---\n"@nannier/canvas": ${bump}\n---\n\nCorrect a behavior.\n`);
  if (otherPackageBump !== undefined) {
    // A second workspace package, which Canvas never ships: it publishes as one package.
    const metadataFile = path.join(repo, "package.json");
    const metadata = JSON.parse(fs.readFileSync(metadataFile, "utf8"));
    metadata.workspaces = [".", "packages/*"];
    write(metadataFile, metadata);
    fs.mkdirSync(path.join(repo, "packages/canvas-blur"), { recursive: true });
    write(path.join(repo, "packages/canvas-blur/package.json"), { name: "@nannier/canvas-blur", version: "0.2.0" });
    fs.writeFileSync(path.join(repo, ".changeset/blur.md"), `---\n"@nannier/canvas-blur": ${otherPackageBump}\n---\n\nAdd optional Android backdrop capture.\n`);
  }
  git(repo, "add", ".");
  git(repo, "commit", "-m", "source");
  git(repo, "push", "origin", "main");
  const source = git(repo, "rev-parse", "HEAD");
  fs.symlinkSync(path.resolve("node_modules"), path.join(repo, "node_modules"));
  const candidateDir = path.join(dir, "candidate");
  const artifacts = path.join(dir, "artifacts");
  return { dir, repo, remote, source, candidateDir, artifacts };
}

function artifacts(f: ReturnType<typeof fixture>, c: ReturnType<typeof readCandidate>) {
  fs.mkdirSync(f.artifacts);
  const packageFiles = Object.fromEntries(c.packages.map((p) => [p.name, "package.tgz"]));
  const files = [...Object.values(packageFiles), "docs.tgz"].map((name) => {
    const bytes = Buffer.from(name);
    fs.writeFileSync(path.join(f.artifacts, name), bytes);
    return { name, sha256: createHash("sha256").update(bytes).digest("hex") };
  });
  write(path.join(f.artifacts, "manifest.json"), { ...c, packageFile: "package.tgz", packageFiles, files });
}

function advance(f: ReturnType<typeof fixture>) {
  const other = path.join(f.dir, "other");
  git(f.dir, "clone", f.remote, other);
  git(other, "config", "user.name", "Other contributor");
  git(other, "config", "user.email", "other@example.test");
  fs.writeFileSync(path.join(other, "test-only.txt"), "New test source\n");
  git(other, "add", ".");
  git(other, "commit", "-m", "test-only advance");
  git(other, "push", "origin", "main");
  return git(other, "rev-parse", "HEAD");
}

describe("frozen release transaction", () => {
  test("versions and tags the one Canvas package", () => {
    const f = fixture("minor");
    const c = prepare(f.repo, f.candidateDir, f.source, true);
    expect(c.packages.map((p) => [p.name, p.version, p.release, p.tag])).toEqual([["@nannier/canvas", "2.4.0", true, "v2.4.0"]]);
    artifacts(f, c);
    const files: string[] = [];
    publish(f.repo, f.candidateDir, f.artifacts, (file) => files.push(path.basename(file)));
    expect(files).toEqual(["package.tgz"]);
    expect(git(f.repo, "ls-remote", "origin", "refs/tags/*")).toContain("refs/tags/v2.4.0");
  }, 30_000);

  test("refuses a changeset for any package other than Canvas before a version is consumed", () => {
    const f = fixture("patch", "patch");
    expect(() => prepare(f.repo, f.candidateDir, f.source, true)).toThrow("Unregistered package in release plan");
    expect(git(f.repo, "rev-parse", "HEAD")).toBe(f.source);
    expect(git(f.repo, "ls-remote", "origin", "refs/heads/main").split(/\s/)[0]).toBe(f.source);
  }, 30_000);

  test("a registry failure leaves no tag and never retries an accepted candidate", () => {
    const f = fixture("patch");
    const c = prepare(f.repo, f.candidateDir, f.source, true);
    artifacts(f, c);
    let calls = 0;
    expect(() => publish(f.repo, f.candidateDir, f.artifacts, () => { calls += 1; throw new Error("registry failure"); })).toThrow("registry failure");
    expect(calls).toBe(1);
    expect(git(f.repo, "ls-remote", "origin", "refs/tags/*")).toBe("");
    expect(publish(f.repo, f.candidateDir, f.artifacts, () => { throw new Error("no retry"); })).toBe("stale");
  }, 30_000);

  test("prepares from a pinned detached CI checkout with no local main ref", () => {
    const f = fixture();
    git(f.repo, "checkout", "--detach", f.source);
    git(f.repo, "branch", "-D", "main");
    const c = prepare(f.repo, f.candidateDir, f.source, true);
    expect(c.status).toBe("ready");
    expect(c.version).toBe("2.3.5");
    expect(git(f.repo, "rev-parse", "main")).toBe(f.source);
    expect(git(f.repo, "rev-parse", "HEAD^")).toBe(f.source);
  }, 30_000);

  // This integration case runs Changesets, copies the complete distribution,
  // invokes npm pack and verifies unpacked files. Give those subprocesses their
  // own bounded budget instead of Bun's five-second unit-test default.
  test.skipIf(!fs.existsSync(path.resolve("dist/index.js")))("seals real npm tarballs and docs archive, then verifies their unpacked bytes", () => {
    const f = fixture("patch");
    const c = prepare(f.repo, f.candidateDir, f.source, true);
    fs.cpSync(path.resolve("dist"), path.join(f.repo, "dist"), { recursive: true });
    fs.cpSync(path.resolve("styles"), path.join(f.repo, "styles"), { recursive: true });
    fs.mkdirSync(path.join(f.repo, "scripts"));
    fs.copyFileSync(path.resolve("scripts/verify-package.ts"), path.join(f.repo, "scripts/verify-package.ts"));
    // The capture module's sources, plus build output and tests the files allowlist must keep out.
    for (const file of ["android/src/main", "android/src/androidTest", "android/build.gradle", "expo-module.config.json"]) {
      fs.mkdirSync(path.dirname(path.join(f.repo, file)), { recursive: true });
      fs.cpSync(path.resolve(file), path.join(f.repo, file), { recursive: true });
    }
    fs.mkdirSync(path.join(f.repo, "android/build/intermediates"), { recursive: true });
    fs.writeFileSync(path.join(f.repo, "android/build/intermediates/stale.txt"), "local build output");
    fs.mkdirSync(path.join(f.repo, "tools/licensegen"), { recursive: true });
    fs.copyFileSync(path.resolve("tools/licensegen/generate.mjs"), path.join(f.repo, "tools/licensegen/generate.mjs"));
    fs.mkdirSync(path.join(f.repo, "docs/dist"), { recursive: true });
    fs.writeFileSync(path.join(f.repo, "docs/dist/index.html"), "Validated docs bytes");
    seal(f.repo, f.candidateDir, f.artifacts);
    const m = verifyArtifacts(f.repo, f.candidateDir, f.artifacts);
    expect(m.version).toBe(c.version);
    const packed = execFileSync("tar", ["-xOf", path.join(f.artifacts, m.packageFile), "package/package.json"], { encoding: "utf8" });
    expect(JSON.parse(packed).version).toBe("2.3.5");
    expect(execFileSync("tar", ["-xOf", path.join(f.artifacts, "docs.tgz"), "./index.html"], { encoding: "utf8" })).toBe("Validated docs bytes");
    expect(execFileSync("tar", ["-xOf", path.join(f.artifacts, m.packageFile), "package/LICENSE"], { encoding: "utf8" })).toContain("MIT License");
    expect(Object.keys(m.packageFiles)).toEqual(["@nannier/canvas"]);
    const entries = execFileSync("tar", ["-tzf", path.join(f.artifacts, m.packageFile)], { encoding: "utf8" });
    expect(entries).toContain("package/expo-module.config.json");
    expect(entries).toContain("package/android/build.gradle");
    expect(entries).toContain("package/android/src/main/java/io/ionize/canvas/blur/CanvasBlurModule.kt");
    expect(entries).not.toContain("androidTest");
    expect(entries).not.toContain("android/build/");
    expect(entries).not.toContain("package/src/");
    expect(entries).not.toContain("node_modules/");
  }, 60_000);

  test("prepares version metadata first and restores the identical commit from its bundle", () => {
    const f = fixture();
    const c = prepare(f.repo, f.candidateDir, f.source, true);
    expect(c.version).toBe("2.3.5");
    expect(c.release).toBe(true);
    expect(git(f.repo, "ls-remote", "origin", "refs/heads/main")).toStartWith(f.source);
    const validation = path.join(f.dir, "validation");
    git(f.dir, "clone", f.remote, validation);
    expect(restore(validation, f.candidateDir, f.source).candidate).toBe(c.candidate);
    expect(git(validation, "rev-parse", "HEAD")).toBe(c.candidate);
    expect(fs.existsSync(path.join(validation, ".changeset/fix.md"))).toBe(false);
  }, 30_000);

  test("major is blocked regardless of manual npm request; no changesets is a no-op", () => {
    const f = fixture("major");
    const c = prepare(f.repo, f.candidateDir, f.source, true);
    expect(c.status).toBe("blocked-major");
    expect(c.candidate).toBe(f.source);
    artifacts(f, c);
    expect(publish(f.repo, f.candidateDir, f.artifacts, () => { throw new Error("must not publish"); })).toBe("blocked-major");
    const empty = fixture("");
    expect(prepare(empty.repo, empty.candidateDir, empty.source, true).status).toBe("no-changesets");
    expect(() => assertReleaseVersion("2.3.4", "3.0.0")).toThrow("Major");
    expect(() => assertReleaseVersion("2.3.4", "2.3.4")).toThrow("increase");
  }, 30_000);

  test("a human-typed exact next major authorizes the major; anything else still blocks", () => {
    const withMajor = (value: string, run: () => void) => {
      const previous = process.env.RELEASE_MAJOR;
      process.env.RELEASE_MAJOR = value;
      try { run(); } finally {
        if (previous === undefined) delete process.env.RELEASE_MAJOR; else process.env.RELEASE_MAJOR = previous;
      }
    };
    // The wrong version (a skipped major, a minor, a typo) authorizes nothing: the
    // pure assertion covers the shapes, one fixture proves prepare still parks.
    for (const wrong of ["4.0.0", "3.1.0", "3.0.1", "3", "next"]) {
      withMajor(wrong, () => expect(() => assertReleaseVersion("2.3.4", "3.0.0")).toThrow("Major"));
    }
    withMajor("3.1.0", () => {
      const f = fixture("major");
      expect(prepare(f.repo, f.candidateDir, f.source, true).status).toBe("blocked-major");
    });
    // The exact next major, typed by a human on the dispatch, versions and readies the candidate.
    withMajor("3.0.0", () => {
      expect(() => assertReleaseVersion("2.3.4", "3.0.0")).not.toThrow();
      expect(() => assertReleaseVersion("2.3.4", "4.0.0")).toThrow("Major");
      const f = fixture("major");
      const c = prepare(f.repo, f.candidateDir, f.source, true);
      expect(c.status).toBe("ready");
      expect(c.version).toBe("3.0.0");
      expect(c.release).toBe(true);
      // Restoring the candidate re-runs the version assertion with the same authorization.
      const validation = path.join(f.dir, "validation");
      git(f.dir, "clone", f.remote, validation);
      expect(restore(validation, f.candidateDir, f.source).version).toBe("3.0.0");
    });
  }, 60_000);

  test("a test-only main advance publishes nothing and pushes no tag", () => {
    const f = fixture();
    const c = prepare(f.repo, f.candidateDir, f.source, true);
    artifacts(f, c);
    const newer = advance(f);
    let calls = 0;
    expect(publish(f.repo, f.candidateDir, f.artifacts, () => { calls++; })).toBe("stale");
    expect(calls).toBe(0);
    expect(git(f.repo, "ls-remote", "origin", "refs/heads/main")).toStartWith(newer);
    expect(git(f.repo, "ls-remote", "origin", "refs/tags/*")).toBe("");
    expect(git(f.repo, "rev-parse", "HEAD")).toBe(c.candidate);
  }, 30_000);

  test("a race after freshness check is rejected by normal push without rebase", () => {
    const f = fixture();
    const c = prepare(f.repo, f.candidateDir, f.source, true);
    expect(accept(f.repo, c, () => advance(f))).toBe(false);
    expect(git(f.repo, "rev-parse", "HEAD")).toBe(c.candidate);
    expect(git(f.repo, "ls-remote", "origin", "refs/tags/*")).toBe("");
  }, 30_000);

  test("publishes the tested file only after candidate push, then pushes only its tag", () => {
    const f = fixture();
    const c = prepare(f.repo, f.candidateDir, f.source, true);
    artifacts(f, c);
    git(f.repo, "tag", "unrelated-local-tag");
    const files: string[] = [];
    expect(publish(f.repo, f.candidateDir, f.artifacts, (file: string) => {
      expect(git(f.repo, "ls-remote", "origin", "refs/heads/main")).toStartWith(c.candidate);
      expect(git(f.repo, "ls-remote", "origin", "refs/tags/*")).toBe("");
      files.push(file);
    })).toBe("published");
    expect(files).toEqual([path.join(f.artifacts, "package.tgz")]);
    expect(git(f.repo, "ls-remote", "origin", "refs/tags/*")).toBe(`${c.candidate}\trefs/tags/v2.3.5`);
  }, 30_000);

  test("artifact corruption or candidate mismatch stops before acceptance", () => {
    const f = fixture();
    const c = prepare(f.repo, f.candidateDir, f.source, true);
    artifacts(f, c);
    expect(verifyArtifacts(f.repo, f.candidateDir, f.artifacts).candidate).toBe(c.candidate);
    fs.appendFileSync(path.join(f.artifacts, "docs.tgz"), "tampered");
    expect(() => publish(f.repo, f.candidateDir, f.artifacts, () => {})).toThrow("checksum");
    expect(git(f.repo, "ls-remote", "origin", "refs/heads/main")).toStartWith(f.source);
    expect(() => restore(f.repo, f.candidateDir, "a".repeat(40))).toThrow("different");
  }, 30_000);

  test("partial npm failure leaves no tag and cannot silently republish that candidate", () => {
    const f = fixture();
    const c = prepare(f.repo, f.candidateDir, f.source, true);
    artifacts(f, c);
    expect(() => publish(f.repo, f.candidateDir, f.artifacts, () => { throw new Error("registry failed"); })).toThrow("registry failed");
    expect(git(f.repo, "ls-remote", "origin", "refs/tags/*")).toBe("");
    expect(publish(f.repo, f.candidateDir, f.artifacts, () => { throw new Error("do not retry"); })).toBe("stale");
  }, 30_000);
});

test("shared Pages preparation makes vendor fonts uploadable before browser validation", () => {
  const dist = root();
  const page = '<link rel="preload" as="font" href="/assets/node_modules/font/a.ttf"><div id="root"></div><script src="/_expo/static/js/web/entry-abc.js" defer></script>';
  fs.mkdirSync(path.join(dist, "assets/node_modules/font"), { recursive: true });
  fs.mkdirSync(path.join(dist, "privacy"));
  fs.mkdirSync(path.join(dist, "components/button-group"), { recursive: true });
  // A split export: the shared chunk marks it, and the component's docs chunk is the
  // one the page must ship before its entry (the real manifest maps button-group to it).
  fs.mkdirSync(path.join(dist, "_expo/static/js/web"), { recursive: true });
  for (const name of ["entry-abc.js", "__common-abc.js", "button-group-docs-0123456789abcdef0123456789abcdef.js"]) fs.writeFileSync(path.join(dist, "_expo/static/js/web", name), "");
  // The exporter's route-group copy and literal dynamic-segment document, both unreachable.
  fs.mkdirSync(path.join(dist, "(components)/components/button-group"), { recursive: true });
  // The baked privacy page is plain HTML (no app root, no fonts) and outranks the
  // rendered privacy route beside it.
  for (const name of ["_headers", "privacy/index.html"]) fs.writeFileSync(path.join(dist, name), "fixture");
  for (const name of ["index.html", "privacy.html", "+not-found.html", "components/button-group/index.html", "components/[slug].html", "(components)/components/button-group/index.html"]) {
    fs.writeFileSync(path.join(dist, name), page);
  }
  fs.writeFileSync(path.join(dist, "assets/node_modules/font/a.ttf"), "font bytes");
  fs.writeFileSync(path.join(dist, "app.js"), 'const font="/assets/node_modules/font/a.ttf";');
  preparePages(dist);
  preparePages(dist);
  expect(fs.readFileSync(path.join(dist, "app.js"), "utf8")).toContain("assets/vendor");
  expect(fs.readFileSync(path.join(dist, "components/button-group/index.html"), "utf8")).toContain("assets/vendor");
  expect(fs.existsSync(path.join(dist, "assets/node_modules"))).toBe(false);
  // Pages serves 404.html for a miss; the exporter's +not-found page is renamed to it.
  expect(fs.existsSync(path.join(dist, "404.html"))).toBe(true);
  expect(fs.existsSync(path.join(dist, "+not-found.html"))).toBe(false);
  expect(fs.existsSync(path.join(dist, "(components)"))).toBe(false);
  expect(fs.existsSync(path.join(dist, "components/[slug].html"))).toBe(false);
  expect(fs.existsSync(path.join(dist, "privacy.html"))).toBe(false);
  expect(fs.readFileSync(path.join(dist, "privacy/index.html"), "utf8")).toBe("fixture");
  // The docs chunk precedes the entry on the component page, once, and nowhere else.
  const componentPage = fs.readFileSync(path.join(dist, "components/button-group/index.html"), "utf8");
  expect(componentPage.indexOf('src="/_expo/static/js/web/button-group-docs-0123456789abcdef0123456789abcdef.js" defer')).toBeGreaterThan(-1);
  expect(componentPage.indexOf("button-group-docs-0123456789abcdef0123456789abcdef.js")).toBeLessThan(componentPage.indexOf("entry-abc.js"));
  expect(componentPage.split("button-group-docs-0123456789abcdef0123456789abcdef.js").length).toBe(2);
  expect(fs.readFileSync(path.join(dist, "index.html"), "utf8")).not.toContain("button-group-docs");
  // The old SPA catch-all would answer every miss with the home page; it is refused.
  fs.writeFileSync(path.join(dist, "_redirects"), "/* /index.html 200");
  expect(() => preparePages(dist)).toThrow("_redirects");
  fs.rmSync(path.join(dist, "_redirects"));
  fs.rmSync(path.join(dist, "assets/vendor/font/a.ttf"));
  expect(() => preparePages(dist)).toThrow();
});

describe("npm publish output in the job log", () => {
  test("keeps npm's error and details and drops the tarball listing that once pushed them past a pipe buffer", () => {
    const listing = Array.from({ length: 4000 }, (_, i) => `npm notice ${i % 9}.${i % 10}kB dist/charts/chart-${i}/chart-${i}.android.d.ts.map`);
    const stderr = ["npm notice", "npm notice 📦  @nannier/canvas@3.9.2", "npm notice Tarball Contents", "npm notice 476.6kB CHANGELOG.md", "npm notice 315B dist/index.js", ...listing,
      "npm notice Tarball Details", "npm notice total files: 3947", "npm notice Publishing to https://registry.npmjs.org/ with tag latest and public access",
      "npm error code E404", "npm error 404 Not Found - PUT https://registry.npmjs.org/@nannier%2fcanvas - Not found"].join("\n");
    const out = publishOutput("", stderr);
    expect(out.split("\n")).toEqual(["npm notice", "npm notice 📦  @nannier/canvas@3.9.2", "npm notice Tarball Contents", "npm notice Tarball Details", "npm notice total files: 3947",
      "npm notice Publishing to https://registry.npmjs.org/ with tag latest and public access", "npm error code E404", "npm error 404 Not Found - PUT https://registry.npmjs.org/@nannier%2fcanvas - Not found"]);
    expect(Buffer.byteLength(out)).toBeLessThan(64 * 1024);
    expect(publishOutput("+ @nannier/canvas@3.9.2\n", undefined)).toBe("+ @nannier/canvas@3.9.2");
  });

  test("a failed publish prints npm's error, not its listing, and stdin is closed so nothing waits on it", () => {
    // A stand-in npm: a listing larger than a pipe buffer, a read of stdin to its end (a prompt
    // on an open stdin would stall until the job's limit, as in Deploy run 39708247691), then
    // the error and a failing exit.
    const bin = root();
    fs.writeFileSync(path.join(bin, "npm"), [
      "#!/bin/sh",
      "i=0; while [ $i -lt 4000 ]; do echo \"npm notice 1.${i}kB dist/chart-$i/chart-$i.android.d.ts.map\" >&2; i=$((i+1)); done",
      "cat > /dev/null",
      "echo \"npm error code E404\" >&2",
      "exit 1",
    ].join("\n") + "\n", { mode: 0o755 });
    const pathBefore = process.env.PATH;
    const printed: string[] = [];
    const error = spyOn(console, "error").mockImplementation((text: unknown) => { printed.push(String(text)); });
    process.env.PATH = `${bin}${path.delimiter}${pathBefore}`;
    try {
      expect(() => npmPublish(bin, "nannier-canvas-3.9.2.tgz")).toThrow("npm publish nannier-canvas-3.9.2.tgz failed (exit 1)");
    } finally {
      process.env.PATH = pathBefore;
      error.mockRestore();
    }
    expect(printed).toEqual(["npm error code E404"]);
  });
});

describe("trusted-publishing check before acceptance", () => {
  // A candidate directory holding only candidate.json, as `restore` leaves it.
  const candidateDir = (release: boolean) => {
    const dir = root();
    const version = release ? "3.9.3" : "3.9.2";
    fs.writeFileSync(path.join(dir, "candidate.json"), JSON.stringify({
      source: "a".repeat(40), candidate: (release ? "b" : "a").repeat(40), name: "@nannier/canvas", version, tag: `v${version}`,
      release, status: release ? "ready" : "no-changesets",
      packages: [{ name: "@nannier/canvas", directory: ".", version, tag: `v${version}`, release }],
    }));
    return dir;
  };
  const env = { ACTIONS_ID_TOKEN_REQUEST_URL: "https://actions.example/idtoken/abc?api-version=2.0", ACTIONS_ID_TOKEN_REQUEST_TOKEN: "request-token" };
  type Call = { url: string; method: string; authorization: string };
  const fakeFetch = (exchange: { status: number; body: unknown }) => {
    const calls: Call[] = [];
    const fetchImpl = async (url: string, init: { method?: string; headers: Record<string, string> }) => {
      calls.push({ url, method: init.method ?? "GET", authorization: init.headers.Authorization });
      if (url.startsWith("https://actions.example/")) return { ok: true, status: 200, json: async () => ({ value: "github-id-token" }) };
      return { ok: exchange.status < 300, status: exchange.status, json: async () => exchange.body };
    };
    return { calls, fetchImpl };
  };

  test("a candidate that releases nothing asks no one", async () => {
    const { calls, fetchImpl } = fakeFetch({ status: 201, body: {} });
    expect(await verifyPublishAuth(candidateDir(false), { env, fetchImpl })).toEqual([]);
    expect(calls).toEqual([]);
  });

  test("a publish job without id-token: write fails before acceptance", async () => {
    const { fetchImpl } = fakeFetch({ status: 201, body: {} });
    await expect(verifyPublishAuth(candidateDir(true), { env: {}, fetchImpl })).rejects.toThrow("id-token: write");
  });

  test("npm's refusal fails the job with npm's own message, after the requests npm itself makes", async () => {
    const { calls, fetchImpl } = fakeFetch({ status: 404, body: { message: "OIDC token exchange error - package not found" } });
    await expect(verifyPublishAuth(candidateDir(true), { env, fetchImpl }))
      .rejects.toThrow("npm refused a trusted-publishing token for @nannier/canvas (HTTP 404: OIDC token exchange error - package not found)");
    expect(calls).toEqual([
      { url: "https://actions.example/idtoken/abc?api-version=2.0&audience=npm%3Aregistry.npmjs.org", method: "GET", authorization: "Bearer request-token" },
      { url: "https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/@nannier%2fcanvas", method: "POST", authorization: "Bearer github-id-token" },
    ]);
  });

  test("an accepted exchange passes and never prints npm's token", async () => {
    const { fetchImpl } = fakeFetch({ status: 201, body: { token: "npm-short-lived-token" } });
    const printed: string[] = [];
    const log = spyOn(console, "log").mockImplementation((text: unknown) => { printed.push(String(text)); });
    try {
      expect(await verifyPublishAuth(candidateDir(true), { env, fetchImpl })).toEqual(["@nannier/canvas"]);
    } finally { log.mockRestore(); }
    expect(printed).toEqual(["npm issues a trusted-publishing token for @nannier/canvas."]);
  });
});

