import { describe, it, expect, afterEach, beforeEach, spyOn } from "bun:test";
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import { type ComponentType, type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { resetDevWarnings } from "../src/style/dev-warn.ts";
import { Badge } from "../src/atoms/badge/badge.tsx";
import { DescriptionList, type DescriptionListProps } from "../src/molecules/description-lists/description-lists.tsx";
import { DescriptionList as IosDescriptionList } from "../src/molecules/description-lists/description-lists.ios.tsx";
import { DescriptionList as AndroidDescriptionList } from "../src/molecules/description-lists/description-lists.android.tsx";

// DescriptionList items take nodes for their term and value, as DataTable takes node
// cells: text keeps the list's own type and its per-item forms, any other node renders
// as given in its place.

let warnSpy: ReturnType<typeof spyOn>;
beforeEach(() => {
  resetDevWarnings();
  warnSpy = spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warnSpy.mockRestore();
  cleanup();
});
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

const ENTRIES = [["web", DescriptionList], ["ios", IosDescriptionList], ["android", AndroidDescriptionList]] as Array<[string, ComponentType<DescriptionListProps>]>;

for (const [platform, List] of ENTRIES) {
  describe(`DescriptionList node items (${platform})`, () => {
    it("renders a node value as given, beside text values that keep their type", () => {
      ui(
        <List
          twoColumn
          items={[
            { term: "States", value: <Badge testID="chip">busy</Badge> },
            { term: "Role", value: "button" },
          ]}
        />,
      );
      expect(screen.getByTestId("chip").textContent).toBe("busy");
      expect(screen.getByText("button")).toBeTruthy();
    });

    it("renders a node term in the term's place", () => {
      ui(<List twoColumn items={[{ term: <Badge testID="term">Keyboard</Badge>, value: "Enter" }]} />);
      expect(screen.getByTestId("term").textContent).toBe("Keyboard");
      expect(screen.getByText("Enter")).toBeTruthy();
    });

    it("keeps the text forms for text values only", () => {
      ui(<List items={[{ term: "Plan", value: "Pro", badge: true }, { term: "Seats", value: 12 }]} />);
      expect(screen.getByText("Pro")).toBeTruthy();
      expect(screen.getByText("12")).toBeTruthy();
    });

    it("offers Update only on a text value, naming a node term's row by position", () => {
      const onUpdate = (_i: number, _v: string) => {};
      ui(
        <List
          twoColumn
          onUpdate={onUpdate}
          items={[
            { term: <Badge>Owner</Badge>, value: "Rachel", update: true },
            { term: "Tags", value: <Badge>beta</Badge>, update: true },
          ]}
        />,
      );
      const updates = screen.getAllByRole("button", { name: /^Update/ });
      expect(updates).toHaveLength(1);
      expect(updates[0]!.getAttribute("aria-label")).toBe("Update row 1");
      fireEvent.click(updates[0]!);
      expect(screen.getByLabelText("row 1 value")).toBeTruthy();
      expect(warnSpy.mock.calls.some((call: unknown[]) => String(call[0]).includes("`update` needs a text value"))).toBe(true);
    });
  });
}
