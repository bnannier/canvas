import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { render, cleanup, waitFor, act } from "@testing-library/react";
import { AccessibilityInfo, type Animated } from "react-native";
import { Backdrop, BackdropHost } from "../src/organisms/backdrop/backdrop.tsx";
import { backdropClock, resetBackdropClocks } from "../src/organisms/backdrop/backdrop-clock.ts";
import { readLayers } from "../src/organisms/backdrop/backdrop-layers.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

// The Backdrop is the kit's background-animation ENGINE. The contracts worth
// locking down are the ones that break silently: the host must clear when its last
// claimant leaves (apps gate their backdrop and rely on that), the engine must
// carry no brand art, and Reduce Motion must never show a moving frame first.
//
// react-native-svg is stubbed to fragments in test/setup.ts, so these assert the
// surface and the clock rather than rendered vector nodes.

afterEach(() => {
  cleanup();
  resetBackdropClocks();
});

const FIELD = Array.from({ length: 12 }, (_, i) => ({ x: i / 12, y: i / 12, r: 1, a: 0.5 }));

/** The surface root is the only aria-hidden node the engine renders. */
const surface = (c: HTMLElement) => c.querySelector('[aria-hidden="true"]');

const valueOf = (v: Animated.Value): number => (v as unknown as { __getValue: () => number }).__getValue();

function Scene() {
  return (
    <Backdrop>
      <Backdrop.Particles field={FIELD} depth={0} />
    </Backdrop>
  );
}

function wrap(ui: React.ReactNode) {
  return <ThemeProvider>{ui}</ThemeProvider>;
}

describe("Backdrop layer vocabulary", () => {
  it("reads children into ordered layer descriptors", () => {
    const layers = readLayers(
      <>
        <Backdrop.Particles field={FIELD} depth={0} />
        <Backdrop.Gradient blobs={[{ color: "#fff", cx: 0.5, cy: 0.5, r: 0.4, o: 0.3, end: 0.6 }]} />
        <Backdrop.Custom>
          <></>
        </Backdrop.Custom>
      </>,
    );
    expect(layers.map((l) => l.kind)).toEqual(["particles", "gradient", "custom"]);
  });

  it("ignores non-layer children rather than throwing", () => {
    const layers = readLayers(
      <>
        {null}
        <Backdrop.Particles field={FIELD} depth={0} />
        {false}
      </>,
    );
    expect(layers).toHaveLength(1);
  });

  it("defaults a particle layer to the travelling depth", () => {
    const [layer] = readLayers(<Backdrop.Particles field={FIELD} />);
    expect(layer.kind).toBe("particles");
    expect(layer.depth).toBe(1);
  });
});

describe("BackdropHost", () => {
  it("renders nothing while no scene is claimed", () => {
    // Load-bearing: apps gate their backdrop on their own conditions (a surface
    // mode, a focused screen). If a root host painted regardless, unmounting the
    // last Backdrop would leave the sky up forever.
    const { container } = render(wrap(<BackdropHost />));
    expect(surface(container)).toBeNull();
  });

  it("paints once a scene is claimed, and clears when it leaves", async () => {
    function App({ on }: { on: boolean }) {
      return <BackdropHost>{on ? <Scene /> : null}</BackdropHost>;
    }
    const { container, rerender } = render(wrap(<App on />));
    await waitFor(() => expect(surface(container)).not.toBeNull());

    await act(async () => {
      rerender(wrap(<App on={false} />));
    });
    expect(surface(container)).toBeNull();
  });

  it("renders inline when there is no host, so an unhosted consumer still works", async () => {
    const { container } = render(wrap(<Scene />));
    await waitFor(() => expect(surface(container)).not.toBeNull());
  });
});

describe("Backdrop accessibility", () => {
  it("starts on the poster frame so Reduce Motion never shows a moving frame", async () => {
    // useReducedMotion resolves asynchronously and reports false until it does, so
    // the engine starts still and goes live only once the preference has been read.
    // Holding the promise unresolved reproduces exactly that first-frame window.
    let resolve: (v: boolean) => void = () => {};
    const spy = spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockReturnValue(
      new Promise<boolean>((r) => {
        resolve = r;
      }),
    );

    render(wrap(<Scene />));
    await waitFor(() => expect(valueOf(backdropClock("default").flight)).toBe(0.35));

    await act(async () => {
      resolve(false);
    });
    spy.mockRestore();
  });

  it("hides itself from assistive technology", async () => {
    const { container } = render(wrap(<Scene />));
    await waitFor(() => expect(surface(container)).not.toBeNull());
    expect(surface(container)?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("the engine carries no brand art", () => {
  // The whole point of putting the engine in the kit and the scene in the app: if a
  // Canvas hex or the docs seed ever appears under the component directory, the
  // boundary has leaked and another app's backdrop would quietly look like ours.
  const BRAND = ["#27cdf2", "#46e082", "#ffb43d", "#ff2d6e", "#b24dff", "20260710"];

  function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });
  }

  it("has no Canvas brand hexes or docs seed in src/organisms/backdrop", () => {
    const offenders: string[] = [];
    for (const file of walk(join(import.meta.dir, "..", "src", "organisms", "backdrop"))) {
      if (file.endsWith(".md")) continue;
      const text = readFileSync(file, "utf8");
      for (const needle of BRAND) {
        if (text.includes(needle)) offenders.push(`${file}: ${needle}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
