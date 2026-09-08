import { afterEach, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { appendBounded, boundedCommand, captureDiagnostics, collectSamples, executeObservedChild, hostSnapshot, LIMITS, parseListeners,
  parseProcStat, processIdentity, readBounded, readLogTail, safeCapture, stopCollector, validateOutput } from "./android-host-diagnostics.mjs";
import { main, parseArguments } from "../../scripts/android-host-diagnostics.mjs";

const directories: string[] = [];
afterEach(() => { for (const directory of directories.splice(0)) fs.rmSync(directory, { recursive: true, force: true }); });
function temporary() { const directory = fs.realpathSync(fs.mkdtempSync(path.join(tmpdir(), "canvas-host-observer-"))); directories.push(directory); return directory; }
function write(file: string, value: string) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value); }
function processFixture(proc: string, pid: number, executable: string, start = "12345", name = "adb") {
  const fields = ["S", "1", ...Array(9).fill("0"), "10", "20", ...Array(4).fill("0"), "4", "0", start, "4096", "12"];
  write(path.join(proc, String(pid), "stat"), `${pid} (${name}) ${fields.join(" ")}\n`);
  fs.symlinkSync(executable, path.join(proc, String(pid), "exe"));
}

test("the history has a hard combined bound and records discarded bytes", () => {
  const file = path.join(temporary(), "samples");
  let discarded = 0;
  for (const text of ["1234", "5678", "abcd", "efgh", "ijklmnopqr"]) discarded += appendBounded(file, text, 16);
  const previous = fs.readFileSync(file + ".previous");
  const current = fs.readFileSync(file);
  expect(previous.length + current.length).toBeLessThanOrEqual(16);
  expect(current.toString()).toBe("klmnopqr");
  expect(discarded + previous.length + current.length).toBe(26);
});

test("regular log tails retain source identity and offsets without changing their bytes", () => {
  const file = path.join(temporary(), "adb.log");
  fs.writeFileSync(file, "abcdefghijkl");
  const first = readLogTail(file, process.getuid?.(), 5);
  expect(first).toMatchObject({ status: "available", path: file, size: 12, offset: 7, text: "hijkl", truncated: true, changedDuringRead: false });
  expect(fs.readFileSync(file, "utf8")).toBe("abcdefghijkl");
  fs.renameSync(file, file + ".old");
  fs.writeFileSync(file, "replacement");
  const second = readLogTail(file, process.getuid?.(), 5);
  expect(second.inode).not.toBe(first.inode);
  expect(second.text).toBe("ement");
  const link = file + ".link";
  fs.symlinkSync(file, link);
  expect(readLogTail(link).status).toBe("unavailable");
  expect(readLogTail(file, (process.getuid?.() ?? 0) + 1).reason).toBe("not-an-owned-regular-file");
  expect(readLogTail(file + ".missing")).toMatchObject({ status: "unavailable", reason: "ENOENT" });
});

test("bounded file and command reads distinguish missing data, truncation and timeout", () => {
  const file = path.join(temporary(), "input");
  fs.writeFileSync(file, "123456789");
  expect(readBounded(file, 4)).toEqual({ status: "available", text: "1234", truncated: true });
  expect(readBounded(file + ".missing")).toMatchObject({ status: "unavailable", reason: "ENOENT" });
  const timeout = boundedCommand("node", ["-e", "setInterval(() => {}, 1000)"], 100, 1000);
  expect(timeout).toMatchObject({ status: "unavailable", reason: "ETIMEDOUT" });
  const failed = boundedCommand("node", ["-e", "process.stderr.write('denied'); process.exit(9)"], 1000, 1000);
  expect(failed).toMatchObject({ status: "failed", exitCode: 9, stderr: "denied" });
});

test("actual listener fields retain inode and all reported owners independently of process names", () => {
  const rows = parseListeners('LISTEN 0 4096 127.0.0.1:5037 0.0.0.0:* users:(("adb",pid=42,fd=8),("other",pid=43,fd=9)) uid:1001 ino:9876 sk:1\nLISTEN 0 4096 [::1]:5037 [::]:* uid:0 ino:9877\n');
  expect(rows.map(({ inode, pids }) => ({ inode, pids }))).toEqual([{ inode: "9876", pids: [42, 43] }, { inode: "9877", pids: [] }]);
  expect(parseListeners("")).toEqual([]);
});

