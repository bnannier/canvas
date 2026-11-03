import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { cleanup } from "@testing-library/react";
import { anatomyParts } from "./fixtures/anatomy-parts.tsx";
import { View, Text, TextInput, Pressable } from "../src/style/primitives.ts";
import { ScrollView } from "../src/style/scroll-view.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { Icon } from "../src/atoms/icon/icon.tsx";
import { Emblem } from "../src/atoms/emblem/emblem.tsx";
import { Swatch } from "../src/atoms/swatch/swatch.tsx";
import { Reveal } from "../src/atoms/reveal/reveal.tsx";
import { Row, Column } from "../src/atoms/layout/layout.tsx";
import { Container } from "../src/atoms/container/container.tsx";
import { Grid } from "../src/atoms/grid/grid.tsx";
import { Divider } from "../src/atoms/divider/divider.tsx";
import { Badge } from "../src/atoms/badge/badge.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { AppFrame } from "../src/organisms/app-frame/app-frame.tsx";
import { DashboardGrid } from "../src/organisms/dashboard-grid/dashboard-grid.tsx";
import { colorsFor } from "../src/style/tokens.ts";
import type { ExampleScope } from "../docs/src/core/scope.ts";

// The anatomy parts the foundations and layout components, the kit primitives and the docs
// reference specimens (View, ScrollView, TextInput) register, and that nested kit
// components register nothing through them.

// Docs have their own dependency tree; use the renderer's React for this DOM harness.
mock.module(import.meta.resolve("../docs/node_modules/react/index.js"), () => React);
const { referenceSpecimen } = await import("../docs/src/ui/detail/reference-specimens.tsx");

afterEach(cleanup);

const scope = { View, TextInput, ScrollView, Typography, tokens: colorsFor("violet", "dark") } as ExampleScope;

describe("foundations", () => {
  it("Typography registers its run, and its inner Text nothing more", async () => {
    expect(await anatomyParts(<Typography>Light as material</Typography>)).toEqual(["Text run"]);
  });
  it("a section Typography keeps its count Badge's parts out", async () => {
    expect(await anatomyParts(<Typography h3 section count={3}>Members</Typography>)).toEqual(["Text run"]);
  });
  it("Text registers its run", async () => {
    expect(await anatomyParts(<Text>Every surface is lit glass.</Text>)).toEqual(["Text run"]);
  });
  it("Icon registers its glyph and bounding box", async () => {
    expect(await anatomyParts(<Icon shield />)).toEqual(["Bounding box", "Glyph"]);
  });
  it("an Icon cell registers the cell as its bounding box", async () => {
    expect(await anatomyParts(<Icon shield cell />)).toEqual(["Bounding box", "Glyph"]);
  });
  it("Emblem registers its tile and the glyph in it, and not the glyph's own parts", async () => {
    expect(await anatomyParts(<Emblem><Icon shield /></Emblem>)).toEqual(["Monogram", "Tile"]);
  });
  it("Emblem registers a monogram label", async () => {
    expect(await anatomyParts(<Emblem label="CV" />)).toEqual(["Monogram", "Tile"]);
  });
  it("Swatch registers its chip, name and value", async () => {
    expect(await anatomyParts(<Swatch color="#7c5cff" value="oklch .74 .17 285">ion</Swatch>)).toEqual(["Chip", "Name", "Value"]);
  });
  it("Reveal registers its entering block, and its content nothing", async () => {
    expect(await anatomyParts(<Reveal><Typography>Rises into place</Typography></Reveal>)).toEqual(["Entering block"]);
  });
});

describe("layout", () => {
  it("Row registers its container and first child, and the Buttons in it nothing", async () => {
    expect(await anatomyParts(<Row><Button primary>Save</Button><Button ghost>Cancel</Button></Row>)).toEqual(["Child", "Container"]);
  });
  it("a spanning Row and a Column register the same parts", async () => {
    expect(await anatomyParts(<Row><Column span={6}><Text>One</Text></Column><Column span={6}><Text>Two</Text></Column></Row>)).toEqual(["Child", "Container"]);
    cleanup();
    expect(await anatomyParts(<Column><Text>One</Text><Text>Two</Text></Column>)).toEqual(["Child", "Container"]);
  });
  it("Container registers its track, capped column and gutter", async () => {
    expect(await anatomyParts(<Container sm pad><Typography medium>Sign in</Typography></Container>)).toEqual(["Capped column", "Gutter", "Track"]);
  });
  it("Grid registers itself and its first tile", async () => {
    expect(await anatomyParts(<Grid minTileWidth={220}><Badge>1</Badge><Badge>2</Badge><Badge>3</Badge></Grid>)).toEqual(["Grid", "Tile"]);
  });
  it("Divider registers its rule and label", async () => {
    expect(await anatomyParts(<Divider>or</Divider>)).toEqual(["Label", "Rule"]);
  });
  it("a Divider with a control in its label's place registers the control as its label", async () => {
    expect(await anatomyParts(<Divider><Button ghost>Show more</Button></Divider>)).toEqual(["Label", "Rule"]);
  });
  it("AppFrame registers its frame, header and body", async () => {
    expect(await anatomyParts(<AppFrame header={<Typography>Workspace</Typography>}><Text>Body</Text></AppFrame>)).toEqual(["Body", "Frame", "Header"]);
  });
  it("an unlocked DashboardGrid registers its grid, first widget and its drag handle", async () => {
    const items = [
      { id: "revenue", span: 6, title: "Revenue", content: <Text>Revenue</Text> },
      { id: "signups", span: 6, title: "Signups", content: <Text>Signups</Text> },
    ];
    expect(await anatomyParts(<DashboardGrid unlocked items={items} />)).toEqual(["Drag handle", "Grid", "Widget"]);
  });
  it("Pressable registers its hit area and its content", async () => {
    expect(await anatomyParts(<Pressable accessibilityRole="button"><Typography>Pressable surface</Typography></Pressable>)).toEqual(["Content", "Hit area", "Text run"]);
  });
  it("a Pressable with a children function registers its content", async () => {
    expect(await anatomyParts(<Pressable>{() => <Icon shield />}</Pressable>)).toEqual(["Bounding box", "Content", "Glyph", "Hit area"]);
  });
});

describe("primitive reference specimens", () => {
  // Each specimen's Typography labels register their run beside the specimen's own parts.
  it("View registers the view and its first child view", async () => {
    expect(await anatomyParts(<>{referenceSpecimen(scope, "View", {})}</>)).toEqual(["Child view", "Text run", "View"]);
  });
  it("ScrollView registers its viewport and its first tile as the content", async () => {
    expect(await anatomyParts(<>{referenceSpecimen(scope, "ScrollView", { horizontal: true })}</>)).toEqual(["Content", "Text run", "Viewport"]);
  });
  it("TextInput registers the native input, and the placeholder while it shows", async () => {
    expect(await anatomyParts(<>{referenceSpecimen(scope, "TextInput", {})}</>)).toEqual(["Native input", "Placeholder"]);
    cleanup();
    expect(await anatomyParts(<>{referenceSpecimen(scope, "TextInput", { value: "Northwind" })}</>)).toEqual(["Native input"]);
  });
});
