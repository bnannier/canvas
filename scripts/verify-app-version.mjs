// Check Expo's resolved config before queuing an EAS build. The package version
// comes from the restored candidate, including any Changesets bump in this run.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function verifyAppVersion(pkg, candidate, config) {
  const version = pkg.version;
  if (typeof version !== "string" || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error("Native releases require a stable Canvas package version (major.minor.patch).");
  }
  if (candidate.version !== version) throw new Error("Canvas package version does not match the release candidate.");
  if (config.version !== version) {
    throw new Error(`Expo app version ${config.version} does not match Canvas ${version}; refusing to queue EAS.`);
  }
  if (config.runtimeVersion?.policy !== "appVersion") {
    throw new Error("Expo runtimeVersion must follow the Canvas appVersion.");
  }
  return version;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [candidateDirectory, configFile] = process.argv.slice(2);
  if (!candidateDirectory || !configFile) throw new Error("Usage: node scripts/verify-app-version.mjs <candidate-directory> <resolved-expo-config.json>");
  const read = (file) => JSON.parse(readFileSync(file, "utf8"));
  const version = verifyAppVersion(read("package.json"), read(resolve(candidateDirectory, "candidate.json")), read(configFile));
  console.log(`Native app and runtime follow Canvas ${version}; EAS manages build numbers separately.`);
}
