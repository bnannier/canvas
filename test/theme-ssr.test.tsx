import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { Text } from "react-native";
import { ThemeProvider, useTheme } from "../src/style/theme.tsx";

afterEach(cleanup);

// Prints the active scheme as text so both server markup and the client DOM can
// be asserted against the same marker.
function Probe() {
  const { scheme } = useTheme();
  return <Text>{`scheme:${scheme}`}</Text>;
}

describe("ThemeProvider ssrScheme", () => {
  it("pins the server render to ssrScheme even when `scheme` disagrees", () => {
    const html = renderToString(
      <ThemeProvider scheme="dark" ssrScheme="light">
        <Probe />
      </ThemeProvider>,
    );
    expect(html).toContain("scheme:light");
    expect(html).not.toContain("scheme:dark");
  });

  it("applies the real scheme after mount on the client", () => {
    const { getByText } = render(
      <ThemeProvider scheme="dark" ssrScheme="light">
        <Probe />
      </ThemeProvider>,
    );
    // Effects have flushed by the time render() returns, so the post-mount
    // switch from ssrScheme to scheme has already happened.
    expect(getByText("scheme:dark")).toBeTruthy();
  });

  it("without ssrScheme the forced scheme applies from the first render", () => {
    const html = renderToString(
      <ThemeProvider scheme="dark">
        <Probe />
      </ThemeProvider>,
    );
    expect(html).toContain("scheme:dark");
  });
});
