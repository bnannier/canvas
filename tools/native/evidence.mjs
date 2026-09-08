import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";

/** The pinned CLI emits one JUnit case for each explicit flow invocation. */
export function successfulMaestroReport(file) {
  const bytes = fs.readFileSync(file);
  const xml = bytes.toString("utf8");
  const suites = [...xml.matchAll(/<testsuite\s[^>]*>/g)];
  const cases = [...xml.matchAll(/<testcase\s[^>]*>/g)];
  if (suites.length !== 1 || cases.length !== 1
    || !/\btests="1"/.test(suites[0][0]) || !/\bfailures="0"/.test(suites[0][0])
    || !/\bstatus="SUCCESS"/.test(cases[0][0])
    || /<(?:failure|error|skipped)\b|<!DOCTYPE|<!ENTITY/.test(xml)) {
    throw new Error("Expected one successful Maestro JUnit case");
  }
  return { path: fs.realpathSync(file), sha256: createHash("sha256").update(bytes).digest("hex") };
}

// Evidence is a fresh sibling of earlier attempts, never a directory inside
// the installed app, sealed package, binary, source checkout or another attempt.
export function createEvidenceDirectory(output, platform, requested) {
  if (!["ios", "android"].includes(platform)) throw new Error("Unknown native platform");
  const parent = fs.realpathSync(output);
  const evidence = path.resolve(requested ?? path.join(parent, `${platform}-evidence`));
  if (fs.realpathSync(path.dirname(evidence)) !== parent
    || !new RegExp(`^${platform}-evidence(?:-[a-zA-Z0-9][a-zA-Z0-9._-]*)?$`).test(path.basename(evidence))) {
    throw new Error(`Evidence must be a fresh ${platform}-evidence[-label] directory directly inside the candidate output`);
  }
  const canonical = path.join(parent, path.basename(evidence));
  fs.mkdirSync(canonical);
  return canonical;
}

// Persist every failure after creating the evidence directory, including an
// unreadable initial appearance. A failed restoration never erases the journey
// error and never leaves an otherwise successful run marked as passed.
export function recordNativeAttempt(evidence, result, initialAppearance, restoreAppearance, exercise, observeFailure) {
  const observe = (phase, error) => {
    if (!observeFailure) return;
    result.failureObservations ??= [];
    try { result.failureObservations.push({ phase, observation: observeFailure(phase, error) }); }
    catch (observationError) { result.failureObservations.push({ phase, observation: { status: "unavailable", reason: String(observationError) } }); }
  };
  let previous;
  let failure;
  try {
    previous = initialAppearance();
    result.initialAppearance = previous;
    exercise();
    result.status = "passed";
  } catch (error) {
    failure = error;
    result.status = "failed";
    result.error = String(error);
    observe("journey-failed", error);
  } finally {
    try {
      if (previous !== undefined) restoreAppearance(previous);
    } catch (error) {
      result.status = "failed";
      result.restorationError = String(error);
      observe("restoration-failed", error);
      failure = failure ? new AggregateError([failure, error], "Native journey and appearance restoration failed") : error;
    } finally {
      result.finishedAt = new Date().toISOString();
      fs.writeFileSync(path.join(evidence, "result.json"), JSON.stringify(result, null, 2) + "\n", { flag: "wx" });
    }
  }
  if (failure) throw failure;
}
