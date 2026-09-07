import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import manifest from "../../package.json";
import {
  PRIVACY_EFFECTIVE,
  PRIVACY_ISSUES_URL,
  PRIVACY_SUMMARY,
} from "../../docs/src/data/privacy-policy.ts";

test("the optional-peer table covers every declared optional dependency", () => {
  const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
  const section = readme.split("### Optional peers\n")[1]?.split("\n## ")[0] ?? "";
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
