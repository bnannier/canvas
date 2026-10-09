import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Column } from "../src/atoms/layout/layout.tsx";
import { Switch as WebSwitch } from "../src/atoms/switch/switch.tsx";
import { Switch as IosSwitch } from "../src/atoms/switch/switch.ios.tsx";
import { Switch as AndroidSwitch } from "../src/atoms/switch/switch.android.tsx";

afterEach(cleanup);

// The browser responsive suite measures the long description in /patterns/glass.
// This pins the same intrinsic wrapping contract through all three platform entries,
// including the whole-row tap target and the track's independently fixed dimensions.
for (const [platform, Switch, trackWidth] of [
  ["web", WebSwitch, "44px"],
  ["ios", IosSwitch, "46px"],
  ["android", AndroidSwitch, "52px"],
] as const) {
  describe(`${platform} Switch label`, () => {
    it("shrinks the label around its track without splitting the tap target", () => {
      const { getByRole, getByText } = render(
        <ThemeProvider solid>
          <Column>
            <Switch description="The provider changes material while the form remains mounted.">Request glass</Switch>
          </Column>
        </ThemeProvider>,
      );
      const control = getByRole("switch");
      const description = getByText("The provider changes material while the form remains mounted.");
      const label = description.parentElement!;
      const track = label.nextElementSibling as HTMLElement;

      expect(label.style.flexShrink).toBe("1");
      expect(label.style.minWidth).toBe("0px");
      expect(getByText("Request glass").closest('[role="switch"]')).toBe(control);
      expect(description.closest('[role="switch"]')).toBe(control);
      expect(track.style.width).toBe(trackWidth);
      expect(control.getAttribute("aria-checked")).toBe("false");

      fireEvent.click(description);
      expect(control.getAttribute("aria-checked")).toBe("true");
      expect(track.style.width).toBe(trackWidth);
      fireEvent.click(getByText("Request glass"));
      expect(control.getAttribute("aria-checked")).toBe("false");
    });
  });
}
