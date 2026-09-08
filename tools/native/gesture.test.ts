import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { CAROUSEL_RECORD_PREFIX, createCarouselContinuation, createCarouselMeasurementCommands, findCarouselFlowDirectory, readCarouselEvidence, validateCarouselMeasurement } from "./gesture.mjs";

const temporary: string[] = [];
afterEach(() => { for (const directory of temporary.splice(0)) rmSync(directory, { recursive: true, force: true }); });
function temp() { const directory = realpathSync(mkdtempSync(join(tmpdir(), "canvas-gesture-"))); temporary.push(directory); return directory; }
const hash = (bytes: string | Buffer) => createHash("sha256").update(bytes).digest("hex");
const expected = { nonce: "measurement-attempt-123456", candidateRevision: "a".repeat(40), packageSha256: "b".repeat(64), packageVersion: "2.62.3", platform: "android", scheme: "light" };
// Actual Android failure: the directional LEFT shortcut ended at x108,
// outside this Card's native [116,463][964,942] rectangle.
const measurement = { generation: 1, status: "ready", index: 1, page: 2, x: 44.19047546386719, y: 176.3809814453125, width: 323.047607421875, height: 182.4761962890625, screenWidth: 411.42857142857144, screenHeight: 914.2857142857143, pixelRatio: 2.625, platform: "android", rtl: false };

function evaluate(code: string, value: unknown) {
  const messages: string[] = [];
  runInNewContext(code.slice(2, -1), { maestro: { copiedText: JSON.stringify(value) }, console: { log: (message: string) => messages.push(message) } });
  return messages;
}
function record(value = measurement, identity = expected) {
  const commands = createCarouselMeasurementCommands(identity);
  return evaluate(commands[1].evalScript!, value)[0];
}
// Synthetic variants exercise rejection cases. The separate captured iOS
// fixture below locks the exact real Maestro 2.10 logger format.
const logLine = (message: string) => `08:48:17.026 [ INFO] maestro.orchestra.Orchestra.executeCommands$lambda$23$lambda$21: JsConsole: ${message}`;
function artifacts(log = logLine(record())) {
  const root = temp();
  const flow = join(root, "2026-09-08_084539", "Sealed Canvas native candidate");
  mkdirSync(join(flow, "logs"), { recursive: true });
  const manifest = { $schema: "https://storage.googleapis.com/maestro-schemas/artifact-manifest/v1.schema.json", entries: [{ kind: "MAESTRO_LOG", format: "TXT", relativePath: "logs/maestro.log", sizeBytes: Buffer.byteLength(log) }] };
  writeFileSync(join(flow, "logs/maestro.log"), log);
  writeFileSync(join(flow, "manifest.json"), JSON.stringify(manifest));
  return { root, flow, manifest };
}
function continuation(value = measurement, identity = expected) {
  const postFlow = join(temp(), "after-carousel.yaml");
  writeFileSync(postFlow, 'appId: com.nannier.canvas.starter.smoke\n---\n- assertVisible: "Current page: 3"\n');
  const result = createCarouselContinuation({ expected: identity, measurement: value, postFlow });
  const [header, body] = result.yaml.split("\n---\n");
  return { ...result, header: JSON.parse(header), commands: JSON.parse(body) as Record<string, any>[] };
}

test("the actual wide-gutter Android Card gets one interior 80%-20% gesture", () => {
  expect(validateCarouselMeasurement(measurement, { platform: "android" })).toEqual({ startX: 794, endX: 286, y: 703, duration: 400 });
  expect(measurement.screenWidth * measurement.pixelRatio * 0.1).toBeLessThan(measurement.x * measurement.pixelRatio);
});

test("iOS coordinates remain points regardless of the display PixelRatio", () => {
  const ios = { ...measurement, platform: "ios", x: 24, y: 200, width: 354, height: 180, screenWidth: 402, screenHeight: 874, pixelRatio: 3 };
  expect(validateCarouselMeasurement(ios, { platform: "ios" })).toEqual({ startX: 307, endX: 95, y: 290, duration: 400 });
});

