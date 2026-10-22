// Validate either the local build or the exact unpacked release tarball.
import * as fs from "node:fs";
import * as path from "node:path";
import ts from "typescript";

export function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

export function verifyPackage(root: string): string[] {
  const errors: string[] = [];
  const dist = path.join(root, "dist");
  const metadata = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const optionalPeers = Object.keys(metadata.peerDependencies ?? {}).filter((name) => metadata.peerDependenciesMeta?.[name]?.optional);
  const optionalPeer = (specifier: string) => optionalPeers.some((peer) => specifier === peer || specifier.startsWith(`${peer}/`));
  const entry = metadata.exports?.["."];
  if (entry?.["react-native"] !== "./dist/native/index.js" || metadata["react-native"] !== entry?.["react-native"]) {
    errors.push("Both the react-native export condition and legacy entry must select ./dist/native/index.js");
  }
  if (entry?.default !== "./dist/index.js" || entry?.types !== "./dist/index.d.ts" || metadata.main !== entry?.default || metadata.types !== entry?.types) {
    errors.push("Web ESM and public types must select dist/index.js and dist/index.d.ts");
  }
  for (const file of ["dist/index.js", "dist/index.d.ts", "dist/native/index.js"]) {
    if (!fs.existsSync(path.join(root, file))) errors.push(`${file} missing, run bun run build`);
  }
  if (!fs.existsSync(dist)) return errors;
  const files = walk(dist);
  const native = path.join(dist, "native") + path.sep;
  for (const file of files) {
    const name = path.relative(root, file);
    if (/\.tsx?$/.test(file) && !file.endsWith(".d.ts")) errors.push(`${name}: raw TypeScript must not ship`);
    if (!file.endsWith(".js") && !file.endsWith(".d.ts")) continue;
    const declaration = file.endsWith(".d.ts");
    const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true,
      declaration ? ts.ScriptKind.TS : ts.ScriptKind.JS);
    const visit = (node: ts.Node) => {
      let literal: ts.StringLiteralLike | undefined;
      let requireCall = false;
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) {
        literal = node.moduleSpecifier;
      } else if (ts.isCallExpression(node) && node.arguments.length && ts.isStringLiteralLike(node.arguments[0])) {
        requireCall = ts.isIdentifier(node.expression) && node.expression.text === "require";
        if (requireCall || node.expression.kind === ts.SyntaxKind.ImportKeyword) literal = node.arguments[0];
      }
      if (literal) {
        const specifier = literal.text;
        if (/^\.\.?\//.test(specifier)) {
          const base = path.resolve(path.dirname(file), specifier);
          const candidates = [base, `${base}.js`, `${base}.d.ts`, path.join(base, "index.js")];
          if (!candidates.some((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile())) errors.push(`${name}: unresolvable specifier ${specifier}`);
          if (file.startsWith(native) && specifier.endsWith(".js")) errors.push(`${name}: explicit .js request ${specifier} bypasses Metro platform resolution`);
        } else if (!declaration && optionalPeer(specifier)) {
          if (!requireCall) errors.push(`${name}: static/dynamic import of optional peer ${specifier}, use a guarded require`);
          else {
            // Mirror Metro's first-block rule without parsing braces in strings.
            let block: ts.Node | undefined = node.parent;
            while (block && !ts.isBlock(block)) block = block.parent;
            if (!block || !ts.isTryStatement(block.parent) || block.parent.tryBlock !== block || !block.parent.catchClause) {
              errors.push(`${name}: require(${specifier}) must be directly inside a try block with a catch`);
            }
          }
        }
      }
      if (declaration && ts.isIdentifier(node) && /^(HTMLElement|HTMLDivElement|Document|Window|MediaQueryList|CSSStyleDeclaration)$/.test(node.text)) {
        errors.push(`${name}: public declaration references DOM-only type ${node.text}`);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    if (!declaration && !file.startsWith(native)) {
      const nativeFile = path.join(native, path.relative(dist, file));
      if (!fs.existsSync(nativeFile)) errors.push(`${name}: matching native output is missing`);
    }
  }
  for (const platform of ["ios", "android"]) {
    if (!files.some((file) => file.startsWith(native) && file.endsWith(`.${platform}.js`))) errors.push(`Native output has no ${platform} forks`);
  }
  errors.push(...verifyCaptureModule(root, metadata));
  return [...new Set(errors)];
}

// Canvas's own Android capture module (android/), which Expo autolinks from the package
// root. The files allowlist must ship its sources and never its build output or tests.
const CAPTURE_FILES = ["android/build.gradle", "android/src/main", "expo-module.config.json"];
function verifyCaptureModule(root: string, metadata: { files?: string[] }): string[] {
  const errors: string[] = [];
  const read = (file: string) => {
    try { return fs.readFileSync(path.join(root, file), "utf8"); } catch { errors.push(`${file} missing`); return ""; }
  };
  const files = metadata.files ?? [];
  if (!CAPTURE_FILES.every((file) => files.includes(file)) || files.some((file) => file === "android" || file.startsWith("android/src/androidTest"))) {
    errors.push(`files must ship ${CAPTURE_FILES.join(", ")} and no other Android path`);
  }
  try {
    const config = JSON.parse(read("expo-module.config.json") || "{}");
    if (JSON.stringify(config.platforms) !== '["android"]' || JSON.stringify(config.android?.modules) !== '["io.ionize.canvas.blur.CanvasBlurModule"]') {
      errors.push("expo-module.config.json must autolink io.ionize.canvas.blur.CanvasBlurModule on Android only");
    }
  } catch { errors.push("expo-module.config.json is not JSON"); }
  if (!read("android/build.gradle").includes("namespace 'io.ionize.canvas.blur'")) errors.push("android/build.gradle has the wrong namespace");
  read("android/src/main/AndroidManifest.xml");
  if (!read("android/src/main/java/io/ionize/canvas/blur/CanvasBlurModule.kt").includes('Name("CanvasBlur")')) errors.push("Wrong native capture module name");
  if (!read("dist/native/style/glass-surface/capture-module.js").includes('"CanvasBlur"')) errors.push("Native output is missing the capture module binding");
  return errors;
}

if (import.meta.main) {
  const root = path.resolve(process.argv[2] ?? path.join(import.meta.dir, ".."));
  const errors = verifyPackage(root);
  for (const error of errors) console.error(`  ✗ ${error}`);
  console.log(errors.length ? `verify-package: ${errors.length} failure(s)` : "verify-package: web, types, native output and optional peers verified");
  process.exitCode = errors.length ? 1 : 0;
}
