// Run LAST, after the docs' SSR/font/paint-first processors. This independent
// React Native app is a single production bundle mounted solely below /recipes.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { writeSitemap } from "./sitemap.mjs";

const APP = fileURLToPath(new URL("../../examples/recipes/", import.meta.url));
const PREFIX = "/recipes";
const digest = (text) => createHash("sha256").update(text).digest("hex");
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  if (entry.isSymbolicLink()) throw new Error(`Recipe artifact must not contain symlinks: ${file}`);
  return entry.isDirectory() ? walk(file) : [file];
});

export function recipeProvenance(app = APP) {
  const dependency = JSON.parse(fs.readFileSync(path.join(app, "package.json"), "utf8")).dependencies["@nannier/canvas"];
  const packageDir = path.join(app, "node_modules/@nannier/canvas");
  if (fs.lstatSync(packageDir).isSymbolicLink()) throw new Error("Recipes must consume the installed npm distribution, not a source link");
  const installed = JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8"));
  const license = fs.readFileSync(path.join(packageDir, "LICENSE"), "utf8");
  if (!/^\d+\.\d+\.\d+$/.test(dependency) || installed.name !== "@nannier/canvas" || installed.version !== dependency || installed.license !== "MIT") {
    throw new Error("Recipes require an exact installed npm Canvas version and its MIT package license");
  }
  const lock = fs.readFileSync(path.join(app, "bun.lock"), "utf8");
  const row = lock.split("\n").find((line) => line.includes(`"@nannier/canvas": ["@nannier/canvas@${dependency}", "",`));
  const integrity = row?.match(/"(sha512-[A-Za-z0-9+/=]+)"\],?$/)?.[1];
  if (!integrity || !license.includes("MIT License") || !license.includes("source repository is not covered")) throw new Error("Missing npm lock integrity or distribution-scoped license notice");
  return { license, notice: {
    schemaVersion: 1,
    package: installed.name,
    version: installed.version,
    registryTarball: `https://registry.npmjs.org/@nannier/canvas/-/canvas-${installed.version}.tgz`,
    lockIntegrity: integrity,
    licenseFile: "LICENSE.canvas.txt",
    licenseSha256: digest(license),
    scope: "The Canvas MIT grant applies to its published npm distribution only. Recipe app and repository source remain all rights reserved.",
    behavior: "Session-only frontend demonstrations. No backend, persistence, authentication, email, payment, or real booking.",
  } };
}

// Exported separately so boundary checks can use synthetic temporary artifacts.
// No repository files, source maps, archives, or export metadata are copied.
export function stageRecipes(exportDir, docsDist, provenance) {
  const docs = path.resolve(docsDist);
  const source = path.resolve(exportDir);
  const target = path.join(docs, "recipes");
  if (source === docs || source === target || source.startsWith(target + path.sep) || target.startsWith(source + path.sep)) throw new Error("Recipe staging and docs output must be separate directories");
  if (!fs.statSync(docs).isDirectory()) throw new Error("Build the docs export before preparing recipes");
  const files = walk(source);
  const allowed = /^(?:index\.html|(?:assets|_expo\/static)\/.+\.(?:js|css|ttf|otf|woff2?|png|jpe?g|gif|webp|svg|ico))$/;
  const output = [];
  for (const file of files) {
    const relative = path.relative(source, file).split(path.sep).join("/");
    if (relative === "metadata.json" || relative === "_expo/.routes.json") continue;
    if (!allowed.test(relative)) throw new Error(`Unexpected recipe export file (source maps and source are forbidden): ${relative}`);
    const destination = relative.replaceAll("assets/node_modules/", "assets/vendor/");
    let content = fs.readFileSync(file);
    if (/\.(?:html|js|css)$/.test(relative)) {
      let text = content.toString("utf8").replaceAll("assets/node_modules/", "assets/vendor/");
      if (/sourceMappingURL\s*=|sourceURL\s*=/.test(text)) throw new Error(`Source-map reference in ${relative}`);
      if (relative === "index.html") {
        const scripts = [...text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
        if (!scripts.length || scripts.some(([, attrs, body]) => body.trim() || !/\bsrc="\/recipes\/_expo\/static\/js\/web\/[^"/]+\.js"/.test(attrs))) throw new Error("Recipe HTML must contain only /recipes production external scripts; inline scripts are forbidden");
        if (/\b(?:src|href)="\/(?!recipes\/)/.test(text)) throw new Error("Recipe HTML asset escapes /recipes");
        // Keep the actual package grant and provenance discoverable without another UI.
        text = text.replace("</head>", '<link rel="license" href="/recipes/LICENSE.canvas.txt" />\n<link rel="describedby" href="/recipes/provenance.json" type="application/json" />\n</head>');
      }
      content = Buffer.from(text);
    }
    output.push([destination, content]);
  }
  if (!output.some(([file]) => file === "index.html")) throw new Error("Recipe export has no index.html");
  // Validate everything before replacing the previously generated subdirectory.
  fs.rmSync(target, { recursive: true, force: true });
  for (const [relative, content] of output) {
    const file = path.join(target, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
  fs.writeFileSync(path.join(target, "LICENSE.canvas.txt"), provenance.license);
  fs.writeFileSync(path.join(target, "provenance.json"), JSON.stringify(provenance.notice, null, 2) + "\n");
  return { target, files: output.length + 2 };
}

export function prepareRecipes(docsDist, { app = APP } = {}) {
  const provenance = recipeProvenance(app);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "canvas-public-recipes-"));
  try {
    const exported = spawnSync(process.execPath, [path.join(app, "node_modules/expo/bin/cli"), "export", "--platform", "web", "--output-dir", temporary, "--max-workers", "2"], {
      cwd: app,
      env: { ...process.env, CI: "1", CANVAS_RECIPES_BASE_PATH: PREFIX, EXPO_NO_TELEMETRY: "1" },
      stdio: "inherit",
    });
    if (exported.error) throw exported.error;
    if (exported.status !== 0) throw new Error(`Recipe export failed (${exported.status})`);
    const result = stageRecipes(temporary, docsDist, provenance);
    writeSitemap(path.resolve(docsDist));
    console.log(`Recipes ready: ${result.files} files under ${result.target}, npm @nannier/canvas ${provenance.notice.version}; sitemap refreshed`);
    return result;
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) prepareRecipes(path.resolve(process.argv[2] ?? "docs/dist"));
