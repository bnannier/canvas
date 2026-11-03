import { afterEach, describe, expect, it } from "bun:test";
import type { ReactElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { AnatomyProvider } from "../src/style/anatomy.tsx";
import { Card } from "../src/molecules/card/card.tsx";
import { Stats } from "../src/molecules/stats/stats.tsx";
import { DataTable } from "../src/organisms/data-table/data-table.tsx";
import { StackedList } from "../src/molecules/stacked-lists/stacked-lists.tsx";
import { GridList } from "../src/molecules/grid-lists/grid-lists.tsx";
import { MediaObject } from "../src/molecules/media-objects/media-objects.tsx";
import { Feed } from "../src/molecules/feeds/feeds.tsx";
import { DescriptionList } from "../src/molecules/description-lists/description-lists.tsx";
import { ActionPanel } from "../src/molecules/action-panels/action-panels.tsx";
import { Accordion } from "../src/molecules/accordion/accordion.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Badge } from "../src/atoms/badge/badge.tsx";
import { Avatar } from "../src/atoms/avatar/avatar.tsx";
import { anatomyParts } from "./fixtures/anatomy-parts.tsx";

// Pins the Anatomy parts the surface components register (Card, Stats, DataTable, the
// list family, ActionPanel, Accordion) when they draw every part their docs spec names,
// and that the kit Badge, Avatar, Button and Checkbox inside them add no part of theirs.

afterEach(cleanup);

describe("surface anatomy parts", () => {
  it("Card registers its surface and sections", async () => {
    expect(await anatomyParts(<Card eyebrow="Library" badge="MIT" title="Canvas v4.0.0" description="107 components." footer="Updated Oct 26" />)).toEqual(
      ["Badge", "Description", "Eyebrow", "Footer", "Surface", "Title"],
    );
  });

  it("a pressable Card registers its surface on the Pressable", async () => {
    expect(await anatomyParts(<Card onPress={() => {}} title="Canvas" />)).toEqual(["Surface", "Title"]);
  });

  it("Stats registers its group and the first metric's parts", async () => {
    expect(await anatomyParts(<Stats items={[{ label: "Active members", value: "1,204", delta: "+6.2%" }, { label: "Seats", value: "40", delta: "+1%" }]} />)).toEqual(
      ["Delta", "Group", "Label", "Stat", "Value"],
    );
  });

  it("DataTable registers its table, header, sort indicator, first row, cell and selection", async () => {
    expect(
      await anatomyParts(
        <DataTable selectable sortable columns={["Name", "Team"]} rows={[["Ada Lovelace", "Platform"], ["Grace Hopper", "Compilers"]]} />,
      ),
    ).toEqual(["Cell", "Header row", "Row", "Selection", "Sort indicator", "Table"]);
  });

  it("StackedList registers its list, header, first row, avatar and trailing", async () => {
    expect(
      await anatomyParts(<StackedList title="Members" items={[{ name: "Ada Lovelace", detail: "Platform", initials: "AL", badge: "Active", success: true }, { name: "Grace Hopper", detail: "Compilers", badge: "Away" }]} />),
    ).toEqual(["Header", "Leading avatar", "List", "Row", "Trailing"]);
  });

  it("GridList registers its grid, first tile, media and caption", async () => {
    expect(
      await anatomyParts(<GridList items={[{ title: "Components", subtitle: "107 exports", avatar: "CO", badge: "New", actions: [{ label: "Open" }] }, { title: "Tokens", subtitle: "12" }]} />),
    ).toEqual(["Caption", "Grid", "Media", "Tile"]);
  });

  it("MediaObject registers its row, lead, title, description and action", async () => {
    expect(await anatomyParts(<MediaObject avatar="GH" title="Grace Hopper" description="Compilers" action={<Button small>Follow</Button>} />)).toEqual(
      ["Action", "Description", "Media", "Meta", "Title"],
    );
  });

  it("Feed registers its card, first event's lead, connector, sentence and time", async () => {
    expect(
      await anatomyParts(<Feed items={[{ actor: "Ada Lovelace", action: "merged", target: "tokens/ion", time: "09:12", icon: "gitBranch" }, { actor: "Grace Hopper", action: "opened", time: "09:40", icon: "gitBranch" }]} />),
    ).toEqual(["Connector", "Event", "Feed", "Lead", "Timestamp"]);
  });

  it("DescriptionList registers its list, first term and detail, and the Update action", async () => {
    expect(
      await anatomyParts(<DescriptionList twoColumn card title="Profile" items={[{ term: "Display name", value: "Bobby Nannier", update: true }, { term: "Role", value: "Admin", badge: true }]} />),
    ).toEqual(["Action", "Detail", "List", "Term"]);
  });

  it("ActionPanel registers its panel, copy and action", async () => {
    expect(await anatomyParts(<ActionPanel destructive title="Delete workspace" description="No undo." actionLabel="Delete" />)).toEqual(
      ["Action", "Description", "Panel", "Title"],
    );
  });

  it("Accordion registers its group, first header and chevron, and the first open panel", async () => {
    expect(
      await anatomyParts(
        <Accordion
          defaultValue={["a"]}
          items={[{ key: "a", title: "Is glass a component prop?", content: "No." }, { key: "b", title: "Second", content: "Yes." }]}
        />,
      ),
    ).toEqual(["Chevron", "Header", "Item", "Panel"]);
  });

  it("the Badge, Avatar and Button inside a surface name no part of their own", async () => {
    const parts = await anatomyParts(
      <Card title="Team">
        <Badge>Label</Badge>
        <Avatar name="Ada Lovelace" />
        <Button>Container</Button>
      </Card>,
    );
    expect(parts).toEqual(["Surface", "Title"]);
  });

  it("a Card outside a provider adds no measuring node", () => {
    const card = <Card eyebrow="Library" badge="MIT" title="Canvas" description="d" footer="f" />;
    const count = (specimen: ReactElement) => {
      const { container } = render(<ThemeProvider dark solid>{specimen}</ThemeProvider>);
      const total = container.querySelectorAll("*").length;
      cleanup();
      return total;
    };
    const bare = count(card);
    // Inside a provider: its root view, the Surface overlay, and the wrappers around the
    // Badge, the description and the footer.
    expect(count(<AnatomyProvider>{card}</AnatomyProvider>)).toBe(bare + 5);
  });
});