test("geometry fails closed for wrong state, identity, extra fields and unsafe numbers", () => {
  const variants = [{ generation: 0 }, { status: "pending" }, { index: 2 }, { page: 3 }, { platform: "ios" }, { rtl: true }, { width: 0 }, { height: -1 }, { x: -1 }, { y: -1 }, { pixelRatio: 0 }, { pixelRatio: Infinity }, { x: NaN }, { y: "1" }, { screenHeight: 200 }, { extra: 1 }];
  for (const invalid of variants) expect(() => validateCarouselMeasurement({ ...measurement, ...invalid }, { platform: "android" })).toThrow();
  const { x: omitted, ...missing } = measurement;
  expect(omitted).toBeGreaterThan(0);
  expect(() => validateCarouselMeasurement(missing, { platform: "android" })).toThrow("fields");
});

test("integer rounding cannot silently cross a Card edge or erase the half-width travel", () => {
  expect(() => validateCarouselMeasurement({ ...measurement, x: 0, width: 0.1, pixelRatio: 1 }, { platform: "android" })).toThrow("Rounded");
  expect(() => validateCarouselMeasurement({ ...measurement, pixelRatio: Number.MAX_VALUE }, { platform: "android" })).toThrow("Rounded");
});

test("export is exactly one versioned console record carrying raw package identity", () => {
  const text = record();
  expect(text.startsWith(CAROUSEL_RECORD_PREFIX)).toBe(true);
  const payload = JSON.parse(text.slice(CAROUSEL_RECORD_PREFIX.length));
  expect(payload).toEqual({ schema: 1, type: "canvas.carousel.measurement", ...expected, measurement });
  expect(() => record({ ...measurement, generation: 2 })).toThrow("fresh");
  for (const invalid of [{ nonce: "short" }, { candidateRevision: "main" }, { packageSha256: "bad" }, { packageVersion: "2\\.62\\.3" }, { platform: "web" }, { scheme: "system" }]) {
    expect(() => createCarouselMeasurementCommands({ ...expected, ...invalid })).toThrow("identity");
  }
});

test("console export rejects embedded and trailing newlines in identity fields", () => {
  for (const key of Object.keys(expected)) {
    for (const newline of ["\n", "\r", "\r\n"]) {
      expect(() => createCarouselMeasurementCommands({ ...expected, [key]: expected[key as keyof typeof expected] + newline })).toThrow("identity");
    }
  }
  const { root } = artifacts(logLine(record()).replace('"generation":1', '"generation":\n1'));
  expect(() => readCarouselEvidence({ artifactRoot: root, expected })).toThrow();
});

test("reader discovers the unique flow manifest and preserves exact log evidence", () => {
  const { root, flow } = artifacts();
  expect(findCarouselFlowDirectory(root)).toBe(flow);
  const result = readCarouselEvidence({ artifactRoot: root, expected });
  expect(result.measurement).toEqual(measurement);
  expect(result.source.line).toBe(logLine(record()));
  expect(result.source.lineNumber).toBe(1);
  expect(result.log.sha256).toBe(hash(readFileSync(result.log.path)));
  expect(result.manifest.sha256).toBe(hash(readFileSync(result.manifest.path)));
  expect(() => readCarouselEvidence({ artifactRoot: root, flowDirectory: flow, expected })).toThrow("exactly one");
});

