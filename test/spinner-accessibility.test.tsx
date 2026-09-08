import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { Text } from "react-native";
import { Spinner } from "../src/atoms/spinner/spinner.tsx";
import { Spinner as SpinnerIOS } from "../src/atoms/spinner/spinner.ios.tsx";
import { Spinner as SpinnerAndroid } from "../src/atoms/spinner/spinner.android.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);

for (const [platform, Component] of [["web", Spinner], ["ios", SpinnerIOS], ["android", SpinnerAndroid]] as const) {
  describe(`${platform} Spinner accessibility`, () => {
    it("exposes one named loading indicator without exposing the visual renderer", () => {
      const { getAllByRole, getByRole, container } = render(<ThemeProvider><Component /></ThemeProvider>);
      expect(getAllByRole("progressbar")).toHaveLength(1);
      expect(getByRole("progressbar", { name: "Loading" })).toBeDefined();
      const visuals = container.querySelector('[aria-hidden="true"]');
      expect(visuals).not.toBeNull();
      expect(visuals?.querySelector('button, input, [tabindex="0"]')).toBeNull();
    });

    it("names the combined label and description once", () => {
      const { getAllByRole, getByRole, getByText } = render(<ThemeProvider>
        <Component stacked description="This may take a moment">Uploading files</Component>
      </ThemeProvider>);
      expect(getAllByRole("progressbar")).toHaveLength(1);
      expect(getByRole("progressbar", { name: "Uploading files" })).toBeDefined();
      expect(getByText("This may take a moment")).toBeDefined();
    });

    it("honors an explicit name when its visible label is rich content", () => {
      const { getAllByRole, getByRole } = render(<ThemeProvider>
        <Component accessibilityLabel="Importing contacts"><Text>Importing</Text></Component>
      </ThemeProvider>);
      expect(getAllByRole("progressbar")).toHaveLength(1);
      expect(getByRole("progressbar", { name: "Importing contacts" })).toBeDefined();
    });
  });
}
