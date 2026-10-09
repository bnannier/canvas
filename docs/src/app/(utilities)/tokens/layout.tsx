import { Column, DataTable, Typography, widths, breakpoints } from "@nannier/canvas";
import type { DocExample } from "../../../core/scope";
import { Page } from "../../../ui/page";
import { PageNav } from "../../../ui/page-nav";
import { Playground } from "../../../ui/playground";
import { TokenH1, TokenLede, TokenSection, Callout } from "../../../ui/tokens-kit";

const directionExamples: DocExample[] = [
  {
    label: "Row",
    code: `<Row cozy alignCenter>
  <Emblem label="A" />
  <Emblem label="B" />
  <Emblem label="C" />
</Row>`,
    render: ({ Row, Emblem }) => <Row cozy alignCenter><Emblem label="A" /><Emblem label="B" /><Emblem label="C" /></Row>,
  },
  {
    label: "Column",
    code: `<Column snug>
  <Card compact><Typography>First item</Typography></Card>
  <Card compact><Typography>Second item</Typography></Card>
</Column>`,
    render: ({ Column, Card, Typography }) => <Column snug><Card compact><Typography>First item</Typography></Card><Card compact><Typography>Second item</Typography></Card></Column>,
  },
];

const alignmentExamples: DocExample[] = [
  {
    label: "Space between",
    code: `<Row between alignCenter>
  <Emblem label="A" />
  <Emblem label="B" />
  <Emblem label="C" />
</Row>`,
    render: ({ Row, Emblem }) => <Row between alignCenter><Emblem label="A" /><Emblem label="B" /><Emblem label="C" /></Row>,
  },
  {
    label: "Centered",
    code: `<Row center snug>
  <Emblem label="A" />
  <Emblem label="B" />
</Row>`,
    render: ({ Row, Emblem }) => <Row center snug><Emblem label="A" /><Emblem label="B" /></Row>,
  },
];

const sizingExamples: DocExample[] = [
  {
    label: "Fill and hug",
    code: `<Row snug alignCenter>
  <Input label="Search" placeholder="Find a project" />
  <Badge status success>Connected</Badge>
</Row>`,
    render: ({ Row, Input, Badge }) => <Row snug alignCenter><Input label="Search" placeholder="Find a project" /><Badge status success>Connected</Badge></Row>,
  },
  {
    label: "Measure",
    code: `<Container sm start>
  <Card>
    <Typography medium>Account details</Typography>
    <Input label="Display name" defaultValue="Ada Lovelace" />
  </Card>
</Container>`,
    render: ({ Container, Card, Typography, Input }) => <Container sm start><Card><Typography medium>Account details</Typography><Input label="Display name" defaultValue="Ada Lovelace" /></Card></Container>,
  },
  {
    label: "Spans",
    code: `<Row stacks>
  <Column span={8}>
    <Card><Typography>Main content</Typography></Card>
  </Column>
  <Column span={4}>
    <Card><Typography>Details</Typography></Card>
  </Column>
</Row>`,
    render: ({ Row, Column, Card, Typography }) => <Row stacks><Column span={8}><Card><Typography>Main content</Typography></Card></Column><Column span={4}><Card><Typography>Details</Typography></Card></Column></Row>,
  },
];

const responsiveExamples: DocExample[] = [
  {
    label: "Wrapping grid",
    code: `<Grid minTileWidth={220} columns={3} relaxed>
  <Card><Typography>Overview</Typography></Card>
  <Card><Typography>Activity</Typography></Card>
  <Card><Typography>Members</Typography></Card>
</Grid>`,
    render: ({ Grid, Card, Typography }) => <Grid minTileWidth={220} columns={3} relaxed><Card><Typography>Overview</Typography></Card><Card><Typography>Activity</Typography></Card><Card><Typography>Members</Typography></Card></Grid>,
  },
  {
    label: "Stacking row",
    code: `<Row stacks stackBreakpoint="md" relaxed>
  <Column span={6}>
    <Input label="City" placeholder="Toronto" />
  </Column>
  <Column span={6}>
    <Input label="Country" placeholder="Canada" />
  </Column>
</Row>`,
    render: ({ Row, Column, Input }) => <Row stacks stackBreakpoint="md" relaxed><Column span={6}><Input label="City" placeholder="Toronto" /></Column><Column span={6}><Input label="Country" placeholder="Canada" /></Column></Row>,
  },
];

export default function LayoutScreen() {
  return (
    <Page>
      <Column loose>
        <Column cozy>
          <TokenH1>Layout & flexbox</TokenH1>
          <TokenLede>
            Compose Canvas with Row, Column, Container and Grid. Their semantic props express direction,
            spacing, alignment and bounds using the same React Native layout on iOS, Android and the web.
          </TokenLede>
          <Callout label="The parent provides the bounds.">Fields and cards fill the space their parent gives them. Buttons and badges hug their content. A Container measure caps a group without fixing its width.</Callout>
        </Column>

        <TokenSection title="Direction" description="Row arranges siblings horizontally; Column stacks them vertically. Choose a gap with flush, tight, snug, cozy, relaxed or loose.">
          <Playground examples={directionExamples} stageAlign="start" />
        </TokenSection>

        <TokenSection title="Alignment" description="center, between and the other distribution props act along the layout's main axis. alignCenter, alignStart, alignEnd and baseline act across it. The example fills its parent, so space-between has real bounds to distribute.">
          <Playground examples={alignmentExamples} stageAlign="start" />
        </TokenSection>

        <TokenSection title="Sizing" description="A fill component beside a hugging sibling takes the remaining room. Use Container for a shared measure and span on a Row's direct children for proportional columns; the Row includes its gaps in the calculation.">
          <Playground examples={sizingExamples} stageAlign="start" />
          <DataTable columns={["Container step", "Maximum width"]} rows={Object.entries(widths).map(([step, value]) => [step, `${value}px`])} />
          <Typography small muted>A named measure centers by default. Add start to pin it to the leading edge. Input and other measure-aware controls accept these same step booleans directly.</Typography>
        </TokenSection>

        <TokenSection title="Responsive layout" description="Start with the desktop composition. Grid measures its own container to choose how many tiles fit. Row stacks changes direction at its own container breakpoint, preserving mounted controls, field values and focus.">
          <Playground examples={responsiveExamples} stageAlign="start" />
          <Callout label="Choose the smallest mechanism that works.">Intrinsic fill, hug and wrap need no layout state. Container measurement handles component reflow. Viewport hooks are reserved for window-level chrome such as a responsive Sidebar or FilterPanel drawer.</Callout>
          <DataTable columns={["Breakpoint", "At this width and below"]} rows={Object.entries(breakpoints).map(([name, value]) => [name, `${value}px`])} />
        </TokenSection>

        <TokenSection title="Composition reference">
          <DataTable columns={["Job", "Canvas API"]} rows={[
            ["A reading or form measure", "Container sm; add start for leading alignment"],
            ["Two columns that stack", "Row stacks with two Column span={6} children"],
            ["Equal tiles that reflow", "Grid minTileWidth={220} columns={3}"],
            ["Content that can wrap", "Row wrap"],
            ["A child that takes spare space", "Column fill"],
            ["Copy that may shrink and wrap", "Column shrink"],
            ["Insets around a group", "Column padTight, pad or padLoose"],
          ]} />
        </TokenSection>
        <PageNav />
      </Column>
    </Page>
  );
}
