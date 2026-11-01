// Package a small runnable recipe scaffold from its tested source, without
// dependencies, lockfiles, test results or generated native projects.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const entries = ["App.tsx", "app.config.js", "babel.config.js", "package.json", "recipe-config.json", "tsconfig.json", "src"];

export function recipeFiles(repository) {
  const source = path.join(repository, "examples/recipes");
  const files = {};
  const visit = (relative) => {
    const file = path.join(source, relative);
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) throw new Error(`Recipe source must not be linked: ${relative}`);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(file).sort()) visit(path.posix.join(relative, name));
    } else if (stat.isFile()) files[relative] = fs.readFileSync(file);
    else throw new Error(`Unexpected recipe asset: ${relative}`);
  };
  for (const entry of entries) visit(entry);
  // The repository's example is not licensed for reuse. The files delivered in
  // the existing npm distribution carry its package LICENSE, copied by the CLI.
  const manifest = JSON.parse(files["package.json"].toString());
  manifest.license = "MIT";
  files["package.json"] = Buffer.from(JSON.stringify(manifest, null, 2) + "\n");
  // npm treats .gitignore specially; name the asset explicitly, and rename it
  // only when the CLI creates the consumer project.
  files["gitignore"] = Buffer.from("node_modules/\n.expo/\ndist/\nios/\nandroid/\n.env*\n!.env.example\n");
  files["README.md"] = Buffer.from(`# Canvas application recipes

This app was created from the Canvas npm package. Its included LICENSE applies to
these distributed files; it does not license the Canvas source repository.

Run \`bun install\`, then \`bun run web\`. Run \`bun run typecheck\` and
\`bun run build:web\` before shipping changes. Commit the generated lockfile.
The scaffold pins upstream Expo Modules fixes through package-manager overrides.
Keep those overrides and the SDK's React and React Native versions together.

\`bun run ios\` and \`bun run android\` build locally. iOS needs compatible Xcode
and CocoaPods. Android needs the Android SDK and JDK 17; set JAVA_HOME accordingly.
No EAS account or backend is configured. Each application uses session state;
reloading resets data, and booking confirms only a local demonstration reservation.
Before distributing your app, choose your own name and native bundle identifiers
in \`app.config.js\`.

The navigation opens Settings, Dashboard and Booking. \`recipe-config.json\`
chooses the initial screen. All recipes share the same React Native component tree
on iOS, Android and web. Replace the sample data and connect persistence/services
for your product; the UI does not make real reservations or send email.

Use \`npx --no-install canvas docs --list\` for the installed package's API catalog,
\`npx --no-install canvas doctor\` for required-peer diagnostics, and
\`npx --no-install canvas skills install --client both\` for project-local guidance.
`);
  return Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)));
}

export function generateRecipes(repository, check = false) {
  const destination = path.join(repository, "consumer/recipes");
  const files = recipeFiles(repository);
  const digest = createHash("sha256");
  for (const [name, bytes] of Object.entries(files)) digest.update(name).update("\0").update(bytes).update("\0");
  const sourceHash = digest.digest("hex");
  const existing = [];
  const visit = (directory, prefix = "") => {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const relative = path.posix.join(prefix, entry.name);
      if (entry.isDirectory()) visit(path.join(directory, entry.name), relative);
      else existing.push(relative);
    }
  };
  visit(destination);
  const stale = Object.entries(files).filter(([name, bytes]) => {
    const target = path.join(destination, name);
    return !fs.existsSync(target) || !fs.readFileSync(target).equals(bytes);
  }).map(([name]) => name);
  const extra = existing.filter((name) => !(name in files));
  if (check) {
    if (stale.length || extra.length) throw new Error(`Consumer scaffold drift: ${[...stale, ...extra].join(", ")}; run bun run consumer:gen`);
  } else {
    for (const name of extra) fs.rmSync(path.join(destination, name));
    for (const [name, bytes] of Object.entries(files)) {
      const target = path.join(destination, name);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, bytes);
    }
  }
  return { files: Object.keys(files).length, sourceHash };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = generateRecipes(root, process.argv.includes("--check"));
  console.log(`consumer: ${result.files} recipe files ${process.argv.includes("--check") ? "checked" : "generated"}, ${result.sourceHash}`);
}
