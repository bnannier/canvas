import { afterEach, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { SourceMap } from "node:module";
import { buildWeb } from "../../scripts/build-web.ts";
import { verifySourceMaps } from "../../scripts/verify-package.ts";

const roots: string[] = [];
const root = () => { const dir = fs.mkdtempSync(path.join(os.tmpdir(), "canvas-map-test-")); roots.push(dir); return dir; };
const write = (root: string, name: string, text: string) => { const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); };
const read = (root: string, name: string) => fs.readFileSync(path.join(root, name), "utf8");
afterEach(() => { for (const dir of roots.splice(0)) fs.rmSync(dir, { recursive: true, force: true }); });

function fixture() {
  const dir = root();
  // Inherit the production emission options, including declarationMap.
  write(dir, "tsconfig.json", JSON.stringify({ extends: path.resolve(import.meta.dir, "../../tsconfig.build.json"), compilerOptions: { rootDir: "src", outDir: "dist", types: [] }, include: ["src/**/*.ts"], exclude: [] }));
  write(dir, "src/index.ts", 'export { greet } from "./greet.js";\n');
  write(dir, "src/greet.ts", 'export function greet(name: string): string {\n  return `Hello ${name}`;\n}\n');
  write(dir, "package.json", JSON.stringify({ name: "canvas-map-fixture", version: "1.0.0", files: ["dist"] }));
  return dir;
}

function expectMappings(dir: string, original: string) {
  for (const extension of ["js", "d.ts"]) {
    const generated = read(dir, `dist/greet.${extension}`);
    const reference = /sourceMappingURL=(\S+)/.exec(generated)![1];
    const map = JSON.parse(read(dir, `dist/${reference}`));
    expect(map.sourcesContent).toEqual([original]);
    const entry = new SourceMap(map).findEntry(0, generated.split("\n")[0].indexOf("greet"));
    expect(entry.originalSource).toBe("../src/greet.ts");
    expect([entry.originalLine, entry.originalColumn]).toEqual([0, original.indexOf("greet")]);
  }
}

test("web JS and declaration maps retain actual mappings in an isolated npm tarball", () => {
  const dir = fixture();
  const original = read(dir, "src/greet.ts");
  expect(buildWeb(path.join(dir, "tsconfig.json"))).toBe(true);
  expect(read(dir, "dist/index.js")).toContain('from "./greet.js"');
  expectMappings(dir, original);
  expect(verifySourceMaps(dir)).toEqual([]);
  const isolated = root();
  const pack = Bun.spawnSync(["npm", "pack", "--ignore-scripts", "--json", "--pack-destination", isolated, "--cache", path.join(isolated, "cache")], { cwd: dir });
  expect(pack.exitCode, pack.stderr.toString()).toBe(0);
  const archive = JSON.parse(pack.stdout.toString())[0].filename;
  const unpack = Bun.spawnSync(["tar", "-xzf", path.join(isolated, archive), "-C", isolated]);
  expect(unpack.exitCode, unpack.stderr.toString()).toBe(0);
  // Remove even the original fixture, preventing an accidental fallback to src/.
  fs.rmSync(dir, { recursive: true, force: true });
  const published = path.join(isolated, "package");
  expect(fs.existsSync(path.join(published, "src"))).toBe(false);
  expectMappings(published, original);
  expect(verifySourceMaps(published)).toEqual([]);
});

test("map guard rejects dangling references, invalid maps and unavailable original sources", () => {
  const dir = fixture();
  expect(buildWeb(path.join(dir, "tsconfig.json"))).toBe(true);
  fs.rmSync(path.join(dir, "dist/greet.js.map"));
  write(dir, "dist/greet.d.ts.map", "not JSON");
  const map = JSON.parse(read(dir, "dist/index.js.map"));
  delete map.sourcesContent;
  write(dir, "dist/index.js.map", JSON.stringify(map));
  const errors = verifySourceMaps(dir).join("\n");
  expect(errors).toContain("broken sourceMappingURL greet.js.map");
  expect(errors).toContain("invalid source map JSON");
  expect(errors).toContain("source ../src/index.ts must be embedded");
});

test("web watch embeds updated sources into both map kinds after subsequent edits", async () => {
  const dir = fixture();
  write(dir, "watch.ts", `import { watchWeb } from ${JSON.stringify(path.resolve(import.meta.dir, "../../scripts/build-web.ts"))};\nwatchWeb(${JSON.stringify(path.join(dir, "tsconfig.json"))});\nconsole.log("WATCH_READY");\n`);
  // Polling also works inside sandboxes where native filesystem events are absent.
  const watcher = Bun.spawn([process.execPath, path.join(dir, "watch.ts")], { stdout: "pipe", stderr: "pipe", env: { ...process.env, TSC_WATCHFILE: "DynamicPriorityPolling" } });
  let output = "";
  const consume = async (stream: ReadableStream<Uint8Array>) => {
    const decoder = new TextDecoder();
    for await (const chunk of stream) output += decoder.decode(chunk, { stream: true });
  };
  const streams = Promise.all([consume(watcher.stdout), consume(watcher.stderr)]);
  const until = async (ready: () => boolean) => {
    const deadline = Date.now() + 10_000;
    while (!ready() && Date.now() < deadline && watcher.exitCode === null) await new Promise((done) => setTimeout(done, 50));
    expect(ready(), output).toBe(true);
  };
  try {
    await until(() => output.includes("WATCH_READY"));
    const original = read(dir, "src/greet.ts").replace("name: string", "person: string").replace("${name}", "${person}");
    write(dir, "src/greet.ts", original);
    await until(() => ["js", "d.ts"].every((extension) => JSON.parse(read(dir, `dist/greet.${extension}.map`)).sourcesContent[0] === original));
    expectMappings(dir, original);
    expect(verifySourceMaps(dir)).toEqual([]);
  } finally {
    watcher.kill();
    await watcher.exited;
    await streams;
  }
}, 25_000);
