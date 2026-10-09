import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { Button } from "../src/atoms/button/button.tsx";
import { Button as IOSButton } from "../src/atoms/button/button.ios.tsx";
import { Button as AndroidButton } from "../src/atoms/button/button.android.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

// A loading Button announces the wait itself: it stays a named button and reports
// busy. Its spinner is decoration. react-native-web draws ActivityIndicator as a
// `progressbar` with no name, which assistive tech would otherwise meet as a second,
// unnamed control inside the button (axe's aria-progressbar-name).

afterEach(cleanup);

for (const [platform, Component] of [["web", Button], ["ios", IOSButton], ["android", AndroidButton]] as const) {
  describe(`${platform} loading Button accessibility`, () => {
    it("is one busy, named button with its spinner hidden from assistive tech", () => {
      const { getByRole, queryAllByRole, container } = render(<ThemeProvider><Component primary loading>Saving</Component></ThemeProvider>);
      const button = getByRole("button", { name: "Saving" });
      expect(button.getAttribute("aria-busy")).toBe("true");
      expect(queryAllByRole("progressbar")).toHaveLength(0);
      const spinner = container.querySelector('[role="progressbar"]');
      expect(spinner).not.toBeNull();
      expect(spinner?.closest('[aria-hidden="true"]')).not.toBeNull();
    });
  });
}
