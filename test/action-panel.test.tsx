import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen, fireEvent, act } from "@testing-library/react";
import type { ComponentType, ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { widths } from "../src/style/tokens.ts";
import { resizeViewport } from "./viewport.ts";
import { ActionPanel as ActionPanelWeb } from "../src/molecules/action-panels/action-panels.tsx";
import { ActionPanel as ActionPanelIOS } from "../src/molecules/action-panels/action-panels.ios.tsx";
import { ActionPanel as ActionPanelAndroid } from "../src/molecules/action-panels/action-panels.android.tsx";
import { Button as ButtonWeb } from "../src/atoms/button/button.tsx";
import { Button as ButtonIOS } from "../src/atoms/button/button.ios.tsx";
import { Button as ButtonAndroid } from "../src/atoms/button/button.android.tsx";
import { Switch as SwitchWeb } from "../src/atoms/switch/switch.tsx";
import { Switch as SwitchIOS } from "../src/atoms/switch/switch.ios.tsx";
import { Switch as SwitchAndroid } from "../src/atoms/switch/switch.android.tsx";
import type { ActionPanelProps } from "../src/molecules/action-panels/action-panels.shared.tsx";
import type { ButtonProps } from "../src/atoms/button/button.shared.tsx";
import type { SwitchProps } from "../src/atoms/switch/switch.shared.tsx";

// ActionPanel on every entry. Each platform injects its own Button, Switch and Card
// (parts injection, so the docs' three-up is truthful), so the action has to BE that
// platform's control: the tests compare it with the same control rendered alone. The
// toggle row is the Switch's own anatomy (the title its label, the description its
// muted line, the whole row the tap target), and an inline row narrower than the `md`
// measure stacks its action under the copy.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider solid>{n}</ThemeProvider>);

const SKINS: [string, ComponentType<ActionPanelProps>, ComponentType<ButtonProps>, ComponentType<SwitchProps>][] = [
  ["web", ActionPanelWeb, ButtonWeb, SwitchWeb],
  ["ios", ActionPanelIOS, ButtonIOS, SwitchIOS],
  ["android", ActionPanelAndroid, ButtonAndroid, SwitchAndroid],
];

/** The style a control renders alone, to compare with the one inside the panel. */
function aloneStyle(node: ReactNode, role: string): string | null {
  const { getByRole, unmount } = ui(node);
  const style = getByRole(role).getAttribute("style");
  unmount();
  return style;
}

/** The track of a switch row: the node after its label column. */
const trackOf = (control: HTMLElement) => control.lastElementChild as HTMLElement;

type LayoutHost = HTMLElement & { __reactLayoutHandler?: (event: unknown) => void };
/** Feed the inline row the layout the native engine would (happy-dom has none). */
function measureRow(title: string, width: number) {
  const row = screen.getByText(title).parentElement!.parentElement as LayoutHost;
  const handler = row.__reactLayoutHandler;
  if (!handler) throw new Error("the inline row measures nothing");
  act(() => handler({ nativeEvent: { layout: { x: 0, y: 0, width, height: 120 } }, timeStamp: 1 }));
  return row;
}

for (const [platform, ActionPanel, Button, Switch] of SKINS) {
  describe(`ActionPanel on ${platform}`, () => {
    it(`acts through ${platform}'s own primary Button, and fires onAction`, () => {
      const expected = aloneStyle(<Button small primary>Export</Button>, "button");
      let fired = 0;
      ui(<ActionPanel title="Export your data" description="Download a ZIP." actionLabel="Export" onAction={() => fired++} />);
      const action = screen.getByRole("button", { name: "Export" });
      expect(action.getAttribute("style")).toBe(expected);
      fireEvent.click(action);
      expect(fired).toBe(1);
    });

    it("turns the action into a destructive Button and the title into the error ink under destructive", () => {
      const expected = aloneStyle(<Button small destructive>Delete</Button>, "button");
      ui(<ActionPanel destructive title="Delete this project" actionLabel="Delete" />);
      expect(screen.getByRole("button", { name: "Delete" }).getAttribute("style")).toBe(expected);
      cleanup();
      ui(<ActionPanel title="Delete this project" actionLabel="Delete" />);
      const neutral = screen.getByText("Delete this project").style.color;
      cleanup();
      ui(<ActionPanel destructive title="Delete this project" actionLabel="Delete" />);
      expect(screen.getByText("Delete this project").style.color).not.toBe(neutral);
    });

    it(`toggles through ${platform}'s own Switch, labelled by the title`, () => {
      const alone = ui(<Switch>Two-factor authentication</Switch>);
      const expectedTrack = trackOf(alone.getByRole("switch")).getAttribute("style");
      alone.unmount();
      ui(<ActionPanel toggle title="Two-factor authentication" description="Require a code on every login." />);
      const control = screen.getByRole("switch");
      expect(trackOf(control).getAttribute("style")).toBe(expectedTrack);
      expect(screen.queryByRole("button")).toBeNull();
      // The Switch owns the label anatomy: title and description are its own lines,
      // inside the control, so the name starts with the title and the row is one target.
      expect(control.textContent).toBe("Two-factor authenticationRequire a code on every login.");
      expect(screen.getByText("Two-factor authentication").closest('[role="switch"]')).toBe(control);
      expect(screen.getByText("Require a code on every login.").closest('[role="switch"]')).toBe(control);
    });

    it("toggles from anywhere on the row, uncontrolled", () => {
      const seen: boolean[] = [];
      ui(<ActionPanel toggle title="Wi-Fi" description="Join known networks." onToggle={(next) => seen.push(next)} />);
      const control = screen.getByRole("switch");
      expect(control.getAttribute("aria-checked")).toBe("false");
      fireEvent.click(screen.getByText("Join known networks."));
      expect(control.getAttribute("aria-checked")).toBe("true");
      fireEvent.click(screen.getByText("Wi-Fi"));
      expect(control.getAttribute("aria-checked")).toBe("false");
      expect(seen).toEqual([true, false]);
    });

    it("follows `checked` when controlled, reporting the flip without taking it", () => {
      const seen: boolean[] = [];
      ui(<ActionPanel toggle checked title="Wi-Fi" onToggle={(next) => seen.push(next)} />);
      const control = screen.getByRole("switch");
      expect(control.getAttribute("aria-checked")).toBe("true");
      fireEvent.click(control);
      expect(seen).toEqual([false]);
      expect(control.getAttribute("aria-checked")).toBe("true");
    });

    it("names a title-less toggle by its action label", () => {
      ui(<ActionPanel toggle actionLabel="Dark mode" />);
      expect(screen.getByRole("switch", { name: "Dark mode" })).toBeTruthy();
    });

    it("keeps an inline row side by side at `md` and wider, and stacks it narrower", () => {
      ui(<ActionPanel inline title="Weekly digest" description="Sent every Monday." actionLabel="Subscribe" />);
      const wide = measureRow("Weekly digest", widths.md + 1);
      expect(wide.style.flexDirection).toBe("row");
      const narrow = measureRow("Weekly digest", widths.md);
      expect(narrow.style.flexDirection).toBe("");
      expect(getComputedStyle(narrow).flexDirection).toBe("column");
      // Stacked, the copy no longer grows into the row and the action keeps its own width.
      const copy = screen.getByText("Weekly digest").parentElement as HTMLElement;
      expect(copy.style.flexGrow).toBe("");
      const actionCell = narrow.lastElementChild as HTMLElement;
      expect(actionCell.contains(screen.getByRole("button", { name: "Subscribe" }))).toBe(true);
      expect(actionCell.style.alignItems).toBe("flex-start");
      // ...and it goes back beside the copy when the row widens again.
      expect(measureRow("Weekly digest", 900).style.flexDirection).toBe("row");
    });

    it("stacks a phone's first frame from the window, before the row measures", () => {
      resizeViewport(390);
      ui(<ActionPanel inline title="Weekly digest" actionLabel="Subscribe" />);
      const row = screen.getByText("Weekly digest").parentElement!.parentElement as HTMLElement;
      expect(getComputedStyle(row).flexDirection).toBe("column");
    });

    it("keeps embedded fields below the action when an inline row stacks", () => {
      ui(
        <ActionPanel inline title="Workspace profile" actionLabel="Save">
          <Switch>Public</Switch>
        </ActionPanel>,
      );
      measureRow("Workspace profile", 320);
      const save = screen.getByRole("button", { name: "Save" });
      const field = screen.getByRole("switch", { name: "Public" });
      expect(save.compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  });
}
