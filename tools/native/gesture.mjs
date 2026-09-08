import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";

export const CAROUSEL_RECORD_PREFIX = "CANVAS_CAROUSEL_MEASUREMENT_V1 ";
const artifactSchema = "https://storage.googleapis.com/maestro-schemas/artifact-manifest/v1.schema.json";
const measurementKeys = ["generation", "status", "index", "page", "x", "y", "width", "height", "screenWidth", "screenHeight", "pixelRatio", "platform", "rtl"];
const expectedKeys = ["nonce", "candidateRevision", "packageSha256", "packageVersion", "platform", "scheme"];
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

function exactKeys(value, keys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || Object.keys(value).length !== keys.length || keys.some((key) => !Object.hasOwn(value, key))) {
    throw new Error(`Invalid ${label} fields`);
  }
}

function validateExpected(expected) {
  exactKeys(expected, expectedKeys, "Carousel identity");
  if (expectedKeys.some((key) => typeof expected[key] !== "string" || /[\r\n]/.test(expected[key]))
    || !/^[a-zA-Z0-9._-]{16,128}$/.test(expected.nonce)
    || typeof expected.candidateRevision !== "string" || !/^[a-f0-9]{40}$/.test(expected.candidateRevision)
    || typeof expected.packageSha256 !== "string" || !/^[a-f0-9]{64}$/.test(expected.packageSha256)
    || typeof expected.packageVersion !== "string" || !/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?(?:\+[a-zA-Z0-9.-]+)?$/.test(expected.packageVersion)
    || !["ios", "android"].includes(expected.platform) || !["light", "dark"].includes(expected.scheme)) {
    throw new Error("Invalid Carousel identity");
  }
}

// This function is also embedded verbatim in Maestro's supported evalScript.
// Keep it self-contained so host and device-side guards use the same math.
export function validateCarouselMeasurement(measurement, { platform, generation = 1 }) {
  const keys = ["generation", "status", "index", "page", "x", "y", "width", "height", "screenWidth", "screenHeight", "pixelRatio", "platform", "rtl"];
  if (!measurement || typeof measurement !== "object" || Array.isArray(measurement)
    || Object.keys(measurement).length !== keys.length || keys.some((key) => !Object.prototype.hasOwnProperty.call(measurement, key))) {
    throw new Error("Invalid Carousel measurement fields");
  }
  const m = measurement;
  if (!["ios", "android"].includes(platform) || m.platform !== platform || m.rtl !== false
    || !Number.isSafeInteger(generation) || generation < 1 || m.generation !== generation
    || m.status !== "ready" || m.index !== 1 || m.page !== 2) {
    throw new Error("Expected the fresh current page 2 Carousel measurement");
  }
  const numbers = [m.x, m.y, m.width, m.height, m.screenWidth, m.screenHeight, m.pixelRatio];
  if (!numbers.every((value) => typeof value === "number" && Number.isFinite(value))
    || m.width <= 0 || m.height <= 0 || m.screenWidth <= 0 || m.screenHeight <= 0 || m.pixelRatio <= 0
    || m.x < 0 || m.y < 0 || m.x + m.width > m.screenWidth || m.y + m.height > m.screenHeight) {
    throw new Error("Carousel card must have finite positive bounds inside the screen");
  }
  // The candidate app uses a full-screen edge-to-edge native window. Only
  // Android converts RN window units to the physical pixels Maestro accepts.
  const scale = platform === "android" ? m.pixelRatio : 1;
  const startX = Math.round((m.x + m.width * 0.8) * scale);
  const endX = Math.round((m.x + m.width * 0.2) * scale);
  const y = Math.round((m.y + m.height * 0.5) * scale);
  if (![startX, endX, y].every(Number.isSafeInteger)
    || !(endX > m.x * scale && startX < (m.x + m.width) * scale)
    || !(y > m.y * scale && y < (m.y + m.height) * scale)
    || !(startX - endX > m.width * scale / 2)) {
    throw new Error("Rounded Carousel drag must stay inside the card and cross more than half its width");
  }
  return { startX, endX, y, duration: 400 };
}

function script(body) { return "${(function () {\n" + body + "\n})()}"; }

