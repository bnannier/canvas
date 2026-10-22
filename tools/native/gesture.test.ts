import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { CAROUSEL_RECORD_PREFIX, createCarouselSwipeCommands, findCarouselFlowDirectory, readCarouselEvidence, validateCarouselMeasurement } from "./gesture.mjs";

const temporary: string[] = [];
afterEach(() => { for (const directory of temporary.splice(0)) rmSync(directory, { recursive: true, force: true }); });
function temp() { const directory = realpathSync(mkdtempSync(join(tmpdir(), "canvas-gesture-"))); temporary.push(directory); return directory; }
const hash = (bytes: string | Buffer) => createHash("sha256").update(bytes).digest("hex");
const expected = { nonce: "measurement-attempt-123456", candidateRevision: "a".repeat(40), packageSha256: "b".repeat(64), packageVersion: "2.62.3", platform: "android", scheme: "light" };
// The Android emulator's page 2 card ([66,491][1014,854] px at 2.625) with its trailing
// "Swipe left" label near the card's bottom right.
const measurement = { generation: 1, status: "ready", index: 1, page: 2, x: 25.142857142857142, y: 187.04761904761904, width: 361.14285714285717, height: 138.28571428571428,
  handleX: 315.42857142857144, handleY: 300.1904761904762, handleWidth: 54.095238095238095, handleHeight: 17.142857142857142,
  screenWidth: 411.42857142857144, screenHeight: 914.2857142857143, pixelRatio: 2.625, platform: "android", rtl: false };
const postFlowFile = () => { const file = join(temp(), "after-carousel.yaml"); writeFileSync(file, 'appId: com.nannier.canvas.starter.smoke\n---\n- assertVisible: "Current page: 3"\n'); return file; };
const commandsFor = (identity = expected) => createCarouselSwipeCommands(identity, postFlowFile());

