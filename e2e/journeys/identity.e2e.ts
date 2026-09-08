import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { expect, test } from "../support/fixtures";
import { gotoDocs } from "../support/docs";

test("the running bundle exposes its build identity", { tag: "@interaction:runtime-identity" }, async ({ page }, info) => {
  await gotoDocs(page, "/testing/diagnostics");
  await expect(page.getByText("Runtime diagnostics", { exact: true })).toBeVisible();
  await expect(page.getByTestId("diagnostic-input-mode")).toHaveText("source");
  const expectedVersion = process.env.CANVAS_EXPECT_PACKAGE_VERSION ?? JSON.parse(readFileSync(resolve(__dirname, "../../package.json"), "utf8")).version;
  const expectedRevision = process.env.CANVAS_EXPECT_CANDIDATE_REVISION ?? execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: resolve(__dirname, "../.."), encoding: "utf8",
    env: Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_"))),
  }).trim();
  await expect(page.getByTestId("diagnostic-package-version")).toHaveText(expectedVersion);
  await expect(page.getByTestId("diagnostic-source-fingerprint")).toHaveText(/^[a-f0-9]{64}$/);
  await expect(page.getByTestId("diagnostic-candidate-revision")).toHaveText(expectedRevision);
  if (process.env.CI) await expect(page.getByTestId("diagnostic-source-dirty")).toHaveText("false");
  await info.attach("running-bundle-identity", { body: await page.getByTestId("runtime-diagnostics").innerText(), contentType: "text/plain" });
});
