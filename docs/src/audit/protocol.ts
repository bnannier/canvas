// The wire protocol between the in-app audit driver (driver.native.tsx, built only into
// the native audit app) and the capture host (tools/audit/native/server.ts). Types and
// constants only, so the host can import it under plain bun with no React Native in
// reach. The driver speaks first and the host answers: the app never listens.
//
//   POST /hello   the build and device identity; the host refuses a stale build
//   GET  /next    the next item, or { done: true }
//   POST /ready   one per scrolled segment, once the item is on screen and settled;
//                 the host takes the screenshot before it answers
//   POST /done    the item is captured
//   POST /fail    the item could not be brought on screen, with the reason
//   POST /log     a console problem or a JS error outside any item

/** The host's port. The iOS simulator shares the Mac's loopback; Android reaches it through `adb reverse`. */
export const AUDIT_PORT = 8791;

/** Names this protocol in every request, so a host can refuse a driver it does not speak. */
export const AUDIT_DRIVER = "canvas-audit-driver/1";

export type AuditPlatform = "ios" | "android";

/** A look as the docs theme spells it: the scheme, the surface and the light palette. */
export interface AuditLook {
  scheme: "light" | "dark";
  surface: "solid" | "glass";
  palette: "blush" | "mint";
}

/** What the running theme resolved, read from the kit's useTheme(), not from what was asked. */
export interface ResolvedLook extends AuditLook {
  dark: boolean;
  reducedTransparency: boolean;
  increasedContrast: boolean;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface HelloRequest {
  driver: string;
  platform: AuditPlatform;
  /** `Platform.Version`: the iOS version string or the Android API level. */
  osVersion: string | number;
  /** `Platform.constants`, as the platform reports it (model, interface idiom, release). */
  constants: Record<string, unknown>;
  /** `extra.canvasBuild` from the embedded app config (docs/scripts/build-info.cjs). */
  build: Record<string, unknown> | null;
  app: {
    name: string | null;
    scheme: string | null;
    /** The config's iOS bundle identifier or Android package. */
    id: string | null;
    version: string | null;
    buildNumber: string | null;
  };
  /** The running update: null id and an embedded launch for a build that never fetched one. */
  update: { updateId: string | null; isEmbeddedLaunch: boolean | null };
  window: { width: number; height: number };
  screen: { width: number; height: number };
  /** `PixelRatio.get()`: device pixels per layout point (iOS) or dp (Android). */
  dpr: number;
  fontScale: number;
  /** The window's safe-area insets. */
  insets: Insets;
  reduceMotion: boolean;
  reduceTransparency: boolean;
  liquidGlass: boolean;
  dev: boolean;
}

export interface HelloResponse {
  session: string;
}

/** A refusal: the body every non-2xx answer carries. */
export interface HostError {
  error: string;
}

export type AuditItem =
  | (ItemBase & { kind: "component"; slug: string; variant: string; label: string })
  | (ItemBase & { kind: "page"; page: string });

interface ItemBase {
  /** The cell id, also its path under the run directory (tools/audit/inventory.ts cellId / pageCellId). */
  id: string;
  route: string;
  look: AuditLook;
  /** Time after the interactions and frames before the first shot, set by the host. */
  settleMs: number;
  /** Time after each scroll before its shot. */
  scrollSettleMs: number;
  /** The driver gives up on the item this long after receiving it and reports /fail. */
  deadlineMs: number;
  /**
   * System chrome the app cannot measure, found by the host in the platform's accessibility
   * tree: the iOS tab bar's top edge as `bottom`. The band is narrowed to it.
   */
  chrome?: { top?: number; bottom?: number };
}

export type NextResponse = { done: true } | { done: false; item: AuditItem };

export interface ReadyRequest {
  session: string;
  id: string;
  /** 0 for the first segment. */
  segment: number;
  /**
   * The captured region in window coordinates (the Playground card, or a page's content),
   * from its layout within the scroller's content and `offset`.
   */
  region: Rect;
  /** The window band no system or navigation bar covers: the narrowest of `bandSources`. */
  band: { top: number; bottom: number };
  /** What each source the screen has said the band was (its frame, its safe areas, its header). */
  bandSources: Record<string, { top: number; bottom: number }>;
  /** The rows of the region this segment adds, in region coordinates: [start, end). */
  rows: { start: number; end: number };
  /** True on the segment that reaches the region's bottom edge. */
  last: boolean;
  /** The scroller's content offset the driver set for this segment. */
  offset: number;
  look: ResolvedLook;
  pathname: string;
  /** The Playground's selected example, or the page's name. */
  label: string;
  /** A page's section titles, in order. */
  sections?: string[];
}

export interface ReadyResponse {
  ok: true;
}

export interface AuditProblem {
  level: "error" | "warn" | "fatal";
  message: string;
  /** Milliseconds since the driver started. */
  at: number;
}

export interface DoneRequest {
  session: string;
  id: string;
  /** Console problems and errors raised while the item was being brought on screen. */
  problems: AuditProblem[];
  /** Milliseconds the driver spent on each phase. */
  timings: Record<string, number>;
}

export interface FailRequest {
  session: string;
  id: string;
  reason: string;
  phase: string;
  problems: AuditProblem[];
}

export interface LogRequest {
  session: string | null;
  problems: AuditProblem[];
}
