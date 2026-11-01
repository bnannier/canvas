import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { GLOBAL_OUTPUTS, json, normalizeImports, normalizeMarkdown, publicGuideLinks, renderAgents, section, sha256, snapshotWrites, validateArchives } from "./model.ts";
import { generate } from "./generate.ts";

describe("agent reference transformations", () => {
  const names = new Set(["Button", "ButtonProps", "useTheme"]);
  test("normalizes named and type imports while preserving aliases, literals and React imports", () => {
    const code = 'import { Button as Action, type ButtonProps } from "../../src/index";\nimport { useState } from "react";\nconst text = "../../src/index";';
    expect(normalizeImports(code, names)).toBe('import { Button as Action, type ButtonProps } from "@nannier/canvas";\nimport { useState } from "react";\nconst text = "../../src/index";');
    expect(normalizeImports('import type { ButtonProps } from "@nannier/canvas/private";', names)).toBe('import type { ButtonProps } from "@nannier/canvas";');
  });
  test("rejects private helpers, default imports and namespace shortcuts", () => {
    expect(() => normalizeImports('import { createButton } from "../src/button";', names)).toThrow("Unexported Canvas API");
    expect(() => normalizeImports('import Canvas from "@nannier/canvas";', names)).toThrow("named public");
    expect(() => normalizeImports('import * as Canvas from "@nannier/canvas";', names)).toThrow("named public");
  });
  test("rewrites code fences without rewriting inline documentation or unrelated code", () => {
    const input = 'Keep `../src/index` in prose.\n```tsx\nimport { Button } from "../src/index";\n<Button />\n```\n```bash\ncat ../src/index\n```';
    expect(normalizeMarkdown(input, names)).toBe(input.replace('from "../src/index"', 'from "@nannier/canvas"'));
  });
  test("sections retain nested headings and stop at the next sibling", () => {
    const markdown = "# Kit\n## Install\nInstall it.\n### Optional\nAdd peers.\n## Theme\nUse tokens.\n";
    expect(section(markdown, "## Install")).toBe("Install it.\n### Optional\nAdd peers.");
    expect(section(markdown, "### Optional")).toBe("Add peers.");
    expect(() => section(markdown, "## Missing")).toThrow("Missing source section");
  });
  test("shell comments and headings inside fenced examples do not truncate a section", () => {
    const markdown = "# Kit\n## Install\n```bash\n# add any subset\nnpm install addon\n```\n### Android\nNative setup.\n~~~md\n## Also not a section\n~~~\n## Quick start\nNext.\n";
    expect(section(markdown, "## Install")).toBe("```bash\n# add any subset\nnpm install addon\n```\n### Android\nNative setup.\n~~~md\n## Also not a section\n~~~");
  });
  test("public guide links resolve to public onboarding and local versioned anchors", () => {
    const mapped = publicGuideLinks("[Platforms](#platforms), [starter](./examples/starter/README.md), [terms](#license).", "4.1.0");
    expect(mapped).toContain("https://canvas.nannier.com/ai/4.1.0/installation.md#platforms");
    expect(mapped).toContain("https://canvas.nannier.com/agents.md#start-a-project-with-an-available-cli");
    expect(mapped).toContain("https://canvas.nannier.com/agents.md#package-and-source-terms");
    expect(mapped.includes("github.com")).toBe(false);
    expect(() => publicGuideLinks("[Private](https://github.com/bnannier/canvas/blob/main/README.md)", "4.1.0")).toThrow("No public guide mapping");
    expect(() => publicGuideLinks("[Unknown](./private.md)", "4.1.0")).toThrow("No public guide mapping");
  });
  test("version changes refresh the maintained agents entry guide and global drift target", () => {
    const template = readFileSync(new URL("./agents.md", import.meta.url), "utf8");
    const previous = renderAgents(template, "4.0.0");
    const next = renderAgents(template, "4.1.0");
    expect(next).toContain("Repository package version: 4.1.0");
    expect(next).toContain("/ai/4.1.0/index.md");
    expect(next).not.toContain("/ai/4.0.0/");
    expect(next).toContain("published `4.0.0` package does **not** include the CLI");
    expect(next).toContain("## Package and source terms");
    expect(next).not.toContain("{{VERSION}}");
    expect(GLOBAL_OUTPUTS).toContain("agents.md");
    expect(snapshotWrites("4.1.0", new Map([["agents.md", next]]), new Map([["agents.md", previous]]))).toEqual(["agents.md"]);
    expect(() => renderAgents("{{UNKNOWN}}", "4.1.0")).toThrow("Unresolved");
  });
});

