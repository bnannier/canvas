// Passive build evidence. No compilation, route execution, environment evaluation or device access.
import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const SELF = fileURLToPath(import.meta.url);
export const LIMITS = Object.freeze({ bundle: 64 * 1024 * 1024, config: 1024 * 1024, excerpt: 16384,
  headerLines: 12, headerBytes: 8192, stderrBytes: 8192, decoderMs: 5000, observerMs: 20000 });
const hash = (bytes, algorithm = "sha256") => createHash(algorithm).update(bytes).digest("hex");
const unavailable = (error) => ({ status: "unavailable", reason: String(error?.code ?? error?.message ?? error).slice(0, 2048) });
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", { flag: "wx" });
function readFile(file, limit = LIMITS.bundle) {
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const before = fs.fstatSync(fd);
    if (!before.isFile() || before.size > limit) throw new Error("Not a bounded regular file");
    const bytes = fs.readFileSync(fd);
    const after = fs.fstatSync(fd);
    if (bytes.length > limit || before.size !== after.size || before.mtimeMs !== after.mtimeMs) throw new Error("Input changed while reading");
    return { bytes, evidence: { status: "available", path: path.resolve(file), size: bytes.length, sha256: hash(bytes), sha1: hash(bytes, "sha1") } };
  } finally { fs.closeSync(fd); }
}
function capture(file, copy, limit) {
  try {
    const { bytes, evidence } = readFile(file, limit);
    if (copy) fs.writeFileSync(copy, bytes, { flag: "wx" });
    return { ...evidence, ...(copy ? { retained: copy } : {}) };
  } catch (error) { return { ...unavailable(error), path: file }; }
}
const literal = (n) => ["StringLiteral", "NumericLiteral", "BooleanLiteral", "NullLiteral"].includes(n?.type);
const value = (n) => n?.type === "NullLiteral" ? null : n?.value;
const property = (n) => !n?.computed && n?.property?.type === "Identifier" ? n.property.name
  : n?.computed && n.property?.type === "StringLiteral" ? n.property.value : null;
const key = (n) => !n.computed && n.key?.type === "Identifier" ? n.key.name : n.key?.type === "StringLiteral" ? n.key.value : null;
function excerpt(source, node) {
  const text = source.slice(node.start, node.end);
  return { start: node.start, end: node.end, sha256: hash(text), text: text.slice(0, LIMITS.excerpt), truncated: text.length > LIMITS.excerpt };
}
function unwrapCallee(p) {
  if (p.isSequenceExpression() && p.node.expressions.length === 2 && p.node.expressions[0].type === "NumericLiteral" && p.node.expressions[0].value === 0) return p.get("expressions.1");
  return p;
}
function safeReferences(binding) {
  return binding?.constant && binding.referencePaths.every((p) => {
    const parent = p.parentPath;
    if (!parent.isMemberExpression() || parent.node.object !== p.node) return false;
    const use = parent.parentPath;
    return !(use.isAssignmentExpression() && use.node.left === parent.node)
      && !use.isUpdateExpression() && !use.isUnaryExpression({ operator: "delete" });
  });
}
function requireDependency(call, module) {
  if (!call?.isCallExpression() || call.node.arguments.length !== 1) return null;
  const callee = call.get("callee");
  const argument = call.get("arguments.0");
  if (!callee.isIdentifier() || callee.scope.getBinding(callee.node.name) !== module.factory.scope.getBinding(module.parameters[1])) return null;
  if (!callee.scope.getBinding(callee.node.name)?.constant || !argument.isMemberExpression() || !argument.node.computed) return null;
  const object = argument.get("object"), index = argument.node.property;
  if (!object.isIdentifier() || object.scope.getBinding(object.node.name) !== module.factory.scope.getBinding(module.parameters[6])
    || !safeReferences(object.scope.getBinding(object.node.name)) || index.type !== "NumericLiteral" || !Number.isInteger(index.value) || index.value < 0) return null;
  const dependency = module.dependencies[index.value];
  return dependency === undefined ? null : { index: index.value, moduleId: dependency };
}
function memberDependency(member, module) {
  if (!member?.isMemberExpression() || !property(member.node)) return null;
  const object = member.get("object");
  if (!object.isIdentifier()) return null;
  const binding = object.scope.getBinding(object.node.name);
  if (!safeReferences(binding) || !binding.path.isVariableDeclarator() || binding.scope !== module.factory.scope) return null;
  const dependency = requireDependency(binding.path.get("init"), module);
  return dependency && { ...dependency, localBinding: object.node.name, member: property(member.node) };
}
function directExportNames(module) {
  const names = new Set();
  module.factory.traverse({
    CallExpression(p) {
      const callee = p.node.callee;
      if (callee.type !== "MemberExpression" || callee.object.type !== "Identifier" || callee.object.name !== "Object"
        || p.scope.getBinding("Object") || property(callee) !== "defineProperty" || p.node.arguments.length !== 3) return;
      const target = p.get("arguments.0");
      if (target.isIdentifier() && target.scope.getBinding(target.node.name) === module.factory.scope.getBinding(module.parameters[5])
        && p.node.arguments[1].type === "StringLiteral") names.add(p.node.arguments[1].value);
    },
    AssignmentExpression(p) {
      const left = p.get("left");
      if (!left.isMemberExpression()) return;
      const object = left.get("object");
      if (object.isIdentifier() && object.scope.getBinding(object.node.name) === module.factory.scope.getBinding(module.parameters[5])) {
        const name = property(left.node); if (name) names.add(name);
      }
    },
  });
  return [...names].sort();
}

