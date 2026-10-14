import { afterEach, expect, spyOn, test } from "bun:test";
import { Linking } from "react-native";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Button } from "../src/atoms/button/button.tsx";
import { Icon } from "../src/atoms/icon/icon.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
afterEach(cleanup);

test("inline work actions remain a single named link and activate their editor", () => {
  let opened = 0;
  const { getByRole, getByText, queryByRole } = render(<ThemeProvider light solid><Button inlineLink link large extraBold foreground steadyPress accessibilityLabel="Edit CORE-1" onPress={() => opened++} iconRight={<Icon arrowRight size={11} heavyStroke />}>Preserve the interface</Button></ThemeProvider>);
  const link = getByRole("link", { name: "Edit CORE-1" });
  expect(queryByRole("button")).toBeNull();
  fireEvent.click(link);
  expect(opened).toBe(1);
  const label = getByText("Preserve the interface");
  expect(label.style.fontSize).toBe("14px");
  expect(label.style.lineHeight).toBe("18.2px");
  expect(label.style.fontWeight).toBe("800");
});

test("external inline links keep their destination and open it once through the system browser", async () => {
  const open = spyOn(Linking, "openURL").mockResolvedValue(undefined);
  try {
    const { getByRole } = render(<ThemeProvider light solid><Button inlineLink link small external href="https://example.com/change">Open change</Button></ThemeProvider>);
    const link = getByRole("link", { name: "Open change" });
    expect(link.getAttribute("href")).toBe("https://example.com/change");
    fireEvent.click(link);
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith("https://example.com/change");
  } finally { open.mockRestore(); }
});
