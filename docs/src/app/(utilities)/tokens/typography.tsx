import { Card, CodeBlock, Column, DataTable, DescriptionList, Grid, Stats, Typography } from "@nannier/canvas";
import { Page } from "../../../ui/page";
import { PageNav } from "../../../ui/page-nav";
import { TokenH1, TokenLede, TokenSection } from "../../../ui/tokens-kit";

const SCALE = [
  { name: "Display", role: "display", spec: "24 / 27 · bold", use: "Hero titles. One per screen, at most." },
  { name: "H1", role: "h1", spec: "20 / 25 · bold", use: "Top-level page titles." },
  { name: "H2", role: "h2", spec: "17 / 22 · bold", use: "Major page sections, dialog titles." },
  { name: "H3", role: "h3", spec: "16 / 20 · bold", use: "Subsections, sheet and drawer titles." },
  { name: "H4", role: "h4", spec: "15 / 20 · bold", use: "In-app page titles, card titles." },
  { name: "H5", role: "h5", spec: "14 / 19 · bold", use: "Section and card headings, form section labels." },
  { name: "Lead", role: "lead", spec: "14 / 21 · medium", use: "Lead paragraphs, identity names." },
  { name: "Body", role: "body", spec: "12.5 / 19 · medium", use: "Default reading text." },
  { name: "Small", role: "small", spec: "11.5 / 17 · semibold · muted", muted: true, use: "Secondary text, helpers." },
  { name: "Tiny", role: "tiny", spec: "11 / 15 · semibold · muted", muted: true, use: "Metadata, timestamps, labels." },
] as const;

// Helper roles beyond the size scale, also boolean props on Typography: a muted
// body, an uppercase caption/eyebrow, and two monospace roles (code carries the
// muted pill fill; mono is bare). Rendered with the real component as well.
const HELPERS = [
  { name: "Muted", role: "muted", sample: "Sphinx of black quartz, judge my vow.", use: "De-emphasised body text." },
  { name: "Caption", role: "caption", sample: "Section label", use: "Eyebrows, uppercase section labels (10/13 bold, 16% tracking)." },
  { name: "Code", role: "code", sample: "--primary", use: "Inline code, tokens, IDs (muted pill)." },
  { name: "Mono", role: "mono", sample: "01HZK7M8N9P0Q1R2", use: "Monospace values, no fill." },
] as const;

const WEIGHTS = [
  { prop: "regular", value: "400", name: "Regular", use: "An explicit lighter reading weight." },
  { prop: "medium", value: "500", name: "Medium", use: "Body and lead copy, button labels." },
  { prop: "semibold", value: "600", name: "Semibold", use: "Small labels and emphasis." },
  { prop: "bold", value: "700", name: "Bold", use: "Titles and strong emphasis." },
] as const;

export default function TypographyScreen() {
  return (
    <Page>
      <Column loose>
        <Column cozy>
          <TokenH1>Typography</TokenH1>
          <TokenLede>Manrope carries the titles, labels and reading text. Geist Mono carries code and identifiers. Typography exposes the type scale through boolean roles; components own the typography of their labels.</TokenLede>
        </Column>

        <TokenSection title="Font families" description="Register the faces in the application and pass them to ThemeProvider fonts. The package ships no font files; the system face stands in until the configured family is available. Nested providers inherit the registered faces.">
          <Grid minTileWidth={280} columns={2} relaxed>
            <Card>
              <Typography caption>Sans serif</Typography>
              <Typography display>Manrope</Typography>
              <Typography code>--font-sans</Typography>
              <Typography>The quick brown fox jumps over the lazy dog 0123456789</Typography>
              <Typography small muted>The docs register weights 400, 500, 600, 700 and 800.</Typography>
            </Card>
            <Card>
              <Typography caption>Monospace</Typography>
              <Typography mono>Geist Mono</Typography>
              <Typography code>--font-mono</Typography>
              <Typography mono>{'const id = "01HZ73K"'}</Typography>
              <Typography small muted>For code, identifiers and copyable values.</Typography>
            </Card>
          </Grid>
        </TokenSection>

        <TokenSection title="Type scale" description="Each sample uses the real Typography role. Pick one role per element, such as h2 or body; the role owns its size, leading and default weight.">
          <Grid minTileWidth={300} columns={2} relaxed>
            {SCALE.map((entry) => (
              <Card key={entry.role}>
                <Typography caption>{entry.name}</Typography>
                <Typography {...{ [entry.role]: true }}>Sphinx of black quartz, judge my vow.</Typography>
                <Typography code>{`<Typography ${entry.role}>`}</Typography>
                <Typography small muted>{entry.spec}</Typography>
                <Typography small>{entry.use}</Typography>
              </Card>
            ))}
          </Grid>
        </TokenSection>

        <TokenSection title="Helper roles" description="Muted text, captions, inline code and bare monospace values are also named roles.">
          <Grid minTileWidth={280} columns={2} relaxed>
            {HELPERS.map((entry) => (
              <Card key={entry.role}>
                <Typography caption>{entry.name}</Typography>
                <Typography {...{ [entry.role]: true }}>{entry.sample}</Typography>
                <Typography code>{`<Typography ${entry.role}>`}</Typography>
                <Typography small>{entry.use}</Typography>
              </Card>
            ))}
          </Grid>
        </TokenSection>

        <TokenSection title="Weights" description="Weight is an independent boolean axis. The four public weight props below combine with any role. A component such as Stats may use another registered weight in its own skin; that does not add a Typography prop.">
          <DataTable columns={["Prop", "Weight", "Sample", "Use"]} rows={WEIGHTS.map((entry) => [
            entry.prop,
            entry.value,
            <Typography key={entry.prop} {...{ [entry.prop]: true }}>{entry.name}</Typography>,
            entry.use,
          ])} />
        </TokenSection>

        <TokenSection title="Patterns in use" description="Use the component that owns the content instead of rebuilding its label or value typography around it.">
          <Grid minTileWidth={280} columns={2} relaxed>
            <Card>
              <Typography caption>Page header</Typography>
              <Typography h1>Identities</Typography>
              <Typography lead subtle>Manage the people in your workspace.</Typography>
            </Card>
            <Stats items={[{ label: "Active sessions", value: "1,204", delta: "+18 today" }]} />
            <DescriptionList items={[
              { term: "Identifier", value: "rachel.chen@example.com" },
              { term: "ID", value: "01HZK7M8N9P0Q1R2" },
            ]} />
            <Card>
              <Typography caption>Inline code</Typography>
              <Typography>The <Typography code>primary</Typography> role identifies selection and links. Primary buttons read the action role.</Typography>
              <CodeBlock code={'<Typography>Read <Typography code>primary</Typography></Typography>'} />
            </Card>
          </Grid>
        </TokenSection>
        <PageNav />
      </Column>
    </Page>
  );
}