describe("versioned output safety", () => {
  test("drift identifies missing, stale and orphaned current files without touching prior snapshots", () => {
    const existing = new Map([["ai/4.0.0/index.md", "archive"], ["ai/4.0.1/index.md", "old"], ["ai/4.0.1/orphan.md", "orphan"], ["llms.txt", "old"]]);
    const outputs = new Map([["ai/4.0.1/index.md", "new"], ["ai/4.0.1/catalog.json", "{}"], ["llms.txt", "new"]]);
    expect(snapshotWrites("4.0.1", outputs, existing)).toEqual(["ai/4.0.1/catalog.json", "ai/4.0.1/index.md", "ai/4.0.1/orphan.md", "llms.txt"]);
    expect(existing.get("ai/4.0.0/index.md")).toBe("archive");
    expect(existing.get("ai/4.0.1/index.md")).toBe("old");
    expect(snapshotWrites("4.0.1", outputs, outputs)).toEqual([]);
  });
  test("refuses cross-version writes, path traversal and mutation of a sealed snapshot", () => {
    expect(() => snapshotWrites("4.0.1", new Map([["ai/4.0.0/index.md", "changed"]]), new Map())).toThrow("another snapshot");
    expect(() => snapshotWrites("../oops", new Map(), new Map())).toThrow("Unsafe package version");
    const manifest = { schemaVersion: 1, package: "@nannier/canvas", version: "4.0.0", status: "source-snapshot", sourceHash: "hash", sources: {}, files: {} };
    const existing = new Map([["ai/4.0.0/manifest.json", json({ ...manifest, sealed: true })], ["ai/4.0.0/index.md", "frozen"]]);
    const same = new Map([["ai/4.0.0/manifest.json", json(manifest)], ["ai/4.0.0/index.md", "frozen"]]);
    expect(snapshotWrites("4.0.0", same, existing)).toEqual([]);
    expect(() => snapshotWrites("4.0.0", new Map([...same, ["ai/4.0.0/index.md", "changed"]]), existing)).toThrow("sealed");
  });
  test("validates archives and rejects missing, changed, extra or unsafe archived content", () => {
    const manifest = { schemaVersion: 1, version: "4.0.0", status: "source-snapshot", sourceHash: sha256(json({})), sources: {}, files: { "index.md": sha256("archive") } };
    const existing = new Map([["ai/4.0.0/manifest.json", json(manifest)], ["ai/4.0.0/index.md", "archive"]]);
    expect(() => validateArchives("4.0.1", existing)).not.toThrow();
    expect(() => validateArchives("4.0.1", new Map([["ai/4.0.0/manifest.json", json(manifest)]]))).toThrow("missing");
    expect(() => validateArchives("4.0.1", new Map([...existing, ["ai/4.0.0/index.md", "tampered"]]))).toThrow("changed");
    expect(() => validateArchives("4.0.1", new Map([...existing, ["ai/4.0.0/extra.md", "unlisted"]]))).toThrow("Unexpected");
    expect(() => validateArchives("4.0.1", new Map([["ai/4.0.0/manifest.json", json({ ...manifest, files: { "../outside": sha256("value") } })]]))).toThrow("Unsafe");
  });
});

test("real source snapshot resolves public API, complete props, links and hashes deterministically", () => {
  const first = generate();
  const second = generate();
  expect([...second].map(([file, content]) => [file, sha256(content)])).toEqual([...first].map(([file, content]) => [file, sha256(content)]));
  const catalogPath = [...first.keys()].find((file) => file.endsWith("/catalog.json"))!;
  const prefix = catalogPath.slice(0, -"catalog.json".length);
  const catalog = JSON.parse(first.get(catalogPath)!);
  const manifest = JSON.parse(first.get(`${prefix}manifest.json`)!);
  expect(catalog.status).toBe("source-snapshot");
  expect(catalog.package).toBe("@nannier/canvas");
  expect(catalog.sourceHash).toBe(sha256(json(manifest.sources)));
  expect(catalog.components.length).toBeGreaterThan(90);
  const button = catalog.components.find((item: { slug: string }) => item.slug === "button");
  expect(button.exports).toContain("Button");
  expect(button.exports).not.toContain("createButton");
  expect(button.propGroups.find((group: { name: string }) => group.name === "ButtonProps").props.map((prop: { name: string }) => prop.name)).toContain("onPress");
  const icon = catalog.components.find((item: { slug: string }) => item.slug === "icon");
  const iconProps = icon.propGroups.flatMap((group: { props: { name: string }[] }) => group.props.map((prop) => prop.name));
  expect(iconProps).toContain("arrowUpRight");
  expect(iconProps).not.toContain("color");
  for (const slug of ["view", "text", "text-input", "scroll-view"]) expect(catalog.components.find((item: { slug: string }) => item.slug === slug).propGroups[0].props.length).toBeGreaterThan(10);
  for (const [file, hash] of Object.entries(manifest.files)) expect(sha256(first.get(prefix + file)!)).toBe(hash);
  for (const file of GLOBAL_OUTPUTS) expect(manifest.globalFiles[file]).toBe(sha256(first.get(file)!));
  expect(manifest.sources["tools/agent-docs/agents.md"]).toBe(sha256(readFileSync(new URL("./agents.md", import.meta.url), "utf8")));
  const installation = first.get(`${prefix}installation.md`)!;
  expect(installation).toContain("### Android capture module");
  expect(installation).toContain("npm install react-native-qrcode-svg expo-video");
  expect(installation).toContain("#package-and-source-terms");
  for (const [file, content] of first) if (file.endsWith(".md") || file.endsWith(".txt")) expect(/\]\(https:\/\/github\.com\/bnannier\/canvas(?:\/|#|\))/.test(content)).toBe(false);
  for (const component of catalog.components) {
    expect(first.has(component.url.replace("https://canvas.nannier.com/", ""))).toBe(true);
    for (const name of component.exports) expect(catalog.exports.some((item: { name: string }) => item.name === name)).toBe(true);
    for (const group of component.propGroups) {
      const props = group.props.map((prop: { name: string }) => prop.name);
      expect(new Set(props).size).toBe(props.length);
      for (const prop of group.props) if (prop.group !== undefined) expect(prop.group < group.groups.length).toBe(true);
    }
  }
  // Every generated Markdown/JSON link resolves within this source snapshot.
  for (const content of first.values()) for (const link of content.matchAll(/https:\/\/canvas\.nannier\.com\/(ai\/[^\s)"<>]+\.(?:md|json))/g)) expect(first.has(link[1])).toBe(true);
  expect(first.get("llms.txt")).toContain("not proof of an npm release");
  expect([...first.values()].some((content) => content.includes("/Users/"))).toBe(false);
}, 20_000);
