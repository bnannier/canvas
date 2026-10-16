import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { View } from "../src/style/index.ts";
import { Dialog } from "../src/organisms/dialog/dialog.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { OverlayProvider } from "../src/style/portal.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { workspaceHeight } from "../src/organisms/dialog/dialog.styles.ts";

afterEach(cleanup);

test("workspace height leaves the safe-area inset in both full and short viewports", () => {
  expect(workspaceHeight(844)).toBe(804);
  expect(workspaceHeight(844, 47, 34)).toBe(723);
  expect(workspaceHeight(320)).toBe(280);
});

test("workspace forms bound the panel and keep a flex body outside the dialog scrollport", () => {
  const { getByTestId, getByRole, getByText } = render(
    <ThemeProvider solid>
      <OverlayProvider>
        <Dialog form workspace overlay open title="Planning" testID="planning-dialog" footer={<Button>Save</Button>}>
          <View testID="thread" style={{ flex: 1, minHeight: 0 }} />
        </Dialog>
      </OverlayProvider>
    </ThemeProvider>,
  );

  const dialog = getByTestId("planning-dialog");
  const panel = document.querySelector('[role="dialog"]');
  expect(panel).toBeTruthy();
  expect(getByRole("heading", { name: "Planning" })).toBeTruthy();
  expect(getByText("Save")).toBeTruthy();

  const thread = getByTestId("thread");
  const body = thread.parentElement;
  expect(body?.style.flex).toContain("1");
  expect(body?.style.minHeight).toBe("0px");
  expect(body?.style.overflowY).not.toBe("auto");

  const sizing = [...(panel?.querySelectorAll("div") ?? [])].find((element) => (element as HTMLElement).style.height) as HTMLElement | undefined;
  expect(Number.parseFloat(sizing?.style.height ?? "0")).toBeGreaterThan(0);
  expect(sizing?.style.maxHeight).toBe(sizing?.style.height);
});
