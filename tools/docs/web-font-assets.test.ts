import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const root = fileURLToPath(new URL("../../", import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(root, "docs/src/ui/web-fonts.json"), "utf8")) as Record<string, { family: string; path: string; weight: number[]; preload?: boolean }>;

test("the three Canvas faces remain critical and Roboto is an explicit optional preview family", () => {
  expect(Object.entries(manifest).filter(([, face]) => face.preload !== false).map(([role]) => role)).toEqual(["sans", "display", "mono"]);
  expect(manifest.androidPreview).toMatchObject({ family: "Roboto", weight: [400, 700], preload: false });
  expect([manifest.sans.family, manifest.display.family, manifest.mono.family]).toEqual(["Instrument Sans", "Bricolage Grotesque", "JetBrains Mono"]);
});

test("every registered web font is a present WOFF2 named by its content", () => {
  for (const face of Object.values(manifest)) {
    const bytes = readFileSync(resolve(root, "docs/public" + face.path));
    expect(bytes.subarray(0, 4).toString()).toBe("wOF2");
    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
    expect(face.path).toEndWith(`.${hash}.woff2`);
  }
});

test("the Roboto source matches its pinned official provenance and carries its license", () => {
  const directory = resolve(root, "docs/assets/fonts/source");
  const source = JSON.parse(readFileSync(resolve(directory, "Roboto-SOURCE.json"), "utf8"));
  expect(source.source).toStartWith("https://github.com/google/fonts/tree/");
  expect(source.source).toContain(source.commit);
  expect(createHash("sha256").update(readFileSync(resolve(directory, source.file))).digest("hex")).toBe(source.sha256);
  expect(readFileSync(resolve(directory, "Roboto-OFL.txt"), "utf8")).toContain("SIL OPEN FONT LICENSE Version 1.1");
});