test("process start identity handles spaces/parentheses and detects a reused PID", () => {
  const proc = temporary();
  processFixture(proc, 42, "/sdk/adb", "900", "adb (server)");
  expect(processIdentity(42, proc)).toMatchObject({ pid: 42, name: "adb (server)", startTicks: "900", executable: "/sdk/adb", threads: "4", rssPages: "12" });
  expect(() => parseProcStat("not stat")).toThrow();
  const output = temporary();
  write(path.join(output, "collector.json"), JSON.stringify({ pid: 42, startTicks: "899", executable: "/sdk/adb" }));
  const signals: unknown[] = [];
  expect(stopCollector(output, { proc, signal: (...args: unknown[]) => signals.push(args) })).toMatchObject({ reason: "collector-identity-changed" });
  expect(signals).toEqual([]);
  write(path.join(output, "collector.json"), JSON.stringify({ pid: 42, startTicks: "900", executable: "/sdk/adb" }));
  expect(stopCollector(output, { proc, signal: (...args: unknown[]) => signals.push(args) })).toEqual({ status: "requested", pid: 42 });
  expect(signals).toEqual([[42, "SIGTERM"]]);
});

test("passive snapshot accepts an existing listener and samples only the task emulator", () => {
  const proc = temporary();
  processFixture(proc, 42, "/sdk/adb");
  processFixture(proc, 50, "/sdk/emulator/qemu-system-x86_64");
  processFixture(proc, 51, "/sdk/emulator/qemu-system-x86_64");
  write(path.join(proc, "50/cmdline"), "qemu\0-avd\0canvas_candidate\0-secret\0never-record-this\0");
  write(path.join(proc, "51/cmdline"), "qemu\0-avd\0unrelated\0");
  const log = path.join(temporary(), "adb.log");
  fs.writeFileSync(log, "daemon connected\n");
  fs.mkdirSync(path.join(proc, "42/fd"));
  fs.symlinkSync(log, path.join(proc, "42/fd/2"));
  fs.symlinkSync("socket:[777]", path.join(proc, "42/fd/8"));
  const calls: unknown[] = [];
  const snapshot = hostSnapshot({ proc, environment: { TMPDIR: temporary() }, command: (command: string, args: string[]) => {
    calls.push([command, args]);
    return { status: "available", stdout: 'LISTEN 0 4096 127.0.0.1:5037 0.0.0.0:* users:(("adb",pid=42,fd=8)) ino:777\n' };
  } });
  expect(calls).toEqual([["ss", ["-H", "-ltnpe", "sport = :5037"]]]);
  expect(snapshot.sockets.listeners[0]).toMatchObject({ inode: "777", pids: [42], ownership: "verified-at-sample", processes: [{ pid: 42, startTicks: "12345", fd: 8, socketVerified: true }] });
  expect(snapshot.emulator.processes.map((item: { pid: number }) => item.pid)).toEqual([50]);
  expect(snapshot.logs[0]).toMatchObject({ status: "available", text: "daemon connected\n" });
  expect(snapshot.resources.meminfo.status).toBe("unavailable");
  expect(snapshot.coverage.transientEventsBetweenSamples).toBe("unknown");
  expect(JSON.stringify(snapshot)).not.toContain("never-record-this");
  expect(JSON.stringify(snapshot)).not.toContain("unrelated");
  fs.unlinkSync(path.join(proc, "42/fd/8"));
  const changed = hostSnapshot({ proc, environment: { TMPDIR: temporary() }, command: () => ({ status: "available", stdout: snapshot.sockets.stdout }) });
  expect(changed.sockets.listeners[0]).toMatchObject({ ownership: "unavailable-or-changed", processes: [{ socketVerified: false }] });
  expect(changed.logs.some((item: { path: string }) => item.path === log)).toBe(false);
});

