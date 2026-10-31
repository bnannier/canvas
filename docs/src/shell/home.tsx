import { useRef, useState, type ReactNode } from "react";
import { Linking, type View as NativeView, type ViewStyle, type TextStyle } from "react-native";
import {
  Button,
  Card,
  Column,
  Container,
  Divider,
  Grid,
  Row,
  Pressable,
  Typography,
  Text,
  View,
  useTheme,
} from "@nannier/canvas";
import { useRouter } from "expo-router";
import { COMPONENTS } from "../core/data/components";
import { getAllTemplates } from "../core/data/templates";
import { AuroraFrame } from "../brand/glow";
import { GradientText } from "../brand/gradient-text";
import { HeroCollage } from "../brand/hero-collage";
import { HeroEntrance, HeroPulse } from "../brand/hero-motion";
import { LibraryAction } from "../brand/library-action";
import { alpha } from "../../../src/style/color";
import { useHeroPanels } from "../brand/hero-panels";
import { HERO_GRID } from "../brand/library-hero-look";
import type { Tier } from "../data/tiers";
import {
  INDEX_COPY,
  LIBRARY_HEADLINE,
  LIBRARY_HERO,
  LIBRARY_INDEX,
  PRINCIPLES,
  SUB_COMPONENTS,
  SUB_COMPONENTS_HEADING,
  SUB_COMPONENT_COUNT,
  TEMPLATES_CALL,
  TIER_LEGEND,
  heroStats,
  tierLetter,
} from "../data/library";
import { Page } from "../ui/page";

// The docs home: the v4 hand-off's Library page (`Canvas v4.0.0 Library.dc.html`): the hero
// (the eyebrow, the "Light as material." headline, the paragraph, two calls, the stats row
// and the collage of live kit components over the aurora), the four direction cards, the
// Index of the eight rooms with each component's tier, the tier legend, the sub-components
// card and the templates call. The copy and the index are docs/src/data/library.ts; the
// gradient word, the glows and the collage are the brand illustrations in docs/src/brand,
// judged against the `v4-library-hero` card (tools/native/liquid-motion.md). The hand-off's
// sections sit 48 px in from the window; the page frame gives 24 of it and the Container
// here the other 24.
//
// The old home's three-looks rotator (./three-looks-rotator.tsx and its captures) is no
// longer mounted; it stays in the tree for a later decision.

/** The design version being previewed; publication is still handled by the release workflow. */
const VERSION = "4.0.0";

/** The index's 16 px letter key, separate from the public Badge variants. */
function TierTag({ tier }: { tier: Tier }) {
  const { tokens: t } = useTheme();
  const [backgroundColor, color] = {
    atom: [t.secondary, t["muted-foreground"]],
    molecule: [t["primary-soft"], t["primary-text"]],
    organism: [alpha(t["chart-2"], 0.18), t["chart-2"]],
    chart: [alpha(t["chart-3"], 0.18), t["chart-3"]],
    primitive: [t["surface-sunken"], t["subtle-foreground"]],
  }[tier];
  return <View style={{ width: 16, height: 16, borderRadius: 5, alignItems: "center", justifyContent: "center", flexShrink: 0, backgroundColor }}>
    <Typography mono style={{ fontSize: 9, lineHeight: 9, fontWeight: "600", color }}>{tierLetter(tier)}</Typography>
  </View>;
}

export function LibraryHero() {
  const router = useRouter();
  const { headline, primary, secondary } = LIBRARY_HERO;
  const headlineBox = useRef<NativeView>(null);
  const panels = useHeroPanels();
  const { tokens } = useTheme();
  return (
    <AuroraFrame testID="library-hero">
      <Grid minTileWidth={HERO_GRID.minTileWidth} columns={2} broad>
        <HeroEntrance><Column panel center fill>
          <Row comfortable alignCenter>
            <HeroPulse />
            <Typography eyebrowLg subtle>{LIBRARY_HERO.eyebrow(VERSION)}</Typography>
          </Row>
          <View ref={headlineBox}>
            <Typography hero accessibilityLabel={LIBRARY_HEADLINE}>
              {`${headline.plain} `}
              <GradientText anchor={headlineBox} testID="library-headline-accent">{headline.accent}</GradientText>
            </Typography>
          </View>
          <Container xxl start>
            <Typography lead subtle>{LIBRARY_HERO.body}</Typography>
          </Container>
          <Row cozy wrap alignCenter>
            <LibraryAction
              primary
              large
              raised
              href={primary.href}
              onPress={(event) => {
                event?.preventDefault?.();
                router.push(primary.href as never);
              }}
              iconRight={<Text style={{ fontSize: 15, lineHeight: 15, color: tokens["primary-foreground"] }}>→</Text>}
            >
              {primary.label}
            </LibraryAction>
            <LibraryAction outline large href={secondary.url} external onPress={() => Linking.openURL(secondary.url)} iconRight={<Text style={{ fontSize: 13, lineHeight: 13, color: tokens["muted-foreground"] }}>↗</Text>}>
              {secondary.label}
            </LibraryAction>
          </Row>
          <Row loose wrap rowsSnug>
            {heroStats(COMPONENTS.length).map((stat) => <Typography key={stat} caption mono muted singleLeading>{stat}</Typography>)}
          </Row>
        </Column></HeroEntrance>
        <HeroCollage testID="library-collage" panels={panels} />
      </Grid>
    </AuroraFrame>
  );
}

