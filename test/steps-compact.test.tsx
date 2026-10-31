import { afterEach, expect, it } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Steps } from "../src/organisms/steps/steps.tsx";
import { Steps as IOSSteps } from "../src/organisms/steps/steps.ios.tsx";
import { Steps as AndroidSteps } from "../src/organisms/steps/steps.android.tsx";

afterEach(cleanup);
const steps = [{ label: "Name" }, { label: "Members" }, { label: "Theme" }, { label: "Review" }];

for (const [name, Component] of [["web", Steps], ["ios", IOSSteps], ["android", AndroidSteps]] as const) {
  it(`${name} compact vertical steps retain short markers and announce the current stage`, () => {
    const view = render(<ThemeProvider solid><Component vertical compact steps={steps} current={1} testID="steps" /></ThemeProvider>);
    const root = view.getByTestId("steps");
    expect(root.style.gap).toBe("6px");
    expect(root.querySelector('[aria-current="step"]')?.textContent).toBe("2Members");
    expect(root.children).toHaveLength(4);
    for (const row of root.children) {
      const marker = row.firstElementChild as HTMLElement;
      expect(marker.style.width).toBe("22px");
      expect(marker.style.height).toBe("22px");
      expect(marker.style.boxShadow).toBe("none");
      expect(row.children).toHaveLength(2);
      expect((row.lastElementChild?.firstElementChild as HTMLElement).style.lineHeight).toBe("");
    }
  });
}

it("compact step activation preserves controlled and uncontrolled selection", () => {
  const requested: number[] = [];
  const view = render(<ThemeProvider><Steps vertical compact steps={steps} defaultCurrent={0} onStepPress={next => requested.push(next)} /></ThemeProvider>);
  fireEvent.click(view.getByRole("button", { name: "Members, step 2 of 4" }));
  expect(requested).toEqual([1]);
  expect(view.container.querySelector('[aria-current="step"]')?.textContent).toBe("2Members");
  view.unmount();
  const controlled = render(<ThemeProvider><Steps vertical compact steps={steps} current={0} onStepPress={next => requested.push(next)} /></ThemeProvider>);
  fireEvent.click(controlled.getByRole("button", { name: "Theme, step 3 of 4" }));
  expect(requested).toEqual([1, 2]);
  expect(controlled.container.querySelector('[aria-current="step"]')?.textContent).toBe("1Name");
});
