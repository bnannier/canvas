// Passive CI observations only. Never connect to ADB or change its lifecycle.
import * as fs from "node:fs";
import * as path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";

export const LIMITS = Object.freeze({ sample: 2 * 1024 * 1024, tail: 256 * 1024, logs: 4, text: 64 * 1024, processes: 1024, snapshots: 32 });
const errorValue = (error) => ({ status: "unavailable", reason: error?.code ?? error?.message ?? String(error) });
export const timestamp = () => ({ utc: new Date().toISOString(), monotonicNs: process.hrtime.bigint().toString() });
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
const journalTime = (value) => new Date(value).toISOString().replace("T", " ").slice(0, 19) + " UTC";
export function readBounded(file, limit = LIMITS.text) {
  let fd;
  try {
    fd = fs.openSync(file, "r");
    const buffer = Buffer.alloc(limit + 1);
    const bytes = fs.readSync(fd, buffer, 0, buffer.length, 0);
    return { status: "available", text: buffer.subarray(0, Math.min(bytes, limit)).toString(), truncated: bytes > limit };
  } catch (error) { return errorValue(error); }
  finally { if (fd !== undefined) fs.closeSync(fd); }
}
export function boundedCommand(command, args, timeout = 1000, maxBuffer = LIMITS.text) {
  const result = spawnSync(command, args, { encoding: "utf8", timeout, maxBuffer, stdio: ["ignore", "pipe", "pipe"] });
  return { status: result.error ? "unavailable" : result.status === 0 ? "available" : "failed", exitCode: result.status,
    signal: result.signal, reason: result.error?.code, stdout: (result.stdout ?? "").slice(-maxBuffer), stderr: (result.stderr ?? "").slice(-maxBuffer) };
}
export function parseProcStat(text) {
  const end = text.lastIndexOf(")");
  if (end < 0 || !/^\d+ \(/.test(text)) throw new Error("Invalid process stat");
  const fields = text.slice(end + 2).trim().split(/\s+/);
  if (fields.length < 22 || !/^\d+$/.test(fields[19])) throw new Error("Incomplete process stat");
  return { pid: Number(text.slice(0, text.indexOf(" "))), name: text.slice(text.indexOf("(") + 1, end), state: fields[0],
    parentPid: Number(fields[1]), userTicks: fields[11], systemTicks: fields[12], threads: fields[17], startTicks: fields[19], rssPages: fields[21] };
}
export function processIdentity(pid, proc = "/proc") {
  try {
    const result = readBounded(path.join(proc, String(pid), "stat"));
    if (result.status !== "available" || result.truncated) return result;
    const identity = parseProcStat(result.text);
    return { status: "available", ...identity, executable: fs.readlinkSync(path.join(proc, String(pid), "exe")) };
  } catch (error) { return errorValue(error); }
}
export function parseListeners(text) {
  return text.split("\n").filter(Boolean).map((line) => ({
    raw: line.slice(0, 4096), inode: /\bino:(\d+)/.exec(line)?.[1] ?? null,
    pids: [...line.matchAll(/\bpid=(\d+)/g)].map((match) => Number(match[1])),
    owners: [...line.matchAll(/\bpid=(\d+),fd=(\d+)/g)].map((match) => ({ pid: Number(match[1]), fd: Number(match[2]) })),
  }));
}
export function appendBounded(file, bytes, cap = LIMITS.sample) {
  const segment = Math.floor(cap / 2);
  const incoming = Buffer.from(bytes);
  const retained = incoming.subarray(Math.max(0, incoming.length - segment));
  let discarded = incoming.length - retained.length;
  const size = fs.existsSync(file) ? fs.statSync(file).size : 0;
  if (size + retained.length > segment) {
    const previous = file + ".previous";
    if (fs.existsSync(previous)) { discarded += fs.statSync(previous).size; fs.unlinkSync(previous); }
    if (size) fs.renameSync(file, previous);
  }
  fs.appendFileSync(file, retained);
  return discarded;
}
export function readLogTail(file, uid = process.getuid?.(), limit = LIMITS.tail) {
  let fd;
  try {
    fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
    const before = fs.fstatSync(fd);
    if (!before.isFile() || before.uid !== uid) return { status: "unavailable", reason: "not-an-owned-regular-file", path: file };
    const offset = Math.max(0, before.size - limit);
    const buffer = Buffer.alloc(Math.min(before.size, limit));
    const bytes = fs.readSync(fd, buffer, 0, buffer.length, offset);
    const after = fs.fstatSync(fd);
    return { status: "available", path: file, inode: String(before.ino), device: String(before.dev), size: before.size,
      modifiedAt: before.mtime.toISOString(), offset, bytes, truncated: offset > 0, changedDuringRead: after.size !== before.size || after.mtimeMs !== before.mtimeMs,
      text: buffer.subarray(0, bytes).toString() };
  } catch (error) { return { ...errorValue(error), path: file }; }
  finally { if (fd !== undefined) fs.closeSync(fd); }
}
function resources(proc) {
  const names = ["meminfo", "loadavg", "uptime", "pressure/memory", "pressure/cpu", "pressure/io", "sys/kernel/random/boot_id"];
  const result = Object.fromEntries(names.map((name) => [name, readBounded(path.join(proc, name), 16384)]));
  result.cgroup = readBounded(path.join(proc, "self/cgroup"), 4096);
  const group = result.cgroup.status === "available" ? /^0::(\/.*)$/m.exec(result.cgroup.text)?.[1] : null;
  const root = group && path.resolve("/sys/fs/cgroup", "." + group);
  result.cgroupMemory = root && (root === "/sys/fs/cgroup" || root.startsWith("/sys/fs/cgroup/"))
    ? Object.fromEntries(["memory.current", "memory.max", "memory.events", "memory.pressure"].map((name) => [name, readBounded(path.join(root, name), 8192)]))
    : { status: "unavailable", reason: "cgroup-v2-path-unavailable" };
  return result;
}
function emulatorProcesses(proc, avd) {
  try {
    const pids = fs.readdirSync(proc).filter((name) => /^\d+$/.test(name));
    const matches = [];
    const deadline = Date.now() + 500;
    let scanned = 0;
    for (const pid of pids.slice(0, LIMITS.processes)) {
      if (Date.now() > deadline) break;
      scanned += 1;
      const identity = processIdentity(Number(pid), proc);
      if (identity.status !== "available" || !/^(emulator|qemu-system[^/]*)$/.test(path.basename(identity.executable))) continue;
      const command = readBounded(path.join(proc, pid, "cmdline"), 8192);
      if (command.status !== "available" || command.truncated) continue;
      const args = command.text.split("\0");
      const index = args.indexOf("-avd");
      if ((index >= 0 && args[index + 1] === avd) || args.includes("@" + avd)) matches.push(identity);
    }
    return { status: "available", processes: matches, scanned, truncated: scanned < pids.length };
  } catch (error) { return errorValue(error); }
}
function logCandidates(listeners, proc, environment) {
  const candidates = new Set();
  for (const listener of listeners) for (const identity of listener.processes) {
    if (identity.status !== "available" || !identity.socketVerified || path.basename(identity.executable) !== "adb") continue;
    for (const fd of [1, 2]) {
      try {
        const file = fs.readlinkSync(path.join(proc, String(identity.pid), "fd", String(fd)));
        if (path.isAbsolute(file)) candidates.add(file);
      } catch { /* Missing/closed descriptors are described by the log coverage field. */ }
    }
  }
  if (environment.ANDROID_ADB_LOG_PATH) candidates.add(environment.ANDROID_ADB_LOG_PATH);
  candidates.add(path.join(environment.TMPDIR || "/tmp", `adb.${process.getuid?.()}.log`));
  return [...candidates].slice(0, LIMITS.logs);
}
export function hostSnapshot({ proc = "/proc", environment = process.env, command = boundedCommand } = {}) {
  const sockets = command("ss", ["-H", "-ltnpe", "sport = :5037"], 1000, 32768);
  const listeners = sockets.status === "available" ? parseListeners(sockets.stdout).map((listener) => {
    const processes = listener.owners.map(({ pid, fd }) => {
      const identity = processIdentity(pid, proc);
      let socket;
      try { socket = fs.readlinkSync(path.join(proc, String(pid), "fd", String(fd))); }
      catch (error) { return { ...identity, socketVerified: false, socketError: errorValue(error) }; }
      const current = processIdentity(pid, proc);
      return { ...identity, fd, socket, socketVerified: identity.status === "available" && current.status === "available"
        && current.startTicks === identity.startTicks && current.executable === identity.executable && socket === `socket:[${listener.inode}]` };
    });
    return { ...listener, processes, ownership: processes.length && processes.every((item) => item.socketVerified) ? "verified-at-sample" : "unavailable-or-changed" };
  }) : [];
  return { ...timestamp(), sockets: { ...sockets, listeners }, emulator: emulatorProcesses(proc, "canvas_candidate"), resources: resources(proc),
    observer: processIdentity(process.pid, proc), logs: logCandidates(listeners, proc, environment).map((file) => readLogTail(file)),
    coverage: { intervalMs: 5000, transientEventsBetweenSamples: "unknown", traceConfiguredByObserver: false,
      logDiscovery: "listener stdout/stderr plus current-environment ADB log path; server environment may differ" } };
}
export class DiagnosticGuardError extends Error {}
export function validateOutput(output, environment = process.env, platform = process.platform) {
  if (platform !== "linux" || environment.GITHUB_ACTIONS !== "true" || environment.RUNNER_ENVIRONMENT !== "github-hosted") {
    throw new DiagnosticGuardError("Passive Android diagnostics are restricted to the GitHub-hosted Linux CI job");
  }
  if (!environment.RUNNER_TEMP) throw new DiagnosticGuardError("RUNNER_TEMP is required");
  const requestedTemp = path.resolve(environment.RUNNER_TEMP);
  if (!path.resolve(output).startsWith(requestedTemp + path.sep) || path.basename(output) !== "android-host-diagnostics") throw new DiagnosticGuardError("Diagnostics must use the task output in RUNNER_TEMP");
  const temp = fs.realpathSync(environment.RUNNER_TEMP);
  const requestedParent = path.dirname(output);
  const parent = fs.realpathSync(requestedParent);
  if (!parent.startsWith(temp + path.sep) || path.basename(output) !== "android-host-diagnostics") throw new DiagnosticGuardError("Diagnostics must use the task output in RUNNER_TEMP");
  try {
    if (fs.lstatSync(output).isSymbolicLink() || fs.realpathSync(output) !== path.join(parent, path.basename(output))) throw new DiagnosticGuardError("Diagnostics cannot follow an output symlink");
  } catch (error) { if (error.code !== "ENOENT") throw error; }
  return path.join(parent, path.basename(output));
}
function localBinaryInventory(environment) {
  const candidates = new Set();
  let firstPath;
  for (const directory of (environment.PATH ?? "").split(path.delimiter)) {
    if (!directory) continue;
    const file = path.join(directory, "adb");
    try {
      fs.accessSync(file, fs.constants.X_OK);
      const realpath = fs.realpathSync(file);
      firstPath ??= { path: file, realpath };
      candidates.add(realpath);
    } catch { /* Not an executable PATH entry. */ }
  }
  if (environment.ANDROID_HOME) candidates.add(path.join(environment.ANDROID_HOME, "platform-tools/adb"));
  const binaries = [...candidates].slice(0, 8).map((file) => {
    try {
      const actual = fs.realpathSync(file);
      return { path: file, realpath: actual, sha256: createHash("sha256").update(fs.readFileSync(actual)).digest("hex"), version: boundedCommand(actual, ["version"], 1000, 8192) };
    } catch (error) { return { path: file, ...errorValue(error) }; }
  });
  return { firstPath: firstPath ?? { status: "unavailable", reason: "adb-not-on-PATH" },
    sdkPath: environment.ANDROID_HOME ? path.join(environment.ANDROID_HOME, "platform-tools/adb") : null, binaries, truncated: candidates.size > 8 };
}
export function initializeDiagnostics(output, environment = process.env) {
  fs.mkdirSync(output);
  const metadata = { schema: 1, ...timestamp(), nonce: randomUUID(), mode: "passive", intervalMs: 5000,
    binaries: localBinaryInventory(environment), adbSettings: Object.fromEntries(["ADB_TRACE", "ADB_SERVER_SOCKET", "ANDROID_ADB_SERVER_ADDRESS", "ANDROID_ADB_SERVER_PORT", "ANDROID_ADB_LOG_PATH"].map((key) => [key, environment[key] ?? null])),
    workflow: Object.fromEntries(["GITHUB_RUN_ID", "GITHUB_RUN_ATTEMPT", "GITHUB_JOB", "GITHUB_SHA", "ImageOS", "ImageVersion"].map((key) => [key, environment[key] ?? null])),
    context: readBounded(path.join(path.dirname(output), "context.json")),
    files: Object.fromEntries([new URL(import.meta.url), new URL("../../scripts/android-host-diagnostics.mjs", import.meta.url)].map((url) => [path.basename(url.pathname), createHash("sha256").update(fs.readFileSync(url)).digest("hex")])) };
  write(path.join(output, "metadata.json"), metadata);
  return metadata;
}
export function captureDiagnostics(output, stage, { kernel = false, snapshot = hostSnapshot, command = boundedCommand } = {}) {
  if (!/^[a-z][a-z0-9-]{0,40}$/.test(stage)) throw new Error("Invalid diagnostic stage");
  const directory = path.join(output, "snapshots");
  fs.mkdirSync(directory, { recursive: true });
  if (fs.readdirSync(directory).length >= LIMITS.snapshots) throw new Error("Diagnostic snapshot limit reached");
  const result = { stage, ...snapshot() };
  if (kernel) {
    try {
      const started = JSON.parse(fs.readFileSync(path.join(output, "metadata.json"), "utf8")).utc;
      result.kernel = command("journalctl", ["--dmesg", "--since", journalTime(started), "--until", journalTime(Date.now()), "--no-pager", "--output=short-monotonic", "--lines=400"], 3000, 256 * 1024);
    } catch (error) { result.kernel = errorValue(error); }
  }
  const file = path.join(directory, `${Date.now()}-${stage}-${randomUUID()}.json`);
  write(file, result);
  return file;
}
export function safeCapture(output, stage, options) {
  try { return { status: "available", path: captureDiagnostics(output, stage, options) }; }
  catch (error) { return errorValue(error); }
}
// Execute once. Observation is allowed to fail without changing the child result.
export async function executeObservedChild(command, args, observe, options = {}) {
  try { await observe("child-start"); } catch { /* Native command remains authoritative. */ }
  const outcome = await new Promise((resolve) => {
    const child = spawn(command, args, { ...options, stdio: "inherit" });
    const forward = (signal) => { if (!child.killed) child.kill(signal); };
    const onInterrupt = () => forward("SIGINT");
    const onTerminate = () => forward("SIGTERM");
    process.once("SIGINT", onInterrupt);
    process.once("SIGTERM", onTerminate);
    const finish = (result) => {
      process.removeListener("SIGINT", onInterrupt);
      process.removeListener("SIGTERM", onTerminate);
      resolve(result);
    };
    child.once("error", (error) => finish({ code: 1, signal: null, spawnError: String(error) }));
    child.once("exit", (code, signal) => finish({ code, signal }));
  });
  try { await observe(outcome.code === 0 ? "child-passed" : "child-failed", outcome); } catch { /* Preserve the original exit/signal. */ }
  return outcome;
}
export function collectSamples(output, { snapshot: snapshotFactory = hostSnapshot, proc = "/proc" } = {}) {
  const owner = processIdentity(process.pid, proc);
  if (owner.status !== "available") throw new Error("Cannot identify the passive collector");
  fs.writeFileSync(path.join(output, "collector.json"), JSON.stringify(owner, null, 2) + "\n", { flag: "wx" });
  let samples = 0;
  let discardedBytes = 0;
  let stopped = false;
  const started = Date.now();
  const errors = [];
  const sample = () => {
    try {
      const snapshot = snapshotFactory();
      // Log payloads have separate bounded tail files; history retains their identities.
      for (let index = 0; index < LIMITS.logs; index += 1) {
        const log = snapshot.logs[index] ?? { status: "unavailable", reason: "no-current-log-candidate" };
        write(path.join(output, `daemon-tail-${index}.json`), { ...timestamp(), ...log });
        delete log.text;
      }
      discardedBytes += appendBounded(path.join(output, "samples.ndjson"), JSON.stringify(snapshot) + "\n");
      samples += 1;
    } catch (error) { if (errors.length < 16) errors.push(String(error)); }
    write(path.join(output, "collector-status.json"), { ...timestamp(), samples, discardedBytes, errors, stopped });
  };
  const stop = () => {
    if (stopped) return;
    stopped = true;
    clearInterval(timer);
    process.removeListener("SIGTERM", stop);
    process.removeListener("SIGINT", stop);
    sample();
  };
  sample();
  const timer = setInterval(() => { if (Date.now() - started > 80 * 60 * 1000) stop(); else sample(); }, 5000);
  process.once("SIGTERM", stop);
  process.once("SIGINT", stop);
  if (process.connected) process.send?.({ ready: true });
  return { stop };
}
export function exitWithOutcome(outcome) {
  if (outcome.signal) process.kill(process.pid, outcome.signal);
  else process.exitCode = outcome.code;
}
export function stopCollector(output, { proc = "/proc", signal = process.kill } = {}) {
  const owner = JSON.parse(fs.readFileSync(path.join(output, "collector.json"), "utf8"));
  const current = processIdentity(owner.pid, proc);
  if (current.status !== "available") return { status: "unavailable", reason: "collector-not-running", current };
  if (current.startTicks !== owner.startTicks || current.executable !== owner.executable) return { status: "unavailable", reason: "collector-identity-changed" };
  signal(owner.pid, "SIGTERM");
  return { status: "requested", pid: owner.pid };
}
