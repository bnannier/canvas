import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { AUDIT_DRIVER, type AuditItem, type HelloRequest, type ReadyRequest } from "../../../docs/src/audit/protocol.ts";
import type { AuditDevice } from "./devices.ts";
import { startAuditHost, type AuditHost, type CellRecord, type QueueItem, type systemChrome } from "./server.ts";

// The host end to end against a fake device and a scripted driver: the same HTTP the app
// speaks, so the queue, the refusals, the retries, the stability check and the crops are
// exercised as a run exercises them, without a simulator.

const DPR = 3;
const WINDOW = { width: 100, height: 200 };
const FINGERPRINT = "f".repeat(64);
const CARD_COLOR = { r: 220, g: 30, b: 40 };

/** A screen of WINDOW at DPR with a filled card at `card` (points). */
async function screen(card: { x: number; y: number; width: number; height: number }, background = { r: 240, g: 240, b: 240 }) {
  const fill = await sharp({ create: { width: Math.round(card.width * DPR), height: Math.round(card.height * DPR), channels: 4, background: { ...CARD_COLOR, alpha: 1 } } }).png().toBuffer();
  return sharp({ create: { width: WINDOW.width * DPR, height: WINDOW.height * DPR, channels: 4, background: { ...background, alpha: 1 } } })
    .composite([{ input: fill, left: Math.round(card.x * DPR), top: Math.max(0, Math.round(card.y * DPR)) }])
    .png()
    .toBuffer();
}

class FakeDevice implements AuditDevice {
  readonly platform = "ios" as const;
  readonly id = "fake-simulator";
  shots: Buffer[] = [];
  grabs = 0;
  launches = 0;
  async info() {
    return { platform: "ios" as const, id: this.id, name: "Fake", model: "Fake", os: "iOS 27.0", details: {} };
  }
  async prepare() {
    return [];
  }
  async restore() {
    return [];
  }
  async isInstalled() {
    return true;
  }
  async launch() {
    this.launches++;
  }
  async terminate() {}
  async screenshot() {
    const shot = this.shots[Math.min(this.grabs, this.shots.length - 1)];
    this.grabs++;
    return shot;
  }
}

const look = { scheme: "light", surface: "solid", palette: "blush" } as const;
const item = (variant: string): QueueItem => ({
  item: { kind: "component", id: `ios/button/${variant}/blush.solid`, route: `/components/button/${variant}`, look, slug: "button", variant, label: variant, settleMs: 0, scrollSettleMs: 0, deadlineMs: 0 },
  a11y: false,
});

const hello = (overrides: Partial<HelloRequest> = {}): HelloRequest => ({
  driver: AUDIT_DRIVER,
  platform: "ios",
  osVersion: "27.0",
  constants: {},
  build: { sourceFingerprint: FINGERPRINT },
  app: { name: "Canvas Audit", scheme: "canvas-audit", id: "com.nannier.canvas.audit", version: "1.0.0", buildNumber: "1" },
  update: { updateId: null, isEmbeddedLaunch: false },
  window: WINDOW,
  screen: WINDOW,
  dpr: DPR,
  fontScale: 1,
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  reduceMotion: true,
  reduceTransparency: false,
  liquidGlass: true,
  dev: false,
  ...overrides,
});

const resolved = { ...look, dark: false, reducedTransparency: false, increasedContrast: false };

let dir = "";
let host: AuditHost | null = null;
afterEach(() => {
  host?.stop();
  host = null;
  if (dir) rmSync(dir, { recursive: true, force: true });
});