test("failed socket and kernel observations are explicit and do not erase the host snapshot", () => {
  const output = temporary();
  write(path.join(output, "metadata.json"), JSON.stringify({ utc: "2026-09-08T00:00:00.000Z" }));
  const calls: unknown[] = [];
  const file = captureDiagnostics(output, "journey-failed", { kernel: true, snapshot: () => ({ utc: "now", sockets: { status: "unavailable", reason: "EACCES" } }),
    command: (command: string, args: string[], timeout: number, maxBuffer: number) => {
      calls.push({ command, args, timeout, maxBuffer });
      return { status: "failed", exitCode: 1, stderr: "permission denied" };
    } });
  expect(JSON.parse(fs.readFileSync(file, "utf8"))).toMatchObject({ stage: "journey-failed", sockets: { reason: "EACCES" }, kernel: { status: "failed", stderr: "permission denied" } });
  expect(calls).toEqual([{ command: "journalctl", args: expect.arrayContaining(["--dmesg", "--lines=400"]), timeout: 3000, maxBuffer: 256 * 1024 }]);
  fs.unlinkSync(path.join(output, "metadata.json"));
  const missing = captureDiagnostics(output, "final", { kernel: true, snapshot: () => ({ marker: "kept" }) });
  expect(JSON.parse(fs.readFileSync(missing, "utf8"))).toMatchObject({ marker: "kept", kernel: { status: "unavailable", reason: "ENOENT" } });
  expect(safeCapture(output, "../escape").status).toBe("unavailable");
});

test("sampling flushes on stop, removes signal listeners, and replaces stale log slots", () => {
  const proc = temporary();
  processFixture(proc, process.pid, process.execPath);
  const output = temporary();
  let count = 0;
  const listeners = process.listenerCount("SIGTERM");
  const collector = collectSamples(output, { proc, snapshot: () => ({ sequence: ++count, logs: count === 1 ? [{ status: "available", path: "/tmp/adb.log", text: "first" }] : [] }) });
  const owner = fs.readFileSync(path.join(output, "collector.json"), "utf8");
  expect(() => collectSamples(output, { proc, snapshot: () => { throw new Error("second collector must not sample"); } })).toThrow("EEXIST");
  expect(fs.readFileSync(path.join(output, "collector.json"), "utf8")).toBe(owner);
  collector.stop();
  collector.stop();
  expect(count).toBe(2);
  expect(process.listenerCount("SIGTERM")).toBe(listeners);
  expect(JSON.parse(fs.readFileSync(path.join(output, "collector-status.json"), "utf8"))).toMatchObject({ stopped: true, samples: 2, errors: [] });
  expect(JSON.parse(fs.readFileSync(path.join(output, "daemon-tail-0.json"), "utf8"))).toMatchObject({ status: "unavailable", reason: "no-current-log-candidate" });
});

for (const code of [0, 7]) test(`child exit ${code} and exactly one execution survive observer failure`, async () => {
  const file = path.join(temporary(), "calls");
  const stages: string[] = [];
  const outcome = await executeObservedChild("node", ["-e", `require('fs').appendFileSync(process.argv[1], 'once\\n'); process.exit(${code})`, file], (stage: string) => { stages.push(stage); throw new Error("observer failed"); });
  expect(outcome).toEqual({ code, signal: null });
  expect(fs.readFileSync(file, "utf8")).toBe("once\n");
  expect(stages).toEqual(["child-start", code === 0 ? "child-passed" : "child-failed"]);
});

test("a real child signal remains a signal and leaves no parent handlers", async () => {
  const before = process.listenerCount("SIGTERM");
  const outcome = await executeObservedChild("node", ["-e", "process.kill(process.pid, 'SIGTERM')"], () => { throw new Error("capture unavailable"); });
  expect(outcome).toEqual({ code: null, signal: "SIGTERM" });
  expect(process.listenerCount("SIGTERM")).toBe(before);
});

test("CLI rejects duplicate/ambiguous arguments and requires the hosted CI path before observing", () => {
  expect(parseArguments(["run", "--output", "/tmp/task/android-host-diagnostics", "--", "node", "script.mjs"])).toMatchObject({ command: "run", child: ["node", "script.mjs"] });
  for (const args of [["start", "--output", "a", "--output", "b"], ["run", "--output", "a"], ["capture", "--output", "a"], ["start", "--output", "a", "--stage", "x"]]) expect(() => parseArguments(args)).toThrow();
  expect(() => validateOutput("/tmp/android-host-diagnostics", {}, "linux")).toThrow("GitHub-hosted");
  const temp = temporary();
  const environment = { GITHUB_ACTIONS: "true", RUNNER_ENVIRONMENT: "github-hosted", RUNNER_TEMP: temp };
  const output = path.join(temp, "native-smoke/android-host-diagnostics");
  expect(() => validateOutput(output, environment, "linux")).toThrow("ENOENT");
  expect(fs.existsSync(path.dirname(output))).toBe(false);
  fs.mkdirSync(path.dirname(output));
  expect(validateOutput(output, environment, "linux")).toBe(output);
  expect(() => validateOutput(path.join(temp, "outside"), environment, "linux")).toThrow();
  fs.symlinkSync(temporary(), output);
  expect(() => validateOutput(output, environment, "linux")).toThrow("symlink");
  fs.unlinkSync(output);
  fs.symlinkSync(path.join(temp, "missing"), output);
  expect(() => validateOutput(output, environment, "linux")).toThrow("symlink");
  expect(() => parseArguments(["capture", "--output", output, "--stage", "../unsafe"])).toThrow("stage");
});

