import { afterEach, describe, expect, it, mock } from "bun:test";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { OverlayProvider } from "../src/style/portal.tsx";
import * as React from "react";
// The docs app has a separate Expo React installation. Its components must use
// the test renderer’s React instance in this harness, just as Metro deduplicates
// React in the actual app.
mock.module(import.meta.resolve("../docs/node_modules/react/index.js"), () => React);
const { getAllPatterns, getPattern } = await import("../docs/src/core/data/patterns.tsx");
import { resizeViewport } from "./viewport.ts";

afterEach(cleanup);
function example(slug: string, title: string) {
  const section = getPattern(slug)?.sections.find((section) => section.title === title);
  if (!section) throw new Error(`Missing pattern ${slug}/${title}`);
  return render(<ThemeProvider light solid><OverlayProvider>{section.render()}</OverlayProvider></ThemeProvider>);
}

describe("live docs patterns", () => {
  it("renders every section without invalid interactive nesting", () => {
    const errors: string[] = [];
    const original = console.error;
    console.error = (...args) => { errors.push(args.map(String).join(" ")); };
    try {
      for (const pattern of getAllPatterns()) {
        for (const section of pattern.sections) {
          example(pattern.slug, section.title);
          expect(document.querySelector("button button")).toBeNull();
          cleanup();
        }
      }
      expect(errors.filter((line) => /cannot be a descendant|cannot contain|validateDOMNesting/.test(line))).toEqual([]);
    } finally { console.error = original; }
  });

  it("moves actual focus instead of painting a pretend focus state", () => {
    example("accessibility", "Focus ring");
    fireEvent.click(screen.getByRole("button", { name: "Focus input" }));
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Focus example" }));
  });

  it("validates on blur, clears errors during correction, and validates submission", () => {
    example("form-validation", "Example form");
    const email = screen.getByRole("textbox", { name: /Email/ });
    fireEvent.change(email, { target: { value: "rachel@" } });
    expect(screen.queryByText("Enter a valid email address.")).toBeNull();
    fireEvent.blur(email);
    expect(screen.getByText("Enter a valid email address.")).toBeDefined();
    fireEvent.change(email, { target: { value: "rachel@example.com" } });
    expect(screen.queryByText("Enter a valid email address.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.queryByText("Demo sign-in complete")).toBeNull();
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "correct-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Demo sign-in complete")).toBeDefined();
  });

  it("keeps drafts and checked state when material changes", () => {
    example("glass", "Live comparison");
    const field = screen.getByRole("textbox", { name: "Project name" }) as HTMLInputElement;
    fireEvent.change(field, { target: { value: "Keep this edited draft" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /Notify the team/ }));
    fireEvent.click(screen.getByRole("switch", { name: /Request glass/ }));
    expect(screen.getByRole("textbox", { name: "Project name" })).toBe(field);
    expect(field.value).toBe("Keep this edited draft");
    expect(screen.getByRole("checkbox", { name: /Notify the team/ }).getAttribute("aria-checked")).toBe("false");
    expect(screen.getByText("Glass requested")).toBeDefined();
  });

  it("runs the button loading state and finishes the request", async () => {
    example("loading", "Spinner in button");
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    const button = screen.getByRole("button", { name: /Saving/ });
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 1000)); });
    await waitFor(() => expect(screen.getByText("Changes saved")).toBeDefined());
  });

  it("filters live tiles and preserves its search input across viewport changes", () => {
    example("responsive", "Layout primitives: Grid and Row stacks");
    const field = screen.getByRole("textbox", { name: "Search runs" }) as HTMLInputElement;
    fireEvent.change(field, { target: { value: "Build" } });
    expect(screen.getByText("Build API")).toBeDefined();
    expect(screen.queryByText("Write guide")).toBeNull();
    resizeViewport(390);
    expect(screen.getByRole("textbox", { name: "Search runs" })).toBe(field);
    expect(field.value).toBe("Build");
  });
});
