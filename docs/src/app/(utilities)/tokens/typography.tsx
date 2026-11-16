import { Card, CodeBlock, Column, DataTable, DescriptionList, Grid, Stats, Typography } from "@nannier/canvas";
import { typeRoles } from "../../../../../src/style/type-scale";
import { Page } from "../../../ui/page";
import { PageNav } from "../../../ui/page-nav";
import { TokenH1, TokenLede, TokenSection } from "../../../ui/tokens-kit";

const SCALE = [
  { name: "Display", role: "display", use: "Hero titles. One per screen, at most." },
  { name: "H1", role: "h1", use: "Top-level page titles." },
  { name: "H2", role: "h2", use: "Major page sections, dialog titles." },
  { name: "H3", role: "h3", use: "Subsections, sheet and drawer titles." },
  { name: "H4", role: "h4", use: "In-app page titles, card titles." },
  { name: "H5", role: "h5", use: "Section and card headings, form section labels." },
  { name: "Lead", role: "lead", use: "Lead paragraphs, identity names." },
  { name: "Body", role: "body", use: "Default reading text." },
  { name: "Small", role: "small", use: "Secondary text, helpers." },
  { name: "Caption", role: "caption", use: "Supporting captions and short annotations." },
  { name: "Tiny", role: "tiny", use: "Metadata, timestamps, labels." },
] as const;

/** The scale's size, line height and weight, read from the same roles as the component. */
function specFor(role: (typeof SCALE)[number]["role"]): string {
  const spec = typeRoles[role];
  return `${spec.fontSize} / ${spec.lineHeight} · ${spec.fontWeight}`;
}

// Helpers compose the size scale with tone or a typeface. Eyebrow owns its
// uppercase transformation and tracking; a caption is regular reading text.
const HELPERS = [
  { name: "Muted", role: "muted", sample: "Sphinx of black quartz, judge my vow.", use: "De-emphasised body text." },
  { name: "Eyebrow", role: "eyebrow", sample: "Section label", use: `Uppercase mono section labels (${typeRoles.eyebrow.fontSize} / ${typeRoles.eyebrow.lineHeight} · ${typeRoles.eyebrow.fontWeight}, ${typeRoles.eyebrow.letterSpacing}px tracking).` },
  { name: "Code", role: "code", sample: "--primary", use: "Inline code, tokens, IDs (muted pill)." },
  { name: "Mono", role: "mono", sample: "01HZK7M8N9P0Q1R2", use: "Monospace values, no fill." },
] as const;

const WEIGHTS = [
  { prop: "regular", value: "400", name: "Regular", use: "Body, lead and supporting reading text." },
  { prop: "medium", value: "500", name: "Medium", use: "Display headings and interface labels." },
  { prop: "semibold", value: "600", name: "Semibold", use: "Small labels and emphasis." },
  { prop: "bold", value: "700", name: "Bold", use: "Strong emphasis when explicitly requested." },
] as const;

export default function TypographyScreen() {
  return (
    <Page>
      <Column loose>
        <Column cozy>
          <TokenH1>Typography</TokenH1>
          <TokenLede>Instrument Sans carries labels and reading text. Bricolage Grotesque carries the display role, headings h1 to h4 and stat values. JetBrains Mono carries code and identifiers. Typography exposes the type scale through boolean roles; components own the typography of their labels and choose their platform face.</TokenLede>
        </Column>

        <TokenSection title="Font families" description="Register the faces in the application and pass them to ThemeProvider fonts. The package ships no font files; the system face stands in until the configured family is available. Nested providers inherit the registered faces.">
          <Grid minTileWidth={240} columns={3} relaxed>
            <Card>
              <Typography caption>Sans serif</Typography>
              <Typography h5>Instrument Sans</Typography>
              <Typography code>--font-sans</Typography>
              <Typography>The quick brown fox jumps over the lazy dog 0123456789</Typography>
              <Typography small muted>The docs register weights 400, 500, 600 and 700.</Typography>
            </Card>
            <Card>
              <Typography caption>Display</Typography>
              <Typography h3>Bricolage Grotesque</Typography>
              <Typography code>--font-display</Typography>
              <Typography h4>The quick brown fox 0123456789</Typography>
              <Typography small muted>The docs register weights 500 and 600; without a display face the sans face stands in.</Typography>
            </Card>
            <Card>
              <Typography caption>Monospace</Typography>
              <Typography mono>JetBrains Mono</Typography>
              <Typography code>--font-mono</Typography>
              <Typography mono>{'const id = "01HZ73K"'}</Typography>
              <Typography small muted>For code, identifiers and copyable values. The docs register weights 400, 500 and 600.</Typography>
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
                <Typography small muted>{specFor(entry.role)}</Typography>
                <Typography small>{entry.use}</Typography>
              </Card>
            ))}
          </Grid>
        </TokenSection>

        <TokenSection title="Helper roles" description="Muted text, eyebrows, inline code and bare monospace values are also named roles.">
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