test("reader accepts the captured Maestro 2.10 iOS phase-A console line unchanged", () => {
  const bytes = readFileSync(new URL("./fixtures/maestro-2.10-carousel-ios.log", import.meta.url));
  expect(hash(bytes)).toBe("028d1f9136c1c5fae871276cb9b74c7cb6aca5aa9900a0646e1ee74c32eebb1d");
  const identity = { nonce: "2b256a23-c696-4b4a-aa35-5001993b3943", candidateRevision: "2e1abfa75575aba994726d6d23d1ebe48a8dd1e2", packageSha256: "2fa63129118817e2ae81f28c94b079f579a91946790a1d3d00bab4c7b34b9c9e", packageVersion: "2.62.3", platform: "ios", scheme: "light" };
  const { root } = artifacts(bytes.toString("utf8"));
  const result = readCarouselEvidence({ artifactRoot: root, expected: identity });
  expect(result.source.line + "\n").toBe(bytes.toString("utf8"));
  expect(result.record).toEqual({ schema: 1, type: "canvas.carousel.measurement", ...identity,
    measurement: { generation: 1, status: "ready", index: 1, page: 2, x: 24, y: 190, width: 354, height: 198, screenWidth: 402, screenHeight: 874, pixelRatio: 3, platform: "ios", rtl: false } });
  expect(result.gesture).toEqual({ startX: 307, endX: 95, y: 289, duration: 400 });
  expect(() => readCarouselEvidence({ artifactRoot: root, expected })).toThrow("identity mismatch");
});

test("command-source echoes and log lookalikes are not measurement records", () => {
  const echo = `08:48:17.000 [ INFO] maestro.cli.runner.CliConsoleListener.onCommandStart: evalScript console.log('${record()}')`;
  const wrongLogger = `08:48:17.000 [ INFO] unrelated.logger: JsConsole: ${record()}`;
  const bare = `JsConsole: ${record()}`;
  for (const text of [echo, wrongLogger, bare]) {
    const { root } = artifacts(text);
    expect(() => readCarouselEvidence({ artifactRoot: root, expected })).toThrow("exactly one Carousel");
  }
  const { root } = artifacts(echo + "\n" + logLine(record()));
  expect(readCarouselEvidence({ artifactRoot: root, expected }).source.lineNumber).toBe(2);
});

test("duplicate, malformed and wrong-identity console records are rejected", () => {
  const payload = JSON.parse(record().slice(CAROUSEL_RECORD_PREFIX.length));
  for (const text of [
    logLine(record()) + "\n" + logLine(record()),
    logLine(CAROUSEL_RECORD_PREFIX + "{"),
    logLine(CAROUSEL_RECORD_PREFIX + JSON.stringify({ ...payload, nonce: "another-attempt-123456" })),
    logLine(CAROUSEL_RECORD_PREFIX + JSON.stringify({ ...payload, schema: 2 })),
    logLine(CAROUSEL_RECORD_PREFIX + JSON.stringify({ ...payload, packageVersion: "2.62.4" })),
    logLine(CAROUSEL_RECORD_PREFIX + JSON.stringify({ ...payload, measurement: { ...measurement, generation: 2 } })),
    logLine(CAROUSEL_RECORD_PREFIX + '{"schema":1,' + JSON.stringify(payload).slice(1)),
  ]) {
    const { root } = artifacts(text);
    expect(() => readCarouselEvidence({ artifactRoot: root, expected })).toThrow();
  }
});

test("discovery rejects absent and ambiguous flow manifests", () => {
  expect(() => findCarouselFlowDirectory(temp())).toThrow("exactly one");
  const { root, flow, manifest } = artifacts();
  const other = join(root, "other-flow"); mkdirSync(other);
  writeFileSync(join(other, "manifest.json"), JSON.stringify(manifest));
  expect(() => findCarouselFlowDirectory(root)).toThrow("exactly one");
  expect(() => findCarouselFlowDirectory(flow)).toThrow("descendant");
});

test("reader rejects duplicate log entries, incorrect sizes and unsafe manifest paths", () => {
  for (const change of [
    (m: any) => m.entries.push(m.entries[0]),
    (m: any) => { m.entries[0].sizeBytes += 1; },
    (m: any) => { m.entries[0].relativePath = "../maestro.log"; },
    (m: any) => { m.entries[0].relativePath = "/private/tmp/maestro.log"; },
    (m: any) => { m.entries[0].relativePath = "logs/./maestro.log"; },
    (m: any) => { m.entries[0].relativePath = "logs\\maestro.log"; },
    (m: any) => { m.$schema = "unverified"; },
  ]) {
    const { root, flow, manifest } = artifacts();
    change(manifest); writeFileSync(join(flow, "manifest.json"), JSON.stringify(manifest));
    expect(() => readCarouselEvidence({ artifactRoot: root, expected })).toThrow();
  }
});

