import { useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { AccessibilityInfo, Dimensions, LogBox, PixelRatio, Platform, type ScrollView } from "react-native";
import Constants from "expo-constants";
import { router, usePathname } from "expo-router";
import { HeaderHeightContext } from "expo-router/react-navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, liquidGlassAvailable, useTheme } from "@nannier/canvas";
import { useDocsTheme } from "../theme/docs-theme";
import { readUpdateIdentity } from "../core/update-identity";
import { AuditProbeContext, type AuditProbe, type ProbeCard, type ProbePage, type ProbeScroller } from "./probe-context";
import {
  AUDIT_DRIVER,
  AUDIT_PORT,
  type AuditItem,
  type AuditLook,
  type AuditProblem,
  type HelloRequest,
  type HelloResponse,
  type Insets,
  type NextResponse,
  type Rect,
  type ReadyRequest,
  type ResolvedLook,
} from "./protocol";

// The component audit's in-app driver (plan 1f), built only into the native audit app:
// `EXPO_PUBLIC_CANVAS_AUDIT=1` makes docs/src/app/_layout.tsx require it, and no other
// build carries it (tools/docs/audit-driver-bundle.test.ts). It renders nothing of its
// own. It asks the capture host on the Mac (tools/audit/native/server.ts) for one item
// at a time, a component example or a pattern or template page in one look, puts it on
// screen the way a person would see it (the docs theme's own setters, the router's own
// navigation), waits until the screen says it is that item, and tells the host where
// the card is so the host can photograph it. Everything the driver knows about the
// screen comes from the screen (the probe context) or, for the iOS tab bar, from the
// platform's accessibility tree through the host, never from a guess at a layout.

const HOST = `http://127.0.0.1:${AUDIT_PORT}`;
// How often a wait re-reads the screen, and how long to wait for a host that is not up.
const POLL_MS = 50;
const NO_HOST_RETRY_MS = 2000;
// Positions within half a point are the same position: layout rounds to the pixel grid.
const SAME_POINT = 0.5;
// A page taller than this many screens is cut off rather than scrolled forever.
const MAX_SEGMENTS = 40;

interface Band {
  top: number;
  bottom: number;
  /** What each source said the band was, in window coordinates. */
  sources: Record<string, { top: number; bottom: number }>;
}

interface ProbeState {
  card: ProbeCard | null;
  scroller: ProbeScroller | null;
  page: ProbePage | null;
  band: Band | null;
}

interface Live {
  pathname: string;
  docs: ReturnType<typeof useDocsTheme>;
  theme: ReturnType<typeof useTheme>;
  insets: Insets;
}

class ItemExpired extends Error {}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const frames = async (count: number) => {
  for (let i = 0; i < count; i++) await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
};
// React Native 0.86 deprecates InteractionManager (its runAfterInteractions is now a bare
// setImmediate) and names requestIdleCallback as the replacement: it runs once the JS
// thread has nothing queued, which is what "after the interactions" meant.
const idle = () => new Promise<void>((resolve) => requestIdleCallback(() => resolve(), { timeout: 1000 }));

function measure(node: { measureInWindow(callback: (x: number, y: number, width: number, height: number) => void): void } | null | undefined, what: string): Promise<Rect> {
  return new Promise((resolve, reject) => {
    if (!node) return reject(new Error(`${what} is not mounted`));
    node.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
  });
}

const sameRect = (a: Rect, b: Rect) =>
  Math.abs(a.x - b.x) < SAME_POINT && Math.abs(a.y - b.y) < SAME_POINT &&
  Math.abs(a.width - b.width) < SAME_POINT && Math.abs(a.height - b.height) < SAME_POINT;

async function waitUntil<T>(read: () => T | null | undefined | false, deadline: number, what: string): Promise<T> {
  for (;;) {
    const value = read();
    if (value) return value;
    if (Date.now() > deadline) throw new Error(`timed out waiting for ${what}`);
    await sleep(POLL_MS);
  }
}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<{ status: number; data: T }> {
  const response = await fetch(`${HOST}${path}`, {
    method,
    headers: { "content-type": "application/json", "x-canvas-audit": AUDIT_DRIVER },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, data: (await response.json()) as T };
}

// Console problems and uncaught errors, kept with the time they happened so each item
// carries the ones raised while it was on its way to the screen.
function forwardProblems(started: number, problems: AuditProblem[], session: () => string | null): () => void {
  const original = { error: console.error, warn: console.warn };
  const text = (args: unknown[]) => args.map((arg) => (arg instanceof Error ? `${arg.name}: ${arg.message}` : typeof arg === "string" ? arg : safeJson(arg))).join(" ");
  console.error = (...args: unknown[]) => {
    problems.push({ level: "error", message: text(args), at: Date.now() - started });
    original.error(...args);
  };
  console.warn = (...args: unknown[]) => {
    problems.push({ level: "warn", message: text(args), at: Date.now() - started });
    original.warn(...args);
  };
  const errorUtils = (globalThis as { ErrorUtils?: { getGlobalHandler(): (error: unknown, fatal?: boolean) => void; setGlobalHandler(handler: (error: unknown, fatal?: boolean) => void): void } }).ErrorUtils;
  const previous = errorUtils?.getGlobalHandler();
  errorUtils?.setGlobalHandler((error, fatal) => {
    const problem: AuditProblem = { level: fatal ? "fatal" : "error", message: text([error]), at: Date.now() - started };
    problems.push(problem);
    // Sent at once: a fatal error ends the process before any item could carry it.
    void call("POST", "/log", { session: session(), problems: [problem] }).catch(() => undefined);
    previous?.(error, fatal);
  });
  return () => {
    console.error = original.error;
    console.warn = original.warn;
    if (previous) errorUtils?.setGlobalHandler(previous);
  };
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

// Platform.constants without Android's device serial, which the audit has no use for.
function deviceConstants(): Record<string, unknown> {
  const { Serial: _serial, ...constants } = Platform.constants as unknown as Record<string, unknown>;
  return constants;
}

function resolvedLook(theme: Live["theme"]): ResolvedLook {
  return {
    scheme: theme.scheme === "dark" ? "dark" : "light",
    surface: theme.surface === "glass" ? "glass" : "solid",
    palette: theme.palette === "mint" ? "mint" : "blush",
    dark: theme.dark,
    reducedTransparency: theme.reducedTransparency,
    increasedContrast: theme.increasedContrast,
  };
}

async function hello(live: Live): Promise<HelloRequest> {
  const config = Constants.expoConfig;
  const id = Platform.OS === "ios" ? config?.ios?.bundleIdentifier : config?.android?.package;
  const scheme = Array.isArray(config?.scheme) ? config.scheme[0] : config?.scheme;
  return {
    driver: AUDIT_DRIVER,
    platform: Platform.OS === "ios" ? "ios" : "android",
    osVersion: Platform.Version,
    constants: deviceConstants(),
    build: (config?.extra?.canvasBuild as Record<string, unknown> | undefined) ?? null,
    app: {
      name: config?.name ?? null,
      scheme: scheme ?? null,
      id: id ?? null,
      version: Constants.nativeAppVersion ?? null,
      buildNumber: Constants.nativeBuildVersion ?? null,
    },
    update: readUpdateIdentity(),
    window: Dimensions.get("window"),
    screen: Dimensions.get("screen"),
    dpr: PixelRatio.get(),
    fontScale: PixelRatio.getFontScale(),
    insets: live.insets,
    reduceMotion: await AccessibilityInfo.isReduceMotionEnabled(),
    reduceTransparency: Platform.OS === "ios" ? await AccessibilityInfo.isReduceTransparencyEnabled() : false,
    liquidGlass: liquidGlassAvailable(),
    dev: __DEV__,
  };
}

// The docs theme setters, called only for an axis that differs from what is showing, then
// a wait until the kit's ThemeProvider resolves to the look: the look is read back from
// useTheme(), not assumed from the call.
async function applyLook(look: AuditLook, live: { current: Live }, deadline: number) {
  const { docs } = live.current;
  // An explicit scheme even when the OS appearance already matches, so the OS cannot
  // change it mid-run.
  if (docs.override !== look.scheme) docs.setScheme(look.scheme);
  if (docs.surface !== look.surface) docs.setSurface(look.surface);
  if (docs.palette !== look.palette) docs.setPalette(look.palette);
  await waitUntil(() => {
    const now = resolvedLook(live.current.theme);
    return now.scheme === look.scheme && now.surface === look.surface && now.palette === look.palette;
  }, deadline, `the ${look.scheme} ${look.surface} ${look.palette} look`);
}

async function runItem(item: AuditItem, session: string, live: { current: Live }, state: ProbeState, problems: AuditProblem[]) {
  const started = Date.now();
  const deadline = started + item.deadlineMs;
  // Problems raised between items belong to no item: they go to the host's log, and the
  // item collects only its own.
  const between = problems.splice(0);
  if (between.length > 0) void call("POST", "/log", { session, problems: between }).catch(() => undefined);
  const timings: Record<string, number> = {};
  let phase = "look";
  let mark = started;
  const lap = (name: string) => {
    const now = Date.now();
    timings[name] = now - mark;
    mark = now;
  };
  try {
    await applyLook(item.look, live, deadline);
    lap("look");

    // A replace remounts the screen, which a deep link into a mounted route does not.
    phase = "route";
    if (live.current.pathname !== item.route) router.replace(item.route as never);
    await waitUntil(() => live.current.pathname === item.route, deadline, `the route ${item.route}`);
    lap("route");

    // The screen says which item it is: the Playground's selected example, or the page.
    phase = "register";
    const label = item.kind === "component" ? item.label : null;
    await waitUntil(() => (item.kind === "component" ? state.card?.label === label : state.page?.path === item.route), deadline,
      item.kind === "component" ? `the example "${item.label}"` : `the page ${item.route}`);
    const scroller = await waitUntil(() => state.scroller, deadline, "the page scroller");
    await waitUntil(() => state.band, deadline, "the visible band");
    lap("register");

    phase = "settle";
    await idle();
    await frames(3);
    await sleep(item.settleMs);
    lap("settle");

    phase = "capture";
    await captureSegments(item, session, scroller, live, state, deadline);
    lap("capture");

    await call("POST", "/done", { session, id: item.id, problems: problems.splice(0), timings });
  } catch (error) {
    if (error instanceof ItemExpired) return;
    const reason = error instanceof Error ? error.message : String(error);
    await call("POST", "/fail", { session, id: item.id, reason, phase, problems: problems.splice(0) }).catch(() => undefined);
  }
}

type Measurable = Parameters<typeof measure>[0];

// The scroller's content view. ScrollView.getInnerViewRef is public in React Native's
// own source (Libraries/Components/ScrollView/ScrollView.js) but its TypeScript
// declaration leaves it out, so the one method used is named here.
function contentOf(view: ScrollView): Measurable {
  return (view as ScrollView & { getInnerViewRef(): Measurable }).getInnerViewRef();
}

// Reads until two reads agree, so a card still laying out is never reported.
async function settled(read: () => Promise<Rect>, deadline: number, what: string): Promise<Rect> {
  let last: Rect | null = null;
  for (;;) {
    const rect = await read();
    if (last && rect.height > 0 && rect.width > 0 && sameRect(last, rect)) return rect;
    if (Date.now() > deadline) throw new Error(`timed out waiting for ${what} to stop moving`);
    last = rect;
    await frames(1);
  }
}

/** A node's layout relative to an ancestor: pure layout, no scroll offset in between. */
function layoutWithin(node: View | null | undefined, ancestor: Measurable, what: string): Promise<Rect> {
  return new Promise((resolve, reject) => {
    if (!node || !ancestor) return reject(new Error(`${what} is not mounted`));
    node.measureLayout(ancestor as Parameters<View["measureLayout"]>[0], (x, y, width, height) => resolve({ x, y, width, height }), () => reject(new Error(`${what} is not inside the page content`)));
  });
}

// Space kept above a card that fits the band, so the screenshot shows its top edge clear
// of the header.
const MARGIN = 16;

// One /ready per segment. The region (the card, or a page's whole content) is placed by
// layout within the scroller's content and by a scroll offset the driver sets itself, not
// by measureInWindow: on iOS the scroller's content offset under the automatic inset
// adjustment is not the one Fabric's layout reads, and a card's window position read
// that way came back hundreds of points off. Segment 0 scrolls the region's top to the
// band (with a margin when it fits), and each later segment starts where the last ended;
// every offset is clamped to the scroller's range, as the scroller itself clamps it.
async function captureSegments(item: AuditItem, session: string, scroller: ProbeScroller, live: { current: Live }, state: ProbeState, deadline: number) {
  const what = item.kind === "component" ? "the preview card" : "the page";
  const sensed = state.band;
  if (!sensed) throw new Error("the visible band is not known");
  const band = {
    top: Math.max(sensed.top, item.chrome?.top ?? -Infinity),
    bottom: Math.min(sensed.bottom, item.chrome?.bottom ?? Infinity),
  };
  const bandSources = { ...sensed.sources, ...(item.chrome ? { host: { top: item.chrome.top ?? sensed.top, bottom: item.chrome.bottom ?? sensed.bottom } } : {}) };
  const view = scroller.ref.current;
  if (!view) throw new Error("the page scroller unmounted");
  const content = contentOf(view);
  const frame = await settled(() => measure(view.getNativeScrollRef(), "the page scroller"), deadline, "the page scroller");
  const contentSize = await settled(() => measure(content, "the page content"), deadline, "the page content");
  const region = item.kind === "component"
    ? await settled(() => layoutWithin(state.card?.ref.current, content, what), deadline, what)
    : { x: 0, y: 0, width: contentSize.width, height: contentSize.height };
  // The bars that lie over the scroller (iOS: the transparent header and the tab bar). A
  // user's scroll rests with the content's ends against them (the automatic inset
  // adjustment), so the offsets run that far past the content's own range; the page frame
  // lets scrollTo reach them in the audit build (scrollToOverflowEnabled). Android lays its
  // screens out between its bars, and both are zero there.
  const insetTop = band.top - frame.y > SAME_POINT ? band.top - frame.y : 0;
  const insetBottom = frame.y + frame.height - band.bottom > SAME_POINT ? frame.y + frame.height - band.bottom : 0;
  const minOffset = -insetTop;
  const maxOffset = Math.max(minOffset, contentSize.height - frame.height + insetBottom);
  const margin = region.height + 2 * MARGIN <= band.bottom - band.top ? MARGIN : 0;
  let covered = 0;
  for (let segment = 0; segment < MAX_SEGMENTS; segment++) {
    const wanted = region.y + covered - (band.top - frame.y) - (segment === 0 ? margin : 0);
    const offset = Math.min(Math.max(wanted, minOffset), maxOffset);
    view.scrollTo({ x: 0, y: offset, animated: false });
    await frames(2);
    await sleep(item.scrollSettleMs);
    const rect = { x: frame.x + region.x, y: frame.y + region.y - offset, width: region.width, height: region.height };
    const visibleStart = Math.max(band.top, rect.y) - rect.y;
    const visibleEnd = Math.min(band.bottom, rect.y + rect.height) - rect.y;
    if (visibleEnd <= covered + SAME_POINT) throw new Error(`${what} stopped scrolling at row ${Math.round(covered)} of ${Math.round(rect.height)}`);
    const rows = { start: Math.max(covered, visibleStart), end: visibleEnd };
    const last = rows.end >= rect.height - SAME_POINT;
    const ready: ReadyRequest = {
      session,
      id: item.id,
      segment,
      region: rect,
      band,
      bandSources,
      rows,
      last,
      offset,
      look: resolvedLook(live.current.theme),
      pathname: live.current.pathname,
      label: item.kind === "component" ? state.card?.label ?? "" : state.page?.name ?? "",
      ...(item.kind === "page" ? { sections: state.page?.sections ?? [] } : null),
    };
    const answer = await call<unknown>("POST", "/ready", ready);
    if (answer.status === 410) throw new ItemExpired();
    if (answer.status !== 200) throw new Error(`the host refused segment ${segment}: ${safeJson(answer.data)}`);
    if (last) return;
    covered = rows.end;
  }
  throw new Error(`${what} needs more than ${MAX_SEGMENTS} screens`);
}

async function loop(live: { current: Live }, state: ProbeState, problems: AuditProblem[], session: { current: string | null }, stopped: () => boolean) {
  while (!stopped()) {
    let answer: { status: number; data: HelloResponse | { error: string } };
    try {
      answer = await call<HelloResponse | { error: string }>("POST", "/hello", await hello(live.current));
    } catch {
      // No host listening: the app was opened outside a run. Ask again later, quietly.
      await sleep(NO_HOST_RETRY_MS);
      continue;
    }
    // A refusal (a stale build, a protocol the host does not speak) is final for this
    // process: the host has said why on its side.
    if (answer.status === 409) return;
    if (answer.status !== 200 || !("session" in answer.data)) {
      await sleep(NO_HOST_RETRY_MS);
      continue;
    }
    session.current = answer.data.session;
    try {
      while (!stopped()) {
        const next = await call<NextResponse>("GET", `/next?session=${encodeURIComponent(session.current)}`);
        if (next.status !== 200 || next.data.done) break;
        await runItem(next.data.item, session.current, live, state, problems);
      }
    } catch {
      // The host went away mid-run; start over with a new hello.
    }
    session.current = null;
    await sleep(NO_HOST_RETRY_MS);
  }
}

// Reports the band of the window no status, navigation or tab bar covers, rendered by the
// page frame over its scroller. Every source the screen has is read and the narrowest
// band they agree on is kept: the screen's own frame (Android lays the screen out between
// its bars), the window's safe area, and the stack header's height (the iOS header is
// transparent and drawn over the content from the window's top). The iOS tab bar is the
// one bar no source here reports (a safe area read inside the screen comes back with the
// window's insets alone), so the host narrows the band to it (AuditItem.chrome). Each
// source is kept beside the band in the probe, so a band that is wrong says which missed.
function BandSensor({ state }: { state: ProbeState }) {
  const header = useContext(HeaderHeightContext);
  const windowInsets = useSafeAreaInsets();
  const frameRef = useRef<View>(null);
  const reported = useRef<Band | null>(null);
  const report = useCallback(() => {
    void measure(frameRef.current, "the screen frame").then((frame) => {
      const height = Dimensions.get("window").height;
      const sources: Band["sources"] = {
        frame: { top: frame.y, bottom: frame.y + frame.height },
        windowSafeArea: { top: windowInsets.top, bottom: height - windowInsets.bottom },
        ...(header !== undefined ? { header: { top: header, bottom: height } } : {}),
      };
      const all = Object.values(sources);
      const band = { top: Math.max(...all.map((s) => s.top)), bottom: Math.min(...all.map((s) => s.bottom)), sources };
      reported.current = band;
      state.band = band;
    }, () => undefined);
  }, [state, header, windowInsets.top, windowInsets.bottom]);
  // Again whenever an input changes: UIKit settles the insets once the screen is in the window.
  useEffect(report, [report]);
  useEffect(() => () => {
    if (state.band === reported.current) state.band = null;
  }, [state]);
  return <View ref={frameRef} style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }} pointerEvents="none" onLayout={report} />;
}

export function AuditDriver({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const docs = useDocsTheme();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const live = useRef<Live>({ pathname, docs, theme, insets });
  live.current = { pathname, docs, theme, insets };

  const { state, probe } = useMemo(() => {
    const state: ProbeState = { card: null, scroller: null, page: null, band: null };
    const register = <K extends "card" | "scroller" | "page">(key: K) => (entry: NonNullable<ProbeState[K]>) => {
      state[key] = entry;
      return () => {
        if (state[key] === entry) state[key] = null;
      };
    };
    const Sensor = () => <BandSensor state={state} />;
    const probe: AuditProbe = { card: register("card"), scroller: register("scroller"), page: register("page"), Sensor };
    return { state, probe };
  }, []);

  useEffect(() => {
    // Release builds have no LogBox; a development build's would cover the card.
    LogBox.ignoreAllLogs(true);
    const started = Date.now();
    const problems: AuditProblem[] = [];
    const session = { current: null as string | null };
    let stopped = false;
    const restore = forwardProblems(started, problems, () => session.current);
    void loop(live, state, problems, session, () => stopped);
    return () => {
      stopped = true;
      restore();
    };
  }, [state]);

  return <AuditProbeContext.Provider value={probe}>{children}</AuditProbeContext.Provider>;
}
