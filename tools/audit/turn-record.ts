// The record a turn keeps of its capture runs: audit/turns/<id>.md, one per component slug,
// page id or foundation id, written by `bun run audit:turn` alone (tools/audit/turn.ts) and
// linked from the facts block of the checklist it belongs to.
//
// A turn captures its slug before the fix and after it (the plan's "per-component turn");
// each capture is several runs (the web variants, the web states, the pages, the native
// run on each platform), and their ids are what the before and after contact sheets are
// built from and what the checklist's Sign-off rows name. The record keeps them by phase,
// one row per run as it finishes, appended and never rewritten, so a phase taken twice
// (the web while the devices were busy, the devices later) keeps both, in order. The runs
// themselves stay under .audit/runs/ (local and gitignored, as every capture is); the
// record is committed with the turn, so the before and after it names travel with the
// checklist.
//
// It is read with the one table reader every audit table goes through
// (tools/audit/table.ts), and `bun run audit:checklists:check` holds every record to its
// shape: a row it cannot read, a record whose id names no checklist, a phase table that is
// missing, each by file and line.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { headerRow, readSectionTable, separatorRow, type MalformedRow, type TableShape } from "./table.ts";

export const TURN_PHASES = ["before", "after"] as const;
export type TurnPhase = (typeof TURN_PHASES)[number];

/** What a run captured: the web's example variants, its interaction states or its pages, or a device run. */
export const RUN_KINDS = ["variants", "states", "pages", "native"] as const;
export type RunKind = (typeof RUN_KINDS)[number];

export const RUN_PLATFORMS = ["web", "ios", "android"] as const;
export type RunPlatform = (typeof RUN_PLATFORMS)[number];

/** One capture run of a turn, as its record row holds it. */
export interface TurnRun {
  runId: string;
  kind: RunKind;
  platform: RunPlatform;
  /** When the turn recorded it (ISO). */
  recorded: string;
  /** The commit the run captured (7 hex digits), and ` dirty` when the source it captured differed from it (build-info.cjs `sourceDirty`). */
  commit: string;
  /** The run's own status: a web run's complete, incomplete, interrupted or refused; a device run's complete, refused or abandoned. */
  status: string;
  /** Its cell counts, as the run's manifest gives them. */
  cells: string;
  /** The slugs it captured, comma-separated. */
  slugs: string;
}

export const TURN_SHAPE: TableShape = { name: "turn", columns: ["Run id", "Kind", "Platform", "Recorded", "Commit", "Status", "Cells", "Slugs"], minCells: 8 };

/** A run directory's name, as the web runner (`20261010-004911-web-45aebec`) and the native runner (`20261009T061230Z-ios-45aebec`) write it. */
export const RUN_ID = /^(\d{8}-\d{6}-web|\d{8}T\d{6}Z-(ios|android))-[0-9a-f]{7}$/;

export interface TurnRecord {
  phases: Record<TurnPhase, TurnRun[]>;
  /** Phase tables that are missing, and rows that cannot be read, by line. */
  malformed: MalformedRow[];
}

const code = (value: string) => `\`${value}\``;
const unquote = (cell: string) => cell.replace(/^`([^`]*)`$/, "$1");

/** The directory of the turn records, under audit/. */
export const TURNS_DIR = "turns";

/** The record's file under audit/, for an id. */
export const turnRecordFile = (id: string): string => `${TURNS_DIR}/${id}.md`;

/** A turn record read back: its runs by phase, and every line it cannot read. */
export function readTurnRecord(content: string): TurnRecord {
  const record: TurnRecord = { phases: { before: [], after: [] }, malformed: [] };
  for (const phase of TURN_PHASES) {
    const table = readSectionTable(content, phase, TURN_SHAPE);
    record.malformed.push(...table.malformed);
    if (!table.found && !table.malformed.length) record.malformed.push({ line: 0, reason: `no "## ${phase}" table (\`${headerRow(TURN_SHAPE)}\`)` });
    for (const { cells, line } of table.rows) {
      const [runCell, kind, platform, recorded, commitCell, status, cellsText, slugs] = cells;
      const runId = unquote(runCell!);
      const commit = unquote(commitCell!.replace(/ dirty$/, "")) + (/ dirty$/.test(commitCell!) ? " dirty" : "");
      const bad = (reason: string) => record.malformed.push({ line, reason });
      if (!RUN_ID.test(runId)) bad(`the Run id cell reads "${runCell}", not a capture run's directory name (\`<stamp>-<web|ios|android>-<sha7>\`)`);
      else if (!(RUN_KINDS as readonly string[]).includes(kind!)) bad(`the Kind cell reads "${kind}", not one of ${RUN_KINDS.join(", ")}`);
      else if (!(RUN_PLATFORMS as readonly string[]).includes(platform!)) bad(`the Platform cell reads "${platform}", not one of ${RUN_PLATFORMS.join(", ")}`);
      else if (!runId.includes(`-${platform}-`)) bad(`the run ${runId} is not a ${platform} run`);
      else if ((kind === "native") !== (platform !== "web")) bad(`a ${kind} run on ${platform}: the web takes variants, states and pages, a device takes native`);
      else if (!/^[0-9a-f]{7}( dirty)?$/.test(commit)) bad(`the Commit cell reads "${commitCell}", not a short sha`);
      else record.phases[phase].push({ runId, kind: kind as RunKind, platform: platform as RunPlatform, recorded: recorded!, commit, status: status!, cells: cellsText!, slugs: slugs! });
    }
  }
  record.malformed.sort((a, b) => a.line - b.line);
  return record;
}

