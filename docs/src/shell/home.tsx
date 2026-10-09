import { type ReactNode } from "react";
import { Linking } from "react-native";
import { Button, Row, Column, Icon, useTheme, useFormFactor, Typography, Badge, Card, Grid, Container, Divider } from "@nannier/canvas";
import { useRouter } from "expo-router";
import { COMPONENTS } from "../core/data/components";
import { CanvasMark } from "../brand/canvas-mark";
import { Github } from "../brand/brand-logos";
import { ThreeLooksRotator, LOOKS_AVAILABLE } from "./three-looks-rotator";
import { CodeBlock } from "../ui/code-block";
import { Page } from "../ui/page";
import { useLatestVersion } from "../ui/use-latest-version";

const REPO_URL = "https://github.com/bnannier/canvas";
const NPM_URL = "https://www.npmjs.com/package/@nannier/canvas";
const PLATFORMS = ["iOS", "Android", "Web", "React Native Web"];

const INSTALL_BASH = "bun add @nannier/canvas";
const INSTALL_TSX = [
  'import "@nannier/canvas/styles/canvas.css";',
  'import { Button } from "@nannier/canvas";',
  "",
  "// The prop name is the value: <Button primary large />",
  "<Button primary large>Save changes</Button>",
  "<Button destructive>Delete</Button>",
  "<Button ghost small>Cancel</Button>",
].join("\n");

const PRINCIPLES = [
  {
    title: "Universal React Native",
    body: "One codebase, one component API, every platform. Canvas renders natively on iOS and Android, and on the web through React Native Web. Write a screen once and ship it everywhere, with no per-platform forks to maintain.",
  },
  {
    title: "Responsive, desktop-first",
    body: "Every component is highly responsive by default, authored desktop-first: size for the desktop case, then add the variants that scale it down to tablet and phone. The smallest matching breakpoint wins.",
  },
  {
    title: "Semantic UI",
    body: "Change a component's style with flat boolean props. Each choice is its own prop, named for its meaning, so the prop name is the value. You write <Button primary large>, never variant=\"primary\". It reads like a sentence.",
  },
  {
    title: "Tokens, themes, density",
    body: "Built with atomic design and driven by design tokens: light and dark schemes, a glass surface mode, and density controls. Theming is a token change, not a rewrite, so the boolean props stay your only API.",
  },
];

const ATOMIC_LEVELS: { id: string; label: string; icon: ReactNode; blurb: string; pages: { label: string; to: string }[] }[] = [
  {
    id: "tokens", label: "Tokens", icon: <Icon layers primary size={16} />,
    blurb: "The lowest-level decisions: color schemes (light and dark), typography, spacing, radii, and density. Every component derives from these tokens, so theming is a token change, not a rewrite.",
    pages: [{ label: "Colors & Theme", to: "/tokens/colors" }, { label: "Theming", to: "/theming" }],
  },
  {
    id: "atoms", label: "Atoms", icon: <Icon plus primary size={16} />,
    blurb: "Indivisible building blocks like Button, Input, Badge, Icon, and Avatar. One job each, styled entirely through semantic boolean props, every state identical on native and web.",
    pages: [
      { label: "Buttons", to: "/components/button" }, { label: "Inputs", to: "/components/input" },
      { label: "Badges", to: "/components/badge" }, { label: "Avatars", to: "/components/avatar" },
    ],
  },
  {
    id: "molecules", label: "Molecules", icon: <Icon shield primary size={16} />,
    blurb: "Small compositions of atoms with a single clear purpose: Card, Description List, Empty State. Reusable across pages and built from the same boolean prop API.",
    pages: [
      { label: "Cards", to: "/components/card" }, { label: "Description Lists", to: "/components/description-lists" },
      { label: "Empty States", to: "/components/empty-state" },
    ],
  },
  {
    id: "organisms", label: "Organisms", icon: <Icon appWindow primary size={16} />,
    blurb: "Self-contained sections of a screen: Data Table, Sidebar, Dialog, Tabs. The larger pieces that adapt desktop-first down to phone and assemble into product surfaces.",
    pages: [
      { label: "Data Tables", to: "/components/data-table" }, { label: "Sidebar", to: "/components/sidebar" },
      { label: "Dialog", to: "/components/dialog" }, { label: "Tabs", to: "/components/tabs" },
    ],
  },
  {
    id: "charts", label: "Charts", icon: <Icon chartLine primary size={16} />,
    blurb: "The data-viz tier: bars, lines, areas, pies, scatter, and the trading set (candlesticks, depth, price lines), all token-themed with a colorblind-validated series palette and scrub-to-inspect.",
    pages: [
      { label: "LineChart", to: "/components/line-chart" }, { label: "Candlestick", to: "/components/candlestick-chart" },
      { label: "PieChart", to: "/components/pie-chart" }, { label: "DepthChart", to: "/components/depth-chart" },
    ],
  },
  {
    id: "templates", label: "Templates", icon: <Icon home primary size={16} />,
    blurb: "Full screen compositions showing how atoms, molecules, and organisms assemble into real product surfaces, from a dashboard to a sign-in flow.",
    pages: [
      { label: "Dashboard", to: "/templates/dashboard" }, { label: "Sign In", to: "/templates/signin" },
      { label: "Settings", to: "/templates/settings" },
    ],
  },
  {
    id: "patterns", label: "Patterns", icon: <Icon check primary size={16} />,
    blurb: "Cross-cutting treatments that span many components: responsive layout, glass surfaces, density, loading, form validation, and accessibility.",
    pages: [
      { label: "Responsive", to: "/patterns/responsive" }, { label: "Glass", to: "/patterns/glass" },
      { label: "Density", to: "/patterns/density" },
    ],
  },
];

