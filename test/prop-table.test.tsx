import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { DataTable } from "../src/organisms/data-table/data-table.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { Badge } from "../src/atoms/badge/badge.tsx";
import { Row, Column } from "../src/atoms/layout/layout.tsx";
import { COMPONENT_PROPS, type PropGroup } from "../docs/src/core/props.ts";

// The generated prop tables (docs/src/core/props.ts) are rendered on each
// component page through the kit's own DataTable — the docs dogfood the component
// they document. This suite locks two things without needing the docs bundler:
//   1. the generated data is well-formed and renderable, and
//   2. the DataTable + Typography + Badge + Row/Column composition PropTables uses
//      renders the prop name, type, required flag, and description.
// It mirrors docs/src/ui/prop-table.tsx's row composition (which itself can't be
// imported here — it pulls in the Geist web font — so the composition is kept in
// sync by hand; it is small and stable).

afterEach(cleanup);

const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);

function GroupTable({ group }: { group: PropGroup }) {
  return (
    <DataTable
      bordered
      striped
      compact
      columns={["Prop", "Description"]}
      rows={group.props.map((p) => [
        <Column tight>
          <Row snug alignCenter wrap>
            <Typography mono semibold>{p.name}</Typography>
            {p.required ? <Badge outline mono>required</Badge> : null}
          </Row>
          <Typography mono subtle>{p.type}</Typography>
        </Column>,
        p.description ? <Typography small>{p.description}</Typography> : <Typography small muted>—</Typography>,
      ])}
    />
  );
}

describe("generated prop tables", () => {
  it("every documented component has at least one well-formed prop group", () => {
    const keys = Object.keys(COMPONENT_PROPS);
    expect(keys.length).toBeGreaterThan(50);
    for (const key of keys) {
      for (const group of COMPONENT_PROPS[key]) {
        expect(group.name).toMatch(/Props$/);
        expect(group.props.length).toBeGreaterThan(0);
        for (const p of group.props) {
          expect(p.name.length).toBeGreaterThan(0);
          expect(p.type.length).toBeGreaterThan(0);
          expect(typeof p.required).toBe("boolean");
        }
      }
    }
  });

  it("renders a component's props through the kit DataTable (name, type, description)", () => {
    const [group] = COMPONENT_PROPS["button"];
    const { getByText, getAllByText } = ui(<GroupTable group={group} />);
    // A boolean axis prop and its type render.
    expect(getByText("primary")).toBeTruthy();
    expect(getAllByText("boolean").length).toBeGreaterThan(0);
    // The column headers render.
    expect(getByText("Prop")).toBeTruthy();
    expect(getByText("Description")).toBeTruthy();
    // A description string renders (Button's `testID` doc line).
    expect(getByText(/E2E hook forwarded to the root element/)).toBeTruthy();
  });

  it("flags required props with a badge and leaves optional ones unflagged", () => {
    // ActionSheet has exactly two required props: `open` and `actions`.
    const [group] = COMPONENT_PROPS["action-sheet"];
    const requiredCount = group.props.filter((p) => p.required).length;
    expect(requiredCount).toBe(2);
    const { getAllByText, getByText } = ui(<GroupTable group={group} />);
    expect(getAllByText("required").length).toBe(requiredCount);
    // `open` is required, `title` is optional — both still render as prop names.
    expect(getByText("open")).toBeTruthy();
    expect(getByText("title")).toBeTruthy();
  });

  it("Avatar contributes two prop groups (Avatar + AvatarGroup)", () => {
    const groups = COMPONENT_PROPS["avatar"];
    expect(groups.map((g) => g.name)).toEqual(["AvatarProps", "AvatarGroupProps"]);
  });
});
