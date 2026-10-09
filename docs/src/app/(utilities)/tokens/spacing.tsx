import { Column, DataTable, Grid, Card, Emblem, Icon, Avatar, Badge, Row, Typography, radius, shape, spacing, shadow, useTheme } from "@nannier/canvas";
import { Page } from "../../../ui/page";
import { PageNav } from "../../../ui/page-nav";
import { Playground } from "../../../ui/playground";
import type { DocExample } from "../../../core/scope";
import { TokenH1, TokenLede, TokenSection } from "../../../ui/tokens-kit";

const GAPS = [
  { prop: "flush", step: "0" }, { prop: "tight", step: "1" },
  { prop: "snug", step: "2" }, { prop: "cozy", step: "3" },
  { prop: "relaxed", step: "4" }, { prop: "loose", step: "6" },
] as const;
const PADDING = [
  { prop: "padTight", step: "2" }, { prop: "pad", step: "4" }, { prop: "padLoose", step: "6" },
] as const;
const SHADOW_LEVELS = ["none", "sm", "DEFAULT", "md", "lg", "xl"] as const;

const gapExamples: DocExample[] = GAPS.map(({ prop, step }) => ({
  label: `${prop} · ${spacing[step]}px`,
  code: `<Row ${prop} alignCenter>
  <Emblem label="A" />
  <Emblem label="B" />
  <Emblem label="C" />
</Row>`,
  render: ({ Row, Emblem }) => <Row {...{ [prop]: true }} alignCenter><Emblem label="A" /><Emblem label="B" /><Emblem label="C" /></Row>,
}));

const paddingExamples: DocExample[] = PADDING.map(({ prop, step }) => ({
  label: `${prop} · ${spacing[step]}px`,
  code: `<Card flush>
  <Column ${prop} snug>
    <Typography medium>Workspace</Typography>
    <Typography small>One inset around the whole group.</Typography>
  </Column>
</Card>`,
  render: ({ Card, Column, Typography }) => <Card flush><Column {...{ [prop]: true }} snug><Typography medium>Workspace</Typography><Typography small>One inset around the whole group.</Typography></Column></Card>,
}));

const elevationExamples: DocExample[] = [
  { label: "Flat", code: `<Card flat><Typography>Flat surface</Typography></Card>`, render: ({ Card, Typography }) => <Card flat><Typography>Flat surface</Typography></Card> },
  { label: "Default", code: `<Card><Typography>Default surface</Typography></Card>`, render: ({ Card, Typography }) => <Card><Typography>Default surface</Typography></Card> },
  { label: "Raised", code: `<Card raised><Typography>Raised surface</Typography></Card>`, render: ({ Card, Typography }) => <Card raised><Typography>Raised surface</Typography></Card> },
];

const layerExamples: DocExample[] = [{
  label: "Anchored overlay",
  code: `<Column relaxed>
  <Popover trigger="Open layer" title="A floating surface" description="The kit positions this panel above the content." actionLabel="Close" />
  <Card><Typography>Content beneath the overlay</Typography></Card>
</Column>`,
  render: ({ Column, Popover, Card, Typography }) => <Column relaxed><Popover trigger="Open layer" title="A floating surface" description="The kit positions this panel above the content." actionLabel="Close" /><Card><Typography>Content beneath the overlay</Typography></Card></Column>,
}];

const densityExamples: DocExample[] = [
  {
    label: "compact",
    code: `<Container xxs start>
  <Card compact>
    <Column tight>
      <Typography lead semibold>Storage</Typography>
      <Typography small muted>84% of 512 GB used.</Typography>
    </Column>
  </Card>
</Container>`,
    render: (scope) => {
      const { Card, Column, Container, Typography } = scope;
      return (
        <Container xxs start>
          <Card compact>
            <Column tight>
              <Typography lead semibold>Storage</Typography>
              <Typography small muted>84% of 512 GB used.</Typography>
            </Column>
          </Card>
        </Container>
      );
    },
  },
  {
    label: "default",
    code: `<Container xxs start>
  <Card>
    <Column tight>
      <Typography lead semibold>Storage</Typography>
      <Typography small muted>84% of 512 GB used.</Typography>
    </Column>
  </Card>
</Container>`,
    render: (scope) => {
      const { Card, Column, Container, Typography } = scope;
      return (
        <Container xxs start>
          <Card>
            <Column tight>
              <Typography lead semibold>Storage</Typography>
              <Typography small muted>84% of 512 GB used.</Typography>
            </Column>
          </Card>
        </Container>
      );
    },
  },
  {
    label: "comfortable",
    code: `<Container xxs start>
  <Card comfortable>
    <Column tight>
      <Typography lead semibold>Storage</Typography>
      <Typography small muted>84% of 512 GB used.</Typography>
    </Column>
  </Card>
</Container>`,
    render: (scope) => {
      const { Card, Column, Container, Typography } = scope;
      return (
        <Container xxs start>
          <Card comfortable>
            <Column tight>
              <Typography lead semibold>Storage</Typography>
              <Typography small muted>84% of 512 GB used.</Typography>
            </Column>
          </Card>
        </Container>
      );
    },
  },
];

