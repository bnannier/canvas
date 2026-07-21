import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Field } from "../src/molecules/field/field.tsx";

// The display-mode value alignment axis: values rest at the leading edge by
// default (beside the label column), and `alignEnd` packs each value to the
// row's trailing edge (receipt / iOS-Settings style). react-native-web renders
// the pair as inline align-items / text-align, so the axis is assertable at the
// DOM: the value wrapper carries the flex-end box, and the value Text carries
// textAlign so wrapped lines stay on the trailing edge too.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const wrapperOf = (text: string) => screen.getByText(text).parentElement as HTMLElement;

describe("field display alignment: default (leading)", () => {
  it("leaves the value wrapper and text un-aligned (values rest at the leading edge)", () => {
    ui(<Field rows={[{ label: "Name", value: "Rachel Chen" }]} />);
    const value = screen.getByText("Rachel Chen") as HTMLElement;
    expect(wrapperOf("Rachel Chen").style.alignItems).toBe("");
    expect(value.style.textAlign).toBe("");
  });
});

describe("field display alignment: alignEnd", () => {
  it("packs the value column to the trailing edge and end-aligns the text", () => {
    ui(<Field alignEnd rows={[{ label: "Total", value: "$1,339.20" }]} />);
    const value = screen.getByText("$1,339.20") as HTMLElement;
    expect(wrapperOf("$1,339.20").style.alignItems).toBe("flex-end");
    expect(value.style.textAlign).toBe("right");
  });

  it("repositions badge values to the trailing edge (the atom's own leading alignSelf loses)", () => {
    ui(<Field alignEnd rows={[{ label: "Status", status: "Paid" }, { label: "Plan", badge: "Pro" }]} />);
    // The badge root (the Text's parent View) pins itself alignSelf:flex-start;
    // alignEnd must override it or the badge alone stays at the leading edge.
    expect(wrapperOf("Paid").style.alignSelf).toBe("flex-end");
    expect(wrapperOf("Pro").style.alignSelf).toBe("flex-end");
  });

  it("carries the trailing pack on composed rows (a copy row keeps its Copy button)", () => {
    let copied = "";
    ui(
      <Field
        alignEnd
        onCopy={(v) => {
          copied = v;
        }}
        rows={[{ label: "Token", value: "sk_live_a8f2", copyValue: "sk_live_a8f2" }]}
      />,
    );
    // The copy row shrink-wraps inside the flex-end wrapper; the Copy button
    // stays rendered and pressable at the trailing edge.
    const copyRow = screen.getByText("sk_live_a8f2").parentElement as HTMLElement;
    expect((copyRow.parentElement as HTMLElement).style.alignItems).toBe("flex-end");
    (screen.getByLabelText("Copy Token") as HTMLElement).click();
    expect(copied).toBe("sk_live_a8f2");
  });
});
