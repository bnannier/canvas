import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Textarea } from "../src/atoms/textarea/textarea.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
afterEach(cleanup);

test("dense paragraph fields keep Argus metrics, visible rows and accessible names", () => {
  render(<ThemeProvider light solid><Textarea dense eyebrow systemFocus label="Description" accessibilityLabel="Project description" rows={3} value="Context" readOnly /></ThemeProvider>);
  const field = screen.getByRole("textbox", { name: "Project description" }) as HTMLTextAreaElement;
  expect(field.style.fontSize).toBe("13px");
  expect(field.style.lineHeight).toBe("19.5px");
  expect(field.style.padding).toBe("10px 12px");
  expect(field.getAttribute("rows")).toBe("3");
  expect(field.readOnly).toBe(true);
  expect(field.disabled).toBe(false);
  expect(screen.getByText("Description").style.fontSize).toBe("9.5px");
});
