import type { ReactElement } from "react";
import { act, render } from "@testing-library/react";
import { ThemeProvider } from "../../src/style/theme.tsx";
import { AnatomyProvider, type AnatomyRects } from "../../src/style/anatomy.tsx";

// The parts a component registers with an AnatomyProvider (src/style/anatomy.tsx), for the
// anatomy coverage tests: the specimen renders inside a provider, every host node's layout
// handler fires as a browser's would, and the names in the provider's last report come
// back sorted. happy-dom lays nothing out, so the rectangles are empty; the registry still
// reports every part whose node is on screen, which is what these tests pin.

// happy-dom has no ResizeObserver, so RNW's onLayout never fires on its own: fire the
// handler RNW attaches to each host node.
function fireLayouts(root: Element) {
  for (const node of [root, ...root.querySelectorAll("*")]) {
    const handler = (node as unknown as { __reactLayoutHandler?: (event: unknown) => void }).__reactLayoutHandler;
    if (typeof handler === "function") act(() => handler({ nativeEvent: { layout: { x: 0, y: 0, width: 0, height: 0 } }, timeStamp: 1 }));
  }
}

/** The part names `specimen` registers inside an AnatomyProvider, sorted. */
export async function anatomyParts(specimen: ReactElement): Promise<string[]> {
  const reports: AnatomyRects[] = [];
  render(
    <ThemeProvider dark solid>
      <AnatomyProvider onMeasure={(parts) => reports.push(parts)}>{specimen}</AnatomyProvider>
    </ThemeProvider>,
  );
  // Overlays portal outside the render container: fire every layout in the document.
  fireLayouts(document.body);
  // RNW's measureLayout reports on a timer.
  await act(() => new Promise((resolve) => setTimeout(resolve, 5)));
  return Object.keys(reports.at(-1) ?? {}).sort();
}
