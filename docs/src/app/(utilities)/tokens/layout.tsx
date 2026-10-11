import { Column, DataTable, Typography, widths, breakpoints, formFactor, type BreakpointKey } from "@nannier/canvas";
import type { DocExample } from "../../../core/scope";
import { CodeBlock } from "../../../ui/code-block";
import { Page } from "../../../ui/page";
import { PageNav } from "../../../ui/page-nav";
import { Playground } from "../../../ui/playground";
import { BulletList } from "../../../ui/prose";
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

// The form-factor tiers, read off the breakpoint scale through the kit's own picker so
// the table can never drift from what useFormFactor resolves.
const TIER_LABEL = { phone: "Phone", tablet: "Tablet", desktop: "Desktop" } as const;
const tierRows = (() => {
  const keys = Object.keys(breakpoints) as BreakpointKey[];
  const tiers: { tier: keyof typeof TIER_LABEL; buckets: string[]; widest: number }[] = [];
  for (const key of keys) {
    const tier = formFactor(breakpoints[key]);
    const last = tiers[tiers.length - 1];
    if (last?.tier === tier) {
      last.buckets.push(key);
      last.widest = breakpoints[key];
    } else tiers.push({ tier, buckets: [key], widest: breakpoints[key] });
  }
  // `base` is wider than every breakpoint, and the unknown width (a server, the frame
  // before layout) resolves to it too.
  tiers[tiers.length - 1].buckets.push("base");
  return tiers.map(({ tier, buckets }, i) => {
    const floor = i === 0 ? null : tiers[i - 1].widest;
    const range = floor === null ? `${tiers[i].widest}px and below` : i === tiers.length - 1 ? `Above ${floor}px` : `${floor + 1} to ${tiers[i].widest}px`;
    return [TIER_LABEL[tier], range, buckets.join(", ")];
  });
})();

const VIEWPORT_TIER = `import { formFactor, responsive, useFormFactor, useResponsive, type FormFactor, type Responsive } from "@nannier/canvas";

// A value per bucket, composed in app code: base is the desktop case, and a
// breakpoint entry applies at that width and below.
const columns: Responsive<number> = { base: 3, lg: 2, sm: 1 };

// Pure pickers, for a width you already have.
responsive(390, columns); // 1
formFactor(390); // "phone"

// The hooks read the window and re-render only when its bucket changes.
function AppShell() {
  const tier: FormFactor = useFormFactor(); // "phone" | "tablet" | "desktop"
  const count = useResponsive(columns);
  // ...
}`;

const OVERRIDE = `import { BreakpointOverride, Container } from "@nannier/canvas";

// A preview stage or a test: everything under it resolves the phone tier.
// Constrain the width to match, so container-measured components agree.
<BreakpointOverride value="sm">
  <Container sm>
    <Screen />
  </Container>
</BreakpointOverride>

// null clears the override, and the real window applies again.
<BreakpointOverride value={null}>
  <Screen />
</BreakpointOverride>`;

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
          <Callout label="Choose the smallest mechanism that works.">Intrinsic fill, hug and wrap need no layout state. Container measurement handles component reflow. Viewport hooks are reserved for window-level chrome: a responsive Sidebar or FilterPanel drawer, Popover's sheet on a phone, and app shells.</Callout>
          <DataTable columns={["Breakpoint", "At this width and below"]} rows={Object.entries(breakpoints).map(([name, value]) => [name, `${value}px`])} />
        </TokenSection>

        <TokenSection title="Viewport tier" description="Window-level chrome reads the viewport tier: the window's width placed in a breakpoint bucket. A bucket applies at its width and below, and a width wider than every breakpoint, or one not known yet (a server render, the frame before layout), is base, the desktop variant. Consumers re-render only when the bucket changes, never per resize pixel. useFormFactor collapses the buckets into three tiers.">
          <DataTable stacks columns={["Form factor", "Window width", "Buckets"]} rows={tierRows} />
          <Callout label="The tier is the window width.">It is the same on every platform: a narrow or zoomed desktop browser window is the phone or tablet tier, and a landscape phone is usually the tablet tier. There is no separate desktop-OS tier; a macOS or desktop web window is placed by its width like any other.</Callout>
          <CodeBlock code={VIEWPORT_TIER} />
          <Typography small muted>A server cannot measure a window, so it renders base. An app that knows it is serving a narrow client passes ThemeProvider&apos;s ssrBreakpoint (sm for a phone): the server and the hydration render use that bucket, and the real window&apos;s bucket applies right after.</Typography>
        </TokenSection>

        <TokenSection title="Simulating a tier" description="BreakpointOverride pins the viewport bucket for a subtree, so a preview stage or a test can show the phone or tablet branch inside a desktop window. The form-factor switcher in each example's stage header on the web uses it. It renders nothing of its own.">
          <CodeBlock code={OVERRIDE} />
          <BulletList small items={[
            "It pins the bucket for every useBreakpoint, useResponsive and useFormFactor reading under it, the Sidebar and FilterPanel drawer modes and Popover's phone sheet included. Menus, dialogs and toasts opened from inside it resolve it too, wherever their overlay layer sits.",
            "Components that measure their own container (DataTable, Grid, Row stacks, Tabs, Navbar) follow their real width. Constrain the subtree to the tier's width beside the override; their first frame, before they measure, already takes the simulated tier.",
            "It pins the tier, not the geometry. A drawer or a phone sheet opened under it takes its phone presentation but lays out against the real window, so a simulated phone in a desktop window opens its sheet across the desktop window.",
            "It is for previews and tests: a real app takes the tier from its window, never from an override.",
          ]} />
          <Callout label="Accessibility">BreakpointOverride adds nothing to the accessibility tree, and the names, roles and states its consumers put there survive it. Keyboard, screen reader and touch behavior is each consumer&apos;s, the same under a simulated tier as under a real one. The tier follows the window&apos;s width in CSS pixels, so zooming a desktop browser in reflows the page into the tablet or phone tier.</Callout>
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
