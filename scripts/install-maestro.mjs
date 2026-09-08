// A task-local tool install with a pinned upstream archive digest. No shell
// profiles, package managers, certificate stores or global commands are changed.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
const manifest = JSON.parse(readFileSync(new URL("../tools/native/maestro.json", import.meta.url), "utf8"));
const output = process.argv[2] && resolve(process.argv[2]);
if (!output || existsSync(output)) throw new Error("Pass a new task-local installation directory");
const response = await fetch(manifest.url);
if (!response.ok) throw new Error(`Maestro download failed: ${response.status}`);
const archive = Buffer.from(await response.arrayBuffer());
if (createHash("sha256").update(archive).digest("hex") !== manifest.sha256) throw new Error("Maestro archive checksum mismatch");
mkdirSync(output, { recursive: true });
writeFileSync(join(output, "maestro.zip"), archive);
execFileSync("unzip", ["-q", join(output, "maestro.zip"), "-d", output], { stdio: "inherit" });
console.log(join(output, "maestro/bin/maestro"));