function evaluate(code: string, value: unknown) {
  const messages: string[] = [];
  runInNewContext(code.slice(2, -1), { maestro: { copiedText: JSON.stringify(value) }, console: { log: (message: string) => messages.push(message) } });
  return messages;
}
function record(value: Record<string, unknown> = measurement, identity = expected) {
  const { commands } = commandsFor(identity);
  return evaluate((commands[1] as { evalScript: string }).evalScript, value)[0];
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
test("the Android label swipe starts and ends inside the card and crosses half of it", () => {
  // Maestro starts at the label's center and ends at 10% of the 1080 px screen: x108.
  expect(validateCarouselMeasurement(measurement, { platform: "android" })).toEqual({ startX: 899, endX: 108, y: 811, duration: 400 });
  expect(108).toBeGreaterThan(measurement.x * measurement.pixelRatio);
});

test("iOS coordinates remain points regardless of the display PixelRatio", () => {
  const ios = { ...measurement, platform: "ios", x: 25, y: 177, width: 352, height: 180, handleX: 315, handleY: 330, handleWidth: 52, handleHeight: 16, screenWidth: 402, screenHeight: 874, pixelRatio: 3 };
  expect(validateCarouselMeasurement(ios, { platform: "ios" })).toEqual({ startX: 341, endX: 40, y: 338, duration: 400 });
});

test("a card that starts right of Maestro's 10% end point, or a label near its center, fails closed", () => {
  // The end point x108 would sit left of a card at 116 px (the older wide-gutter layout).
  expect(() => validateCarouselMeasurement({ ...measurement, x: 116 / 2.625, width: 848 / 2.625, handleX: 300 }, { platform: "android" })).toThrow("inside the card");
  // A label at the card's center leaves under half the card's width of travel.
  expect(() => validateCarouselMeasurement({ ...measurement, handleX: 180 }, { platform: "android" })).toThrow("more than half");
  // A label outside the card is rejected before any gesture math.
  expect(() => validateCarouselMeasurement({ ...measurement, handleX: 380 }, { platform: "android" })).toThrow("label inside the card");
});

test("geometry fails closed for wrong state, identity, extra fields and unsafe numbers", () => {
  const variants = [{ generation: 0 }, { status: "pending" }, { index: 2 }, { page: 3 }, { platform: "ios" }, { rtl: true }, { width: 0 }, { height: -1 }, { x: -1 }, { y: -1 }, { pixelRatio: 0 }, { pixelRatio: Infinity }, { x: NaN }, { y: "1" }, { screenHeight: 200 }, { extra: 1 }];
  for (const invalid of variants) expect(() => validateCarouselMeasurement({ ...measurement, ...invalid }, { platform: "android" })).toThrow();
  const { x: omitted, ...missing } = measurement;
  expect(omitted).toBeGreaterThan(0);
  expect(() => validateCarouselMeasurement(missing, { platform: "android" })).toThrow("fields");
});

test("integer rounding cannot silently cross a Card edge or erase the half-width travel", () => {
  expect(() => validateCarouselMeasurement({ ...measurement, pixelRatio: Number.MAX_VALUE }, { platform: "android" })).toThrow();
});

test("export is exactly one versioned console record carrying raw package identity", () => {
  const text = record();
  expect(text.startsWith(CAROUSEL_RECORD_PREFIX)).toBe(true);
  const payload = JSON.parse(text.slice(CAROUSEL_RECORD_PREFIX.length));
  expect(payload).toEqual({ schema: 2, type: "canvas.carousel.measurement", ...expected, measurement, gesture: validateCarouselMeasurement(measurement, { platform: "android" }) });
  expect(() => record({ ...measurement, generation: 2 })).toThrow("fresh");
  for (const invalid of [{ nonce: "short" }, { candidateRevision: "main" }, { packageSha256: "bad" }, { packageVersion: "2\\.62\\.3" }, { platform: "web" }, { scheme: "system" }]) {
    expect(() => commandsFor({ ...expected, ...invalid })).toThrow("identity");
  }
});

test("console export rejects embedded and trailing newlines in identity fields", () => {
  for (const key of Object.keys(expected)) {
    for (const newline of ["\n", "\r", "\r\n"]) {
      expect(() => commandsFor({ ...expected, [key]: expected[key as keyof typeof expected] + newline })).toThrow("identity");
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
    logLine(CAROUSEL_RECORD_PREFIX + JSON.stringify({ ...payload, schema: 1 })),
    logLine(CAROUSEL_RECORD_PREFIX + JSON.stringify({ ...payload, gesture: { ...payload.gesture, endX: 1 } })),
    logLine(CAROUSEL_RECORD_PREFIX + JSON.stringify({ ...payload, packageVersion: "2.62.4" })),
    logLine(CAROUSEL_RECORD_PREFIX + JSON.stringify({ ...payload, measurement: { ...measurement, generation: 2 } })),
    logLine(CAROUSEL_RECORD_PREFIX + '{"schema":2,' + JSON.stringify(payload).slice(1)),
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

test("the swipe runs in the measuring session: one label swipe, then the authored post-flow", () => {
  const { commands, postFlow } = commandsFor();
  expect(commands.filter((c) => "swipe" in c)).toEqual([{ swipe: { from: { id: "carousel-swipe-2" }, direction: "LEFT", duration: 400 } }]);
  expect(commands.at(-1)).toEqual({ runFlow: { file: postFlow.path } });
  expect(postFlow.sha256).toBe(hash(readFileSync(postFlow.path)));
  // No relaunch, navigation or second measurement between measuring and swiping.
  for (const command of commands) expect(Object.keys(command).some((k) => ["launchApp", "openLink", "clearState", "stopApp", "retry", "repeat", "tapOn"].includes(k))).toBe(false);
});

test("the generated guard rejects a stale or reordered-but-different measurement", () => {
  const guard = (commandsFor().commands[1] as { evalScript: string }).evalScript;
  const reordered = Object.fromEntries(Object.entries(measurement).reverse());
  expect(() => evaluate(guard, reordered)).not.toThrow();
  expect(() => evaluate(guard, { ...measurement, generation: 0 })).toThrow("fresh");
  expect(() => evaluate(guard, { ...measurement, handleX: 180 })).toThrow("more than half");
});

test("the swipe commands reject an unpreserved post-flow path", () => {
  expect(() => createCarouselSwipeCommands(expected, "relative.yaml")).toThrow("absolute");
  const post = join(temp(), "post.yaml"); writeFileSync(post, "---\n[]\n");
  const linked = join(temp(), "linked.yaml"); symlinkSync(post, linked);
  expect(() => createCarouselSwipeCommands(expected, linked)).toThrow("real directories");
});
