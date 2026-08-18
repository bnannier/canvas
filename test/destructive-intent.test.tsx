import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Alert } from "../src/molecules/alert/alert.tsx";
import { Chip } from "../src/atoms/chip/chip.tsx";
import { Toast } from "../src/organisms/toast/toast.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// The danger intent is spelled `destructive` across the kit (Button, AlertDialog, every chart)
// and in the design hand-off. Alert, Chip and Toast historically spelled it `error`. `destructive`
// is now the name; `error` stays working as a deprecated alias. These tests pin BOTH halves of
// that contract: the new name paints the danger tone, and the old name still paints exactly the
// same thing, because an alias that silently drifted would be worse than no alias at all.

/** Every backgroundColor/color/borderColor in a subtree, as a stable signature of the tone. */
function paint(root: HTMLElement): string[] {
  return [...root.querySelectorAll<HTMLElement>("*")]
    .flatMap((el) => [el.style.backgroundColor, el.style.color, el.style.borderColor])
    .filter(Boolean);
}

describe("destructive is the intent-axis name, error is its alias", () => {
  it("Alert: destructive and error paint identically, and differ from the neutral default", () => {
    const withNew = paint(ui(<Alert destructive title="Payment failed" />).container);
    cleanup();
    const withOld = paint(ui(<Alert error title="Payment failed" />).container);
    cleanup();
    const neutral = paint(ui(<Alert title="Payment failed" />).container);

    expect(withNew.length).toBeGreaterThan(0);
    expect(withNew).toEqual(withOld);
    expect(withNew).not.toEqual(neutral);
  });

  it("Chip: destructive and error resolve to the same hue, distinct from success", () => {
    const withNew = paint(ui(<Chip destructive>Failing</Chip>).container);
    cleanup();
    const withOld = paint(ui(<Chip error>Failing</Chip>).container);
    cleanup();
    const success = paint(ui(<Chip success>Passing</Chip>).container);

    expect(withNew.length).toBeGreaterThan(0);
    expect(withNew).toEqual(withOld);
    expect(withNew).not.toEqual(success);
  });

  it("Toast: destructive and error render identically", () => {
    // Toast carries its intent only through the leading glyph, and the harness stubs
    // react-native-svg to a Fragment, so the tone leaves no DOM trace here and there is no
    // honest way to assert it differs from neutral. What IS assertable is the half this change
    // introduced: the two spellings must produce byte-identical output. The tone itself is
    // covered above by Alert and Chip, which tint real DOM nodes.
    const withNew = ui(<Toast destructive message="Upload failed" />).container.innerHTML;
    cleanup();
    const withOld = ui(<Toast error message="Upload failed" />).container.innerHTML;

    expect(withNew.length).toBeGreaterThan(0);
    expect(withNew).toBe(withOld);
  });

  it("destructive wins when both are passed, rather than stacking two tones", () => {
    // Same branch, so passing both is redundant but must never produce a third result.
    const both = paint(ui(<Alert destructive error title="Payment failed" />).container);
    cleanup();
    const one = paint(ui(<Alert destructive title="Payment failed" />).container);
    expect(both).toEqual(one);
  });

  it("destructive does not displace the other tones on the same axis", () => {
    // The axis is success / warning / destructive / info / neutral. Adding a name to one member
    // must not perturb the precedence of the rest.
    const warning = paint(ui(<Alert warning title="Low disk space" />).container);
    cleanup();
    const destructive = paint(ui(<Alert destructive title="Low disk space" />).container);
    expect(warning).not.toEqual(destructive);
  });
});
