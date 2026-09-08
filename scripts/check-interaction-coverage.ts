import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { COMPONENTS } from "../docs/src/core/data/components";
import { inventory, evidence } from "../tools/interactions/registry";
import { checkRegistry } from "../tools/interactions/check";

const root = resolve(import.meta.dir, "..");
const result = checkRegistry(COMPONENTS.map(({ slug }) => slug), inventory, evidence, (file) => readFileSync(resolve(root, file), "utf8"));
if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
else {
  const missing = result.rows.filter((row) => !row.registeredEvidence.length).map(({ component }) => component);
  console.log(`Interaction registry: ${result.rows.length} components, ${evidence.length} active test declarations.`);
  console.log(`No behavioral evidence registered for: ${missing.join(", ") || "none"}. This is an evidence inventory, not a test pass or a coverage percentage.`);
  console.log("Native runtime, VoiceOver and TalkBack results must be recorded separately against an identified candidate. Browser skins and DOM tests do not qualify.");
  for (const error of result.errors) console.error(error);
}
if (result.errors.length) process.exitCode = 1;