async function start(device: FakeDevice, queue: QueueItem[], chrome: typeof systemChrome = async () => ({ chrome: { bottom: 180 } })) {
  dir = mkdtempSync(join(tmpdir(), "canvas-audit-host-"));
  const cells: CellRecord[] = [];
  const refusals: string[] = [];
  const stalls: string[] = [];
  host = await startAuditHost([{ platform: "ios", device, dir, queue, dev: false }], {
    fingerprint: FINGERPRINT,
    port: 0,
    chrome,
    events: {
      log: () => {},
      hello: () => {},
      refused: (_platform, why) => refusals.push(why),
      cell: (_platform, record) => cells.push(record),
      stalled: async (_platform, why) => {
        stalls.push(why);
      },
    },
  });
  const port = host.port;
  // node:http, not fetch: the test preload installs happy-dom, whose fetch is a browser's.
  const call = (method: "GET" | "POST", path: string, body?: unknown) =>
    new Promise<{ status: number; data: Record<string, unknown> }>((resolve, reject) => {
      const payload = body === undefined ? undefined : JSON.stringify(body);
      const req = httpRequest({ host: "127.0.0.1", port, path, method, headers: payload ? { "content-type": "application/json", "content-length": Buffer.byteLength(payload) } : {} }, (response) => {
        let text = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => (text += chunk));
        response.on("end", () => resolve({ status: response.statusCode ?? 0, data: JSON.parse(text) as Record<string, unknown> }));
      });
      req.on("error", reject);
      req.end(payload);
    });
  return { host, cells, refusals, stalls, call };
}

function ready(session: string, it: AuditItem, segment: number, region: ReadyRequest["region"], rows: ReadyRequest["rows"], last: boolean): ReadyRequest {
  return { session, id: it.id, segment, region, band: { top: 0, bottom: WINDOW.height }, bandSources: {}, rows, last, offset: 0, look: resolved, pathname: it.route, label: "x" };
}

