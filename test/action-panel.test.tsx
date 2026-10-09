import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import type { ComponentType, ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
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
// platform's control: the tests compare it with the same control rendered alone. Two
// defects stay open for Phase 4 (audit/components/action-panels.md): the toggle is a
// bare Switch beside sibling copy rather than the Switch's own label anatomy, and an
// inline panel never stacks at phone width.

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

    it(`toggles through ${platform}'s own Switch, named by the title`, () => {
      const expected = aloneStyle(<Switch accessibilityLabel="Two-factor authentication" />, "switch");
      ui(<ActionPanel toggle title="Two-factor authentication" description="Require a code on every login." />);
      const control = screen.getByRole("switch", { name: "Two-factor authentication" });
      expect(control.getAttribute("style")).toBe(expected);
      expect(screen.queryByRole("button")).toBeNull();
      expect(screen.getByText("Require a code on every login.")).toBeTruthy();
    });

    it("keeps the error ink on a destructive toggle's title", () => {
      ui(<ActionPanel toggle title="Delete on sign-out" />);
      const neutral = screen.getByText("Delete on sign-out").style.color;
      cleanup();
      ui(<ActionPanel toggle destructive title="Delete on sign-out" />);
      expect(screen.getByText("Delete on sign-out").style.color).not.toBe(neutral);
    });

    it("flips itself when uncontrolled, starting from defaultChecked", () => {
      const seen: boolean[] = [];
      ui(<ActionPanel toggle defaultChecked title="Wi-Fi" onToggle={(next) => seen.push(next)} />);
      const control = screen.getByRole("switch", { name: "Wi-Fi" });
      expect(control.getAttribute("aria-checked")).toBe("true");
      fireEvent.click(control);
      expect(control.getAttribute("aria-checked")).toBe("false");
      fireEvent.click(control);
      expect(control.getAttribute("aria-checked")).toBe("true");
      expect(seen).toEqual([false, true]);
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

    it("lays an inline panel's action beside the copy, and stacks the default one below it", () => {
      ui(<ActionPanel inline title="Weekly digest" description="Sent every Monday." actionLabel="Subscribe" />);
      const row = screen.getByText("Weekly digest").parentElement!.parentElement as HTMLElement;
      expect(row.style.flexDirection).toBe("row");
      expect(row.contains(screen.getByRole("button", { name: "Subscribe" }))).toBe(true);
      cleanup();
      ui(<ActionPanel title="Weekly digest" description="Sent every Monday." actionLabel="Subscribe" />);
      const column = screen.getByText("Weekly digest").parentElement!.parentElement as HTMLElement;
      expect(column.style.flexDirection).toBe("");
      const copy = screen.getByText("Weekly digest").parentElement as HTMLElement;
      expect(copy.compareDocumentPosition(screen.getByRole("button", { name: "Subscribe" })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("hangs embedded fields below an inline row", () => {
      ui(
        <ActionPanel inline title="Workspace profile" actionLabel="Save">
          <Switch>Public</Switch>
        </ActionPanel>,
      );
      const save = screen.getByRole("button", { name: "Save" });
      const field = screen.getByRole("switch", { name: "Public" });
      expect(save.compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  });
}