/** Append to the preserved phase-A commands after its page/count assertions. */
export function createCarouselMeasurementCommands(expected) {
  validateExpected(expected);
  return [
    { copyTextFrom: { id: "carousel-measurement" } },
    { evalScript: script([
      "var expected = " + JSON.stringify(expected) + ";",
      "var measurement = JSON.parse(maestro.copiedText);",
      "(" + validateCarouselMeasurement.toString() + ")(measurement, { platform: expected.platform, generation: 1 });",
      "var record = { schema: 1, type: 'canvas.carousel.measurement', nonce: expected.nonce, candidateRevision: expected.candidateRevision, packageSha256: expected.packageSha256, packageVersion: expected.packageVersion, platform: expected.platform, scheme: expected.scheme, measurement: measurement };",
      "console.log(" + JSON.stringify(CAROUSEL_RECORD_PREFIX) + " + JSON.stringify(record));",
    ].join("\n")) },
  ];
}

function checkedFile(directory, relative, limit) {
  const base = path.resolve(directory);
  if (fs.realpathSync(base) !== base || !fs.lstatSync(base).isDirectory()) throw new Error("Evidence directory must be a real directory without symlinks");
  if (typeof relative !== "string" || relative.length === 0 || path.isAbsolute(relative) || relative.includes("\\")
    || relative.split("/").some((part) => !part || part === "." || part === "..")) throw new Error("Unsafe artifact path");
  let current = base;
  const parts = relative.split("/");
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink() || (index < parts.length - 1 ? !stat.isDirectory() : !stat.isFile())) throw new Error("Artifact paths must contain only real directories and regular files");
  }
  const handle = fs.openSync(current, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const before = fs.fstatSync(handle);
    if (!before.isFile() || before.size > limit) throw new Error("Invalid artifact file size or type");
    const bytes = fs.readFileSync(handle);
    const after = fs.fstatSync(handle);
    if (bytes.length !== before.size || before.size !== after.size || before.mtimeMs !== after.mtimeMs
      || fs.realpathSync(current) !== current) throw new Error("Artifact changed while reading");
    return { path: current, bytes, sha256: digest(bytes) };
  } finally { fs.closeSync(handle); }
}

/** Discover the sole flow-scoped log manifest inside this fresh attempt only. */
export function findCarouselFlowDirectory(artifactRoot) {
  const root = path.resolve(artifactRoot);
  if (fs.realpathSync(root) !== root || !fs.lstatSync(root).isDirectory()) throw new Error("Artifact root must be a real directory without symlinks");
  const found = [];
  const pending = [root];
  let visited = 0;
  while (pending.length) {
    const directory = pending.pop();
    for (const name of fs.readdirSync(directory)) {
      if (++visited > 10000) throw new Error("Unexpectedly large Maestro artifact tree");
      const file = path.join(directory, name);
      const stat = fs.lstatSync(file);
      if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) throw new Error("Maestro artifact tree contains an unsafe entry");
      if (fs.realpathSync(file) !== file) throw new Error("Maestro artifact path is not canonical");
      if (stat.isDirectory()) pending.push(file);
      else if (name === "manifest.json") {
        const manifest = checkedFile(directory, name, 1024 * 1024);
        const data = JSON.parse(manifest.bytes.toString("utf8"));
        if (data.$schema !== artifactSchema || !Array.isArray(data.entries)) throw new Error("Invalid Maestro artifact manifest");
        if (data.entries.some((entry) => entry?.kind === "MAESTRO_LOG")) {
          if (directory === root) throw new Error("Expected a descendant flow-scoped manifest");
          found.push(directory);
        }
      }
    }
  }
  if (found.length !== 1) throw new Error("Expected exactly one Maestro flow manifest");
  return found[0];
}

