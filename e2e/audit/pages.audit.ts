/**
 * The component audit's page capture (plan 1d): every pattern and template page at every
 * width, in every look and surface, narrowed by the run's filters. A page cell is its first
 * screen and one photograph per section, each section probed (e2e/audit/page-cell.ts).
 *
 * One test per (page, look, surface), looping widths. Runs only when the run asks for
 * pages (`bun run audit:web -- --pages`, AUDIT_PAGES); the runner (tools/audit/run-web.ts)
 * plans the same cells from the same rules (tools/audit/web-capture.ts `planPageCapture`).
 */
import { test } from "@playwright/test";
import { components, pages } from "../../tools/audit/inventory.ts";
import { axeApplies, parseKinds, parseWebFilters, planPageCapture, splitOnly } from "../../tools/audit/web-capture.ts";
import { AuditSession, auditRunDir, recordCell } from "./cell";
import { PAGE_CELL_TIMEOUT_MS, capturePageCell } from "./page-cell";

const filters = parseWebFilters(process.env);
const kinds = parseKinds(process.env);

if (kinds.pages) {
  const pageList = pages();
  const only = splitOnly(filters.only, kinds, components(), pageList);
  const plan = planPageCapture(pageList, { ...filters, only: only.pages });
  const runDir = auditRunDir();

  for (const group of plan.groups) {
    test(`${group.page.id} ${group.look} ${group.surface}`, async ({ context }, testInfo) => {
      test.setTimeout(60_000 + group.widths.length * PAGE_CELL_TIMEOUT_MS);
      const session = await AuditSession.open(context);
      try {
        for (const width of group.widths) {
          const record = await capturePageCell(
            session,
            { page: group.page, width, look: group.look, surface: group.surface },
            { runDir, worker: testInfo.workerIndex, axe: axeApplies(filters.axe, width.key, group.surface) },
          );
          recordCell(runDir, record);
        }
      } finally {
        await session.close();
      }
    });
  }
}