const FOOTER_COLS: { head: string; links: { label: string; to?: string; url?: string }[] }[] = [
  { head: "Components", links: [
    { label: "Buttons", to: "/components/button" }, { label: "Cards", to: "/components/card" },
    { label: "Data Tables", to: "/components/data-table" }, { label: "Dialog", to: "/components/dialog" },
  ] },
  { head: "Foundations", links: [
    { label: "Tokens", to: "/tokens/colors" }, { label: "Theming", to: "/theming" },
    { label: "Responsive", to: "/patterns/responsive" }, { label: "Integration", to: "/integration" },
  ] },
  { head: "Project", links: [
    { label: "GitHub", url: REPO_URL }, { label: "npm", url: NPM_URL },
  ] },
];

function SectionHead({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return <Column snug>
    <Typography caption primary semibold>{eyebrow}</Typography>
    <Typography h2>{title}</Typography>
    <Container xxl start><Typography subtle>{desc}</Typography></Container>
  </Column>;
}

export function Home() {
  const { tokens } = useTheme();
  const router = useRouter();
  const go = (to: string) => router.push(to as never);
  const version = useLatestVersion();
  const formFactor = useFormFactor();
  const showThreeLooks = LOOKS_AVAILABLE && formFactor === "desktop";
  return <Page>
    <Column loose>
      <Row snug wrap alignCenter>
        <Badge success>{version}</Badge>
        <Button link small href={NPM_URL} onPress={() => Linking.openURL(NPM_URL)}>@nannier/canvas</Button>
      </Row>
      <Typography h1>One codebase. Every platform. One component API.</Typography>
      <Container xxl start><Typography lead subtle>Canvas is a universal React Native UI kit. The same components render natively on iOS and Android and on the web through React Native Web, styled with flat, semantic boolean props that read like a sentence.</Typography></Container>
      <Row snug wrap alignCenter>
        <Typography code>{"<Button primary large block>"}</Typography>
        <Typography small subtle>The prop name is the value.</Typography>
      </Row>
      <Row cozy wrap>
        <Button primary large href="/components/button" iconRight={<Icon arrowRight primaryForeground />} onPress={() => go("/components/button")}>Browse components</Button>
        <Button outline large href="/tokens/colors" onPress={() => go("/tokens/colors")}>Explore tokens</Button>
      </Row>
      <Row relaxed wrap>{PLATFORMS.map(p => <Row tight alignCenter key={p}><Icon check primary /><Typography small>{p}</Typography></Row>)}</Row>
    </Column>
    {showThreeLooks ? <Column relaxed>
      <SectionHead eyebrow="Platform-adaptive" title="One component API. Three native looks." desc="Real captures from the iPhone simulator, Pixel emulator, and browser. Platform controls keep their native shape; the rest share the Dark Factory look." />
      <ThreeLooksRotator />
    </Column> : null}
    <Divider />
    <Column relaxed>
      <SectionHead eyebrow="The system" title="Four principles, one API." desc="The rules every component follows, from the smallest atom to a full template." />
      <Grid columns={2} minTileWidth={320} relaxed>{PRINCIPLES.map(p => <Card key={p.title} title={p.title}><Typography subtle>{p.body}</Typography></Card>)}</Grid>
    </Column>
    <Column relaxed>
      <SectionHead eyebrow="Quick start" title="Install. Import. Build." desc="Use semantic props and the kit's layout components to assemble your first screen." />
      <CodeBlock code={INSTALL_BASH} language="bash" />
      <CodeBlock code={INSTALL_TSX} />
      <Button link href="/integration" onPress={() => go("/integration")}>Read the integration guide</Button>
    </Column>
    <Column relaxed>
      <SectionHead eyebrow="Atomic design" title="A system from tokens to templates." desc={`Explore all ${COMPONENTS.length} component references, live examples, and complete screen templates.`} />
      {ATOMIC_LEVELS.map((lvl) => <Card key={lvl.id} title={lvl.label} icon={lvl.icon}>
        <Column relaxed>
          <Typography subtle>{lvl.blurb}</Typography>
          <Row snug wrap>{lvl.pages.map(pg => <Button key={pg.to} outline small href={pg.to} onPress={() => go(pg.to)} iconRight={<Icon chevronRight />}>{pg.label}</Button>)}</Row>
        </Column>
      </Card>)}
    </Column>
    <Card raised title="Build your first screen." description="Browse every component live, copy the JSX, and ship it to iOS, Android, and web.">
      <Row cozy wrap>
        <Button primary href="/components" onPress={() => go("/components")}>Browse components</Button>
        <Button outline href={REPO_URL} onPress={() => Linking.openURL(REPO_URL)} iconLeft={<Github size={16} color={tokens.foreground} />}>View on GitHub</Button>
      </Row>
    </Card>
    <Divider />
    <Column loose>
      <Button ghost href="/" onPress={() => go("/")} iconLeft={<CanvasMark size={26} />}>Canvas design system</Button>
      <Typography subtle>A universal React Native UI kit. Native iOS and Android, plus web.</Typography>
      <Grid columns={3} minTileWidth={192} relaxed>{FOOTER_COLS.map(col => <Column snug key={col.head}>
        <Typography h3>{col.head}</Typography>
        {col.links.map(l => <Button link small key={l.label} href={l.url ?? l.to} onPress={() => l.url ? Linking.openURL(l.url) : go(l.to!)}>{l.label}</Button>)}
      </Column>)}</Grid>
      <Typography tiny subtle>© 2026 Canvas · @nannier/canvas {version}</Typography>
    </Column>
  </Page>;
}