export default function SpacingScreen() {
  const { tokens } = useTheme();
  return (
    <Page>
      <Column loose>
        <Column cozy>
          <TokenH1>Spacing & Shape</TokenH1>
          <TokenLede>Semantic layout props choose spacing; components own their shape and elevation. The token tables below expose the underlying values for reference, while the examples use the same public APIs as an application.</TokenLede>
        </Column>

        <TokenSection title="Gap" description="Row and Column share a six-step gap axis. snug is the default. Switch the example to compare the space between real components.">
          <Playground examples={gapExamples} />
          <DataTable columns={["Prop", "Spacing token", "Gap"]} rows={GAPS.map(({ prop, step }) => [prop, step, `${spacing[step]}px`])} />
        </TokenSection>

        <TokenSection title="Padding" description="padTight, pad and padLoose inset a layout group. A normal Card already owns its inset; flush removes that inset when a child layout must provide it.">
          <Playground examples={paddingExamples} stageAlign="start" />
        </TokenSection>

        <TokenSection title="Spacing reference" description="The shared numeric scale includes the hairline and half steps alongside the 4px progression. Components and layout primitives map their semantic props onto this scale.">
          <DataTable columns={["Token", "Value"]} rows={Object.entries(spacing).sort((a, b) => a[1] - b[1]).map(([name, value]) => [name, `${value}px`])} />
        </TokenSection>

        <TokenSection title="Radius and shape" description="The radius ladder is a reference for component skins. Use a component's supported shape prop at a call site, such as Emblem circle; other components choose their shape for their own role and platform.">
          <Grid minTileWidth={280} columns={2} relaxed>
            <DataTable columns={["Radius", "Value"]} rows={Object.entries(radius).map(([name, value]) => [name, `${value}px`])} />
            <Card>
              <Typography h3>Shapes in use</Typography>
              <Row snug alignCenter wrap><Emblem><Icon shield /></Emblem><Emblem circle><Icon shield /></Emblem><Avatar name="Ada Lovelace" /><Badge>Member</Badge></Row>
              <Typography small muted>These are Emblem, Avatar and Badge, with their own shapes and materials.</Typography>
            </Card>
          </Grid>
          <DataTable columns={["Shape token", "Web", "iOS", "Android"]} rows={Object.keys(shape.web).map((key) => {
            const role = key as keyof typeof shape.web;
            return [key, String(shape.web[role]), String(shape.ios[role]), String(shape.android[role])];
          })} />
          <Typography small muted>The shape table records platform token values. Each component selects the platform shape only when that platform defines a control for its job; other native skins use the web shape.</Typography>
        </TokenSection>

        <TokenSection title="Elevation" description="Card exposes flat, default and raised appearances. These examples use those appearances directly; the reference lists the shadow helper's output on the running platform in the active theme.">
          <Playground examples={elevationExamples} />
          <DataTable columns={["Preset", "Resolved shadow"]} rows={SHADOW_LEVELS.map((level) => [level, JSON.stringify(shadow(level, tokens))])} />
        </TokenSection>

        <TokenSection title="Layering" description="Floating components own their placement and stacking. Open the Popover to see the real overlay above its sibling Card.">
          <Playground examples={layerExamples} />
          <DataTable columns={["Reserve", "Owner"]} rows={[["10", "Local component layers"], ["50", "Floating overlays"], ["900", "Drag layer"], ["1000", "Portal outlet"]]} />
        </TokenSection>

        <TokenSection title="Component density" description="compact and comfortable adjust a component's own metrics. Omit both for its regular density. There is no global padding override: the same props are resolved by each component's skin.">
          <Playground examples={densityExamples} />
        </TokenSection>
        <PageNav />
      </Column>
    </Page>
  );
}
