import { afterEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
// The shipped Node CLI is imported directly: fixtures exercise its public entry
// functions with real package resolution and file copies, no shell or network.
import { contained, copyNewDirectory, docsLocation, doctor, main, satisfiesMinimum } from "../../consumer/cli.mjs";

const temporary: string[] = [];
afterEach(() => {
  for (const directory of temporary.splice(0)) fs.rmSync(directory, { recursive: true, force: true });
});

function put(directory: string, file: string, value: string | object) {
  const target = path.join(directory, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, typeof value === "string" ? value : `${JSON.stringify(value)}\n`);
}

function fixture() {
  const temporaryRoot = fs.mkdtempSync(path.join(fs.realpathSync(tmpdir()), "canvas-consumer-cli-"));
  temporary.push(temporaryRoot);
  const project = path.join(temporaryRoot, "project");
  const root = path.join(temporaryRoot, "tool");
  put(project, "package.json", { name: "consumer", private: true });
  put(root, "package.json", { name: "@nannier/canvas", version: "4.2.0" });
  return { temporaryRoot, project, root };
}

function installed(project: string, version: string, peers: Record<string, string> = {}, optional: string[] = []) {
  const root = path.join(project, "node_modules/@nannier/canvas");
  put(root, "package.json", { name: "@nannier/canvas", version, exports: { "./package.json": "./package.json" }, peerDependencies: peers, peerDependenciesMeta: Object.fromEntries(optional.map((name) => [name, { optional: true }])) });
  return root;
}

function docs(root: string, version: string, components = [{ slug: "button", name: "Button", exports: ["Button"], description: "Triggers an action." }]) {
  const directory = path.join(root, "docs/public/ai", version);
  put(directory, "catalog.json", { package: "@nannier/canvas", version, status: "source-snapshot", sourceHash: "fixture-source", components });
  put(directory, "components/button.md", `# Button ${version}\n`);
  put(directory, "installation.md", `# Install ${version}\n`);
  return directory;
}

function invoke(args: string[], options: { project: string; root: string }) {
  let output = "";
  const status = main(args, { cwd: options.project, root: options.root, write: (text: string) => { output += text; } });
  return { status, output };
}

test("the executable runs through npm's bin symlink, including preserved-symlink Node mode", () => {
  const f = fixture();
  const cli = path.resolve("consumer/cli.mjs");
  const bin = path.join(f.temporaryRoot, "canvas");
  fs.symlinkSync(cli, bin);
  const direct = execFileSync("node", [cli, "--help"], { encoding: "utf8" });
  expect(direct).toContain("Canvas consumer tools");
  expect(execFileSync("node", [bin, "--help"], { encoding: "utf8" })).toBe(direct);
  expect(execFileSync("node", ["--preserve-symlinks-main", bin, "--help"], { encoding: "utf8" })).toBe(direct);
});

describe("offline installed-version documentation", () => {
  test("looks up the installed API even when this tool carries a newer version", () => {
    const f = fixture();
    const dependency = installed(f.project, "4.1.0");
    docs(f.root, "4.2.0");
    const expected = docs(dependency, "4.1.0");
    expect(docsLocation(f.project, f.root).directory).toBe(expected);
    expect(invoke(["docs", "Button"], f)).toEqual({ status: 0, output: "# Button 4.1.0\n" });
    const result = JSON.parse(invoke(["docs", "button", "--json"], f).output);
    expect(result.version).toBe("4.1.0");
    expect(result.sourceHash).toBe("fixture-source");
    expect(result.component.exports).toContain("Button");
    expect(invoke(["docs", "installation"], f).output).toBe("# Install 4.1.0\n");
  });
  test("does not substitute newer bundled docs when the installed version has no snapshot", () => {
    const f = fixture();
    installed(f.project, "4.1.0");
    docs(f.root, "4.2.0");
    expect(() => docsLocation(f.project, f.root)).toThrow("No bundled documentation for installed Canvas 4.1.0");
    expect(() => invoke(["docs", "button"], f)).toThrow("do not substitute another version");
  });
  test("uses the tool snapshot only when uninstalled or when package versions match", () => {
    const f = fixture();
    const expected = docs(f.root, "4.2.0");
    expect(docsLocation(f.project, f.root).directory).toBe(expected);
    expect(docsLocation(f.project, f.root).installed).toBe(false);
    // Node/Bun module resolution may cache a failed lookup within one process;
    // a fresh consumer models the next CLI invocation after installation.
    const sameVersion = fixture();
    const matching = docs(sameVersion.root, "4.2.0");
    installed(sameVersion.project, "4.2.0");
    expect(docsLocation(sameVersion.project, sameVersion.root).directory).toBe(matching);
    expect(docsLocation(sameVersion.project, sameVersion.root).installed).toBe(true);
  });
  test("rejects mismatched catalog identity and failed/ambiguous component lookup", () => {
    const f = fixture();
    const directory = docs(f.root, "4.2.0");
    put(directory, "catalog.json", { package: "wrong-package", version: "4.2.0", components: [] });
    expect(() => docsLocation(f.project, f.root)).toThrow("package identity");
    docs(f.root, "4.2.0", [
      { slug: "button", name: "Button", exports: ["Button"], description: "Action control" },
      { slug: "split-button", name: "SplitButton", exports: ["SplitButton"], description: "Action menu" },
    ]);
    expect(() => invoke(["docs", "not-a-component"], f)).toThrow("No component matches");
    expect(() => invoke(["docs", "action"], f)).toThrow("Several components match");
    expect(JSON.parse(invoke(["docs", "--list", "--json"], f).output).components).toHaveLength(2);
  });
});

describe("consumer diagnosis", () => {
  test("does not diagnose an ancestor's installation as a missing consumer project", () => {
    const f = fixture();
    installed(f.project, "4.2.0");
    const missing = path.join(f.project, "not-created");
    const result = doctor(missing, f.root);
    expect(result.ok).toBe(false);
    expect(result.package).toBe(null);
    expect(result.issues).toContain("No package.json in the requested project directory.");
  });
  test("reports absent and too-old required peers but accepts omitted optional modules", () => {
    const f = fixture();
    const dependency = installed(f.project, "4.2.0", { react: ">=18", "react-native": ">=0.74", "react-native-svg": ">=15.8.0", "expo-video": "*" }, ["expo-video"]);
    docs(dependency, "4.2.0");
    put(f.project, "node_modules/react/package.json", { name: "react", version: "17.0.2" });
    put(f.project, "node_modules/react-native/package.json", { name: "react-native", version: "0.86.0" });
    const diagnosis = doctor(f.project, f.root);
    expect(diagnosis.ok).toBe(false);
    expect(diagnosis.issues).toEqual(expect.arrayContaining([expect.stringContaining("react 17.0.2 does not satisfy >=18"), expect.stringContaining("react-native-svg")]));
    expect(diagnosis.issues.some((issue: string) => issue.includes("expo-video"))).toBe(false);
    expect(diagnosis.peers.find((peer: { name: string }) => peer.name === "react-native").compatible).toBe(true);
    expect(invoke(["doctor", "--json"], f).status).toBe(1);
    const healthy = fixture();
    const healthyDependency = installed(healthy.project, "4.2.0", { react: ">=18", "react-native": ">=0.74", "react-native-svg": ">=15.8.0", "expo-video": "*" }, ["expo-video"]);
    docs(healthyDependency, "4.2.0");
    put(healthy.project, "node_modules/react/package.json", { name: "react", version: "19.2.0" });
    put(healthy.project, "node_modules/react-native/package.json", { name: "react-native", version: "0.86.0" });
    put(healthy.project, "node_modules/react-native-svg/package.json", { name: "react-native-svg", version: "15.15.5" });
    expect(doctor(healthy.project, healthy.root).ok).toBe(true);
    expect(invoke(["doctor", "--json"], healthy).status).toBe(0);
  });
  test("warns about unknown ranges and local overlays without claiming registry provenance", () => {
    const f = fixture();
    const dependency = installed(f.project, "4.1.0", { react: "^19" });
    put(dependency, ".origin", "/local/checkout");
    put(f.project, "node_modules/react/package.json", { name: "react", version: "19.2.0" });
    const diagnosis = doctor(f.project, f.root);
    expect(diagnosis.ok).toBe(true);
    expect(diagnosis.warnings).toEqual(expect.arrayContaining([expect.stringContaining("does not evaluate"), expect.stringContaining("local overlay"), expect.stringContaining("differs from installed"), expect.stringContaining("No bundled documentation")]));
    expect(satisfiesMinimum("0.74.0", ">=0.74")).toBe(true);
    expect(satisfiesMinimum("0.73.9", ">=0.74")).toBe(false);
    expect(satisfiesMinimum("19.0.0-rc.1", ">=18")).toBe(null);
    expect(satisfiesMinimum("19.0.0", "^19")).toBe(null);
  });
  test("an uninstalled project gets an actionable failed diagnosis", () => {
    const f = fixture();
    expect(doctor(f.project, f.root).ok).toBe(false);
    expect(doctor(f.project, f.root).issues.join(" ")).toContain("not installed");
  });
});

describe("project-local skill copies", () => {
  test("copies complete guidance and license to both clients, repeats without changing user files", () => {
    const f = fixture();
    put(f.root, "consumer/canvas/SKILL.md", "# Canvas\nFollow the installed reference.\n");
    put(f.root, "consumer/canvas/references/api.md", "Use public exports.\n");
    put(f.root, "LICENSE", "Fixture license\n");
    expect(invoke(["skills", "install", "--client", "both"], f).status).toBe(0);
    for (const client of [".agents", ".claude"]) {
      expect(fs.readFileSync(path.join(f.project, client, "skills/canvas/SKILL.md"), "utf8")).toContain("installed reference");
      expect(fs.readFileSync(path.join(f.project, client, "skills/canvas/LICENSE"), "utf8")).toBe("Fixture license\n");
    }
    expect(invoke(["skills", "install", "--client", "both"], f).output.match(/unchanged/g)).toHaveLength(2);
    put(f.project, ".agents/skills/canvas/SKILL.md", "My edited guidance\n");
    expect(() => invoke(["skills", "install", "--client", "codex"], f)).toThrow("Destination exists and differs");
    expect(fs.readFileSync(path.join(f.project, ".agents/skills/canvas/SKILL.md"), "utf8")).toBe("My edited guidance\n");
  });
  test("nested asset ordering plus an extra license stays idempotent", () => {
    const f = fixture();
    const source = path.join(f.root, "assets");
    const destination = path.join(f.project, "copy");
    put(source, "a/z.md", "Nested.\n");
    put(source, "a.md", "Sibling.\n");
    expect(copyNewDirectory(source, destination, undefined, { LICENSE: "License\n" })).toBe("created");
    expect(copyNewDirectory(source, destination, undefined, { LICENSE: "License\n" })).toBe("unchanged");
  });
  test("refuses symlink destinations, symlink source entries and extra-file traversal", () => {
    const f = fixture();
    const source = path.join(f.root, "assets");
    put(source, "SKILL.md", "Guidance\n");
    const outside = path.join(f.temporaryRoot, "outside");
    fs.mkdirSync(outside);
    fs.symlinkSync(outside, path.join(f.project, ".agents"), "dir");
    expect(() => copyNewDirectory(source, path.join(f.project, ".agents/skills/canvas"))).toThrow("symlink destination");
    expect(fs.readdirSync(outside)).toEqual([]);
    fs.symlinkSync(path.join(source, "SKILL.md"), path.join(source, "linked.md"));
    expect(() => copyNewDirectory(source, path.join(f.project, "safe"))).toThrow("symlink in consumer assets");
    fs.unlinkSync(path.join(source, "linked.md"));
    expect(() => copyNewDirectory(source, path.join(f.project, "safe"), undefined, { "../escaped.md": "Escape" })).toThrow("inside its destination");
    expect(fs.existsSync(path.join(f.project, "escaped.md"))).toBe(false);
    expect(fs.existsSync(path.join(f.project, "safe"))).toBe(false);
    expect(() => contained(f.project, "../escaped.md")).toThrow("inside its destination");
    expect(() => contained(f.project, path.join(f.project, "absolute.md"))).toThrow("inside its destination");
    expect(() => contained(f.project, ".")).toThrow("inside its destination");
  });
});

describe("offline recipe initialization", () => {
  test("pins the tool version, rewrites recipe choice and app name, and preserves other source files", () => {
    const f = fixture();
    put(f.root, "consumer/recipes/package.json", { name: "template", private: true, dependencies: { "@nannier/canvas": "0.0.0", expo: "^57.0.0" } });
    put(f.root, "consumer/recipes/recipe-config.json", { initialRecipe: "settings" });
    put(f.root, "consumer/recipes/app/index.tsx", "export default function Screen() { return null; }\n");
    put(f.root, "LICENSE", "License\n");
    const result = invoke(["init", "--recipe", "booking", "--dir", "My_App"], f);
    expect(result.status).toBe(0);
    const target = path.join(f.project, "My_App");
    const manifest = JSON.parse(fs.readFileSync(path.join(target, "package.json"), "utf8"));
    expect(manifest.name).toBe("my-app");
    expect(manifest.dependencies).toEqual({ "@nannier/canvas": "4.2.0", expo: "^57.0.0" });
    expect(JSON.parse(fs.readFileSync(path.join(target, "recipe-config.json"), "utf8"))).toEqual({ initialRecipe: "booking" });
    expect(fs.readFileSync(path.join(target, "app/index.tsx"), "utf8")).toContain("return null");
    expect(fs.existsSync(path.join(target, "node_modules"))).toBe(false);
    expect(fs.existsSync(path.join(target, "bun.lock"))).toBe(false);
    expect(invoke(["init", "--recipe", "booking", "--dir", "My_App"], f).output).toContain("unchanged");
    expect(() => invoke(["init", "--recipe", "dashboard", "--dir", "My_App"], f)).toThrow("Destination exists and differs");
    fs.mkdirSync(path.join(f.project, "empty"));
    expect(() => invoke(["init", "--recipe", "settings", "--dir", "empty"], f)).toThrow("Destination exists and differs");
    expect(() => invoke(["init", "--recipe", "unknown", "--dir", "another"], f)).toThrow("Use canvas init");
  });
});
