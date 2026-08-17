import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, waitFor, screen } from "@testing-library/react";
import { Text } from "react-native";
import { ThemeProvider, useTheme } from "../src/style/theme.tsx";

// The scheme axis in boolean grammar (<ThemeProvider dark> / <ThemeProvider
// light>), mirroring the surface axis: the boolean is the canonical spelling,
// the legacy `scheme` value prop stays supported underneath, and these pin the
// resolution order: dark > light > scheme > the OS appearance.

afterEach(cleanup);

function SchemeProbe() {
  const { scheme, dark } = useTheme();
  return <Text>{`scheme:${scheme}|dark:${dark}`}</Text>;
}

describe("ThemeProvider scheme axis booleans", () => {
  it("dark forces the dark scheme", async () => {
    render(
      <ThemeProvider dark>
        <SchemeProbe />
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByText("scheme:dark|dark:true")).toBeDefined());
  });

  it("light forces the light scheme", async () => {
    render(
      <ThemeProvider light>
        <SchemeProbe />
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByText("scheme:light|dark:false")).toBeDefined());
  });

  it("omitting both follows the OS appearance (light under the test DOM)", async () => {
    render(
      <ThemeProvider>
        <SchemeProbe />
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByText("scheme:light|dark:false")).toBeDefined());
  });

  it("dark wins over light (axis first-match), and both win over legacy scheme", async () => {
    render(
      <ThemeProvider dark light scheme="light">
        <SchemeProbe />
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByText("scheme:dark|dark:true")).toBeDefined());
  });

  it('light overrides a legacy scheme="dark"', async () => {
    render(
      <ThemeProvider light scheme="dark">
        <SchemeProbe />
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByText("scheme:light|dark:false")).toBeDefined());
  });

  it("the legacy scheme value prop still resolves on its own", async () => {
    render(
      <ThemeProvider scheme="dark">
        <SchemeProbe />
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByText("scheme:dark|dark:true")).toBeDefined());
  });
});
