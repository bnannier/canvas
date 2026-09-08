import { afterEach, expect, test } from "bun:test";
import { useEffect, useRef, type ReactNode, type useLayoutEffect } from "react";
import { cleanup, render } from "@testing-library/react";
import { Platform, View } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);

type CommitEffect = typeof useLayoutEffect;

async function loadForRuntime(platform: "web" | "ios" | "android", noDOM: boolean): Promise<CommitEffect> {
  const os = Object.getOwnPropertyDescriptor(Platform, "OS")!;
  const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
  try {
    Object.defineProperty(Platform, "OS", { configurable: true, value: platform });
    if (noDOM) {
      Reflect.deleteProperty(globalThis, "document");
      Reflect.deleteProperty(globalThis, "window");
    }
    // Each isolated module evaluation observes the actual runtime globals once,
    // just as a browser/native/SSR bundle does before its first render.
    const module = await import(`../src/style/use-isomorphic-layout-effect.ts?ordering=${platform}`);
    return module.useIsomorphicLayoutEffect;
  } finally {
    Object.defineProperty(Platform, "OS", os);
    if (documentDescriptor) Object.defineProperty(globalThis, "document", documentDescriptor);
    if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor);
  }
}

for (const platform of ["web", "ios", "android"] as const) {
  test(`${platform} commits values before passive observers, including native without DOM globals`, async () => {
    const useCommitEffect = await loadForRuntime(platform, platform !== "web");
    const events: string[] = [];
    function Probe({ value }: { value: string }) {
      const committed = useRef("uncommitted");
      // Register this first so accidentally substituting useEffect changes the
      // observed value/order, rather than merely passing an alias identity check.
      useEffect(() => {
        events.push(`passive:${committed.current}`);
        return () => { events.push(`passive-cleanup:${value}`); };
      }, [value]);
      useCommitEffect(() => {
        committed.current = value;
        events.push(`commit:${value}`);
        return () => { events.push(`commit-cleanup:${value}`); };
      }, [value]);
      return <View />;
    }
    const ui = (children: ReactNode) => <ThemeProvider>{children}</ThemeProvider>;
    const result = render(ui(<Probe value="initial" />));
    expect(events).toEqual(["commit:initial", "passive:initial"]);
    events.length = 0;
    result.rerender(ui(<Probe value="updated" />));
    expect(events).toEqual([
      "commit-cleanup:initial", "commit:updated", "passive-cleanup:initial", "passive:updated",
    ]);
    events.length = 0;
    result.unmount();
    expect(events).toEqual(["commit-cleanup:updated", "passive-cleanup:updated"]);
  });
}
