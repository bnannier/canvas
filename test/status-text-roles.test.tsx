import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider, useTheme, type ThemeTokenOverrides } from "../src/style/theme.tsx";
import { colorsByScheme } from "../src/style/tokens.ts";
import { statusColors } from "../src/style/status.ts";

// The success and warning text roles alias the hand-off's status colours,
// so a brand that overrides a status colour must repaint its text
// too, the way an overriding `destructive` repaints `destructive-text`; an explicit text
// role wins, and an undefined one is an omission.

afterEach(cleanup);

function inks(tokens: ThemeTokenOverrides) {
  const seen: { success?: string; warning?: string } = {};
  function Probe() {
    const t = useTheme().tokens;
    seen.success = statusColors(t, "success").ink;
    seen.warning = statusColors(t, "warning").ink;
    return null;
  }
  render(<ThemeProvider light tokens={tokens}><Probe /></ThemeProvider>);
  return seen;
}

describe("status text roles", () => {
  it("default to the hand-off status inks", () => {
    expect(inks({})).toEqual({ success: colorsByScheme.light["success-text"], warning: colorsByScheme.light["warning-text"] });
  });

  it("follow an overriding status colour", () => {
    expect(inks({ success: "#0f6b3a", warning: "#7a4a00" })).toEqual({ success: "#0f6b3a", warning: "#7a4a00" });
  });

  it("let an explicit text role win and treat undefined as omission", () => {
    expect(inks({ success: "#0f6b3a", "success-text": "#0a5a30" }).success).toBe("#0a5a30");
    expect(inks({ success: "#0f6b3a", "success-text": undefined }).success).toBe("#0f6b3a");
    expect(inks({ "warning-text": undefined }).warning).toBe(colorsByScheme.light["warning-text"]);
  });
});