test("symlinked roots, manifest files, log files and intermediate directories fail closed", () => {
  for (const leaf of ["manifest.json", "logs/maestro.log", "logs"]) {
    const { root, flow } = artifacts();
    const target = join(temp(), "target");
    if (leaf === "logs") mkdirSync(target); else writeFileSync(target, "untrusted");
    rmSync(join(flow, leaf), { recursive: true, force: true });
    symlinkSync(target, join(flow, leaf));
    expect(() => readCarouselEvidence({ artifactRoot: root, expected })).toThrow("unsafe");
    expect(() => readCarouselEvidence({ flowDirectory: flow, expected })).toThrow();
  }
  const { root } = artifacts(); const link = join(temp(), "link"); symlinkSync(root, link);
  expect(() => findCarouselFlowDirectory(link)).toThrow("symlinks");
});

test("continuation has literal endpoints, one 400ms gesture and one authored post-flow reference", () => {
  const result = continuation();
  expect(result.header).toEqual({ appId: "com.nannier.canvas.starter.smoke", name: `Sealed Canvas native candidate continuation ${expected.nonce}` });
  expect(result.commands.filter((c) => c.swipe)).toEqual([{ swipe: { start: "794, 703", end: "286, 703", duration: 400 } }]);
  expect(result.commands.at(-1)).toEqual({ runFlow: { file: result.postFlow.path } });
  expect(result.postFlow.sha256).toBe(hash(readFileSync(result.postFlow.path)));
  expect(result.sha256).toBe(hash(result.yaml));
  for (const command of result.commands) expect(Object.keys(command).some((k) => ["launchApp", "openLink", "clearState", "stopApp", "retry", "repeat"].includes(k))).toBe(false);
  expect(result.commands.filter((c) => c.tapOn)).toEqual([{ tapOn: { text: "Measure current slide", retryTapIfNoChange: false } }]);
});

test("generated guards prove continuity and fresh generation, without depending on JSON key order", () => {
  const guards = continuation().commands.filter((c) => c.evalScript).map((c) => c.evalScript as string);
  expect(guards).toHaveLength(2);
  const reordered = Object.fromEntries(Object.entries(measurement).reverse());
  expect(() => evaluate(guards[0], reordered)).not.toThrow();
  expect(() => evaluate(guards[1], { ...reordered, generation: 2 })).not.toThrow();
  expect(() => evaluate(guards[0], { ...measurement, generation: 0 })).toThrow("fresh");
  expect(() => evaluate(guards[1], measurement)).toThrow("fresh");
  expect(() => evaluate(guards[1], { ...measurement, generation: 3 })).toThrow("fresh");
  // This tiny drift would round to the same pixels; exact original fields
  // still reject it instead of treating the old measurement as fresh.
  expect(() => evaluate(guards[1], { ...measurement, generation: 2, x: measurement.x + 0.001 })).toThrow("changed between phases");
  expect(() => evaluate(guards[1], { ...measurement, generation: 2, index: 2, page: 3 })).toThrow("fresh");
});

test("continuation rejects an unpreserved path and a different app identity", () => {
  expect(() => createCarouselContinuation({ expected, measurement, postFlow: "relative.yaml" })).toThrow("absolute");
  expect(() => createCarouselContinuation({ expected, measurement, postFlow: "/does/not/exist", appId: "another.app" })).toThrow("app ID");
  const post = join(temp(), "post.yaml"); writeFileSync(post, "---\n[]\n");
  const linked = join(temp(), "linked.yaml"); symlinkSync(post, linked);
  expect(() => createCarouselContinuation({ expected, measurement, postFlow: linked })).toThrow("real directories");
});
