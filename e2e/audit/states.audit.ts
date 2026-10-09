/**
 * The component audit's interaction-state capture (plan 1d): every state recipe of every
 * component (e2e/support/state-recipes.ts), from each of its rows, at its widths (hover,
 * focus, pressed, invalid and disabled at the desktop; open at all three, since an overlay
 * becomes a sheet on a phone), in every look and surface, narrowed by the run's filters.
 *
 * One test per (component, look, surface), looping its state cells. Each cell is captured
 * by `captureStateCell`, which records a state it cannot confirm as `state-not-reached`
 * and a failure as failed, so one broken recipe costs one cell, not the run.
 *
 * Runs only when the run asks for states (`bun run audit:web -- --states`, AUDIT_STATES);
 * the runner (tools/audit/run-web.ts) plans the same cells from the same rules
 * (tools/audit/web-capture.ts `planStateCapture`) and writes the manifest.
 */
import { test } from "@playwright/test";
import { components, pages } from "../../tools/audit/inventory.ts";
import { axeApplies, parseKinds, parseWebFilters, planStateCapture, splitOnly } from "../../tools/audit/web-capture.ts";
import { recipeFor, stateSpecsOf } from "../support/state-recipes";
import { AuditSession, auditRunDir, recordCell } from "./cell";
import { STATE_CELL_TIMEOUT_MS, captureStateCell } from "./state-cell";

const filters = parseWebFilters(process.env);
const kinds = parseKinds(process.env);

if (kinds.states) {
  const inventory = components();
  const only = splitOnly(filters.only, kinds, inventory, pages());
  const plan = planStateCapture(inventory, stateSpecsOf, { ...filters, only: only.components }, kinds.states);
  const runDir = auditRunDir();

  for (const group of plan.groups) {
    test(`${group.slug} states ${group.look} ${group.surface}`, async ({ context }, testInfo) => {
      // Every cell is bounded by STATE_CELL_TIMEOUT_MS, so the test is bounded by their sum.
      test.setTimeout(60_000 + group.cells.length * STATE_CELL_TIMEOUT_MS);
      const session = await AuditSession.open(context);
      try {
        for (const cell of group.cells) {
          const record = await captureStateCell(
            session,
            { ...cell, slug: group.slug, look: group.look, surface: group.surface },
            recipeFor(group.slug, cell.state),
            { runDir, worker: testInfo.workerIndex, examples: group.examples, axe: axeApplies(filters.axe, cell.width.key, group.surface) },
          );
          recordCell(runDir, record);
        }
      } finally {
        await session.close();
      }
    });
  }
}
