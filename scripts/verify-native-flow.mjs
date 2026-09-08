// Maestro's check-syntax command stops before command conversion. Use the pinned
// distribution's full parser so invalid commands fail before native builds.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { accessSync, constants, existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { delimiter, dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const manifest = JSON.parse(readFileSync(new URL("../tools/native/maestro.json", import.meta.url), "utf8"));
const defaultFlow = fileURLToPath(new URL("../tools/native/flows/candidate.yaml", import.meta.url));
const bridge = fileURLToPath(new URL("../tools/native/ParseFlow.java", import.meta.url));

function executable(command) {
  const candidates = isAbsolute(command) || command.includes("/") || command.includes("\\")
    ? [resolve(command)]
    : (process.env.PATH ?? "").split(delimiter).map((directory) => resolve(directory, command));
  for (const candidate of candidates) {
    try {
      accessSync(candidate, constants.X_OK);
      if (statSync(candidate).isFile()) return realpathSync(candidate);
    } catch { /* Continue through PATH, or report the selected path below. */ }
  }
  throw new Error(`Native flow preflight cannot find executable: ${command}`);
}

function run(command, args, purpose, includeStderr = false) {
  const result = spawnSync(command, args, {
    encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 30_000,
    env: { ...process.env, MAESTRO_CLI_NO_ANALYTICS: "1", MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: "true" },
  });
  if (result.error) throw new Error(`${purpose}: ${result.error.message}`, { cause: result.error });
  if (result.status !== 0) throw new Error(`${purpose} failed (exit ${result.status ?? result.signal}):\n${result.stderr}${result.stdout}`.trim());
  return includeStderr ? result.stdout + result.stderr : result.stdout;
}

/** Parse every command with the reviewed Maestro libraries, without a device. */
export function verifyNativeFlow({ maestro = "maestro", flow = defaultFlow } = {}) {
  const flowPath = resolve(flow);
  if (!existsSync(flowPath) || !statSync(flowPath).isFile()) throw new Error(`Native flow is missing: ${flowPath}`);
  const flowBytes = readFileSync(flowPath);
  const cli = executable(maestro);
  // Match the official launcher's Java selection, and inspect properties from
  // both streams because Java prints version/settings information to stderr.
  const java = executable(process.env.JAVA_HOME ? join(process.env.JAVA_HOME, "bin/java") : "java");
  const javaInfo = run(java, ["-XshowSettings:properties", "-version"], "Java version check", true);
  const javaVersion = /^\s*java\.version\s*=\s*(\S+)\s*$/m.exec(javaInfo)?.[1];
  const specification = /^\s*java\.specification\.version\s*=\s*(\d+(?:\.\d+)?)\s*$/m.exec(javaInfo)?.[1];
  const javaMajor = Number(specification?.startsWith("1.") ? specification.slice(2) : specification);
  if (!javaVersion || !Number.isInteger(javaMajor) || javaMajor < 17) {
    throw new Error(`Native flow preflight requires Java 17 or newer; received ${javaVersion ?? "an unknown Java version"}`);
  }
  const maestroVersion = run(cli, ["--version"], "Maestro version check").trim();
  if (maestroVersion !== manifest.version) throw new Error(`Native flow preflight requires Maestro ${manifest.version}, received ${maestroVersion}`);
  const libraries = resolve(dirname(cli), "../lib");
  for (const name of [`maestro-cli-${manifest.version}.jar`, "maestro-orchestra.jar", "maestro-orchestra-models.jar", "maestro-client.jar"]) {
    if (!existsSync(join(libraries, name))) throw new Error(`Pinned Maestro library is missing: ${join(libraries, name)}`);
  }
  // Java 17 source-file mode compiles this small bridge in memory, with no javac
  // step or checked-in class.
  const output = run(java, ["--class-path", join(libraries, "*"), bridge, flowPath], "Maestro full command parser (Java 17+ required)");
  const count = /^CANVAS_NATIVE_FLOW_COMMANDS=(\d+)$/m.exec(output)?.[1];
  if (!count) throw new Error(`Maestro parser did not report successful command conversion:\n${output}`);
  if (!readFileSync(flowPath).equals(flowBytes)) throw new Error("Native flow changed during parser verification");
  return {
    maestroVersion, javaVersion, commandCount: Number(count), flow: flowPath,
    flowSha256: createHash("sha256").update(flowBytes).digest("hex"),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = {};
    for (let index = 2; index < process.argv.length; index += 2) {
      const key = process.argv[index];
      const value = process.argv[index + 1];
      if (!["--maestro", "--flow"].includes(key) || !value || value.startsWith("--")) {
        throw new Error("Usage: node scripts/verify-native-flow.mjs [--maestro PATH] [--flow FLOW.yaml]");
      }
      if (Object.hasOwn(options, key.slice(2))) throw new Error(`Duplicate native flow argument: ${key}`);
      options[key.slice(2)] = value;
    }
    console.log(JSON.stringify(verifyNativeFlow(options), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
