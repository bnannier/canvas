// The native capture host: the HTTP server the in-app driver (docs/src/audit/
// driver.native.tsx) talks to, on 127.0.0.1:8791 (docs/src/audit/protocol.ts). One
// server drives every platform of a run at once; each platform has its own queue, its
// session with the app, and its own run directory.
//
// The queue is look-major (every item in one look and surface before the next), so the
// app changes its theme six times a run, not once an item. Each item gets 30 s of the
// driver's time; past that it is failed and the app relaunched, and a failed item is
// tried once more before it is recorded as failed. The host takes every screenshot
// itself, twice at least, and keeps a frame only once two grabs in a row agree; a card
// that never holds still (a spinner, a caret) is kept and marked unstable. The card is
// cut from the screen by the rect the driver measured, segment by segment, and stitched.

import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";
import sharp from "sharp";
import {
  AUDIT_DRIVER,
  AUDIT_PORT,
  type AuditItem,
  type AuditPlatform,
  type AuditProblem,
  type DoneRequest,
  type FailRequest,
  type HelloRequest,
  type LogRequest,
  type NextResponse,
  type ReadyRequest,
} from "../../../docs/src/audit/protocol.ts";
import { androidSnapshot, findMaestro, iosSnapshot, iosTabBar, type A11ySnapshot } from "./a11y.ts";
import { AUDIT_APP_ID, type AuditDevice } from "./devices.ts";
import { fingerprint, meanAbsDiff } from "./fingerprint.ts";

/** Driver time one item may take before it is failed and the app relaunched. */
export const ITEM_TIMEOUT_MS = 30_000;
/** Attempts an item gets before it is recorded as failed. */
export const MAX_ATTEMPTS = 2;
/** The wait between the grabs of the stability check, and how many grabs it takes at most. */
const STABILITY_GAP_MS = 250;
const MAX_GRABS = 5;
/**
 * The largest mean difference (0 to 255, on a 128 px wide grayscale thumbnail of the card)
 * between two grabs that still counts as the same frame. A static screen grabs
 * identically on both devices, so anything above this is the card moving.
 */
export const STABLE_MAD = 0.1;
/** How long the driver lets the screen settle, sent with every item (calibrated in audit/README.md). */
const SETTLE_MS = 300;
const SCROLL_SETTLE_MS = 150;
/** The driver's own deadline, under the host's, so it reports a stuck item itself first. */
const DRIVER_DEADLINE_MS = 25_000;

export interface QueueItem {
  item: AuditItem;
  /** Dump the accessibility tree on the item's first segment. */
  a11y: boolean;
}

export type CellStatus = "ok" | "unstable" | "failed";

export interface CellRecord {
  id: string;
  status: CellStatus;
  reason?: string;
  attempts: number;
  /** Wall time of the successful (or last) attempt, from hand-out to done. */
  seconds: number;
  segments: number;
  a11y?: "ok" | "skipped" | string;
}

interface Segment {
  request: ReadyRequest;
  screen: Buffer;
  /** The card rows this segment adds, cut from the screen. */
  crop: Buffer;
  grabs: number;
  mads: number[];
  stable: boolean;
}

interface Current {
  queued: QueueItem;
  attempt: number;
  started: number;
  /** Host time spent inside requests (shots, accessibility dumps), which the timeout does not count. */
  hostMs: number;
  segments: Segment[];
  a11y?: A11ySnapshot | { error: string };
}

export interface PlatformRun {
  platform: AuditPlatform;
  device: AuditDevice;
  /** The run directory: .audit/runs/<stamp>-<platform>-<sha7>. */
  dir: string;
  queue: QueueItem[];
  /** Whether a Debug build (`--dev`, bundle from Metro) is what the host expects. */
  dev: boolean;
}