describe("the native capture host", () => {
  test("refuses a build from another source fingerprint and ends the platform's run", async () => {
    const { call, refusals, host: h } = await start(new FakeDevice(), [item("default")]);
    const answer = await call("POST", "/hello", hello({ build: { sourceFingerprint: "0".repeat(64) } }));
    expect(answer.status).toBe(409);
    expect(String(answer.data.error)).toContain("stale");
    expect(refusals).toHaveLength(1);
    await h.finished;
    expect(h.refused("ios")).toContain("stale");
  });

  test("refuses to run when the system chrome cannot be read", async () => {
    const { call, refusals } = await start(new FakeDevice(), [item("default")], async () => ({ error: "no Tab Bar in the iOS accessibility tree" }));
    const answer = await call("POST", "/hello", hello());
    expect(answer.status).toBe(409);
    expect(refusals).toEqual(["no Tab Bar in the iOS accessibility tree"]);
  });

  test("refuses an app that is not the audit build", async () => {
    const { call } = await start(new FakeDevice(), [item("default")]);
    const answer = await call("POST", "/hello", hello({ app: { ...hello().app, id: "com.nannier.canvas" } }));
    expect(answer.status).toBe(409);
  });

  test("hands out items in queue order, crops the card and stitches segments", async () => {
    const device = new FakeDevice();
    const { call, cells, host: h } = await start(device, [item("default"), item("tall")]);
    const session = String((await call("POST", "/hello", hello())).data.session);

    // A card that fits: one segment, cropped from the steady screen.
    const first = (await call("GET", `/next?session=${session}`)).data.item as AuditItem;
    expect(first.id).toBe("ios/button/default/blush.solid");
    expect(first.settleMs).toBeGreaterThan(0);
    // The chrome the host read from the accessibility tree rides with every item.
    expect(first.chrome).toEqual({ bottom: 180 });
    const card = { x: 10, y: 50, width: 80, height: 40 };
    device.shots = [await screen(card)];
    device.grabs = 0;
    expect((await call("POST", "/ready", ready(session, first, 0, card, { start: 0, end: 40 }, true))).status).toBe(200);
    expect(device.grabs).toBe(2);
    expect((await call("POST", "/done", { session, id: first.id, problems: [], timings: {} })).status).toBe(200);
    const cellDir = join(dir, first.id);
    const png = await sharp(readFileSync(join(cellDir, "card.png"))).raw().toBuffer({ resolveWithObject: true });
    expect([png.info.width, png.info.height]).toEqual([card.width * DPR, card.height * DPR]);
    expect([...png.data.subarray(0, 3)]).toEqual([CARD_COLOR.r, CARD_COLOR.g, CARD_COLOR.b]);
    expect(existsSync(join(cellDir, "screen.png"))).toBe(true);
    const probe = JSON.parse(readFileSync(join(cellDir, "probe.json"), "utf8"));
    expect(probe.status).toBe("ok");
    expect(probe.segments[0].stable).toBe(true);

    // A card taller than the band: two segments, scrolled, stacked at their rows.
    const second = (await call("GET", `/next?session=${session}`)).data.item as AuditItem;
    const top = { x: 10, y: 50, width: 80, height: 300 };
    device.shots = [await screen({ ...top, height: 150 })];
    device.grabs = 0;
    await call("POST", "/ready", ready(session, second, 0, top, { start: 0, end: 150 }, false));
    const scrolled = { ...top, y: -100 };
    device.shots = [await screen({ x: 10, y: 0, width: 80, height: 200 })];
    device.grabs = 0;
    await call("POST", "/ready", ready(session, second, 1, scrolled, { start: 150, end: 300 }, true));
    await call("POST", "/done", { session, id: second.id, problems: [], timings: {} });
    const tall = await sharp(readFileSync(join(dir, second.id, "card.png"))).metadata();
    expect([tall.width, tall.height]).toEqual([80 * DPR, 300 * DPR]);
    expect(existsSync(join(dir, second.id, "screen-2.png"))).toBe(true);

    expect((await call("GET", `/next?session=${session}`)).data).toEqual({ done: true });
    await h.finished;
    expect(cells.map((c) => [c.id, c.status, c.segments])).toEqual([
      ["ios/button/default/blush.solid", "ok", 1],
      ["ios/button/tall/blush.solid", "ok", 2],
    ]);
    expect(readFileSync(join(dir, "cells.jsonl"), "utf8").trim().split("\n")).toHaveLength(2);
  });

  test("marks a card that never holds still unstable, and keeps it", async () => {
    const device = new FakeDevice();
    const { call, cells } = await start(device, [item("spinner")]);
    const session = String((await call("POST", "/hello", hello())).data.session);
    const it = (await call("GET", `/next?session=${session}`)).data.item as AuditItem;
    const card = { x: 10, y: 50, width: 80, height: 40 };
    const a = await screen(card);
    const b = await screen(card, { r: 0, g: 0, b: 0 });
    device.shots = [a, b, a, b, a, b];
    // Alternate frames on every grab.
    device.screenshot = async () => (device.grabs++ % 2 === 0 ? a : b);
    await call("POST", "/ready", ready(session, it, 0, { x: 0, y: 40, width: 100, height: 60 }, { start: 0, end: 60 }, true));
    await call("POST", "/done", { session, id: it.id, problems: [], timings: {} });
    expect(cells[0].status).toBe("unstable");
    expect(device.grabs).toBe(5);
    expect(existsSync(join(dir, it.id, "card.png"))).toBe(true);
  });

  test("retries a failed item once, then records it failed", async () => {
    const { call, cells } = await start(new FakeDevice(), [item("broken"), item("after")]);
    const session = String((await call("POST", "/hello", hello())).data.session);
    const first = (await call("GET", `/next?session=${session}`)).data.item as AuditItem;
    await call("POST", "/fail", { session, id: first.id, reason: "timed out waiting for the example", phase: "register", problems: [] });
    const retry = (await call("GET", `/next?session=${session}`)).data.item as AuditItem;
    expect(retry.id).toBe(first.id);
    await call("POST", "/fail", { session, id: retry.id, reason: "timed out waiting for the example", phase: "register", problems: [] });
    const next = (await call("GET", `/next?session=${session}`)).data.item as AuditItem;
    expect(next.id).toBe("ios/button/after/blush.solid");
    expect(cells).toEqual([expect.objectContaining({ id: first.id, status: "failed", attempts: 2, reason: "register: timed out waiting for the example" })]);
  });

  test("answers a segment for an item it no longer holds with 410, so the driver drops it", async () => {
    const { call } = await start(new FakeDevice(), [item("default")]);
    const session = String((await call("POST", "/hello", hello())).data.session);
    const it = (await call("GET", `/next?session=${session}`)).data.item as AuditItem;
    // The app restarted: a new hello fails the item in hand.
    const again = String((await call("POST", "/hello", hello())).data.session);
    expect(again).not.toBe(session);
    expect((await call("POST", "/ready", ready(again, it, 0, { x: 0, y: 0, width: 10, height: 10 }, { start: 0, end: 10 }, true))).status).toBe(410);
    expect((await call("GET", `/next?session=${session}`)).status).toBe(410);
  });
});