// These are the installed TypeScript helper shapes, not callee-name heuristics.
// Compare parsed ASTs with lexical bindings alpha-normalized; altered helpers stay unknown.
const EXPORT_HELPERS = `function template(){
  var __createBinding = this && this.__createBinding || (Object.create ? function (o,m,k,k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m,k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = {enumerable:true,get:function(){return m[k];}};
    }
    Object.defineProperty(o,k2,desc);
  } : function(o,m,k,k2){if(k2===undefined)k2=k;o[k2]=m[k];});
  var __exportStar = this && this.__exportStar || function(m,exports) {
    for(var p in m) if(p!=="default" && !Object.prototype.hasOwnProperty.call(exports,p)) __createBinding(exports,m,p);
  };
}`;
function astShape(nodePath) {
  const bindings = new Map();
  const ignored = new Set(["start", "end", "loc", "extra", "leadingComments", "innerComments", "trailingComments"]);
  function visit(p) {
    if (p.isIdentifier() && (p.isReferencedIdentifier() || p.isBindingIdentifier())) {
      const binding = p.scope.getBinding(p.node.name);
      if (binding) {
        if (!bindings.has(binding)) bindings.set(binding, bindings.size);
        return { type: "Identifier", binding: bindings.get(binding) };
      }
    }
    const result = {};
    for (const k of Object.keys(p.node).sort()) {
      if (ignored.has(k)) continue;
      const v = p.node[k];
      if (Array.isArray(v)) result[k] = v.map((n, i) => n?.type ? visit(p.get(`${k}.${i}`)) : n);
      else result[k] = v?.type ? visit(p.get(k)) : v;
    }
    return result;
  }
  return visit(nodePath);
}
function exportEvidence(module, modules, parser, traverse) {
  let expected;
  traverse(parser.parse(EXPORT_HELPERS), { FunctionDeclaration(p) {
    expected = Object.fromEntries(["__createBinding", "__exportStar"].map((name) => [name, astShape(p.scope.getBinding(name).path.get("init"))]));
    p.stop();
  } });
  const visited = new Set(), forwards = [], names = new Set();
  let incomplete = false;
  function inspect(current, depth) {
    if (!current.factory.scope.getBinding(current.parameters[5])?.constant) { incomplete = true; return; }
    if (depth > 4 || visited.size >= 32) { incomplete = true; return; }
    if (visited.has(current.id)) return;
    visited.add(current.id);
    for (const name of directExportNames(current)) names.add(name);
    for (const statement of current.factory.get("body.body")) {
      if (!statement.isExpressionStatement()) continue;
      const call = statement.get("expression");
      if (!call.isCallExpression() || call.node.arguments.length !== 2 || !call.get("callee").isIdentifier()) continue;
      const destination = call.get("arguments.1");
      if (!destination.isIdentifier() || destination.scope.getBinding(destination.node.name) !== current.factory.scope.getBinding(current.parameters[5])) continue;
      const dependency = requireDependency(call.get("arguments.0"), current);
      if (!dependency) continue;
      const binding = call.scope.getBinding(call.node.callee.name);
      if (!binding?.constant || !binding.path.isVariableDeclarator() || binding.scope !== current.factory.scope
        || !isDeepStrictEqual(astShape(binding.path.get("init")), expected.__exportStar)) { incomplete = true; continue; }
      // The validated fallback calls one bound helper. Confirm that helper's full AST too.
      const helpers = [];
      binding.path.get("init").traverse({ CallExpression(p) {
        if (p.get("callee").isIdentifier()) helpers.push(p.scope.getBinding(p.node.callee.name));
      } });
      const helper = helpers[0];
      if (helpers.length !== 1 || !helper?.constant || !helper.path.isVariableDeclarator() || helper.scope !== current.factory.scope
        || !isDeepStrictEqual(astShape(helper.path.get("init")), expected.__createBinding)) { incomplete = true; continue; }
      const targets = modules.filter((m) => m.valid && m.id === dependency.moduleId);
      forwards.push({ ownerModuleId: current.id, ...dependency, helperShape: "typescript-export-star-and-create-binding" });
      if (targets.length === 1) inspect(targets[0], depth + 1); else incomplete = true;
    }
  }
  inspect(module, 0);
  return { exports: [...names].sort(), forwarding: forwards, inspectedModuleIds: [...visited], incomplete,
    matchesRouterExportShape: names.has("Stack") && names.has("Redirect"), evidenceOnly: true };
}

