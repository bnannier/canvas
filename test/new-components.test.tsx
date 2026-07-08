import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Row, Column } from "../src/atoms/layout/layout.tsx";
import { Avatar, AvatarGroup } from "../src/atoms/avatar/avatar.tsx";
import { Chip } from "../src/atoms/chip/chip.tsx";
import { IconTile } from "../src/atoms/icon-tile/icon-tile.tsx";
import { Sparkline } from "../src/atoms/sparkline/sparkline.tsx";
import { Gauge, Heatmap } from "../src/organisms/charts/charts.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { Card } from "../src/molecules/card/card.tsx";
import { Breadcrumb } from "../src/atoms/breadcrumb/breadcrumb.tsx";
import { Textarea } from "../src/atoms/textarea/textarea.tsx";

// Behavior + a11y coverage for the "no styling escape hatches" component wave:
// Row/Column, AvatarGroup, Chip, IconTile, Sparkline, the Gauge/Heatmap charts,
// plus the new Typography tone/weight axes, Card selected/grow, Breadcrumb
// collapse, and the Textarea flush variant. react-native-web renders these to
// readable inline styles, so a semantic boolean prop can be checked at the DOM
// (e.g. `loose` → `gap: 24px`), alongside the aria-* / interaction assertions.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const at = (c: HTMLElement, id: string) => c.querySelector(`[data-testid="${id}"]`) as HTMLElement;

describe("Row / Column (layout primitives)", () => {
  it("carry their fixed direction as flexDirection", () => {
    const { container } = ui(
      <>
        <Row testID="r"><Text>x</Text></Row>
        <Column testID="c"><Text>y</Text></Column>
      </>,
    );
    expect(at(container, "r").style.flexDirection).toBe("row");
    expect(at(container, "c").style.flexDirection).toBe("column");
  });

  it("map the gap axis to the shared spacing scale (default snug, loose, tight)", () => {
    const { container } = ui(
      <>
        <Row testID="def"><Text>x</Text></Row>
        <Row loose testID="lo"><Text>x</Text></Row>
        <Row tight testID="ti"><Text>x</Text></Row>
      </>,
    );
    expect(at(container, "def").style.gap).toBe("8px"); // snug default
    expect(at(container, "lo").style.gap).toBe("24px");
    expect(at(container, "ti").style.gap).toBe("4px");
  });

  it("map justify / align booleans to justifyContent / alignItems", () => {
    const { container } = ui(
      <>
        <Row center alignCenter testID="cc"><Text>x</Text></Row>
        <Row between testID="bw"><Text>x</Text></Row>
      </>,
    );
    expect(at(container, "cc").style.justifyContent).toBe("center");
    expect(at(container, "cc").style.alignItems).toBe("center");
    expect(at(container, "bw").style.justifyContent).toBe("space-between");
  });

  it("turn wrap on and forward testID to the root element", () => {
    const { container } = ui(<Row wrap testID="wrapped"><Text>x</Text></Row>);
    const el = at(container, "wrapped");
    expect(el).not.toBeNull();
    expect(el.style.flexWrap).toBe("wrap");
  });
});

describe("AvatarGroup", () => {
  it("caps the visible avatars at max and collapses the rest into a +N chip", () => {
    const { getByText, queryByText } = ui(
      <AvatarGroup max={2}>
        <Avatar name="Ada Byron" />
        <Avatar name="Bob Cat" />
        <Avatar name="Cy Young" />
        <Avatar name="Dee Ell" />
      </AvatarGroup>,
    );
    expect(getByText("AB")).toBeDefined(); // first visible avatar's initials
    expect(queryByText("CY")).toBeNull(); // 3rd avatar is past the cap
    expect(getByText("+2")).toBeDefined(); // two hidden collapse into +2
  });

  it("injects the separator ring onto the stacked avatars (caller sets none)", () => {
    const { container } = ui(
      <AvatarGroup max={3}>
        <Avatar name="Ada Byron" testID="av0" />
        <Avatar name="Bob Cat" />
      </AvatarGroup>,
    );
    // The group clones each child with ring:true, which paints the 2px outline.
    expect(at(container, "av0").style.borderWidth).toBe("2px");
  });
});

describe("Chip", () => {
  it("fires onPress when the whole pill is tapped", () => {
    let pressed = false;
    const { container } = ui(<Chip onPress={() => { pressed = true; }}>Filter</Chip>);
    fireEvent.click(container.querySelector('[role="button"]') as Element);
    expect(pressed).toBe(true);
  });

  it("fires onRemove from the trailing remove button", () => {
    let removed = false;
    const { container } = ui(<Chip onRemove={() => { removed = true; }}>Design</Chip>);
    fireEvent.click(container.querySelector('[aria-label="Remove Design"]') as Element);
    expect(removed).toBe(true);
  });

  it("reflects the active (primary) tone through aria-pressed", () => {
    const { container, rerender } = ui(<Chip onPress={() => {}}>Filter</Chip>);
    expect(container.querySelector('[role="button"]')?.getAttribute("aria-pressed")).toBe("false");
    rerender(<ThemeProvider><Chip primary onPress={() => {}}>Filter</Chip></ThemeProvider>);
    expect(container.querySelector('[role="button"]')?.getAttribute("aria-pressed")).toBe("true");
  });

  it("names the specific chip on its remove control", () => {
    const { container } = ui(<Chip onRemove={() => {}}>Design</Chip>);
    expect(container.querySelector('[aria-label="Remove Design"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Remove"]')).toBeNull();
  });
});

