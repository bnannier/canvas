import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import manifest from "../../package.json";
import {
  PRIVACY_EFFECTIVE,
  PRIVACY_ISSUES_URL,
  PRIVACY_SUMMARY,
} from "../../docs/src/data/privacy-policy.ts";

test("the optional-peer table covers every declared optional dependency", () => {
  const guide = readFileSync(new URL("../../USAGE.md", import.meta.url), "utf8");
  const section = guide.split("### Optional peers\n")[1]?.split("\n## ")[0] ?? "";
  const documented = [...section.matchAll(/^\| `([^`]+)` \|/gm)].map((match) => match[1]);
  const optional = Object.entries(manifest.peerDependenciesMeta)
    .filter(([, metadata]) => metadata.optional)
    .map(([name]) => name);
  expect(documented.sort()).toEqual(optional.sort());
});

test("the static privacy page carries the current shared policy and contact", () => {
  const page = readFileSync(new URL("../../docs/public/privacy/index.html", import.meta.url), "utf8");
  expect(page).toContain(PRIVACY_SUMMARY);
  expect(page).toContain(`Effective ${PRIVACY_EFFECTIVE}.`);
  expect(page).toContain(`href="${PRIVACY_ISSUES_URL}"`);
  const repository = manifest.repository.url.replace(/^git\+/, "").replace(/\.git$/, "");
  expect(PRIVACY_ISSUES_URL).toBe(`${repository}/issues`);
  expect(manifest.bugs.url).toBe(PRIVACY_ISSUES_URL);
});

test("the public privacy policy is a script-free Canvas render with local fonts", () => {
  const page = readFileSync(new URL("../../docs/public/privacy/index.html", import.meta.url), "utf8");
  expect(page).toContain('id="react-native-stylesheet"');
  expect(page).not.toMatch(/<script\b/i);
  expect(page.match(/<main data-privacy-theme=/g)).toHaveLength(2);
  const fontPaths = [...page.matchAll(/src:url\("(\/privacy\/fonts\/[^\"]+)"\)/g)].map(match => match[1]);
  // Instrument Sans at 400 to 700 for the text, Bricolage Grotesque at 500 and 600 for the
  // headings (tools/privacygen/render.tsx).
  expect(fontPaths).toHaveLength(6);
  for (const path of fontPaths) expect(readFileSync(new URL(`../../docs/public${path}`, import.meta.url)).byteLength).toBeGreaterThan(1000);
});