// Deliberately narrow syntax recognition. Names describe compiled shapes, not module execution.
export function classifyTestingLayout(source, parser, traverse) {
  let ast;
  try { ast = parser.parse(source, { sourceType: "script" }); }
  catch (error) { return { ...unavailable(error), classification: "unclassified", reason: "full-bundle-parse-failed", detail: unavailable(error).reason }; }
  const modules = [], candidates = [], routes = [];
  traverse(ast, { Program(program) {
    for (const statement of program.get("body")) {
      if (!statement.isExpressionStatement()) continue;
      const call = statement.get("expression");
      if (!call.isCallExpression() || !call.get("callee").isIdentifier({ name: "__d" }) || call.scope.getBinding("__d")) continue;
      const factory = call.get("arguments.0");
      if (!factory?.isFunctionExpression() || factory.node.params.length !== 7 || factory.node.params.some((p) => p.type !== "Identifier")
        || new Set(factory.node.params.map((p) => p.name)).size !== 7) continue;
      const id = call.node.arguments[1], deps = call.node.arguments[2];
      const shape = call.node.arguments.length === 3 && literal(id) && ["StringLiteral", "NumericLiteral"].includes(id.type)
        && deps?.type === "ArrayExpression" && deps.elements.every((e) => ["StringLiteral", "NumericLiteral"].includes(e?.type));
      const module = { factory, call, id: shape ? value(id) : null, parameters: factory.node.params.map((p) => p.name),
        dependencies: shape ? deps.elements.map(value) : [], valid: !!shape };
      modules.push(module);
      factory.traverse({ FunctionDeclaration(p) {
        if (p.node.id?.name === "TestingLayout") candidates.push({ module, fn: p });
      } });
    }
    program.skip();
  } });
  for (const module of modules) module.factory.traverse({ ObjectProperty(p) {
    const name = key(p.node);
    if (typeof name !== "string" || !/^\.\/testing\/(?:_layout|diagnostics|escape-layers)\.[jt]sx?$/.test(name) || !p.get("value").isObjectExpression()) return;
    const getters = p.get("value.properties").filter((p) => p.isObjectMethod() && key(p.node) === "get");
    if (getters.length !== 1 || getters[0].node.body.body.length !== 1 || getters[0].node.body.body[0].type !== "ReturnStatement") return;
    const dependency = requireDependency(getters[0].get("body.body.0.argument"), module);
    if (dependency) routes.push({ route: name, ownerModuleId: module.id, ...dependency });
  } });
  const base = { status: "available", topLevelModules: modules.length, candidates: candidates.map(({ module, fn }) => ({
    moduleId: module.id, function: excerpt(source, fn.node), module: excerpt(source, module.call.node) })),
    routeTable: { evidenceOnly: true, entries: routes }, interpretation: "Compiled syntax only. Dependency export shape and route entries do not prove module identity, URL receipt or execution." };
  if (!candidates.length) return { ...base, classification: "unavailable", reason: "named-function-missing-or-minified" };
  if (candidates.length !== 1) return { ...base, classification: "ambiguous", reason: "multiple-named-functions" };
  const { module, fn } = candidates[0];
  const unknown = (reason) => ({ ...base, classification: "unclassified", reason });
  if (!module.valid || modules.filter((m) => m.id === module.id).length !== 1 || fn.parentPath !== module.factory.get("body")
    || fn.node.async || fn.node.generator || fn.node.params.length) return unknown("unsupported-module-or-function-shape");
  const statements = fn.get("body.body");
  const ifs = statements.filter((p) => p.isIfStatement());
  if (ifs.length === 1 && statements.every((p) => p.isVariableDeclaration() || p === ifs[0])) {
    const test = ifs[0].node.test;
    if (test.type === "BinaryExpression" && ["===", "!==", "==", "!="].includes(test.operator) && literal(test.left) && literal(test.right) && ifs[0].node.alternate) {
      return { ...base, classification: "unfolded", condition: { operator: test.operator, left: value(test.left), right: value(test.right) } };
    }
  }
  if (statements.length === 0 || !statements.at(-1).isReturnStatement() || statements.slice(0, -1).some((p) => !p.isVariableDeclaration())) return unknown("not-one-unconditional-return");
  let hiddenControlFlow = false;
  fn.traverse({ ConditionalExpression() { hiddenControlFlow = true; }, IfStatement() { hiddenControlFlow = true; },
    Function(p) { p.skip(); }, ReturnStatement(p) { if (p !== statements.at(-1)) hiddenControlFlow = true; } });
  if (hiddenControlFlow) return unknown("conditional-or-nested-return");
  const result = statements.at(-1).get("argument");
  if (!result.isCallExpression() || result.node.arguments.length !== 2) return unknown("unknown-return-expression");
  const runtime = memberDependency(unwrapCallee(result.get("callee")), module);
  const component = memberDependency(result.get("arguments.0"), module);
  const props = result.get("arguments.1");
  if (!runtime || !["jsx", "jsxs"].includes(runtime.member) || !component || !props.isObjectExpression()
    || props.node.properties.some((p) => p.type !== "ObjectProperty" || p.computed)) return unknown("unresolved-jsx-or-component-binding");
  const targets = modules.filter((m) => m.id === component.moduleId && m.valid);
  if (targets.length !== 1) return unknown("dependency-module-missing-or-ambiguous");
  const evidence = { component, jsxRuntime: runtime, dependency: exportEvidence(targets[0], modules, parser, traverse) };
  if (!evidence.dependency.matchesRouterExportShape) return { ...unknown("dependency-export-shape-unconfirmed"), ...evidence };
  if (component.member === "Stack") return { ...base, ...evidence, classification: "smoke-enabled" };
  const hrefs = props.node.properties.filter((p) => key(p) === "href");
  if (component.member === "Redirect" && hrefs.length === 1 && hrefs[0].value.type === "StringLiteral" && hrefs[0].value.value === "/") return { ...base, ...evidence, classification: "redirect" };
  return { ...unknown("unknown-component-or-redirect-target"), ...evidence };
}