describe("IconTile", () => {
  it("renders a monogram label", () => {
    const { getByText } = ui(<IconTile label="JS" />);
    expect(getByText("JS")).toBeDefined();
  });

  it("tints the surface from the semantic tone", () => {
    const { container } = ui(
      <>
        <IconTile primary label="A" testID="pri" />
        <IconTile muted label="A" testID="mut" />
      </>,
    );
    const pri = at(container, "pri").style.backgroundColor;
    const mut = at(container, "mut").style.backgroundColor;
    expect(pri).not.toBe("");
    expect(mut).not.toBe("");
    expect(pri).not.toBe(mut); // tone drives a distinct fill
  });
});

describe("Sparkline", () => {
  it("renders one bar per value", () => {
    const { container } = ui(<Sparkline values={[1, 2, 3, 4, 5]} testID="spark" />);
    expect(at(container, "spark").children.length).toBe(5);
  });

  it("exposes an accessible summary label", () => {
    const { container } = ui(
      <Sparkline values={[1, 2, 3]} accessibilityLabel="requests, last 3 days" />,
    );
    expect(container.querySelector('[aria-label="requests, last 3 days"]')).not.toBeNull();
  });
});

describe("Charts — Gauge & Heatmap", () => {
  it("Gauge's accessible name carries the label and value", () => {
    const { container } = ui(<Gauge value={87} label="Uptime" />);
    const name = container.querySelector("[aria-label]")?.getAttribute("aria-label") ?? "";
    expect(name).toContain("Uptime");
    expect(name).toContain("87%");
  });

  it("Gauge clamps an out-of-range value into 0–100", () => {
    const { container } = ui(<Gauge value={150} />);
    expect(container.querySelector("[aria-label]")?.getAttribute("aria-label")).toContain("100%");
  });

  it("Heatmap's accessible name carries the label and cell count", () => {
    const { container } = ui(<Heatmap values={[0.1, 0.5, 0.9]} label="Activity" hideLegend />);
    const name = container.querySelector("[aria-label]")?.getAttribute("aria-label") ?? "";
    expect(name).toContain("Activity");
    expect(name).toContain("3 cells");
  });
});

describe("Typography — tone & weight axes", () => {
  it("applies the weight axis as fontWeight over the role's own weight", () => {
    const { container } = ui(
      <>
        <Typography body testID="reg">Plain</Typography>
        <Typography body bold testID="bold">Heavy</Typography>
      </>,
    );
    expect(at(container, "bold").style.fontWeight).toBe("700");
    // The body role carries no intrinsic weight, so the untouched one stays unset.
    expect(at(container, "reg").style.fontWeight).not.toBe("700");
  });

  it("applies the tone axis as a distinct color over the role's own color", () => {
    const { container } = ui(
      <>
        <Typography body testID="plain">Plain</Typography>
        <Typography body primary testID="tone">Branded</Typography>
      </>,
    );
    const plain = at(container, "plain").style.color;
    const tone = at(container, "tone").style.color;
    expect(tone).not.toBe("");
    expect(tone).not.toBe(plain);
  });
});

describe("Card — selected & grow", () => {
  it("selected recolors the border away from the resting surface", () => {
    const { container } = ui(
      <>
        <Card testID="rest"><Text>a</Text></Card>
        <Card selected testID="sel"><Text>b</Text></Card>
      </>,
    );
    expect(at(container, "sel").style.borderColor).not.toBe(at(container, "rest").style.borderColor);
  });

  it("grow sets flexGrow so the card fills its parent axis", () => {
    const { container } = ui(<Card grow testID="g"><Text>a</Text></Card>);
    expect(at(container, "g").style.flexGrow).toBe("1");
  });
});

describe("Breadcrumb — maxItems collapse", () => {
  it("keeps the first and tail crumbs and replaces the middle with an ellipsis", () => {
    const { getByText, queryByText, container } = ui(
      <Breadcrumb items={["Home", "Team", "Projects", "Canvas", "Settings"]} maxItems={3} />,
    );
    expect(getByText("Home")).toBeDefined(); // first crumb kept
    expect(getByText("Settings")).toBeDefined(); // last crumb kept
    expect(queryByText("Team")).toBeNull(); // collapsed into the middle
    expect(queryByText("Projects")).toBeNull(); // collapsed into the middle
    expect(container.querySelector('[aria-label="More levels"]')).not.toBeNull();
  });
});

describe("Textarea — flush variant", () => {
  it("drops its own border and radius so it sits flush in a framed container", () => {
    const { container } = ui(<Textarea flush testID="ta" />);
    const field = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(field.style.borderTopWidth).toBe("0px");
    expect(field.style.borderRadius).toBe("0px");
  });
});
