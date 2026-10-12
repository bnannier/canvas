import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { useContext, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { Modal, Text, View } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { OverlayProvider } from "../src/style/portal.tsx";
import {
  GlassBlurTargetContext,
  GlassModalBlurTarget,
  GlassWindowBlurTargetContext,
} from "../src/style/glass-surface/glass-surface.shared.tsx";
import { GlassSurface as AndroidGlassSurface } from "../src/style/glass-surface/glass-surface.android.tsx";
import { GlassPane, paneStyle } from "../src/style/glass-surface/glass-pane.tsx";
import { createCaptureTarget, type CaptureTarget } from "../src/style/glass-surface/capture-target.ts";
import * as captureRuntime from "../src/style/glass-surface/capture-runtime.ts";
import * as runtime from "../src/style/glass-surface/material-runtime.ts";
import type { MaterialCapabilities, MaterialResolution } from "../src/style/glass-surface/material-resolution.ts";
import { useMaterialResolution, useMaterialTheme } from "../src/style/glass-surface/use-material-theme.ts";
import { Drawer } from "../src/organisms/drawer/drawer.tsx";
import { ActionSheet } from "../src/organisms/action-sheet/action-sheet.tsx";

// GlassModalBlurTarget, the Modal blur bridge: inside a React Native Modal it hands the
// glass surfaces the page's Android capture plane (the outermost OverlayProvider's page
// content), which they can sample because a Modal is a separate native window. Placed
// anywhere in the main window it hands them the plane they sit inside, which
// @nannier/canvas-blur refuses (FrostView.kt's TargetSafety); the frost reports that
// (onTargetRejected) and the bridge then withdraws the plane, so every surface under it
// resolves its complete solid skin (the owner's GMBT-2 decision).
//
// The runtime under test is the web's, so the material capabilities are Android's by
// spy, and the plane is a real page element the tests render into: React Native Web
// mounts a Modal's content in document.body, outside it, as Android mounts a Modal in a
// window of its own. canvas-blur's FrostView is a stand-in that refuses a plane
// containing it and reports that once, as the native view does.

afterEach(cleanup);

const android: MaterialCapabilities = { platform: "android", frost: true, liquid: false, requiresTarget: true };
const card = { borderRadius: 14, backgroundColor: "#123456", borderWidth: 1, borderColor: "#abcdef", padding: 8 };

/** Android's capabilities and canvas-blur's frost, for the length of one test. */
function androidRuntime(refuses: (plane: Element, frost: Element) => boolean = (plane, frost) => plane.contains(frost)) {
  const reports: number[] = [];
  function FakeFrost({ targetRef, onTargetRejected }: {
    targetRef: RefObject<View | null>;
    onTargetRejected?: (event: { nativeEvent: { targetId: number; reason: string } }) => void;
  }) {
    const own = useRef<View>(null);
    const reported = useRef(false);
    useLayoutEffect(() => {
      const plane = targetRef.current as unknown as Element | null;
      const frost = own.current as unknown as Element | null;
      if (reported.current || !plane || !frost || !refuses(plane, frost)) return;
      reported.current = true;
      reports.push(1);
      onTargetRejected?.({ nativeEvent: { targetId: 1, reason: "ancestor" } });
    });
    return <View ref={own} testID="native-frost" />;
  }
  const capabilities = spyOn(runtime, "useMaterialCapabilities").mockReturnValue(android);
  const frost = spyOn(captureRuntime as unknown as { NativeCaptureFrost: typeof FakeFrost }, "NativeCaptureFrost").mockImplementation(FakeFrost);
  return { reports, restore: () => { capabilities.mockRestore(); frost.mockRestore(); } };
}

/** A page element that is the window's capture plane, attached and ready to sample. */
function pagePlane(): { page: HTMLElement; plane: CaptureTarget } {
  const page = document.body.appendChild(document.createElement("div"));
  const plane = createCaptureTarget();
  plane.attach(page as unknown as View);
  plane.setAvailable(page as unknown as View, true);
  return { page, plane };
}

/** The app's root: the window plane published as the outermost OverlayProvider does. */
function Root({ plane, children }: { plane: CaptureTarget | null; children: ReactNode }) {
  return (
    <ThemeProvider glass light>
      <GlassWindowBlurTargetContext.Provider value={plane?.ref ?? null}>
        <OverlayProvider>{children}</OverlayProvider>
      </GlassWindowBlurTargetContext.Provider>
    </ThemeProvider>
  );
}

const materialsIn = (root: ParentNode) => root.querySelectorAll('[data-testid="glass-material"]').length;
/** The materials painted outside the page: in the Modals' windows. */
const modalMaterials = (page: HTMLElement) => [...document.querySelectorAll('[data-testid="glass-material"]')].filter((node) => !page.contains(node)).length;

/** A host that paints around a pane, reading the same decision its pane mounts from. */
function PaneHost({ testID }: { testID: string }) {
  const theme = useMaterialTheme({ static: true, layer: "control" });
  const shape = { borderRadius: 12, borderWidth: 1 };
  return (
    <View testID={testID} style={paneStyle(theme, [shape, { backgroundColor: "#123456", borderColor: "#abcdef" }])}>
      <GlassPane static layer="control" shape={shape} testID={`${testID}-pane`} />
      <Text>Readable</Text>
    </View>
  );
}

/** Records every material decision a surface at this place renders from. */
function MaterialProbe({ seen }: { seen: MaterialResolution[] }) {
  seen.push(useMaterialResolution({ layer: "functional" }).material);
  return null;
}

describe("GlassModalBlurTarget", () => {
  it("renders no element of its own", () => {
    const bare = render(<View><Text>Sheet content</Text></View>).container.innerHTML;
    cleanup();
    const bridged = render(<View><GlassModalBlurTarget><Text>Sheet content</Text></GlassModalBlurTarget></View>).container.innerHTML;
    expect(bridged).toBe(bare);
  });

  it("hands a Modal's surfaces the page's plane, frost from their first render", () => {
    const { page, plane } = pagePlane();
    const android = androidRuntime();
    const seen: MaterialResolution[] = [];
    try {
      render(
        <Root plane={plane}>
          <Modal visible transparent>
            <GlassModalBlurTarget>
              <MaterialProbe seen={seen} />
              <AndroidGlassSurface testID="sheet" style={card}><Text>In the Modal</Text></AndroidGlassSurface>
            </GlassModalBlurTarget>
          </Modal>
        </Root>,
        { container: page },
      );
      // A Modal never contains the plane, so the frost never refuses it and the
      // surface never takes a solid first frame.
      expect(seen.map((material) => material.renderer)).toEqual(seen.map(() => "frost"));
      expect(materialsIn(screen.getByTestId("sheet"))).toBe(1);
      expect(screen.getByTestId("native-frost")).toBeDefined();
      expect(android.reports).toEqual([]);
      expect(plane.active()).toBe(true);
    } finally { android.restore(); page.remove(); }
  });

  it("resolves the complete solid skin under a bridge placed in the page, beside one in a Modal that keeps its frost", () => {
    const { page, plane } = pagePlane();
    const android = androidRuntime();
    try {
      render(
        <Root plane={plane}>
          <GlassModalBlurTarget>
            <AndroidGlassSurface testID="misplaced" style={card}><Text>In the page</Text></AndroidGlassSurface>
            <PaneHost testID="host" />
          </GlassModalBlurTarget>
          <Modal visible transparent>
            <GlassModalBlurTarget>
              <AndroidGlassSurface testID="sheet" style={card}><Text>In the Modal</Text></AndroidGlassSurface>
            </GlassModalBlurTarget>
          </Modal>
        </Root>,
        { container: page },
      );
      // The page's frost refused the plane it sits in, once; the bridge withdrew it.
      expect(android.reports).toEqual([1]);
      const misplaced = screen.getByTestId("misplaced");
      expect(materialsIn(misplaced)).toBe(0);
      expect(misplaced.style.backgroundColor).toMatch(/18, ?52, ?86/);
      expect(misplaced.style.borderColor).toMatch(/171, ?205, ?239/);
      // A host and its pane under the same bridge follow it: no pane, the host's own skin.
      const host = screen.getByTestId("host");
      expect(screen.queryByTestId("host-pane")).toBeNull();
      expect(host.style.backgroundColor).toMatch(/18, ?52, ?86/);
      expect(host.style.borderColor).toMatch(/171, ?205, ?239/);
      // The bridge in the Modal is a verdict of its own: still the page's frost.
      expect(materialsIn(screen.getByTestId("sheet"))).toBe(1);
      expect(screen.getAllByTestId("native-frost")).toHaveLength(1);
    } finally { android.restore(); page.remove(); }
  });

  it("releases the plane's capture demand once its frost refuses it", () => {
    const { page, plane } = pagePlane();
    const android = androidRuntime();
    try {
      render(
        <Root plane={plane}>
          <GlassModalBlurTarget>
            <AndroidGlassSurface testID="misplaced" style={card} />
          </GlassModalBlurTarget>
        </Root>,
        { container: page },
      );
      expect(android.reports).toEqual([1]);
      expect(screen.queryByTestId("native-frost")).toBeNull();
      expect(plane.active()).toBe(false);
    } finally { android.restore(); page.remove(); }
  });

  it("keeps trusting its plane when the module never reports (an older canvas-blur)", () => {
    const { page, plane } = pagePlane();
    // The 0.1 module refuses the same plane without a word: the surface keeps the frost
    // it was handed, which draws no blur (a tint alone), as before the event existed.
    const android = androidRuntime(() => false);
    try {
      render(
        <Root plane={plane}>
          <GlassModalBlurTarget>
            <AndroidGlassSurface testID="misplaced" style={card} />
          </GlassModalBlurTarget>
        </Root>,
        { container: page },
      );
      expect(materialsIn(screen.getByTestId("misplaced"))).toBe(1);
    } finally { android.restore(); page.remove(); }
  });

  it("ignores a refusal of a plane it did not publish", () => {
    const { page, plane } = pagePlane();
    const other = createCaptureTarget();
    const element = document.body.appendChild(document.createElement("div"));
    other.attach(element as unknown as View);
    other.setAvailable(element as unknown as View, true);
    // A nested provider's own plane, refused by everything here.
    const android = androidRuntime((refused) => refused === element);
    try {
      render(
        <Root plane={plane}>
          <Modal visible transparent>
            <GlassModalBlurTarget>
              <AndroidGlassSurface testID="sheet" style={card} />
              <GlassBlurTargetContext.Provider value={other.ref}>
                <AndroidGlassSurface testID="nested" style={card} />
              </GlassBlurTargetContext.Provider>
            </GlassModalBlurTarget>
          </Modal>
        </Root>,
        { container: page },
      );
      expect(android.reports).toEqual([1]);
      expect(materialsIn(screen.getByTestId("sheet"))).toBe(1);
    } finally { android.restore(); page.remove(); element.remove(); }
  });

  it("takes a new plane on trust after refusing the last one", () => {
    const { page, plane } = pagePlane();
    const next = createCaptureTarget();
    const element = document.body.appendChild(document.createElement("div"));
    next.attach(element as unknown as View);
    next.setAvailable(element as unknown as View, true);
    const android = androidRuntime();
    let seen: unknown = "unset";
    function Probe() {
      seen = useContext(GlassBlurTargetContext);
      return null;
    }
    const tree = (window: CaptureTarget) => (
      <Root plane={window}>
        <GlassModalBlurTarget>
          <Probe />
          <AndroidGlassSurface testID="misplaced" style={card} />
        </GlassModalBlurTarget>
      </Root>
    );
    try {
      const result = render(tree(plane), { container: page });
      expect(seen).toBeNull();
      // A plane that does not contain the surface (here, one outside the page) is taken
      // on trust again: the verdict belongs to the plane it was given about.
      result.rerender(tree(next));
      expect(seen).toBe(next.ref);
      expect(materialsIn(screen.getByTestId("misplaced"))).toBe(1);
    } finally { android.restore(); page.remove(); element.remove(); }
  });
});

// The bridge's two kit consumers, rendered whole (their web builds; the resolution is
// shared by every platform): their sheet and panel take the page's frost inside their
// Modals, the solid skin with no plane to sample, and the solid skin once the plane is
// refused.
describe("Drawer and ActionSheet through the bridge", () => {
  const sheet = (
    <ActionSheet open title="Share" message="Choose where to send it." actions={[{ label: "Copy link", onPress() {} }]} />
  );
  const drawer = (seen: MaterialResolution[], children?: ReactNode) => (
    <Drawer open><MaterialProbe seen={seen} /><Text>Drawer content</Text>{children}</Drawer>
  );

  it("frost their sheet and panel from the page's plane", () => {
    const { page, plane } = pagePlane();
    const android = androidRuntime();
    const seen: MaterialResolution[] = [];
    try {
      render(<Root plane={plane}>{sheet}</Root>, { container: page });
      // The actions card and the separate Cancel card.
      expect(modalMaterials(page)).toBe(2);
      cleanup();
      render(<Root plane={plane}>{drawer(seen)}</Root>, { container: page });
      expect(modalMaterials(page)).toBe(1);
      expect(seen.length).toBeGreaterThan(0);
      expect(seen.every((material) => material.renderer === "frost")).toBe(true);
    } finally { android.restore(); page.remove(); }
  });

  it("keep their solid skin when no OverlayProvider published a plane", () => {
    const { page } = pagePlane();
    const android = androidRuntime();
    const seen: MaterialResolution[] = [];
    try {
      render(<Root plane={null}>{sheet}</Root>, { container: page });
      expect(modalMaterials(page)).toBe(0);
      cleanup();
      render(<Root plane={null}>{drawer(seen)}</Root>, { container: page });
      expect(modalMaterials(page)).toBe(0);
      expect(seen.at(-1)).toMatchObject({ renderer: "solid", fallback: "missing-target" });
    } finally { android.restore(); page.remove(); }
  });

  it("take their solid skin once their plane is refused", () => {
    const { page, plane } = pagePlane();
    // A plane the module refuses for any reason: the Drawer's own panel follows the
    // bridge's verdict with every other surface in its Modal.
    const android = androidRuntime(() => true);
    const seen: MaterialResolution[] = [];
    try {
      render(<Root plane={plane}>{drawer(seen, <AndroidGlassSurface testID="in-drawer" style={card} />)}</Root>, { container: page });
      expect(android.reports).toEqual([1]);
      expect(modalMaterials(page)).toBe(0);
      expect(seen.at(-1)).toMatchObject({ renderer: "solid", fallback: "missing-target" });
      // The Android surface in the panel let the plane go with its frost.
      expect(plane.active()).toBe(false);
    } finally { android.restore(); page.remove(); }
  });
});
