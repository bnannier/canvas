/**
 * The component audit's web capture: every example variant of every component page, at
 * every width, in every look and surface (plan 1c), narrowed by the run's filters.
 *
 * One test per (component, look, surface), looping its variants by widths, so a worker
 * keeps one look's page warm through a component and the tests spread the components
 * across workers. Each cell is captured by `captureCell`, which records a failure on the
 * cell instead of throwing, so one broken example costs one cell, not the run; the test
 * itself fails only when the capture machinery does.
 *
 * Run through `bun run audit:web` (tools/audit/run-web.ts), which plans the same cells
 * from the same rules (tools/audit/web-capture.ts), makes the run directory and writes its
 * manifest. The filters arrive as AUDIT_ONLY, AUDIT_VARIANTS, AUDIT_LOOKS, AUDIT_SURFACES,
 * AUDIT_WIDTHS and AUDIT_AXE. A run that asks for states or pages (AUDIT_STATES,
 * AUDIT_PAGES) captures those instead (./states.audit.ts, ./pages.audit.ts).
 */
import { test } from "@playwright/test";
import { components, pages } from "../../tools/audit/inventory.ts";
import { axeApplies, parseKinds, parseWebFilters, planWebCapture, splitOnly } from "../../tools/audit/web-capture.ts";
import { AuditSession, CELL_TIMEOUT_MS, auditRunDir, captureCell, recordCell } from "./cell";

const filters = parseWebFilters(process.env);
const kinds = parseKinds(process.env);

if (kinds.variants) {
  const inventory = components();
  const only = splitOnly(filters.only, kinds, inventory, pages());
  const plan = planWebCapture(inventory, { ...filters, only: only.components });
  const runDir = auditRunDir();

  for (const group of plan.groups) {
    test(`${group.slug} ${group.look} ${group.surface}`, async ({ context }, testInfo) => {
      const cells = group.variants.length * group.widths.length;
      // Every cell is bounded by CELL_TIMEOUT_MS, so the test is bounded by their sum.
      test.setTimeout(60_000 + cells * CELL_TIMEOUT_MS);
      const session = await AuditSession.open(context);
      try {
        for (const variant of group.variants) {
          for (const width of group.widths) {
            const record = await captureCell(
              session,
              { slug: group.slug, variant: variant.variant, label: variant.label, path: variant.path, width, look: group.look, surface: group.surface },
              { runDir, worker: testInfo.workerIndex, examples: group.examples, axe: axeApplies(filters.axe, width.key, group.surface) },
            );
            recordCell(runDir, record);
          }
        }
      } finally {
        await session.close();
      }
    });
  }
}
