// This wrapper observes the CI attempt without managing ADB or replaying work.
import * as fs from "node:fs";
import * as path from "node:path";
import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";
import { initializeDiagnostics, collectSamples, stopCollector, validateOutput, safeCapture, timestamp, executeObservedChild, boundedCommand, exitWithOutcome } from "../tools/native/android-host-diagnostics.mjs";

const script = fileURLToPath(import.meta.url);
export function parseArguments(args) {
  const [command, ...rest] = args;
  const separator = rest.indexOf("--");
  const options = separator < 0 ? rest : rest.slice(0, separator);
  const child = separator < 0 ? [] : rest.slice(separator + 1);
  const values = {};
  for (let index = 0; index < options.length; index += 2) {
    if (!["--output", "--stage"].includes(options[index]) || options[index] in values || !options[index + 1] || options[index + 1].startsWith("--")) throw new Error("Expected unique diagnostic arguments");
    values[options[index]] = options[index + 1];
  }
  if (!["start", "collect", "capture", "run", "finalize"].includes(command) || !values["--output"]
    || (command === "run") !== (child.length > 0) || (command === "capture") !== Boolean(values["--stage"])) throw new Error("Invalid diagnostic command");
  if (values["--stage"] && !/^[a-z][a-z0-9-]{0,40}$/.test(values["--stage"])) throw new Error("Invalid diagnostic stage");
  return { command, output: path.resolve(values["--output"]), stage: values["--stage"], child };
}
function record(output, name, value) {
  fs.writeFileSync(path.join(output, name), JSON.stringify({ ...timestamp(), ...value }, null, 2) + "\n");
}
function captureBounded(output, stage) {
  const captured = boundedCommand(process.execPath, [script, "capture", "--output", output, "--stage", stage], 5000, 16384);
  if (captured.status !== "available") return captured;
  try { return JSON.parse(captured.stdout); }
  catch { return { status: "unavailable", reason: "invalid-capture-response" }; }
}
async function start(output) {
  initializeDiagnostics(output);
  record(output, "preboot.json", safeCapture(output, "preboot"));
  const child = fork(script, ["collect", "--output", output], { detached: true, stdio: ["ignore", "ignore", "ignore", "ipc"] });
  const result = await new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ status: "unavailable", reason: "collector-start-timeout" }), 3000);
    child.once("message", () => { clearTimeout(timer); resolve({ status: "available", pid: child.pid }); });
    child.once("error", (error) => { clearTimeout(timer); resolve({ status: "unavailable", reason: String(error) }); });
    child.once("exit", (code, signal) => { clearTimeout(timer); resolve({ status: "unavailable", reason: "collector-exited", code, signal }); });
  });
  if (child.connected) child.disconnect();
  child.unref();
  record(output, "startup.json", result);
}
export async function bestEffortObservation(command, operation, warn = console.warn) {
  try { return await operation(); }
  catch (error) {
    const result = { status: "unavailable", reason: String(error) };
    try { warn(`Passive Android diagnostics ${command}: ${JSON.stringify(result)}`); } catch { /* Even an unavailable log sink must not replace the native outcome. */ }
    return result;
  }
}
async function finalize(output) {
  if (!fs.existsSync(output)) fs.mkdirSync(output);
  const final = path.join(output, "finalization.json");
  if (fs.existsSync(final)) return;
  const snapshot = captureBounded(output, "final");
  let collector;
  try { collector = stopCollector(output); }
  catch (error) { collector = { status: "unavailable", reason: String(error) }; }
  let acknowledged = false;
  if (collector.status === "requested") {
    const deadline = Date.now() + 3000;
    do {
      try { acknowledged = JSON.parse(fs.readFileSync(path.join(output, "collector-status.json"), "utf8")).stopped === true; } catch { /* A partial/missing status is not completion. */ }
      if (!acknowledged) await new Promise((resolve) => setTimeout(resolve, 50));
    } while (!acknowledged && Date.now() < deadline);
  }
  record(output, "finalization.json", { snapshot, collector, acknowledged });
}
export async function main(args, { guard = validateOutput, begin = start, finish = finalize, warn = console.warn } = {}) {
  const options = parseArguments(args);
  let output;
  const validation = await bestEffortObservation("path access", () => { output = guard(options.output); }, warn);
  if (validation?.status === "unavailable") {
    // No observation path was proven accessible. Run the unchanged native child
    // without enabling its observer, or report unavailable standalone diagnostics.
    if (options.command === "run") {
      const environment = { ...process.env };
      delete environment.CANVAS_ANDROID_DIAGNOSTICS;
      exitWithOutcome(await executeObservedChild(options.child[0], options.child.slice(1), () => {}, { env: environment }));
    }
    if (options.command === "capture") console.log(JSON.stringify(validation));
    return validation;
  }
  if (options.command === "start") return bestEffortObservation("start", () => begin(output), warn);
  if (options.command === "collect") return bestEffortObservation("collect", () => collectSamples(output), warn);
  if (options.command === "capture") {
    const result = safeCapture(output, options.stage, { kernel: options.stage.endsWith("failed") || options.stage === "final" });
    console.log(JSON.stringify(result));
    return;
  }
  if (options.command === "finalize") return bestEffortObservation("finalize", () => finish(output), warn);
  const observe = (stage, outcome) => bestEffortObservation(stage, () => {
    if (!fs.existsSync(output)) fs.mkdirSync(output);
    const result = captureBounded(output, stage);
    // Snapshots are authoritative; this small outcome file also survives capture failure.
    record(output, `latest-${stage}.json`, { capture: result, ...(outcome ? { outcome } : {}) });
  }, warn);
  const outcome = await executeObservedChild(options.child[0], options.child.slice(1), observe, {
    env: { ...process.env, CANVAS_ANDROID_DIAGNOSTICS: output },
  });
  exitWithOutcome(outcome);
}
if (process.argv[1] && path.resolve(process.argv[1]) === script) {
  main(process.argv.slice(2)).catch((error) => { console.error(String(error)); process.exitCode = 1; });
}