interface RunState extends PlatformRun {
  /** System chrome found in the accessibility tree, sent with every item. */
  chrome: AuditItem["chrome"];
  session: string | null;
  sessions: number;
  hello: HelloRequest | null;
  next: number;
  retry: { queued: QueueItem; attempt: number } | null;
  current: Current | null;
  lastContact: number;
  records: CellRecord[];
  finished: boolean;
  refused: string | null;
  resolve: () => void;
  done: Promise<void>;
}

export interface HostEvents {
  log(platform: AuditPlatform, line: string): void;
  /** The app stopped answering or an item timed out: relaunch it. */
  stalled(platform: AuditPlatform, why: string): Promise<void>;
  /** The first hello of a platform, with what it said. */
  hello(platform: AuditPlatform, hello: HelloRequest): void;
  /** The host refused the app (a stale build, a foreign app): the platform's run is over. */
  refused(platform: AuditPlatform, why: string): void;
  cell(platform: AuditPlatform, record: CellRecord, done: number, total: number): void;
}

/** An answer to the driver: a status and a JSON body. */
interface Reply {
  status: number;
  body: unknown;
}

const json = (status: number, body: unknown): Reply => ({ status, body });
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface AuditHost {
  /** The port the host listens on (AUDIT_PORT unless the caller asked for another). */
  port: number;
  /** Resolves when every platform's queue is done, or its app was refused. */
  finished: Promise<void>;
  records(platform: AuditPlatform): CellRecord[];
  hello(platform: AuditPlatform): HelloRequest | null;
  refused(platform: AuditPlatform): string | null;
  stop(): void;
}

/** The wire item for the driver, with the host's timings. */
function wireItem(item: AuditItem, chrome: AuditItem["chrome"]): AuditItem {
  return { ...item, settleMs: SETTLE_MS, scrollSettleMs: SCROLL_SETTLE_MS, deadlineMs: DRIVER_DEADLINE_MS, ...(chrome ? { chrome } : {}) };
}

export type ChromeResult = { chrome: AuditItem["chrome"] } | { error: string };

/**
 * The system chrome the app cannot measure: on iOS the tab bar, which UIKit lays over the
 * content where neither the scroller's insets nor any safe area the app can read reports
 * it; its frame comes from the accessibility tree while the app shows its first screen.
 * Android lays its screens out between its bars, so the app's own band is enough there.
 */
