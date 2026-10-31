import { afterEach, expect, it, mock, spyOn } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Platform } from "react-native";
import { Wizard } from "../src/organisms/wizard/wizard.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Dialog } from "../src/organisms/dialog/dialog.tsx";
import { OverlayProvider } from "../src/style/portal.tsx";

const steps = [{ label: "Connections" }, { label: "Plan" }, { label: "Review" }];
afterEach(cleanup);

it("wizard keeps navigation controlled and names the previous stage", () => {
  const previous = mock(() => {});
  const next = mock(() => {});
  const close = mock(() => {});
  const view = render(<ThemeProvider><Wizard open title="Plan a project" steps={steps} current={1}
    onOpenChange={close} testID="project-wizard" previous={{ label: "Connections", onPress: previous }}
    status="Autosaved" actions={<Button primary onPress={next}>Review plan</Button>}>
    <Typography>Planning content</Typography>
  </Wizard></ThemeProvider>);
  expect(view.getByRole("dialog").getAttribute("aria-labelledby")).toBeTruthy();
  expect(view.getByTestId("project-wizard-body-scroll")).toBeTruthy();
  expect(view.getByTestId("project-wizard-steps")).toBeTruthy();
  expect(view.getByRole("dialog").textContent).toContain("Autosaved");
  expect(view.getByTestId("project-wizard-footer").textContent).not.toContain("Autosaved");
  expect(view.getByTestId("project-wizard-steps").parentElement?.style.width).toBe("170px");
  expect(view.getByTestId("project-wizard-steps").querySelector('[aria-current="step"]')?.textContent).toContain("Plan");
  fireEvent.click(view.getByRole("button", { name: "Connections" }));
  fireEvent.click(view.getByRole("button", { name: "Review plan" }));
  expect(previous).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledTimes(1);
  expect(close).not.toHaveBeenCalled();
  expect(view.getByText("Planning content")).toBeTruthy();
  fireEvent.click(view.getByRole("button", { name: "Close" }));
  expect(close).toHaveBeenCalledWith(false);
  // The application may decline a close request while a save is pending.
  expect(view.getByRole("dialog")).toBeTruthy();
});

it("wizard preserves a child's independent scroll and disables previous navigation", () => {
  const previous = mock(() => {});
  const view = render(<ThemeProvider><Wizard open title="Conversation" steps={steps} current={1}
    onOpenChange={() => {}} scrollBody={false} testID="project-wizard"
    previous={{ label: "Connections", onPress: previous, disabled: true }}>
    <Typography>Independent conversation</Typography>
  </Wizard></ThemeProvider>);
  expect(view.queryByTestId("project-wizard-body-scroll")).toBeNull();
  fireEvent.click(view.getByRole("button", { name: "Connections" }));
  expect(previous).not.toHaveBeenCalled();
  expect(view.getByText("Independent conversation")).toBeTruthy();
  view.rerender(<ThemeProvider><Wizard open={false} title="Conversation" steps={steps} current={1} onOpenChange={() => {}} /></ThemeProvider>);
  expect(view.queryByRole("dialog")).toBeNull();
});

it("embedded Wizard keeps its opaque in-page panel without a veil in either surface mode", () => {
  const css = Object.getOwnPropertyDescriptor(globalThis, "CSS");
  Object.defineProperty(globalThis, "CSS", { configurable: true, value: { supports: () => true } });
  try {
    const content = (glass: boolean) => <ThemeProvider light glass={glass} solid={!glass}>
      <Wizard open embedded title="New workspace" steps={steps} current={1}>
        <Typography>Planning content</Typography>
      </Wizard>
    </ThemeProvider>;
    const view = render(content(false));
    const dialog = view.getByRole("dialog");
    const panel = view.getByText("New workspace").closest('[style*="border-radius: 20px"]') as HTMLElement;
    expect(panel).toBeTruthy();
    const solidPanel = panel.style.cssText;
    expect(dialog.querySelector('[style*="backdrop-filter"]')).toBeNull();
    expect(dialog.querySelector('[data-testid="glass-material"]')).toBeNull();
    expect(dialog.getAttribute("aria-modal")).toBeNull();
    expect(view.queryByRole("button", { name: "Close" })).toBeNull();
    view.rerender(content(true));
    expect(view.getByRole("dialog")).toBe(dialog);
    expect(panel.style.cssText).toBe(solidPanel);
    expect(dialog.querySelector('[style*="backdrop-filter"]')).toBeNull();
    expect(dialog.querySelector('[data-testid="glass-material"]')).toBeNull();
  } finally {
    if (css) Object.defineProperty(globalThis, "CSS", css);
    else delete (globalThis as Record<string, unknown>).CSS;
  }
});

it("retains the veil and floating panel for a live Wizard and an ordinary embedded form Dialog", () => {
  const css = Object.getOwnPropertyDescriptor(globalThis, "CSS");
  Object.defineProperty(globalThis, "CSS", { configurable: true, value: { supports: () => true } });
  try {
    for (const glass of [false, true]) {
      const view = render(<ThemeProvider light glass={glass} solid={!glass}><OverlayProvider>
        <Wizard open title="Live workspace" steps={steps} current={1}><Typography>Live content</Typography></Wizard>
        <Dialog open embedded form title="Embedded form"><Typography>Form content</Typography></Dialog>
      </OverlayProvider></ThemeProvider>);
      for (const title of ["Live workspace", "Embedded form"]) {
        const dialog = view.getByRole("dialog", { name: title });
        expect(dialog.querySelector('[style*="backdrop-filter: blur(2px)"]')).toBeTruthy();
        expect(dialog.querySelector('[data-testid="glass-material"]') != null).toBe(glass);
      }
      expect(view.getByRole("dialog", { name: "Live workspace" }).getAttribute("aria-modal")).toBe("true");
      expect(view.getByRole("dialog", { name: "Embedded form" }).getAttribute("aria-modal")).toBeNull();
      view.unmount();
    }
  } finally {
    if (css) Object.defineProperty(globalThis, "CSS", css);
    else delete (globalThis as Record<string, unknown>).CSS;
  }
});

it("physical native workflow configuration inherits the app's registered fonts", async () => {
  const select = spyOn(Platform, "select").mockImplementation((values: Record<string, unknown>) => values.default as never);
  try {
    // Load a fresh configuration under the native platform mechanism; no platform
    // global is mutated and no component module is replaced.
    const native = await import("../src/organisms/wizard/wizard.typography.ts?native-font-contract");
    expect(native.iosTypography.fonts).toBeUndefined();
    expect(native.androidTypography.fonts).toBeUndefined();
  } finally { select.mockRestore(); }
  const view = render(<ThemeProvider fonts={{ sans: "App interface", display: "App display", mono: "App mono" }}>
    <Wizard open embedded title="Custom workflow" steps={steps} current={1} onOpenChange={() => {}} status="Saved">
      <Typography>Custom content</Typography>
    </Wizard>
  </ThemeProvider>);
  expect(view.getByRole("heading", { name: "Custom workflow" }).style.fontFamily.replaceAll('"', "")).toBe("App display");
  expect(view.getByText("Custom content").style.fontFamily.replaceAll('"', "")).toBe("App interface");
  expect(view.getByText("Saved").style.fontFamily.replaceAll('"', "")).toBe("App mono");
});