test("capture count is bounded without overwriting earlier observations", () => {
  const output = temporary();
  for (let i = 0; i < LIMITS.snapshots; i += 1) captureDiagnostics(output, "child-start", { snapshot: () => ({ index: i }) });
  expect(safeCapture(output, "child-start", { snapshot: () => ({ index: 99 }) })).toMatchObject({ status: "unavailable", reason: "Diagnostic snapshot limit reached" });
  expect(fs.readdirSync(path.join(output, "snapshots"))).toHaveLength(LIMITS.snapshots);
});


test("the CLI outcome handler returns exact numeric status or the original OS signal", () => {
  const module = new URL("./android-host-diagnostics.mjs", import.meta.url).href;
  for (const outcome of [{ code: 0, signal: null }, { code: 7, signal: null }, { code: null, signal: "SIGTERM" }]) {
    const child = spawnSync("node", ["--input-type=module", "-e", `import { exitWithOutcome } from ${JSON.stringify(module)}; exitWithOutcome(${JSON.stringify(outcome)});`], { encoding: "utf8", timeout: 2000 });
    expect(child.error).toBeUndefined();
    expect(child.status).toBe(outcome.code);
    expect(child.signal).toBe(outcome.signal);
  }
});


for (const command of ["start", "finalize"]) test(`${command} command keeps unavailable setup/finalization from failing the native job`, async () => {
  const temp = temporary();
  const output = path.join(temp, "native-smoke/android-host-diagnostics");
  fs.mkdirSync(path.dirname(output));
  const warnings: string[] = [];
  const previousExitCode = process.exitCode;
  const environment = { GITHUB_ACTIONS: "true", RUNNER_ENVIRONMENT: "github-hosted", RUNNER_TEMP: temp };
  let operations = 0;
  const unavailable = () => { operations += 1; throw Object.assign(new Error("disk unavailable"), { code: "ENOSPC" }); };
  const result = await main([command, "--output", output], { guard: (value: string) => validateOutput(value, environment, "linux"),
    begin: unavailable, finish: unavailable, warn: (message: string) => warnings.push(message) });
  expect(result).toMatchObject({ status: "unavailable", reason: "Error: disk unavailable" });
  expect(operations).toBe(1);
  expect(process.exitCode).toBe(previousExitCode);
  expect(warnings).toHaveLength(1);
  expect(warnings[0]).toContain(command);
  expect(warnings[0]).toContain("unavailable");
});

test("host/path rejection disables observation while malformed command arguments stay fatal", async () => {
  const warnings: string[] = [];
  const unavailable = await main(["finalize", "--output", "/tmp/task/android-host-diagnostics"], {
    guard: () => { throw Object.assign(new Error("permission denied"), { code: "EACCES" }); }, warn: (message: string) => warnings.push(message),
  });
  expect(unavailable).toMatchObject({ status: "unavailable" });
  expect(warnings).toHaveLength(1);
  const hostDenied = await main(["finalize", "--output", "/tmp/task/android-host-diagnostics"], {
    guard: (value: string) => validateOutput(value, {}, "linux"), warn: () => {},
  });
  expect(hostDenied).toMatchObject({ status: "unavailable", reason: expect.stringContaining("GitHub-hosted") });
  await expect(main(["finalize", "--output", "a", "--output", "b"])).rejects.toThrow("unique");
  const temp = temporary();
  const environment = { GITHUB_ACTIONS: "true", RUNNER_ENVIRONMENT: "github-hosted", RUNNER_TEMP: temp };
  const outside = path.join(temporary(), "untouched/android-host-diagnostics");
  const pathDenied = await main(["start", "--output", outside], {
    guard: (value: string) => validateOutput(value, environment, "linux"), warn: () => {},
  });
  expect(pathDenied).toMatchObject({ status: "unavailable", reason: expect.stringContaining("RUNNER_TEMP") });
  expect(fs.existsSync(path.dirname(outside))).toBe(false);
});


