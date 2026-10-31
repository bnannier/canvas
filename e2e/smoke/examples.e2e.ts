/**
 * Every component playground and documented variant route, actually rendered.
 *
 * Each full-page load gets its own test budget and console gate. Grouping every
 * variant under one component test exhausted that shared budget under CI load.
 * ExampleErrorBoundary catches render failures, so also check its visible message.
 */
import { componentExamples, EXAMPLE_ROUTES } from "../support/routes";
import { gotoDocs, exampleCard, stage, BASE_PATH } from "../support/docs";
import { expect, test } from "../support/fixtures";

const FAILURE = "Example failed to render";

for (const { route } of componentExamples()) {
  test(`${route.name}: playground renders`, async ({ page }) => {
    await gotoDocs(page, route.path, { scheme: "dark" });
    await expect(stage(page)).toBeVisible();
    await expect(page.getByText(FAILURE)).toHaveCount(0);
  });
}

for (const example of EXAMPLE_ROUTES) {
  // The first example's canonical address is the bare playground, checked above.
  if (example.path === `/components/${example.slug}`) continue;
  test(`${example.slug}: ${example.label} example renders`, async ({ page }) => {
    await gotoDocs(page, example.path, { scheme: "dark" });
    await expect(page, example.label).toHaveURL(url => url.pathname === `${BASE_PATH}${example.path}`);
    await expect(exampleCard(page, example.label), example.label).toBeVisible();
    await expect(page.getByText(FAILURE), example.label).toHaveCount(0);
  });
}