/** A record's markdown, every phase's runs in the order they were recorded. */
export function renderTurnRecord(id: string, title: string, checklist: string, phases: Record<TurnPhase, TurnRun[]>): string {
  const cell = (value: string) => value.replace(/\s*\n\s*/g, " ").replace(/(?<!\\)\|/g, "\\|").trim();
  return [
    `# Turn record: ${title}`,
    "",
    `The capture runs \`bun run audit:turn -- --slug=${id}\` took for this turn, by phase, one row per run as it finished. Written by \`audit:turn\` alone and appended, never rewritten; do not edit by hand. The runs are under \`.audit/runs/<run id>/\` (local and gitignored, as every capture is); \`${checklist}\` names the after-phase runs in its Sign-off rows. See \`audit/README.md\`, "One component's turn".`,
    "",
    ...TURN_PHASES.flatMap((phase) => [
      `## ${phase}`,
      "",
      headerRow(TURN_SHAPE),
      separatorRow(TURN_SHAPE),
      ...phases[phase].map((run) =>
        `| ${code(run.runId)} | ${run.kind} | ${run.platform} | ${cell(run.recorded)} | ${code(run.commit.replace(/ dirty$/, ""))}${run.commit.endsWith(" dirty") ? " dirty" : ""} | ${cell(run.status)} | ${cell(run.cells)} | ${cell(run.slugs)} |`,
      ),
      "",
    ]),
  ].join("\n");
}

/** A turn's record with runs appended to a phase: the existing record's runs kept as they are. Throws on a record it cannot read, rather than drop a row. */
export function appendTurnRuns(existing: string | null, id: string, title: string, checklist: string, phase: TurnPhase, runs: TurnRun[]): string {
  const phases: Record<TurnPhase, TurnRun[]> = { before: [], after: [] };
  if (existing !== null) {
    const record = readTurnRecord(existing);
    if (record.malformed.length) {
      throw new Error(`the turn record for ${id} has lines it cannot read, so appending would drop them; fix them by hand first:\n${record.malformed.map((m) => `  line ${m.line}: ${m.reason}`).join("\n")}`);
    }
    phases.before.push(...record.phases.before);
    phases.after.push(...record.phases.after);
  }
  phases[phase].push(...runs);
  return renderTurnRecord(id, title, checklist, phases);
}

/** Every problem with the turn records under audit/turns/: a record for an id no checklist has, and a line that cannot be read. */
export function turnProblems(auditDir: string, knownIds: ReadonlySet<string>): string[] {
  const dir = join(auditDir, TURNS_DIR);
  if (!existsSync(dir)) return [];
  const problems: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith(".md")) continue;
    const id = name.slice(0, -3);
    const file = `audit/${TURNS_DIR}/${name}`;
    if (!knownIds.has(id)) {
      problems.push(`orphan turn record ${file}: no component, page or foundation is called "${id}" (delete it, or restore its checklist)`);
      continue;
    }
    for (const m of readTurnRecord(readFileSync(join(dir, name), "utf8")).malformed) problems.push(`${file}${m.line ? `:${m.line}` : ""}: ${m.reason} (the record is audit:turn's; fix it by hand only to restore its shape)`);
  }
  return problems;
}
