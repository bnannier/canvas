import { afterEach, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createEvidenceDirectory, recordNativeAttempt, successfulMaestroReport } from "./evidence.mjs";
import { fileURLToPath } from "node:url";

const temporary: string[] = [];
afterEach(() => { for (const directory of temporary.splice(0)) rmSync(directory, { recursive: true, force: true }); });
function output() {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), "canvas-native-evidence-")));
  temporary.push(directory);
  return directory;
}
const readResult = (directory: string) => JSON.parse(readFileSync(join(directory, "result.json"), "utf8"));

test("a phase requires one successful JUnit case before its evidence is consumed", () => {
  const report = join(output(), "report.xml");
  const success = '<testsuites><testsuite name="Test Suite" tests="1" failures="0"><testcase name="measurement" status="SUCCESS"/></testsuite></testsuites>';
  writeFileSync(report, success);
  expect(successfulMaestroReport(report)).toEqual({ path: report, sha256: expect.stringMatching(/^[a-f0-9]{64}$/) });
  for (const invalid of [
    "", success.replace('tests="1"', 'tests="0"'), success.replace('failures="0"', 'failures="1"'),
    success.replace('status="SUCCESS"', 'status="ERROR"'),
    success.replace('/></testsuite>', '><failure>failed</failure></testcase></testsuite>'),
    success.replace('/></testsuite>', '><skipped/></testcase></testsuite>'),
    success.replace('</testsuite>', '<testcase status="SUCCESS"/></testsuite>'),
    `<!DOCTYPE testsuites>${success}`,
  ]) {
    writeFileSync(report, invalid);
    expect(() => successfulMaestroReport(report)).toThrow("Expected one successful Maestro JUnit case");
  }
});

test("invalid evidence CLI arguments fail before reading a candidate or touching a device", () => {
  const script = fileURLToPath(new URL("../../scripts/native-smoke.mjs", import.meta.url));
  const root = output();
  for (const args of [
    ["test", "--output", root, "--evidence"],
    ["test", "--output", root, "--evidence", "first", "--evidence", "second"],
    ["build", "--output", root, "--evidence", "invalid-build-option"],
  ]) {
    const result = spawnSync("node", [script, ...args], { encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/Expected unique named|only valid for test/);
    expect(result.stderr).not.toContain("context.json");
  }
});

test("a fresh labeled attempt preserves the default and earlier failure bytes", () => {
  const root = output();
  const first = createEvidenceDirectory(root, "ios");
  expect(first).toBe(join(root, "ios-evidence"));
  writeFileSync(join(first, "result.json"), "original failed result\n");
  const next = createEvidenceDirectory(root, "ios", join(root, "ios-evidence-flow-fix"));
  expect(next).toBe(join(root, "ios-evidence-flow-fix"));
  expect(readFileSync(join(first, "result.json"), "utf8")).toBe("original failed result\n");
  expect(() => createEvidenceDirectory(root, "ios", next)).toThrow();
});

test("evidence cannot reuse files or links, enter protected trees, or escape its candidate", () => {
  const root = output();
  const outside = output();
  mkdirSync(join(root, "app"));
  symlinkSync(outside, join(root, "alias"));
  symlinkSync(join(root, "missing"), join(root, "ios-evidence-dangling"));
  writeFileSync(join(root, "ios-evidence-file"), "preserve");
  for (const requested of [
    join(root, "app"), join(root, "app/ios-evidence"), join(root, "alias/ios-evidence"),
    join(root, "ios-evidence-dangling"), join(root, "ios-evidence-file"),
    join(outside, "ios-evidence"), join(root, "android-evidence"),
  ]) expect(() => createEvidenceDirectory(root, "ios", requested)).toThrow();
  expect(() => createEvidenceDirectory(root, "web")).toThrow("Unknown native platform");
  expect(readFileSync(join(root, "ios-evidence-file"), "utf8")).toBe("preserve");
});

test("an initial appearance failure is recorded without device input or guessed restoration", () => {
  const evidence = createEvidenceDirectory(output(), "ios");
  const calls: string[] = [];
  const result = { status: "failed" };
  expect(() => recordNativeAttempt(evidence, result, () => { throw new Error("appearance unavailable"); },
    () => calls.push("restore"), () => calls.push("exercise"))).toThrow("appearance unavailable");
  expect(calls).toEqual([]);
  expect(readResult(evidence)).toMatchObject({ status: "failed", error: "Error: appearance unavailable" });
});

test("a journey and restoration failure retain both errors and the original binary identity", () => {
  const evidence = createEvidenceDirectory(output(), "android");
  const identity = { candidateRevision: "a".repeat(40) };
  const result = { status: "failed", identity, testInfrastructure: { revision: "b".repeat(40), dirty: false } };
  const calls: string[] = [];
  expect(() => recordNativeAttempt(evidence, result, () => "no", (previous: string) => {
    calls.push(previous); throw new Error("restore failed");
  }, () => { throw new Error("journey failed"); })).toThrow(AggregateError);
  expect(calls).toEqual(["no"]);
  expect(readResult(evidence)).toMatchObject({
    status: "failed", identity, testInfrastructure: { revision: "b".repeat(40), dirty: false },
    error: "Error: journey failed", restorationError: "Error: restore failed", initialAppearance: "no",
  });
});

test("passing both schemes qualifies only when restoration succeeds", () => {
  for (const restorationFails of [false, true]) {
    const evidence = createEvidenceDirectory(output(), "ios");
    const result = { status: "failed", schemes: {} as Record<string, string> };
    const calls: string[] = [];
    const exercise = () => recordNativeAttempt(evidence, result, () => "dark", (previous: string) => {
      calls.push(`restore:${previous}`);
      if (restorationFails) throw new Error("restore failed");
    }, () => {
      for (const scheme of ["light", "dark"]) { calls.push(scheme); result.schemes[scheme] = "passed"; }
    });
    if (restorationFails) expect(exercise).toThrow("restore failed");
    else expect(exercise).not.toThrow();
    expect(calls).toEqual(["light", "dark", "restore:dark"]);
    expect(readResult(evidence).status).toBe(restorationFails ? "failed" : "passed");
  }
});
