#!/usr/bin/env node
// Consumer tools ship in the existing Canvas package. No network, telemetry or
// package-manager subprocess runs here; installing dependencies remains explicit.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const moduleFile = fs.realpathSync(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(path.dirname(moduleFile), "..");
const json = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const recipes = ["settings", "dashboard", "booking"];

export function contained(root, relative) {
  const file = path.resolve(root, relative);
  if (path.isAbsolute(relative) || file === path.resolve(root) || !file.startsWith(path.resolve(root) + path.sep)) {
    throw new Error(`Path must stay inside its destination: ${relative}`);
  }
  return file;
}

function filesUnder(root, prefix = "") {
  return fs.readdirSync(path.join(root, prefix), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap((entry) => {
    const relative = path.join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Refusing a symlink in consumer assets: ${relative}`);
    if (entry.isDirectory()) return filesUnder(root, relative);
    if (!entry.isFile()) throw new Error(`Unsupported consumer asset: ${relative}`);
    return [relative];
  });
}

function assertNoSymlinkParents(destination) {
  let current = path.resolve(destination);
  for (;;) {
    try {
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`Refusing a symlink destination: ${current}`);
    } catch (error) { if (error.code !== "ENOENT") throw error; }
    const parent = path.dirname(current);
    if (parent === current) return;
    current = parent;
  }
}

/** An existing identical skill is a no-op; user-edited files are never overwritten. */
export function copyNewDirectory(source, destination, transform = (relative, bytes) => bytes, extraFiles = {}, rename = (relative) => relative) {
  assertNoSymlinkParents(destination);
  const sourceFiles = [...filesUnder(source), ...Object.keys(extraFiles)];
  const files = sourceFiles.map(rename).sort((a, b) => a.localeCompare(b));
  if (new Set(files).size !== files.length) throw new Error("Duplicate consumer asset");
  const data = sourceFiles.map((relative) => [rename(relative), Buffer.from(transform(relative, Object.hasOwn(extraFiles, relative) ? extraFiles[relative] : fs.readFileSync(contained(source, relative))))]);
  if (fs.existsSync(destination)) {
    if (fs.statSync(destination).isDirectory()) {
      const existing = filesUnder(destination).sort((a, b) => a.localeCompare(b));
      if (JSON.stringify(existing) === JSON.stringify(files) && data.every(([relative, bytes]) => fs.readFileSync(contained(destination, relative)).equals(bytes))) return "unchanged";
    }
    throw new Error(`Destination exists and differs; choose a new directory: ${destination}`);
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const temporary = path.join(path.dirname(destination), `.canvas-${randomUUID()}`);
  try {
    fs.mkdirSync(temporary);
    for (const [relative, bytes] of data) {
      const file = contained(temporary, relative);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, bytes, { flag: "wx" });
    }
    // The destination is checked again so another process's new directory is not
    // intentionally replaced. rename is atomic within this parent filesystem.
    if (fs.existsSync(destination)) throw new Error(`Destination appeared while copying: ${destination}`);
    fs.renameSync(temporary, destination);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
  return "created";
}

export function installedPackage(project) {
  try {
    const file = createRequire(path.join(project, "package.json")).resolve("@nannier/canvas/package.json");
    return { root: path.dirname(file), manifest: json(file) };
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") return null;
    throw error;
  }
}

export function docsLocation(project, root = packageRoot) {
  const tool = json(path.join(root, "package.json"));
  const installed = installedPackage(project);
  const version = installed?.manifest.version ?? tool.version;
  if (!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(version)) throw new Error("Invalid Canvas package version");
  const candidates = installed ? [installed.root, ...(version === tool.version ? [root] : [])] : [root];
  for (const candidate of candidates) {
    const directory = path.join(candidate, "docs/public/ai", version);
    const file = path.join(directory, "catalog.json");
    if (!fs.existsSync(file)) continue;
    const catalog = json(file);
    if (catalog.package !== "@nannier/canvas" || catalog.version !== version) throw new Error("Bundled documentation does not match Canvas's package identity");
    return { directory, catalog, installed: !!installed };
  }
  throw new Error(`No bundled documentation for installed Canvas ${version}. Read its dist/index.d.ts and https://canvas.nannier.com/ai/${version}/index.md; do not substitute another version's API.`);
}

function readComponent(catalog, query) {
  const normalized = query.toLowerCase();
  const exact = catalog.components.find((item) => item.slug.toLowerCase() === normalized || item.name.toLowerCase() === normalized || item.exports?.some((name) => (typeof name === "string" ? name : name.name).toLowerCase() === normalized));
  if (exact) return exact;
  const matches = catalog.components.filter((item) => `${item.name} ${item.description} ${item.slug}`.toLowerCase().includes(normalized));
  if (matches.length === 1) return matches[0];
  if (matches.length) throw new Error(`Several components match; choose one: ${matches.map((item) => item.slug).join(", ")}`);
  throw new Error(`No component matches '${query}'. Run canvas docs --list.`);
}

/** Required peer ranges currently use >=. Unknown future ranges are not guessed. */
export function satisfiesMinimum(version, range) {
  const floor = /^>=(\d+)(?:\.(\d+))?(?:\.(\d+))?$/.exec(range);
  const actual = /^(\d+)\.(\d+)\.(\d+)(?:\+[^-]+)?$/.exec(version);
  if (!floor || !actual) return null;
  for (let index = 1; index <= 3; index += 1) {
    const difference = Number(actual[index]) - Number(floor[index] ?? 0);
    if (difference) return difference > 0;
  }
  return true;
}

export function doctor(project, root = packageRoot) {
  const issues = [];
  const warnings = [];
  const tool = json(path.join(root, "package.json"));
  if (!fs.existsSync(path.join(project, "package.json"))) return { ok: false, project, toolVersion: tool.version, package: null, peers: [], issues: ["No package.json in the requested project directory."], warnings };
  const installed = installedPackage(project);
  if (!installed) return { ok: false, project, toolVersion: tool.version, package: null, peers: [], issues: ["@nannier/canvas is not installed in this project."], warnings };
  const require = createRequire(path.join(project, "package.json"));
  const peers = Object.entries(installed.manifest.peerDependencies ?? {}).map(([name, range]) => {
    const optional = installed.manifest.peerDependenciesMeta?.[name]?.optional === true;
    let version = null;
    try { version = json(require.resolve(`${name}/package.json`)).version; } catch (error) {
      if (error.code !== "MODULE_NOT_FOUND" && error.code !== "ERR_PACKAGE_PATH_NOT_EXPORTED") throw error;
    }
    const compatible = version ? satisfiesMinimum(version, range) : null;
    if (!optional && !version) issues.push(`Required peer missing or not inspectable: ${name} (${range}).`);
    else if (!optional && compatible === false) issues.push(`${name} ${version} does not satisfy ${range}.`);
    else if (!optional && compatible === null) warnings.push(`Check ${name} ${version} against ${range}; this tool does not evaluate that range.`);
    return { name, required: !optional, range, installedVersion: version, compatible };
  });
  if (fs.lstatSync(installed.root).isSymbolicLink() || fs.existsSync(path.join(installed.root, ".origin"))) warnings.push("Canvas is linked or marked as a local overlay; this is not registry provenance.");
  if (installed.manifest.version !== tool.version) warnings.push(`Tool ${tool.version} differs from installed Canvas ${installed.manifest.version}; lookups use the installed version.`);
  let docs = null;
  try { const location = docsLocation(project, root); docs = { version: location.catalog.version, status: location.catalog.status, sourceHash: location.catalog.sourceHash }; }
  catch (error) { warnings.push(error.message); }
  return { ok: issues.length === 0, project, toolVersion: tool.version, package: { name: installed.manifest.name, version: installed.manifest.version }, peers, docs, issues, warnings, limits: ["No network or package changes performed.", "This checks declared required peer minimums, not Expo SDK compatibility, bundling or runtime behavior.", "Use your package-manager lockfile to verify registry provenance; a version string is not proof."] };
}

const help = `Canvas consumer tools

  canvas docs --list                         List the bundled component catalog
  canvas docs button [--json]                 Read a component's Markdown or API record
  canvas docs installation                   Read setup, theming, layout or overlays guidance
  canvas doctor [--json]                     Inspect installed Canvas and required peers
  canvas skills install --client codex|claude|both
                                             Copy guidance into project-local skill folders
  canvas init --recipe settings|dashboard|booking --dir ./my-app
                                             Create an Expo recipe; install dependencies yourself

Use --project <directory> for an existing consumer (defaults to the current directory).
No command contacts a server or runs a package manager. Existing differing files are never overwritten.
`;

export function main(args, { cwd = process.cwd(), root = packageRoot, write = (text) => process.stdout.write(text) } = {}) {
  const positionals = [];
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (["--json", "--list", "--help"].includes(token)) options[token.slice(2)] = true;
    else if (["--project", "--client", "--recipe", "--dir"].includes(token)) {
      const value = args[++index];
      if (!value || value.startsWith("--")) throw new Error(`${token} requires a value`);
      options[token.slice(2)] = value;
    } else if (token.startsWith("--")) throw new Error(`Unknown option ${token}`);
    else positionals.push(token);
  }
  const project = path.resolve(cwd, options.project ?? ".");
  const [command, subject, extra] = positionals;
  if (options.help || !command || command === "help") { write(help); return 0; }
  if (extra) throw new Error(`Unexpected argument: ${extra}`);
  if (command === "docs") {
    const { directory, catalog } = docsLocation(project, root);
    if (options.list || !subject) {
      write(options.json ? `${JSON.stringify({ package: catalog.package, version: catalog.version, status: catalog.status, components: catalog.components.map(({ slug, name, description }) => ({ slug, name, description })) }, null, 2)}\n` : `Canvas ${catalog.version} (${catalog.status})\n${catalog.components.map(({ slug, description }) => `${slug}: ${description}`).join("\n")}\n`);
      return 0;
    }
    if (["index", "installation", "theming", "layout", "overlays"].includes(subject)) {
      if (options.json) throw new Error("Guide pages are Markdown; omit --json.");
      write(fs.readFileSync(contained(directory, `${subject}.md`), "utf8"));
    } else {
      const component = readComponent(catalog, subject);
      write(options.json ? `${JSON.stringify({ package: catalog.package, version: catalog.version, status: catalog.status, sourceHash: catalog.sourceHash, component }, null, 2)}\n` : fs.readFileSync(contained(directory, `components/${component.slug}.md`), "utf8"));
    }
    return 0;
  }
  if (command === "doctor") {
    if (subject) throw new Error("doctor takes no positional argument");
    const result = doctor(project, root);
    write(options.json ? `${JSON.stringify(result, null, 2)}\n` : `${result.ok ? "Required peer checks passed" : "Setup needs attention"}\n${[...result.issues, ...result.warnings, ...(result.limits ?? [])].map((line) => `- ${line}`).join("\n")}\n`);
    return result.ok ? 0 : 1;
  }
  if (command === "skills" && subject === "install") {
    if (!["codex", "claude", "both"].includes(options.client)) throw new Error("Choose --client codex, claude or both.");
    const clients = options.client === "both" ? ["codex", "claude"] : [options.client];
    for (const client of clients) {
      const destination = path.join(project, client === "codex" ? ".agents" : ".claude", "skills", "canvas");
      const license = path.join(root, "LICENSE");
      const status = copyNewDirectory(path.join(root, "consumer/canvas"), destination, undefined, fs.existsSync(license) ? { LICENSE: fs.readFileSync(license) } : {});
      write(`${client}: ${status} ${destination}\n`);
    }
    return 0;
  }
  if (command === "init") {
    if (subject || !options.dir || !recipes.includes(options.recipe)) throw new Error("Use canvas init --recipe settings|dashboard|booking --dir <new-directory>.");
    const destination = path.resolve(project, options.dir);
    const version = json(path.join(root, "package.json")).version;
    const license = path.join(root, "LICENSE");
    const status = copyNewDirectory(path.join(root, "consumer/recipes"), destination, (relative, bytes) => {
      if (relative === "package.json") {
        const manifest = JSON.parse(bytes.toString());
        manifest.name = path.basename(destination).toLowerCase().replace(/[^a-z0-9-]/g, "-") || "canvas-app";
        manifest.dependencies["@nannier/canvas"] = version;
        return JSON.stringify(manifest, null, 2) + "\n";
      }
      if (relative === "recipe-config.json") return JSON.stringify({ initialRecipe: options.recipe }, null, 2) + "\n";
      return bytes;
    }, fs.existsSync(license) ? { LICENSE: fs.readFileSync(license) } : {}, (relative) => relative === "gitignore" ? ".gitignore" : relative);
    write(`${status}: ${destination}\nCanvas is pinned to ${version}. In that directory, run bun install, then bun run web. Review and commit the generated lockfile. Native builds require Xcode/Android tooling; see README.md.\n`);
    return 0;
  }
  throw new Error(`Unknown command.\n${help}`);
}

// npm creates node_modules/.bin/canvas as a symlink. Compare real paths so an
// installed command runs just like direct `node consumer/cli.mjs` invocation.
if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(process.argv[1]) === moduleFile) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (error) { console.error(`canvas: ${error.message}`); process.exitCode = 1; }
}
