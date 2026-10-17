import { afterEach, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Wizard } from "../src/organisms/wizard/wizard.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

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
  expect(view.getByTestId("project-wizard-footer").textContent).toContain("Autosaved");
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
