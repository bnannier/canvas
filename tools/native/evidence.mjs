import * as fs from "node:fs";
import * as path from "node:path";

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
export function recordNativeAttempt(evidence, result, initialAppearance, restoreAppearance, exercise) {
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
  } finally {
    try {
      if (previous !== undefined) restoreAppearance(previous);
    } catch (error) {
      result.status = "failed";
      result.restorationError = String(error);
      failure = failure ? new AggregateError([failure, error], "Native journey and appearance restoration failed") : error;
    } finally {
      result.finishedAt = new Date().toISOString();
      fs.writeFileSync(path.join(evidence, "result.json"), JSON.stringify(result, null, 2) + "\n", { flag: "wx" });
    }
  }
  if (failure) throw failure;
}
