import { afterEach, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { verifyNativeFlow } from "../../scripts/verify-native-flow.mjs";

const directories: string[] = [];
afterEach(() => { for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true }); });

function flow(commands: string) {
  const directory = mkdtempSync(join(tmpdir(), "canvas-native-flow-"));
  directories.push(directory);
  const file = join(directory, "flow.yaml");
  writeFileSync(file, `appId: com.nannier.canvas.starter.smoke\n---\n${commands}\n`);
  return file;
}

test("native flow verification fails when the selected CLI is missing", () => {
  const file = flow('- swipe:\n    start: "307, 289"\n    end: "95, 289"');
  expect(() => verifyNativeFlow({ flow: file, maestro: join(file, "missing-maestro") })).toThrow("cannot find executable");
});

test("the verifier CLI rejects duplicate flags before invoking external tooling", () => {
  const script = fileURLToPath(new URL("../../scripts/verify-native-flow.mjs", import.meta.url));
  for (const flag of ["--maestro", "--flow"]) {
    const result = spawnSync(process.execPath, [script, flag, "missing-first", flag, "missing-second"], { encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(`Duplicate native flow argument: ${flag}`);
  }
});

// Normal kit tests do not require a native tooling install. Native CI always
// supplies the verified distribution and runs this file without the UI preload.
const maestro = process.env.CANVAS_MAESTRO_BIN;
const integration = maestro ? test : test.skip;

integration("the installed full parser accepts every canonical flow command", () => {
  const result = verifyNativeFlow({ maestro });
  const expectedVersion = JSON.parse(readFileSync(new URL("./maestro.json", import.meta.url), "utf8")).version;
  expect(result.maestroVersion).toBe(expectedVersion);
  expect(Number.parseInt(result.javaVersion, 10)).toBeGreaterThanOrEqual(17);
  expect(result.commandCount).toBeGreaterThan(1);
  expect(result.flowSha256).toBe(createHash("sha256").update(readFileSync(result.flow)).digest("hex"));
});

integration("the installed full parser accepts literal absolute coordinates", () => {
  const file = flow('- swipe:\n    start: "307, 289"\n    end: "95, 289"\n    duration: 400');
  expect(verifyNativeFlow({ maestro, flow: file }).commandCount).toBe(2);
});

const invalidPoints = [
  ["whole absolute expression", "${output.carouselDrag.start}", "${output.carouselDrag.end}"],
  ["separate absolute expressions", "${output.carouselDrag.startX}, ${output.carouselDrag.y}", "${output.carouselDrag.endX}, ${output.carouselDrag.y}"],
  ["percentage expressions", "${output.carouselDrag.startX}%, ${output.carouselDrag.y}%", "${output.carouselDrag.endX}%, ${output.carouselDrag.y}%"],
];
for (const [name, start, end] of invalidPoints) {
  integration(`the installed full parser rejects ${name} before a device session`, () => {
    const file = flow(`- swipe:\n    start: "${start}"\n    end: "${end}"\n    duration: 400`);
    expect(() => verifyNativeFlow({ maestro, flow: file })).toThrow("For input string:");
  });
}