/** Call only after phase A succeeds; it never promotes a failed run to success. */
export function readCarouselEvidence({ flowDirectory, artifactRoot, expected }) {
  if (!!flowDirectory === !!artifactRoot) throw new Error("Provide exactly one flowDirectory or artifactRoot");
  flowDirectory ??= findCarouselFlowDirectory(artifactRoot);
  validateExpected(expected);
  const manifest = checkedFile(flowDirectory, "manifest.json", 1024 * 1024);
  const data = JSON.parse(manifest.bytes.toString("utf8"));
  if (data.$schema !== artifactSchema || !Array.isArray(data.entries)) throw new Error("Invalid Maestro artifact manifest");
  const logs = data.entries.filter((entry) => entry && entry.kind === "MAESTRO_LOG");
  if (logs.length !== 1 || logs[0].format !== "TXT") throw new Error("Expected exactly one Maestro flow log");
  const log = checkedFile(flowDirectory, logs[0].relativePath, 32 * 1024 * 1024);
  if (!Number.isSafeInteger(logs[0].sizeBytes) || logs[0].sizeBytes !== log.bytes.length) throw new Error("Maestro flow log does not match its manifest size");
  // Installed Orchestra emits `JsConsole: <message>` through this logger.
  // A command's printed JS source can contain the same marker; it is not a record.
  const consoleLine = /^\d{2}:\d{2}:\d{2}\.\d{3} \[\s*INFO\s*\] maestro\.orchestra\.Orchestra(?:\.[^\s:]*)?: JsConsole: (.*)$/;
  const records = log.bytes.toString("utf8").split(/\r?\n/).flatMap((line, index) => {
    const message = consoleLine.exec(line)?.[1];
    return message?.startsWith(CAROUSEL_RECORD_PREFIX) ? [{ line, lineNumber: index + 1, json: message.slice(CAROUSEL_RECORD_PREFIX.length) }] : [];
  });
  if (records.length !== 1) throw new Error("Expected exactly one Carousel JsConsole record");
  const source = records[0];
  if (source.json.length > 8192) throw new Error("Oversized Carousel console record");
  const record = JSON.parse(source.json);
  // The producer uses JSON.stringify. Requiring that exact form also rejects
  // duplicate JSON object keys and multi-line/source-echo lookalikes.
  if (JSON.stringify(record) !== source.json) throw new Error("Noncanonical Carousel console record");
  exactKeys(record, ["schema", "type", ...expectedKeys, "measurement"], "Carousel record");
  if (record.schema !== 1 || record.type !== "canvas.carousel.measurement"
    || expectedKeys.some((key) => record[key] !== expected[key])) throw new Error("Carousel console record identity mismatch");
  const gesture = validateCarouselMeasurement(record.measurement, { platform: expected.platform });
  return { record, measurement: record.measurement, gesture, manifest, log, source };
}

/** Generate a new continuation, never a substituted or resized app fixture. */
export function createCarouselContinuation({ expected, measurement, postFlow, appId = "com.nannier.canvas.starter.smoke" }) {
  validateExpected(expected);
  if (appId !== "com.nannier.canvas.starter.smoke") throw new Error("Unexpected Carousel continuation app ID");
  const gesture = validateCarouselMeasurement(measurement, { platform: expected.platform });
  if (typeof postFlow !== "string" || !path.isAbsolute(postFlow)) throw new Error("Post-flow must be an absolute preserved path");
  const post = checkedFile(path.dirname(postFlow), path.basename(postFlow), 1024 * 1024);
  const guard = (generation) => script([
    "var original = " + JSON.stringify(measurement) + ";",
    "var measured = JSON.parse(maestro.copiedText);",
    "var literal = " + JSON.stringify(gesture) + ";",
    "var actual = (" + validateCarouselMeasurement.toString() + ")(measured, { platform: " + JSON.stringify(expected.platform) + ", generation: " + generation + " });",
    "var fields = " + JSON.stringify(measurementKeys.filter((key) => key !== "generation")) + ";",
    "if (fields.some(function (key) { return measured[key] !== original[key]; })) throw new Error('Carousel geometry or state changed between phases');",
    "if (actual.startX !== literal.startX || actual.endX !== literal.endX || actual.y !== literal.y) throw new Error('Fresh Carousel coordinates differ from literal gesture');",
  ].join("\n"));
  const page = [
    { assertVisible: "Native carousel paging" },
    { assertVisible: { id: "carousel-current", text: "Current page: 2" } },
    { assertVisible: { id: "carousel-changes", text: "Page changes: 0" } },
    { assertVisible: "Slide 2 of 6, current slide" },
    { assertVisible: { id: "carousel-page-2" } },
  ];
  const commands = [
    ...page,
    { copyTextFrom: { id: "carousel-measurement" } },
    { evalScript: guard(1) },
    { tapOn: { text: "Measure current slide", retryTapIfNoChange: false } },
    { assertVisible: { id: "carousel-measurement", text: '.*"generation":2,"status":"ready".*' } },
    { copyTextFrom: { id: "carousel-measurement" } },
    { evalScript: guard(2) },
    ...page,
    { takeScreenshot: "carousel-measured-before-drag" },
    { swipe: { start: `${gesture.startX}, ${gesture.y}`, end: `${gesture.endX}, ${gesture.y}`, duration: gesture.duration } },
    { runFlow: { file: post.path } },
  ];
  // JSON documents are valid YAML. Numeric point strings reach Maestro's eager
  // parser as literals; only supported evalScript guards contain expressions.
  const yaml = JSON.stringify({ appId, name: `Sealed Canvas native candidate continuation ${expected.nonce}` }) + "\n---\n" + JSON.stringify(commands, null, 2) + "\n";
  return { yaml, sha256: digest(yaml), gesture, postFlow: { path: post.path, sha256: post.sha256 } };
}