export function parseHermesHeader(stdout) {
  const versions = [...stdout.matchAll(/^\s*Bytecode version number:\s*(\d+)\s*$/gm)];
  const hashes = [...stdout.matchAll(/^\s*Source hash:\s*([a-fA-F0-9]{40})\s*$/gm)];
  return versions.length === 1 && hashes.length === 1
    ? { status: "available", bytecodeVersion: Number(versions[0][1]), sourceSha1: hashes[0][1].toLowerCase() }
    : { status: "unavailable", reason: "unsupported-or-incomplete-decoder-header" };
}
export function observeHeader(command, args, limits = {}) {
  const policy = { ...LIMITS, ...limits };
  return new Promise((resolve) => {
    let stdout = Buffer.alloc(0), stderr = Buffer.alloc(0), stopReason = null, spawnError = null;
    let stdoutTruncated = false, stderrTruncated = false, killTimer;
    let child;
    try { child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] }); }
    catch (error) { resolve({ ...unavailable(error), command: [command, ...args], spawnError: unavailable(error), header: parseHermesHeader("") }); return; }
    const stop = (reason) => {
      if (stopReason) return;
      stopReason = reason;
      child.kill("SIGTERM");
      killTimer = setTimeout(() => child.kill("SIGKILL"), 250);
    };
    const timer = setTimeout(() => stop("timeout"), policy.decoderMs);
    child.stdout.on("data", (bytes) => {
      const combined = Buffer.concat([stdout, bytes]);
      const lines = combined.toString("utf8").split("\n");
      if (lines.length > policy.headerLines) {
        const header = Buffer.from(lines.slice(0, policy.headerLines).join("\n") + "\n");
        stdout = header.subarray(0, policy.headerBytes); stdoutTruncated = true; stop("header-lines");
      } else {
        stdout = combined.subarray(0, policy.headerBytes);
        if (combined.length > policy.headerBytes) { stdoutTruncated = true; stop("stdout-limit"); }
      }
    });
    child.stderr.on("data", (bytes) => {
      const combined = Buffer.concat([stderr, bytes]);
      stderr = combined.subarray(0, policy.stderrBytes);
      if (combined.length > policy.stderrBytes) { stderrTruncated = true; stop("stderr-limit"); }
    });
    child.once("error", (error) => { spawnError = unavailable(error); });
    child.once("close", (exitCode, signal) => {
      clearTimeout(timer); clearTimeout(killTimer);
      const intentional = stopReason === "header-lines";
      const expectedExit = exitCode === 0 || (intentional && ["SIGTERM", "SIGKILL"].includes(signal));
      resolve({ status: spawnError || (stopReason && !intentional) ? "unavailable" : expectedExit ? "available" : "failed",
        command: [command, ...args], exitCode, signal, stopReason, intentionalTermination: intentional,
        terminationDescription: intentional ? `Observer requested decoder termination after ${policy.headerLines} header lines; actual exit and signal are recorded separately` : null,
        spawnError, stdout: stdout.toString(), stderr: stderr.toString(), stdoutTruncated, stderrTruncated,
        header: parseHermesHeader(stdout.toString()) });
    });
  });
}
function packageTool(require, name) {
  const entry = require.resolve(name), metadata = require.resolve(`${name}/package.json`);
  return { name, version: JSON.parse(fs.readFileSync(metadata, "utf8")).version, entry: capture(entry), package: capture(metadata) };
}
function compareFiles(before, after) {
  return before.status === "available" && after.status === "available" ? before.sha256 === after.sha256 ? "unchanged" : "changed" : "unavailable";
}
export function sourceBinding(plain, embedded, decoder, preservation) {
  if (preservation !== "unchanged") return { status: "unavailable", reason: "input-preservation-not-established" };
  if (plain.status !== "available" || embedded.status !== "available" || decoder.status !== "available" || decoder.header?.status !== "available") return { status: "unavailable", reason: "plain-embedded-or-header-unavailable" };
  return { status: plain.sha1 === decoder.header.sourceSha1 ? "bound" : "mismatch", sourceSha1: plain.sha1,
    headerSourceSha1: decoder.header.sourceSha1, embeddedSha256: embedded.sha256,
    meaning: "Official decoder source SHA1 compared with retained pre-Hermes bytes; this does not prove runtime execution." };
}
async function worker(inputFile) {
  const record = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  const report = { ...record, observation: { startedAt: new Date().toISOString() } };
  const require = createRequire(path.join(record.app, "package.json"));
  try {
    report.parser = packageTool(require, "@babel/parser");
    report.traverse = packageTool(require, "@babel/traverse");
    report.route = record.inputs.plain.status === "available"
      ? classifyTestingLayout(readFile(record.inputs.plain.retained).bytes.toString("utf8"), require("@babel/parser"), require("@babel/traverse").default)
      : { ...unavailable("plain-bundle-missing"), classification: "unavailable" };
  } catch (error) { report.route = { ...unavailable(error), classification: "unclassified" }; }
  try {
    const packageFile = require.resolve("hermes-compiler/package.json");
    const executable = path.join(path.dirname(packageFile), "hermesc/osx-bin/hermesc");
    report.compiler = { version: JSON.parse(fs.readFileSync(packageFile, "utf8")).version, executable: capture(executable) };
    report.decoder = await observeHeader(executable, ["-b", "-dump-bytecode", record.inputs.embedded.retained]);
    fs.writeFileSync(path.join(record.output, "hermes-header.txt"), report.decoder.stdout, { flag: "wx" });
    fs.writeFileSync(path.join(record.output, "hermes-stderr.txt"), report.decoder.stderr, { flag: "wx" });
  } catch (error) { report.decoder = unavailable(error); }
  try {
    const config = JSON.parse(readFile(record.inputs.config.retained, LIMITS.config).bytes.toString("utf8"));
    report.configuration = { status: "available", scheme: config.scheme ?? null, bundleIdentifier: config.ios?.bundleIdentifier ?? null,
      canvasBuild: config.extra?.canvasBuild ?? null, identityMatches: isDeepStrictEqual(config.extra?.canvasBuild, record.identity),
      expectedSchemeMatches: config.scheme === "canvas-smoke", expectedIdentifierMatches: config.ios?.bundleIdentifier === "com.nannier.canvas.starter.smoke" };
  } catch (error) { report.configuration = unavailable(error); }
  const plist = spawnSync("/usr/bin/plutil", ["-convert", "json", "-o", "-", record.inputs.plist.retained ?? record.inputs.plist.path],
    { encoding: "utf8", timeout: 2000, maxBuffer: LIMITS.config });
  try {
    if (plist.error || plist.status !== 0) throw plist.error ?? new Error(`plutil exited ${plist.status}`);
    const config = JSON.parse(plist.stdout);
    report.plist = { status: "available", bundleIdentifier: config.CFBundleIdentifier ?? null,
      urlSchemes: (config.CFBundleURLTypes ?? []).flatMap((item) => item.CFBundleURLSchemes ?? []) };
  } catch (error) { report.plist = { ...unavailable(error), exitCode: plist.status, stderr: String(plist.stderr ?? "").slice(0, 2048) }; }
  report.observation.completedAt = new Date().toISOString();
  write(path.join(record.output, "observation.json"), report);
}