test("an unavailable observer path still runs the real child once with its original exit", () => {
  const counter = path.join(temporary(), "calls");
  const module = new URL("../../scripts/android-host-diagnostics.mjs", import.meta.url).href;
  const args = ["run", "--output", "/tmp/unavailable/android-host-diagnostics", "--", "node", "-e", "require('fs').appendFileSync(process.argv[1], 'once'); process.exit(7)", counter];
  const source = `import { main } from ${JSON.stringify(module)}; await main(${JSON.stringify(args)}, { guard() { throw Object.assign(new Error('disk unavailable'), {code: 'EACCES'}); }, warn() {} });`;
  const child = spawnSync("node", ["--input-type=module", "-e", source], { encoding: "utf8", timeout: 2000 });
  expect(child.error).toBeUndefined();
  expect(child.status).toBe(7);
  expect(child.signal).toBeNull();
  expect(fs.readFileSync(counter, "utf8")).toBe("once");
});


for (const signal of [false, true]) test(`a denied observer guard preserves a real child ${signal ? "signal" : "exit"} without out-of-scope writes`, () => {
  const allowed = temporary();
  const outside = path.join(temporary(), "untouched/android-host-diagnostics");
  const counter = path.join(temporary(), "calls");
  const module = new URL("../../scripts/android-host-diagnostics.mjs", import.meta.url).href;
  const helper = new URL("./android-host-diagnostics.mjs", import.meta.url).href;
  const childCode = "require('fs').appendFileSync(process.argv[1], JSON.stringify({called: true, observer: process.env.CANVAS_ANDROID_DIAGNOSTICS ?? null})); " + (signal ? "process.kill(process.pid, 'SIGTERM')" : "process.exit(7)");
  const args = ["run", "--output", outside, "--", "node", "-e", childCode, counter];
  const environment = { GITHUB_ACTIONS: "true", RUNNER_ENVIRONMENT: "github-hosted", RUNNER_TEMP: allowed };
  const source = `import { main } from ${JSON.stringify(module)}; import { validateOutput } from ${JSON.stringify(helper)}; await main(${JSON.stringify(args)}, { guard(value) { return validateOutput(value, ${JSON.stringify(environment)}, 'linux'); } });`;
  const child = spawnSync("node", ["--input-type=module", "-e", source], { encoding: "utf8", timeout: 2000,
    env: { ...process.env, CANVAS_ANDROID_DIAGNOSTICS: outside } });
  expect(child.error).toBeUndefined();
  expect(child.status).toBe(signal ? null : 7);
  expect(child.signal).toBe(signal ? "SIGTERM" : null);
  expect(child.stderr).toContain("unavailable");
  expect(child.stderr).toContain("RUNNER_TEMP");
  expect(fs.readFileSync(counter, "utf8")).toBe(JSON.stringify({ called: true, observer: null }));
  expect(fs.existsSync(path.dirname(outside))).toBe(false);
  expect(fs.readdirSync(allowed)).toEqual([]);
});


test("a denied capture guard prints its actual unavailable reason as stdout JSON", () => {
  const outside = path.join(temporary(), "untouched/android-host-diagnostics");
  const module = new URL("../../scripts/android-host-diagnostics.mjs", import.meta.url).href;
  const helper = new URL("./android-host-diagnostics.mjs", import.meta.url).href;
  const args = ["capture", "--output", outside, "--stage", "journey-failed"];
  const source = `import { main } from ${JSON.stringify(module)}; import { validateOutput } from ${JSON.stringify(helper)}; await main(${JSON.stringify(args)}, { guard(value) { return validateOutput(value, {}, 'linux'); } });`;
  const child = spawnSync("node", ["--input-type=module", "-e", source], { encoding: "utf8", timeout: 2000 });
  expect(child.error).toBeUndefined();
  expect(child.status).toBe(0);
  expect(JSON.parse(child.stdout)).toEqual({ status: "unavailable", reason: "Error: Passive Android diagnostics are restricted to the GitHub-hosted Linux CI job" });
  expect(child.stderr).toContain("GitHub-hosted Linux CI job");
  expect(fs.existsSync(path.dirname(outside))).toBe(false);
});
