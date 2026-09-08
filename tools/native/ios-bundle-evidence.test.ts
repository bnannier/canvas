import { afterEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { classifyTestingLayout, observeIosBundleEvidence, parseHermesHeader, sourceBinding } from "./ios-bundle-evidence.mjs";

const require = createRequire(import.meta.url);
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const temporary: string[] = [];
const directory = () => { const p = fs.mkdtempSync(path.join(os.tmpdir(), "canvas-ios-bundle-test-")); temporary.push(p); return p; };
afterEach(() => { for (const p of temporary.splice(0)) fs.rmSync(p, { recursive: true, force: true }); });
const module = (body: string, id = 10, deps = "[20,30,40]") => `__d(function(g,r,i,a,m,e,d){${body}},${id},${deps});`;
const router = module('Object.defineProperty(e,"Stack",{get(){return S;}});Object.defineProperty(e,"Redirect",{get(){return R;}});', 20, "[]");
const imports = 'var route=r(d[0]), theme=r(d[1]), runtime=r(d[2]);';
const component = (body = 'var t=theme.useTheme();return (0,runtime.jsx)(route.Stack,{screenOptions:{headerShown:false}});') => module(`${imports}function TestingLayout(){${body}}`);
const classify = (source: string) => classifyTestingLayout(source, parser, traverse);
// The native build runner is Node. Exercise the actual child-process boundary in Node,
// avoiding Bun's separate child_process implementation and its inherited-stdin differences.
const observeHeader = (command: string, args: string[], limits = {}) => {
  const module = new URL("./ios-bundle-evidence.mjs", import.meta.url).href;
  const code = `import {observeHeader} from ${JSON.stringify(module)};console.log(JSON.stringify(await observeHeader(${JSON.stringify(command)},${JSON.stringify(args)},${JSON.stringify(limits)})));`;
  const child = spawnSync("node", ["--input-type=module", "-e", code], { encoding: "utf8", timeout: 3000 });
  expect(child.error).toBeUndefined(); expect(child.status).toBe(0);
  return JSON.parse(child.stdout);
};
const sha = "1234567890abcdef1234567890abcdef12345678";
const header = `Bytecode File Information:\n  Bytecode version number: 98\n  Source hash: ${sha}\n`;

describe("compiled TestingLayout observation", () => {
  test("resolves actual lexical require bindings and dependency IDs, preserving bounded AST excerpts", () => {
    const source = component() + router;
    const result = classify(source);
    expect(result.classification).toBe("smoke-enabled");
    expect(result.component).toMatchObject({ index: 0, moduleId: 20, localBinding: "route", member: "Stack" });
    expect(result.jsxRuntime).toMatchObject({ index: 2, moduleId: 40, member: "jsx" });
    expect(result.dependency.matchesRouterExportShape).toBe(true);
    expect(result.candidates[0].module.text).toBe(component().slice(0, -1));
    expect(source.slice(result.candidates[0].function.start, result.candidates[0].function.end)).toBe(result.candidates[0].function.text);
    expect(classify(source.replaceAll("route", "renamed").replaceAll("runtime", "another").replaceAll("d[", "dependencies[").replaceAll(",d)", ",dependencies)")).classification).toBe("smoke-enabled");
  });
  test("recognizes only the exact unconditional home Redirect", () => {
    expect(classify(component('return runtime.jsx(route.Redirect,{href:"/"});') + router).classification).toBe("redirect");
    expect(classify(component('return runtime.jsx(route.Redirect,{href:"/other"});') + router).classification).toBe("unclassified");
    expect(classify(component('return runtime.jsx(route.Redirect,{href:"/",href:"/other"});') + router).classification).toBe("unclassified");
  });
  test("records unfolded literal conditions without interpreting a branch as executed", () => {
    const result = classify(component('if("1"!=="1"){return runtime.jsx(route.Redirect,{href:"/"});}else{return runtime.jsx(route.Stack,{});}') + router);
    expect(result.classification).toBe("unfolded");
    expect(result.condition).toEqual({ operator: "!==", left: "1", right: "1" });
    expect(classify(component('if(flag)return runtime.jsx(route.Redirect,{href:"/"});return runtime.jsx(route.Stack,{});') + router).classification).toBe("unclassified");
    expect(classify(component('var ignored=flag?one:two;return runtime.jsx(route.Stack,{});') + router).classification).toBe("unclassified");
  });
  test("does not infer identity from familiar variable names or a nested fake function", () => {
    expect(classify(component().replace('route=r(d[0])', 'route=pretend') + router).classification).toBe("unclassified");
    expect(classify(component('var route={Stack:fake};return runtime.jsx(route.Stack,{});') + router).classification).toBe("unclassified");
    expect(classify(module(`${imports}function outer(){function TestingLayout(){return runtime.jsx(route.Stack,{});}}`) + router).classification).toBe("unclassified");
    expect(classify(component() + router.replaceAll('"Redirect"', '"Unrelated"')).classification).toBe("unclassified");
  });
  test("rejects reassigned require, dependency arrays and returned bindings", () => {
    for (const mutation of ['route={Stack:fake};', 'route.Stack=fake;', 'r=fake;', 'd[0]=99;']) {
      expect(classify(component().replace('function TestingLayout()', `${mutation}function TestingLayout()`) + router).classification).toBe("unclassified");
    }
    expect(classify(component('var r=fake;var route=r(d[0]);return runtime.jsx(route.Stack,{});') + router).classification).toBe("unclassified");
  });
  test("unknown JSX/props/module forms remain unclassified", () => {
    for (const body of ['return runtime.createElement(route.Stack,{});', 'return runtime.jsx(route.Stack,props);',
      'return runtime.jsx(route.Stack,{...props});', 'run();return runtime.jsx(route.Stack,{});', 'return runtime.jsx(route.Stack,{});return other;']) {
      expect(classify(component(body) + router).classification).toBe("unclassified");
    }
    expect(classify(component().replace('[20,30,40]', '[20,,40]') + router).classification).toBe("unclassified");
    expect(classify(component() + router + router).classification).toBe("unclassified");
  });
  test("parses complete bundles without mistaking nested delimiters or strings for modules", () => {
    const source = component('var label="__d(function(){ },99,[]);";return runtime.jsx(route.Stack,{text:label});') + router;
    expect(classify(source).classification).toBe("smoke-enabled");
    expect(classify(source).topLevelModules).toBe(2);
    expect(classify(source + '\n__d(broken').classification).toBe("unclassified");
  });
  test("missing/minified and duplicate candidates are explicit", () => {
    expect(classify(router).classification).toBe("unavailable");
    expect(classify(component().replaceAll('TestingLayout', 'T') + router).classification).toBe("unavailable");
    expect(classify(component() + component().replace('},10,', '},11,') + router).classification).toBe("ambiguous");
    expect(classify(module(`${imports}function TestingLayout(){} function nested(){function TestingLayout(){}}`) + router).classification).toBe("ambiguous");
  });
  test("follows the installed Expo TypeScript barrel helpers by full AST and bindings", () => {
    // Preserved Expo Router 57 module590 shape, including the actual helper fallbacks.
    const barrel = `__d(function(global,require,importDefault,importAll,module,exports,_dependencyMap){
      var __createBinding = this && this.__createBinding || (Object.create ? function(o,m,k,k2){
        if(k2===undefined)k2=k;
        var desc=Object.getOwnPropertyDescriptor(m,k);
        if(!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)){
          desc={enumerable:true,get:function(){return m[k];}};
        }
        Object.defineProperty(o,k2,desc);
      }:function(o,m,k,k2){if(k2===undefined)k2=k;o[k2]=m[k];});
      var __exportStar=this && this.__exportStar || function(m,exports){
        for(var p in m)if(p!=="default" && !Object.prototype.hasOwnProperty.call(exports,p))__createBinding(exports,m,p);
      };
      Object.defineProperty(exports,"__esModule",{value:true});
      require(_dependencyMap[0]);
      __exportStar(require(_dependencyMap[1]),exports);
      __exportStar(require(_dependencyMap[2]),exports);
      __exportStar(require(_dependencyMap[3]),exports);
      __exportStar(require(_dependencyMap[4]),exports);
    },590,[591,592,1082,1084,1086]);`;
    const rest = component().replace('[20,30,40]', '[590,30,40]')
      + module('Object.defineProperty(e,"Redirect",{get(){return R;}});', 592, '[]')
      + module('Object.defineProperty(e,"Stack",{get(){return S;}});', 1082, '[]')
      + module('', 1084, '[]') + module('', 1086, '[]');
    const result = classify(rest + barrel);
    expect(result.classification).toBe('smoke-enabled');
    expect(result.dependency.forwarding).toContainEqual({ ownerModuleId: 590, index: 2, moduleId: 1082, helperShape: 'typescript-export-star-and-create-binding' });
    expect(result.dependency.incomplete).toBe(false);
    // A familiar helper name alone is insufficient. Changing its actual operation fails closed.
    expect(classify(rest + barrel.replace('return m[k];', 'return "fake";')).classification).toBe('unclassified');
    expect(classify(rest + barrel.replace('p!=="default"', 'p==="default"')).classification).toBe('unclassified');
    expect(classify(rest + barrel.replace('require(_dependencyMap[2]),exports', 'require(_dependencyMap[2]),other')).classification).toBe('unclassified');
    expect(classify(rest + barrel.replace('var __createBinding', 'var Object = fake; var __createBinding')).classification).toBe('unclassified');
  });
  test("reassigning the exports parameter cannot supply router export evidence", () => {
    const result = classify(component() + module('e={};e.Stack=1;e.Redirect=2;', 20, '[]'));
    expect(result.classification).toBe('unclassified');
    expect(result.reason).toBe('dependency-export-shape-unconfirmed');
    expect(result.dependency.matchesRouterExportShape).toBe(false);
    expect(result.dependency.incomplete).toBe(true);
  });
  test("keeps route table links as supporting evidence with dependency indices", () => {
    const routes = module('Object.defineProperties(routes,{"./testing/_layout.tsx":{enumerable:true,get(){return r(d[0]);}},"./testing/escape-layers.tsx":{get(){return r(d[1]);}}});', 50, '[10,60]');
    expect(classify(component() + router + routes).routeTable).toEqual({ evidenceOnly: true, entries: [
      { route: "./testing/_layout.tsx", ownerModuleId: 50, index: 0, moduleId: 10 },
      { route: "./testing/escape-layers.tsx", ownerModuleId: 50, index: 1, moduleId: 60 },
    ] });
  });
});

describe("bounded official decoder observation", () => {
  test("requires exactly one version and forty-hex source hash", () => {
    expect(parseHermesHeader(header)).toEqual({ status: "available", bytecodeVersion: 98, sourceSha1: sha });
    for (const bad of [header.replace(sha, 'abc'), header.replace('Source hash', 'Other hash'), header + header]) expect(parseHermesHeader(bad).status).toBe("unavailable");
  });
  test("intentionally terminates only its owned decoder after the retained header", async () => {
    const output = header + Array.from({ length: 30 }, (_, i) => `field${i}: 0\n`).join('');
    const result = await observeHeader('node', ['-e', `process.stdout.write(${JSON.stringify(output)});setInterval(()=>{},1000)`]);
    expect(result.status).toBe("available");
    expect(result.intentionalTermination).toBe(true);
    expect(result.stopReason).toBe("header-lines");
    expect(result.stdout.split('\n')).toHaveLength(13);
    expect(result.header.sourceSha1).toBe(sha);
    expect(result.signal).toBe("SIGTERM");
  });
  test("preserves genuine errors separately from observation timeout and spawn failure", async () => {
    const failed = await observeHeader('node', ['-e', 'process.stderr.write("bad bytecode");process.exit(7)']);
    expect(failed.status).toBe("failed"); expect(failed.exitCode).toBe(7); expect(failed.stderr).toBe("bad bytecode");
    const timed = await observeHeader('node', ['-e', 'setInterval(()=>{},1000)'], { decoderMs: 100 });
    expect(timed.status).toBe("unavailable"); expect(timed.stopReason).toBe("timeout"); expect(timed.intentionalTermination).toBe(false);
    const missing = await observeHeader('/nonexistent-canvas-decoder', []);
    expect(missing.status).toBe("unavailable"); expect(missing.spawnError.reason).toBe("ENOENT");
  });
  test("bounds unterminated stdout and stderr instead of retaining disassembly", async () => {
    const out = await observeHeader('node', ['-e', 'process.stdout.write("x".repeat(200000));setInterval(()=>{},1000)'], { headerBytes: 128 });
    expect(out.stdout.length).toBe(128); expect(out.stopReason).toBe("stdout-limit"); expect(out.status).toBe("unavailable");
    const err = await observeHeader('node', ['-e', 'process.stderr.write("x".repeat(200000));setInterval(()=>{},1000)'], { stderrBytes: 128 });
    expect(err.stderr.length).toBe(128); expect(err.stderrTruncated).toBe(true); expect(err.status).toBe("unavailable");
  });
  test("a mismatch, genuine decoder error or changed input can never become bound", () => {
    const plain = { status: "available", sha1: sha }, embedded = { status: "available", sha256: 'embedded' };
    const decoder = { status: "available", header: parseHermesHeader(header) };
    expect(sourceBinding(plain, embedded, decoder, "unchanged").status).toBe("bound");
    expect(sourceBinding({ ...plain, sha1: 'different' }, embedded, decoder, "unchanged").status).toBe("mismatch");
    expect(sourceBinding(plain, embedded, { ...decoder, status: "failed" }, "unchanged").status).toBe("unavailable");
    expect(sourceBinding(plain, embedded, decoder, "changed").status).toBe("unavailable");
  });
});

test("best-effort wrapper retains exact inputs and a failure report when the observer cannot finish", () => {
  const root = directory(), binary = path.join(root, 'Products', 'Sample.app');
  fs.mkdirSync(binary, { recursive: true });
  fs.writeFileSync(path.join(root, 'Products/main.jsbundle'), 'plain original');
  fs.writeFileSync(path.join(binary, 'main.jsbundle'), 'embedded original');
  const output = path.join(root, 'evidence');
  const result = observeIosBundleEvidence({ app: root, binary, output, identity: { candidateRevision: 'candidate' }, smokeFlag: '1', identityProvided: true }, { timeoutMs: 1 });
  expect(result.status).toBe("unavailable"); expect(result.binding).toBe("unavailable");
  const report = JSON.parse(fs.readFileSync(path.join(output, 'report.json'), 'utf8'));
  expect(report.inputs.plain.sha1).toBe(createHash('sha1').update('plain original').digest('hex'));
  expect(report.preservation.plain).toEqual({ original: 'unchanged', retained: 'unchanged' });
  expect(report.preservation.embedded).toEqual({ original: 'unchanged', retained: 'unchanged' });
  expect(report.runnerEnvironment).toEqual({ smokeFlag: '1', identityProvided: true, scriptPhaseInheritance: 'unobserved' });
  const oldReport = fs.readFileSync(path.join(output, 'report.json'));
  expect(observeIosBundleEvidence({ app: root, binary, output, identity: {}, smokeFlag: '1', identityProvided: true }).status).toBe('unavailable');
  expect(fs.readFileSync(path.join(output, 'report.json'))).toEqual(oldReport);
});

test("missing/symlink inputs produce explicit evidence without following the symlink or throwing", () => {
  const root = directory(), binary = path.join(root, 'Products', 'Sample.app');
  fs.mkdirSync(binary, { recursive: true });
  const preserved = path.join(root, 'preserved'); fs.writeFileSync(preserved, 'do not follow');
  fs.symlinkSync(preserved, path.join(root, 'Products/main.jsbundle'));
  const output = path.join(root, 'evidence');
  const result = observeIosBundleEvidence({ app: root, binary, output, identity: {}, smokeFlag: undefined, identityProvided: false });
  const report = JSON.parse(fs.readFileSync(result.path!, 'utf8'));
  expect(report.inputs.plain.status).toBe('unavailable'); expect(report.inputs.embedded.status).toBe('unavailable');
  expect(fs.existsSync(path.join(output, 'plain.jsbundle'))).toBe(false);
  expect(fs.readFileSync(preserved, 'utf8')).toBe('do not follow');
});