function Principles() {
  return (
    <Grid minTileWidth={260} spacious>
      {PRINCIPLES.map((principle) => (
        <Card key={principle.num} cozy style={{ padding: 24, gap: 12, borderRadius: 20 }}>
          <Typography caption mono primary medium singleLeading>{principle.num}</Typography>
          <Typography cardTitle level={2}>{principle.title}</Typography>
          <Typography cardBody style={{ textWrap: "pretty" } as TextStyle}>{principle.body}</Typography>
        </Card>
      ))}
    </Grid>
  );
}

/** Index navigation stays a real keyboard-operable link, with the reference's row hover. */
function IndexLink({ href, children, style }: { href: string; children: ReactNode; style: ViewStyle }) {
  const router = useRouter();
  const { tokens } = useTheme();
  const [hovered, setHovered] = useState(false);
  return <Pressable role="link" {...({ href } as object)} onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)}
    onPress={(event) => { event.preventDefault?.(); router.push(href as never); }}
    style={[style, { backgroundColor: hovered ? tokens.secondary : "transparent" }]}>{children}</Pressable>;
}

function Index() {
  const router = useRouter();
  const { tokens: t } = useTheme();
  const go = (href: string) => (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();
    router.push(href as never);
  };
  return (
    <View testID="library-index">
      <View style={{ maxWidth: 760, gap: 12, marginBottom: 40 }}>
        <Typography h1 level={2}>{INDEX_COPY.title()}</Typography>
        <Typography tagline>{INDEX_COPY.lead}</Typography>
        <Typography sectionLead subtle>
          {INDEX_COPY.body.before}<Typography mono style={{ fontSize: 15 }}>{INDEX_COPY.body.mono}</Typography>{INDEX_COPY.body.after}
        </Typography>
      </View>
      <Grid minTileWidth={158} comfortable flow>
        {LIBRARY_INDEX.map((column) => (
          <Card key={column.id} style={{ paddingTop: 16, paddingHorizontal: 14, paddingBottom: 10, gap: 10, borderRadius: 20 }} testID={`library-index-${column.id}`}>
            <IndexLink href={column.href} style={{ gap: 8, paddingBottom: 12, borderBottomWidth: 1, borderColor: t.border }}>
              <Typography eyebrow primary>{column.num}</Typography>
              <Row between baseline snug>
                <Typography h5 level={3} style={{ fontSize: 18, lineHeight: 20.7, letterSpacing: -0.27, fontWeight: "500", flexShrink: 1 }}>{column.title}</Typography>
                <Typography caption mono muted style={{ lineHeight: 16, fontWeight: "500" }}>{column.items.length}</Typography>
              </Row>
            </IndexLink>
            <View>
              {column.items.map((item) => (
                <IndexLink key={item.slug} href={item.href} style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 28, paddingHorizontal: 6, marginHorizontal: -6, borderRadius: 8, }}>
                  <TierTag tier={item.tier} />
                  <Typography subtle numberOfLines={1} style={{ fontSize: 12.5, lineHeight: 12.5, flexShrink: 1 }}>{item.name}</Typography>
                </IndexLink>
              ))}
            </View>
          </Card>
        ))}
      </Grid>
      <Row wrap loose style={{ marginTop: 20, rowGap: 10 }}>
        {TIER_LEGEND.map((entry) => <Row key={entry.tier} snug alignCenter><TierTag tier={entry.tier} /><Typography caption mono muted>{entry.label}</Typography></Row>)}
      </Row>
      <Card style={{ marginTop: 24, padding: 20, borderRadius: 20, gap: 14 }}>
        <Row between wrap cozy><Typography eyebrow muted>{SUB_COMPONENTS_HEADING}</Typography><Typography eyebrow muted>{`${SUB_COMPONENT_COUNT} exports`}</Typography></Row>
        <Grid minTileWidth={320} loose style={{ rowGap: 4 }}>
          {SUB_COMPONENTS.map((group) => (
            <IndexLink key={group.parent} href={group.href} style={{ flexDirection: "row", alignItems: "baseline", gap: 12, paddingVertical: 8, paddingHorizontal: 6, marginHorizontal: -6, borderRadius: 8, }}>
              <Typography small medium style={{ width: 140, flexShrink: 0 }}>{group.parent}</Typography>
              <Typography caption mono subtle style={{ lineHeight: 18, flex: 1 }}>{group.names.join(" · ")}</Typography>
            </IndexLink>
          ))}
        </Grid>
      </Card>
      <Card style={{ marginTop: 12, paddingVertical: 18, paddingHorizontal: 20, borderRadius: 20, borderColor: t.ring, backgroundColor: t["primary-soft"], boxShadow: "none" }}>
        <Row between alignCenter wrap cozy>
          <View style={{ gap: 2 }}><Typography h5 level={2}>{TEMPLATES_CALL.title(getAllTemplates().length)}</Typography><Typography small subtle>{TEMPLATES_CALL.body}</Typography></View>
          <Button primary raised href={TEMPLATES_CALL.href} onPress={go(TEMPLATES_CALL.href)}>{TEMPLATES_CALL.label} →</Button>
        </Row>
      </Card>
    </View>
  );
}

export function Home() {
  return (
    <Page lead={<><LibraryHero /><Divider /></>}>
      <Container padLoose>
        <View style={{ paddingTop: 64, gap: 96 }}>
          <Principles />
          <Index />
        </View>
      </Container>
    </Page>
  );
}