// Synchronous boundary preserves the native build API. All failures are diagnostic data.
export function observeIosBundleEvidence({ app, binary, output, identity, smokeFlag, identityProvided }, { timeoutMs = LIMITS.observerMs } = {}) {
  try {
    output = path.resolve(output);
    fs.mkdirSync(output); // Fresh evidence only, never overwrite a prior attempt.
    const locations = { plain: path.join(path.dirname(binary), "main.jsbundle"), embedded: path.join(binary, "main.jsbundle"),
      config: path.join(binary, "EXConstants.bundle/app.config"), plist: path.join(binary, "Info.plist") };
    // Copy first, before AST work or another build can reuse Products.
    const inputs = Object.fromEntries(Object.entries(locations).map(([name, file]) => [name,
      capture(file, path.join(output, { plain: "plain.jsbundle", embedded: "embedded.jsbundle", config: "app.config.json", plist: "Info.plist" }[name]),
        ["config", "plist"].includes(name) ? LIMITS.config : LIMITS.bundle)]));
    const input = { schema: 1, app: path.resolve(app), output, identity, inputs, startedAt: new Date().toISOString(), helper: capture(SELF),
      runnerEnvironment: { smokeFlag: smokeFlag ?? null, identityProvided: !!identityProvided, scriptPhaseInheritance: "unobserved" },
      limits: LIMITS, interpretation: "Best-effort build observation only; never changes native command success and does not prove navigation or the origin of a compiled branch." };
    const request = path.join(output, "request.json"); write(request, input);
    const observed = spawnSync(process.execPath, [SELF, "--observe", request], { timeout: timeoutMs, killSignal: "SIGKILL", maxBuffer: 16384, encoding: "utf8", env: { ...process.env } });
    let report;
    try { report = JSON.parse(fs.readFileSync(path.join(output, "observation.json"), "utf8")); }
    catch (error) { report = { ...input, observation: unavailable(error), route: { classification: "unavailable", reason: "observer-did-not-complete" } }; }
    report.observerProcess = { exitCode: observed.status, signal: observed.signal, error: observed.error ? unavailable(observed.error) : null,
      stdout: String(observed.stdout ?? "").slice(0, 8192), stderr: String(observed.stderr ?? "").slice(0, 8192) };
    report.after = Object.fromEntries(Object.entries(locations).map(([name, file]) => [name, capture(file)]));
    report.retained = Object.fromEntries(Object.entries(inputs).map(([name, original]) => [name,
      original.retained ? capture(original.retained) : unavailable("not-retained")]));
    report.preservation = Object.fromEntries(Object.keys(inputs).map((name) => [name, {
      original: compareFiles(inputs[name], report.after[name]), retained: compareFiles(inputs[name], report.retained[name]) }]));
    const intact = ["plain", "embedded"].every((name) => Object.values(report.preservation[name]).every((s) => s === "unchanged"));
    report.binding = sourceBinding(inputs.plain, inputs.embedded, report.decoder ?? {}, intact ? "unchanged" : "unavailable");
    const file = path.join(output, "report.json"); write(file, report);
    return { status: observed.status === 0 && !observed.error ? "observed" : "unavailable", path: file, sha256: capture(file).sha256,
      binding: report.binding.status, classification: report.route?.classification ?? "unavailable" };
  } catch (error) { return { ...unavailable(error), output }; }
}
if (process.argv[1] && path.resolve(process.argv[1]) === SELF && process.argv[2] === "--observe") {
  worker(process.argv[3]).catch((error) => { console.error(unavailable(error).reason); process.exitCode = 1; });
}
