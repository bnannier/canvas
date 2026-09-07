/**
 * The `test` every spec imports.
 *
 * Two automatic fixtures wrap every test in every project:
 *
 *   errors    Fails the test if the page logged a console error, threw, violated the
 *             Content-Security-Policy, or failed to load a same-origin asset. This is
 *             the whole reason the suite is worth running at all on most routes: a
 *             react-native-web screen that throws in an effect still paints, so
 *             "it rendered" proves very little on its own.
 *   registry  Stubs the npm registry. docs/src/ui/use-latest-version.ts re-fetches
 *             the published version EVERY time a screen gains focus, so leaving it
 *             live would make every test depend on the network and on npm's latency.
 *
 * Both are `auto`, so a spec gets them without naming them.
 */
import { test as base, expect, type Page } from "@playwright/test";

export interface PageProblems {
  consoleErrors: string[];
  pageErrors: string[];
  cspViolations: string[];
  badResponses: string[];
  failedRequests: string[];
}

/**
 * Requests the browser aborts on purpose. A navigation that supersedes an in-flight
 * fetch cancels it, and that is not a defect.
 */
const BENIGN_FAILURES = /net::ERR_ABORTED/;

async function watchForProblems(page: Page): Promise<PageProblems> {
  const problems: PageProblems = {
    consoleErrors: [],
    pageErrors: [],
    cspViolations: [],
    badResponses: [],
    failedRequests: [],
  };

  page.on("console", (message) => {
    if (message.type() === "error") problems.consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => {
    problems.pageErrors.push(error.message);
  });
  page.on("response", (response) => {
    const url = response.url();
    if (response.status() >= 400 && url.startsWith("http://127.0.0.1")) {
      problems.badResponses.push(`${response.status()} ${url}`);
    }
  });
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText ?? "unknown";
    if (BENIGN_FAILURES.test(failure)) return;
    problems.failedRequests.push(`${failure} ${request.url()}`);
  });

  // The docs ship `require-trusted-types-for 'script'` and a strict script-src, and
  // the static server replays that policy, so a Trusted Types sink on an import path
  // (the failure that once served the whole site blank) surfaces here as an event.
  await page.exposeFunction("__e2eReportCspViolation", (detail: string) => {
    problems.cspViolations.push(detail);
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      const report = event as SecurityPolicyViolationEvent;
      const reporter = (window as unknown as Record<string, unknown>).__e2eReportCspViolation;
      if (typeof reporter === "function") {
        (reporter as (detail: string) => void)(
          `${report.violatedDirective} blocked ${report.blockedURI || "(inline)"}`,
        );
      }
    });
  });

  return problems;
}

function describe(problems: PageProblems): string[] {
  const lines: string[] = [];
  const add = (label: string, items: string[]) => {
    for (const item of items) lines.push(`${label}: ${item}`);
  };
  add("page error", problems.pageErrors);
  add("console error", problems.consoleErrors);
  add("CSP violation", problems.cspViolations);
  add("response", problems.badResponses);
  add("request failed", problems.failedRequests);
  return lines;
}

export const test = base.extend<{ problems: PageProblems; registry: void }>({
  registry: [
    async ({ page }, use) => {
      await page.route("https://registry.npmjs.org/**", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ version: "0.0.0-e2e" }),
        }),
      );
      await use();
    },
    { auto: true },
  ],

  problems: [
    async ({ page }, use, testInfo) => {
      const problems = await watchForProblems(page);
      await use(problems);
      // Only gate a test that was otherwise passing: on a test that already failed,
      // these are usually consequences of the real failure and would bury it.
      if (testInfo.status !== testInfo.expectedStatus) return;
      const lines = describe(problems);
      expect(lines, `the page reported ${lines.length} problem(s):\n  ${lines.join("\n  ")}`).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
