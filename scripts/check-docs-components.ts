import { resolve } from "node:path";
import { allowedDocsUsage, exceptionFootprintErrors, formatDocsUsage, inspectDocsTree } from "../tools/docs/component-usage.ts";

const findings = inspectDocsTree(resolve(import.meta.dir, ".."));
const violations = findings.filter(finding => !allowedDocsUsage(finding));
const footprintErrors = exceptionFootprintErrors(findings);
for (const finding of process.argv.includes("--inventory") ? findings : violations) console.log(formatDocsUsage(finding));
console.log(`Docs component usage: ${violations.length} violations; ${findings.length - violations.length} reviewed infrastructure uses.`);
for (const error of footprintErrors) console.error(error);
if (violations.length || footprintErrors.length) process.exitCode = 1;