export async function systemChrome(platform: AuditPlatform, device: AuditDevice): Promise<ChromeResult> {
  if (platform !== "ios") return { chrome: undefined };
  const maestro = findMaestro();
  if (!maestro) return { error: "the iOS band needs the tab bar's frame from Maestro, which is not installed: node scripts/install-maestro.mjs .audit/tools/maestro-<version>" };
  try {
    const tabBar = await iosTabBar(device.id, maestro);
    return tabBar ? { chrome: { bottom: tabBar.y } } : { error: "no Tab Bar in the iOS accessibility tree, so the band the tab bar covers is unknown" };
  } catch (error) {
    return { error: `reading the tab bar failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function startAuditHost(runs: PlatformRun[], options: { fingerprint: string; events: HostEvents; port?: number; chrome?: typeof systemChrome }): Promise<AuditHost> {
  const { events } = options;
  const states = new Map<AuditPlatform, RunState>();
  for (const run of runs) {
    let resolve = () => {};
    const done = new Promise<void>((r) => (resolve = r));
    states.set(run.platform, {
      ...run, chrome: undefined, session: null, sessions: 0, hello: null, next: 0, retry: null, current: null,
      lastContact: Date.now(), records: [], finished: run.queue.length === 0, refused: null, resolve, done,
    });
    if (run.queue.length === 0) resolve();
  }

  const bySession = (session: string | null) => [...states.values()].find((s) => s.session !== null && s.session === session);
  const total = (s: RunState) => s.queue.length;

  async function record(s: RunState, rec: CellRecord) {
    s.records.push(rec);
    await appendFile(join(s.dir, "cells.jsonl"), `${JSON.stringify(rec)}\n`);
    events.cell(s.platform, rec, s.records.length, total(s));
  }

  async function failAttempt(s: RunState, reason: string, phase: string, problems: AuditProblem[] = []) {
    const current = s.current;
    if (!current) return;
    s.current = null;
    const id = current.queued.item.id;
    events.log(s.platform, `${id}: attempt ${current.attempt} failed in ${phase}: ${reason}`);
    await writeProbe(s, current, { status: "failed", reason: `${phase}: ${reason}`, problems });
    if (current.attempt < MAX_ATTEMPTS) {
      s.retry = { queued: current.queued, attempt: current.attempt + 1 };
      return;
    }
    await record(s, { id, status: "failed", reason: `${phase}: ${reason}`, attempts: current.attempt, seconds: (Date.now() - current.started) / 1000, segments: current.segments.length });
  }

  async function writeProbe(s: RunState, current: Current, outcome: { status: CellStatus; reason?: string; problems: AuditProblem[]; timings?: Record<string, number> }) {
    const cellDir = join(s.dir, current.queued.item.id);
    await mkdir(cellDir, { recursive: true });
    const first = current.segments[0]?.request;
    const probe = {
      id: current.queued.item.id,
      platform: s.platform,
      item: wireItem(current.queued.item, s.chrome),
      attempt: current.attempt,
      status: outcome.status,
      ...(outcome.reason ? { reason: outcome.reason } : {}),
      session: s.session,
      look: first?.look ?? null,
      pathname: first?.pathname ?? null,
      label: first?.label ?? null,
      ...(first?.sections ? { sections: first.sections } : {}),
      dpr: s.hello?.dpr ?? null,
      segments: current.segments.map((segment, index) => ({
        segment: index,
        screen: index === 0 ? "screen.png" : `screen-${index + 1}.png`,
        region: segment.request.region,
        band: segment.request.band,
        bandSources: segment.request.bandSources,
        offset: segment.request.offset,
        rows: segment.request.rows,
        grabs: segment.grabs,
        mads: segment.mads.map((mad) => Number(mad.toFixed(4))),
        stable: segment.stable,
      })),
      a11y: current.a11y ? ("error" in current.a11y ? { error: current.a11y.error } : "a11y.json") : current.queued.a11y ? "not captured" : "not requested",
      problems: outcome.problems,
      timings: { driver: outcome.timings ?? {}, hostMs: current.hostMs, totalMs: Date.now() - current.started },
    };
    await writeFile(join(cellDir, "probe.json"), `${JSON.stringify(probe, null, 2)}\n`);
  }

  // The screen, grabbed until two grabs in a row agree on the card's rows.
  async function steadyShot(s: RunState, request: ReadyRequest) {
    const dpr = s.hello?.dpr ?? 1;
    let screen = await s.device.screenshot();
    const meta = await sharp(screen).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    const left = clamp(Math.round(request.region.x * dpr), 0, width - 1);
    const right = clamp(Math.round((request.region.x + request.region.width) * dpr), left + 1, width);
    const destTop = Math.round(request.rows.start * dpr);
    const destBottom = Math.round(request.rows.end * dpr);
    const top = clamp(Math.round((request.region.y + request.rows.start) * dpr), 0, height - 1);
    const rows = clamp(destBottom - destTop, 1, height - top);
    const area = { left, top, width: right - left, height: rows };
    const thumb = { width: 128, height: clamp(Math.round((128 * area.height) / area.width), 8, 1024) };
    const print = async (png: Buffer) => fingerprint(await sharp(png).extract(area).png().toBuffer(), thumb);
    let last = await print(screen);
    const mads: number[] = [];
    let stable = false;
    let grabs = 1;
    while (grabs < MAX_GRABS) {
      await sleep(STABILITY_GAP_MS);
      const next = await s.device.screenshot();
      grabs++;
      const nextPrint = await print(next);
      const mad = meanAbsDiff(last, nextPrint);
      mads.push(mad);
      screen = next;
      last = nextPrint;
      if (mad <= STABLE_MAD) {
        stable = true;
        break;
      }
    }
    const crop = await sharp(screen).extract(area).png().toBuffer();
    return { screen, crop, grabs, mads, stable };
  }

  async function onReady(s: RunState, request: ReadyRequest): Promise<Reply> {
    const current = s.current;
    if (!current || current.queued.item.id !== request.id) return json(410, { error: `${request.id} is not the item in hand` });
    const began = Date.now();
    try {
      const shot = await steadyShot(s, request);
      current.segments.push({ request, screen: shot.screen, crop: shot.crop, grabs: shot.grabs, mads: shot.mads, stable: shot.stable });
      if (current.queued.a11y && request.segment === 0) current.a11y = await accessibility(s, request);
    } finally {
      current.hostMs += Date.now() - began;
    }
    return json(200, { ok: true });
  }

  async function accessibility(s: RunState, request: ReadyRequest): Promise<A11ySnapshot | { error: string }> {
    // The part of the card on screen, in layout points.
    const top = Math.max(request.region.y, request.band.top);
    const bottom = Math.min(request.region.y + request.region.height, request.band.bottom);
    const region = { x: request.region.x, y: top, width: request.region.width, height: Math.max(0, bottom - top) };
    try {
      if (s.platform === "android") return await androidSnapshot(s.device.id, s.hello?.dpr ?? 1, region);
      const maestro = findMaestro();
      if (!maestro) return { error: "Maestro is not installed: node scripts/install-maestro.mjs .audit/tools/maestro-<version>" };
      return await iosSnapshot(s.device.id, region, maestro);
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  async function onDone(s: RunState, request: DoneRequest): Promise<Reply> {
    const current = s.current;
    if (!current || current.queued.item.id !== request.id) return json(410, { error: `${request.id} is not the item in hand` });
    const cellDir = join(s.dir, current.queued.item.id);
    await mkdir(cellDir, { recursive: true });
    const dpr = s.hello?.dpr ?? 1;
    const segments = current.segments;
    if (segments.length === 0) {
      await failAttempt(s, "the driver finished without a segment", "capture", request.problems);
      return json(200, { ok: true });
    }
    for (const [index, segment] of segments.entries()) {
      await writeFile(join(cellDir, index === 0 ? "screen.png" : `screen-${index + 1}.png`), segment.screen);
    }
    // The card, its segments stacked at the rows each one added.
    const region = segments[0].request.region;
    const width = (await sharp(segments[0].crop).metadata()).width ?? 1;
    const height = Math.max(1, Math.round(region.height * dpr));
    const card = await sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite(await Promise.all(segments.map(async (segment) => ({
        input: await clip(segment.crop, width, height - Math.round(segment.request.rows.start * dpr)),
        top: Math.round(segment.request.rows.start * dpr),
        left: 0,
      }))))
      .png()
      .toBuffer();
    await writeFile(join(cellDir, "card.png"), card);
    if (current.a11y && !("error" in current.a11y)) await writeFile(join(cellDir, "a11y.json"), `${JSON.stringify(current.a11y, null, 2)}\n`);
    const unstable = segments.some((segment) => !segment.stable);
    s.current = null;
    await writeProbe(s, current, { status: unstable ? "unstable" : "ok", problems: request.problems, timings: request.timings });
    await record(s, {
      id: current.queued.item.id,
      status: unstable ? "unstable" : "ok",
      ...(unstable ? { reason: "the card kept changing between grabs" } : {}),
      attempts: current.attempt,
      seconds: (Date.now() - current.started) / 1000,
      segments: segments.length,
      ...(current.queued.a11y ? { a11y: current.a11y ? ("error" in current.a11y ? current.a11y.error : "ok") : "not captured" } : {}),
    });
    return json(200, { ok: true });
  }

  async function onNext(s: RunState): Promise<Reply> {
    if (s.current) {
      // The driver asked for another item without finishing this one; it lost track of it.
      await failAttempt(s, "the driver moved on without finishing", "next");
    }
    let handout: { queued: QueueItem; attempt: number } | null = null;
    if (s.retry) {
      handout = s.retry;
      s.retry = null;
    } else if (s.next < s.queue.length) {
      handout = { queued: s.queue[s.next], attempt: 1 };
      s.next++;
    }
    if (!handout) {
      if (!s.finished) {
        s.finished = true;
        s.resolve();
      }
      return json(200, { done: true } satisfies NextResponse);
    }
    s.current = { queued: handout.queued, attempt: handout.attempt, started: Date.now(), hostMs: 0, segments: [] };
    return json(200, { done: false, item: wireItem(handout.queued.item, s.chrome) } satisfies NextResponse);
  }

  function refuse(s: RunState, why: string): Reply {
    s.refused = why;
    events.refused(s.platform, why);
    if (!s.finished) {
      s.finished = true;
      s.resolve();
    }
    return json(409, { error: why });
  }

  async function onHello(request: HelloRequest): Promise<Reply> {
    if (request.driver !== AUDIT_DRIVER) return json(409, { error: `this host speaks ${AUDIT_DRIVER}, not ${request.driver}` });
    const s = states.get(request.platform);
    if (!s) return json(409, { error: `no ${request.platform} run is in progress` });
    if (s.finished) return json(409, { error: `the ${request.platform} run is over` });
    if (request.app.id !== AUDIT_APP_ID) return refuse(s, `the app saying hello is ${request.app.id}, not the audit build ${AUDIT_APP_ID}`);
    const built = request.build?.sourceFingerprint;
    if (built !== options.fingerprint) {
      return refuse(s, `the installed build is stale: it was built from source fingerprint ${String(built).slice(0, 12)}, this checkout is ${options.fingerprint.slice(0, 12)}; run bun run audit:native:build -- --platform=${request.platform}`);
    }
    // With updates off (the audit build) expo-updates reports no update id and a
    // non-embedded launch; only an update id with a non-embedded launch is a download.
    if (!s.dev && request.update.updateId !== null && request.update.isEmbeddedLaunch === false) {
      return refuse(s, `the app is running a downloaded update (${request.update.updateId}), not the bundle it was built with`);
    }
    if (!s.dev && request.dev) return refuse(s, "the app is a Debug build; sweeps run on Release (pass --dev to drive a Debug build)");
    if (s.current) await failAttempt(s, "the app restarted", "hello");
    // The iOS tab bar lies over the content where nothing in the app can measure it; the
    // accessibility tree has its frame. The app is on its first screen, tab bar showing.
    if (!s.chrome) {
      const found = await (options.chrome ?? systemChrome)(s.platform, s.device);
      if ("error" in found) return refuse(s, found.error);
      s.chrome = found.chrome;
      if (found.chrome) events.log(s.platform, `system chrome from the accessibility tree: ${JSON.stringify(found.chrome)}`);
    }
    if (!s.hello) events.hello(s.platform, request);
    s.hello = request;
    s.sessions++;
    s.session = `${request.platform}-${s.sessions}`;
    return json(200, { session: s.session });
  }

  async function handle(method: string, url: URL, body: unknown): Promise<Reply> {
    const route = `${method} ${url.pathname}`;
    if (route === "POST /hello") return onHello(body as HelloRequest);
    if (route === "POST /log") {
      const { session, problems } = body as LogRequest;
      const s = bySession(session) ?? [...states.values()].find((state) => state.hello !== null);
      if (s) await appendFile(join(s.dir, "driver-log.jsonl"), problems.map((p) => `${JSON.stringify(p)}\n`).join(""));
      return json(200, { ok: true });
    }
    const session = method === "GET" ? url.searchParams.get("session") : (body as { session?: string }).session ?? null;
    const s = bySession(session);
    if (!s) return json(410, { error: `no session ${session}` });
    s.lastContact = Date.now();
    if (route === "GET /next") return onNext(s);
    if (route === "POST /ready") return onReady(s, body as ReadyRequest);
    if (route === "POST /done") return onDone(s, body as DoneRequest);
    if (route === "POST /fail") {
      const fail = body as FailRequest;
      if (s.current?.queued.item.id === fail.id) await failAttempt(s, fail.reason, fail.phase, fail.problems);
      return json(200, { ok: true });
    }
    return json(404, { error: `no ${route}` });
  }

  // node:http rather than Bun.serve: a Bun.serve handler answers with the global
  // Response, which the repository's test preload replaces with happy-dom's (Bun then
  // rejects it), so a Bun.serve host could not be exercised by the suite; and Bun's types
  // are not installed here. node:http is Bun's own implementation under bun. A segment's
  // request waits on the shots and an accessibility dump, which no timeout here cuts off.
  const server = createServer((request, response) => {
    void (async () => {
      let reply: Reply;
      try {
        const chunks: Buffer[] = [];
        for await (const chunk of request) chunks.push(chunk as Buffer);
        const text = Buffer.concat(chunks).toString("utf8");
        reply = await handle(request.method ?? "GET", new URL(request.url ?? "/", "http://127.0.0.1"), text ? JSON.parse(text) : null);
      } catch (error) {
        reply = json(500, { error: error instanceof Error ? error.message : String(error) });
      }
      response.writeHead(reply.status, { "content-type": "application/json" });
      response.end(JSON.stringify(reply.body));
    })();
  });
  server.requestTimeout = 0;
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port ?? AUDIT_PORT, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : options.port ?? AUDIT_PORT;

  // The watchdog: an item past its time, or an app that has gone quiet with work left,
  // is a stalled app. The item is failed (and retried once) and the app relaunched.
  const STALL_MS = ITEM_TIMEOUT_MS + 15_000;
  const relaunching = new Set<AuditPlatform>();
  const watchdog = setInterval(() => {
    for (const s of states.values()) {
      if (s.finished || relaunching.has(s.platform)) continue;
      const now = Date.now();
      const current = s.current;
      const overdue = current && now - current.started - current.hostMs > ITEM_TIMEOUT_MS;
      const quiet = !current && s.session !== null && now - s.lastContact > STALL_MS;
      const silent = s.session === null && now - s.lastContact > STALL_MS * 2;
      if (!overdue && !quiet && !silent) continue;
      const why = overdue ? `${current?.queued.item.id} took over ${ITEM_TIMEOUT_MS / 1000} s` : quiet ? "the app stopped asking for items" : "the app never said hello";
      relaunching.add(s.platform);
      void (async () => {
        if (overdue) await failAttempt(s, `timed out after ${ITEM_TIMEOUT_MS / 1000} s`, "watchdog");
        s.session = null;
        await events.stalled(s.platform, why);
        s.lastContact = Date.now();
      })().finally(() => relaunching.delete(s.platform));
    }
  }, 1000);

  return {
    port,
    finished: Promise.all([...states.values()].map((s) => s.done)).then(() => undefined),
    records: (platform) => states.get(platform)?.records ?? [],
    hello: (platform) => states.get(platform)?.hello ?? null,
    refused: (platform) => states.get(platform)?.refused ?? null,
    stop() {
      clearInterval(watchdog);
      server.closeAllConnections();
      server.close();
    },
  };
}

function clamp(value: number, low: number, high: number) {
  return Math.min(Math.max(value, low), high);
}

// A crop trimmed to fit the card canvas below its row, so a last segment that rounds a
// pixel past the card's height still composites.
async function clip(png: Buffer, width: number, room: number): Promise<Buffer> {
  const meta = await sharp(png).metadata();
  const w = Math.min(meta.width ?? width, width);
  const h = Math.min(meta.height ?? room, Math.max(1, room));
  return w === meta.width && h === meta.height ? png : sharp(png).extract({ left: 0, top: 0, width: w, height: h }).png().toBuffer();
}
