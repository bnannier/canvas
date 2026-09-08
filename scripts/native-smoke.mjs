// The ordinary starter stays registry-pinned. All candidate installs, generated
// native projects and build outputs belong to a fresh isolated output directory.
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyArtifacts } from "./release.mjs";
import { appInventory, assertInstalledPackage, fileInventory, packageIdentity, sha256 } from "../tools/native/candidate.mjs";
import { installSmokeFixtures } from "../tools/native/fixtures.mjs";
import { createEvidenceDirectory, recordNativeAttempt } from "../tools/native/evidence.mjs";
import { verifyNativeFlow } from "./verify-native-flow.mjs";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
const env = (identity) => ({
  ...Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_"))),
  HUSKY: "0", CI: "1", EXPO_PUBLIC_CANVAS_SMOKE: "1", CANVAS_SMOKE_IDENTITY: JSON.stringify(identity),
  MAESTRO_CLI_NO_ANALYTICS: "1", MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: "true",
});
function run(cwd, command, args, identity, capture = false) {
  return execFileSync(command, args, { cwd, env: env(identity), encoding: "utf8", stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit" });
}

export function prepareNativeSmoke(candidate, artifacts, output) {
  const manifest = verifyArtifacts(repo, candidate, artifacts);
  const identity = packageIdentity(manifest);
  if (fs.existsSync(output)) throw new Error("Native smoke output must be a new directory");
  fs.mkdirSync(output, { recursive: true });
  const app = path.join(output, "app");
  fs.mkdirSync(app);
  // Copy only the candidate's committed tree. An ignored .env file or untracked
  // fixture in a developer checkout must not alter the app attributed to HEAD.
  const starterArchive = path.join(output, "starter.tar");
  run(repo, "git", ["archive", "--format=tar", "--output", starterArchive, "HEAD", "examples/starter"], identity);
  run(output, "tar", ["-xf", starterArchive, "-C", app, "--strip-components=2"], identity);
  run(app, "bun", ["install", "--frozen-lockfile"], identity);
  const tarball = path.join(output, manifest.packageFile);
  fs.copyFileSync(path.join(artifacts, manifest.packageFile), tarball);
  if (sha256(tarball) !== identity.packageSha256) throw new Error("Copied candidate checksum changed");
  const unpacked = path.join(output, "unpacked");
  fs.mkdirSync(unpacked);
  run(output, "tar", ["-xzf", tarball, "-C", unpacked], identity);
  const metadataFile = path.join(app, "package.json");
  const metadata = read(metadataFile);
  metadata.dependencies[manifest.name] = `file:${tarball}`;
  write(metadataFile, metadata);
  run(app, "bun", ["install", "--ignore-scripts"], identity);
  assertInstalledPackage(path.join(unpacked, "package"), path.join(app, "node_modules", manifest.name));
  const installed = read(path.join(app, "node_modules", manifest.name, "package.json"));
  if (installed.version !== identity.packageVersion) throw new Error("Installed version differs from the candidate");
  // These templates can exercise new candidate APIs that the registry starter's
  // published pin does not have yet. Typecheck them only against the sealed install.
  installSmokeFixtures(app);
  run(app, "bun", ["run", "typecheck"], identity);
  const configuration = JSON.parse(run(app, "node", ["node_modules/expo/bin/cli", "config", "--type", "public", "--json"], identity, true));
  if (configuration.ios?.bundleIdentifier !== "com.nannier.canvas.starter.smoke"
    || configuration.android?.package !== "com.nannier.canvas.starter.smoke"
    || configuration.scheme !== "canvas-smoke" || JSON.stringify(configuration.extra?.canvasBuild) !== JSON.stringify(identity)) {
    throw new Error("Smoke app ID, scheme or runtime identity is incorrect");
  }
  write(path.join(output, "context.json"), { schema: 1, identity, appSources: appInventory(app), tarball: manifest.packageFile });
  console.log(`Prepared independent native candidate ${identity.packageVersion} (${identity.packageSha256}) in ${output}`);
}

function context(output) {
  const context = read(path.join(output, "context.json"));
  const app = path.join(output, "app");
  if (context.schema !== 1 || sha256(path.join(output, context.tarball)) !== context.identity.packageSha256) throw new Error("Native smoke candidate changed");
  if (JSON.stringify(appInventory(app)) !== JSON.stringify(context.appSources)) throw new Error("Starter source changed after candidate preparation");
  assertInstalledPackage(path.join(output, "unpacked/package"), path.join(app, "node_modules", context.identity.packageName));
  return { ...context, app };
}

export function buildNativeSmoke(output, platform, device) {
  const { app, identity } = context(output);
  run(app, "node", ["node_modules/expo/bin/cli", "prebuild", "--platform", platform, "--no-install"], identity);
  let binary;
  if (platform === "ios") {
    run(app, "pod", ["install", "--project-directory=ios"], identity);
    const workspaces = fs.readdirSync(path.join(app, "ios")).filter((name) => name.endsWith(".xcworkspace"));
    if (workspaces.length !== 1) throw new Error("Expected one generated iOS workspace");
    const workspace = path.join(app, "ios", workspaces[0]);
    const scheme = workspaces[0].slice(0, -".xcworkspace".length);
    run(app, "xcodebuild", ["-workspace", workspace, "-scheme", scheme, "-configuration", "Release", "-sdk", "iphonesimulator",
      "-destination", `id=${device}`, "-derivedDataPath", path.join(output, "ios-build"), "CODE_SIGNING_ALLOWED=NO", "ONLY_ACTIVE_ARCH=YES", "build"], identity);
    binary = path.join(output, "ios-build/Build/Products/Release-iphonesimulator", `${scheme}.app`);
  } else {
    run(path.join(app, "android"), "./gradlew", [":app:assembleRelease", "--no-daemon"], identity);
    binary = path.join(app, "android/app/build/outputs/apk/release/app-release.apk");
  }
  if (!fs.existsSync(binary)) throw new Error(`Native release output missing: ${binary}`);
  const digest = platform === "ios" ? fileInventory(binary) : sha256(binary);
  write(path.join(output, `${platform}-build.json`), { identity, binary, digest });
  console.log(`Built embedded ${platform} candidate: ${binary}`);
}

export function testNativeSmoke(output, platform, device, maestro, requestedEvidence) {
  const { app, identity } = context(output);
  const build = read(path.join(output, `${platform}-build.json`));
  const digest = platform === "ios" ? fileInventory(build.binary) : sha256(build.binary);
  if (JSON.stringify(build.identity) !== JSON.stringify(identity) || JSON.stringify(digest) !== JSON.stringify(build.digest)) throw new Error("Native binary changed or belongs to another candidate");
  const evidence = createEvidenceDirectory(output, platform, requestedEvidence);
  const startedAt = new Date().toISOString();
  const sourceFlow = path.join(repo, "tools/native/flows/candidate.yaml");
  const flow = path.join(evidence, "candidate.yaml");
  const result = { schema: 1, platform, device, identity, binaryDigest: digest, startedAt, status: "failed", voiceOver: "not-run", talkBack: "not-run" };
  const appearanceCommand = platform === "ios"
    ? ["xcrun", ["simctl", "ui", device, "appearance"]]
    : ["adb", ["-s", device, "shell", "cmd", "uimode", "night"]];
  const setAppearance = (value) => run(app, appearanceCommand[0], [...appearanceCommand[1], value], identity);
  recordNativeAttempt(evidence, result, () => {
    // This flow is self-contained: nested runFlow commands are inline. Execute
    // the preserved snapshot, so later source edits cannot change either scheme.
    fs.copyFileSync(sourceFlow, flow, fs.constants.COPYFILE_EXCL);
    result.flowSha256 = sha256(flow);
    const inputs = ["scripts/native-smoke.mjs", "scripts/verify-native-flow.mjs", "scripts/release.mjs",
      "tools/native/candidate.mjs", "tools/native/evidence.mjs", "tools/native/ParseFlow.java", "tools/native/maestro.json"];
    result.testInfrastructure = {
      revision: run(repo, "git", ["rev-parse", "HEAD"], identity, true).trim(),
      dirty: run(repo, "git", ["status", "--porcelain", "--untracked-files=all"], identity, true).trim() !== "",
      files: Object.fromEntries(inputs.map((file) => [file, sha256(path.join(repo, file))])),
    };
    result.artifactOutput = fs.realpathSync(output);
    result.binaryPath = fs.realpathSync(build.binary);
    result.evidencePath = evidence;
    result.contextSha256 = sha256(path.join(output, "context.json"));
    result.buildManifestSha256 = sha256(path.join(output, `${platform}-build.json`));
    const parsed = verifyNativeFlow({ maestro, flow });
    result.maestroVersion = parsed.maestroVersion;
    result.javaVersion = parsed.javaVersion;
    result.flowCommandCount = parsed.commandCount;
    const initial = run(app, appearanceCommand[0], appearanceCommand[1], identity, true).trim();
    const previous = platform === "ios" ? initial : /^Night mode: (no|yes|auto|custom)$/.exec(initial)?.[1];
    if (!previous || (platform === "ios" && !["light", "dark"].includes(previous))) throw new Error("Cannot safely restore the device's appearance");
    return previous;
  }, setAppearance, () => {
    if (platform === "ios") {
      run(app, "xcrun", ["simctl", "install", device, build.binary], identity);
      result.deviceMetadata = JSON.parse(run(app, "xcrun", ["simctl", "list", "devices", "--json"], identity, true));
    } else {
      run(app, "adb", ["-s", device, "install", "-r", build.binary], identity);
      result.deviceMetadata = run(app, "adb", ["-s", device, "shell", "getprop", "ro.build.fingerprint"], identity, true).trim();
    }
    result.schemes = {};
    for (const scheme of ["light", "dark"]) {
      if (sha256(flow) !== result.flowSha256) throw new Error("Preserved native flow changed during execution");
      result.schemes[scheme] = "failed";
      setAppearance(platform === "ios" ? scheme : scheme === "dark" ? "yes" : "no");
      const directory = path.join(evidence, scheme);
      fs.mkdirSync(directory);
      run(app, maestro, ["--device", device, "test", "--format", "junit", "--output", path.join(directory, "report.xml"),
        "--test-output-dir", path.join(directory, "maestro"), "-e", `CANDIDATE=${identity.candidateRevision}`,
        "-e", `PACKAGE_SHA256=${identity.packageSha256}`, "-e", `PACKAGE_VERSION=${identity.packageVersion.replaceAll(".", "\\.")}`,
        "-e", `SCHEME=${scheme}`, flow], identity);
      result.schemes[scheme] = "passed";
    }
    if (sha256(flow) !== result.flowSha256) throw new Error("Preserved native flow changed during execution");
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...args] = process.argv.slice(2);
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]?.replace(/^--/, "");
    if (!["candidate", "artifacts", "output", "platform", "device", "maestro", "evidence"].includes(key)
      || key in options || !args[index + 1] || args[index + 1].startsWith("--")) throw new Error("Expected unique named native smoke arguments");
    options[key] = args[index + 1];
  }
  if (!options.output) throw new Error("--output is required");
  if (options.evidence && command !== "test") throw new Error("--evidence is only valid for test");
  const output = path.resolve(options.output);
  if (command === "prepare") {
    if (!options.candidate || !options.artifacts) throw new Error("prepare requires --candidate and --artifacts");
    prepareNativeSmoke(path.resolve(options.candidate), path.resolve(options.artifacts), output);
  } else {
    if (!["ios", "android"].includes(options.platform) || !options.device) throw new Error("build/test requires --platform and --device");
    if (command === "build") buildNativeSmoke(output, options.platform, options.device);
    else if (command === "test") testNativeSmoke(output, options.platform, options.device, options.maestro ?? "maestro", options.evidence);
    else throw new Error("Expected prepare, build or test");
  }
}
