import { useRef } from "react";
import { Linking, type View as NativeView } from "react-native";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  ButtonGroup,
  Card,
  Chart,
  Chip,
  Column,
  Container,
  Divider,
  Grid,
  Icon,
  Row,
  Switch,
  Toast,
  Typography,
  View,
} from "@nannier/canvas";
import { useRouter } from "expo-router";
import canvasPkg from "../../../package.json";
import { COMPONENTS } from "../core/data/components";
import { getAllTemplates } from "../core/data/templates";
import { resolvePhoto } from "../core/photos";
import { AuroraFrame } from "../brand/glow";
import { GradientText } from "../brand/gradient-text";
import { HeroCollage } from "../brand/hero-collage";
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
// (the eyebrow, the "Made of light." headline, the paragraph, two calls, the stats row
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

/** The eyebrow's version: the kit's own package.json, the release this checkout builds. */
const VERSION = canvasPkg.version;

/**
 * A tier's tag: the hand-off's 16 px letter tile, as the kit's small mono badge. The kit's
 * Badge has no dotless cyan or mint tone, so the organism takes the foreground pill and the
 * chart the success pill (green, with the status dot every status tone leads with).
 */
function TierTag({ tier }: { tier: Tier }) {
  const letter = tierLetter(tier);
  switch (tier) {
    case "atom":
      return <Badge small mono secondary>{letter}</Badge>;
    case "molecule":
      return <Badge small mono>{letter}</Badge>;
    case "organism":
      return <Badge small mono foreground>{letter}</Badge>;
    case "chart":
      return <Badge small mono success>{letter}</Badge>;
    case "primitive":
      return <Badge small mono outline>{letter}</Badge>;
  }
}

const PEOPLE = ["/ada-lovelace.jpg", "/grace-hopper.jpg", "/kira-tanaka.jpg"] as const;
const PEOPLE_NAMES = ["Ada Lovelace", "Grace Hopper", "Kira Tanaka"] as const;
const REVENUE = [34, 52, 41, 66, 58, 74, 63, 88, 71, 95, 82, 100];
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

/** The collage's six panels, live kit components in the hand-off's state. */
function CollagePanels() {
  return {
    revenue: (
      <Card raised>
        <Row between alignCenter>
          <Typography eyebrow subtle>Monthly revenue</Typography>
          <Badge success small>+18.2%</Badge>
        </Row>
        <Typography statValue tabular>$128,400</Typography>
        <Chart compact data={REVENUE.map((value, index) => ({ label: MONTHS[index]!, value }))} />
      </Card>
    ),
    segmented: <ButtonGroup segmented block accessibilityLabel="Range" items={["Day", "Week", "Month"]} defaultActive={1} />,
    online: (
      <Chip
        icon={
          <AvatarGroup small>
            {PEOPLE.map((photo, index) => <Avatar key={photo} small src={resolvePhoto(photo) as string} name={PEOPLE_NAMES[index]} />)}
          </AvatarGroup>
        }
      >
        +12 online
      </Chip>
    ),
    glass: (
      <Card compact>
        <Switch defaultChecked description="Liquid on iOS 26, frost elsewhere">Glass surface</Switch>
      </Card>
    ),
    toast: <Toast success message="Saved to workspace" action={{ label: "Undo", onPress: () => {} }} />,
    ship: <Button primary large raised iconRight={<Icon arrowRight primaryForeground />}>Ship it</Button>,
  };
}

export function LibraryHero() {
  const router = useRouter();
  const { headline, primary, secondary } = LIBRARY_HERO;
  const headlineBox = useRef<NativeView>(null);
  return (
    <AuroraFrame testID="library-hero">
      <Grid minTileWidth={HERO_GRID.minTileWidth} columns={2} broad>
        <Column panel center fill>
          <Row snug alignCenter>
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Badge signal info />
            </View>
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
            <Button
              primary
              large
              raised
              href={primary.href}
              onPress={(event) => {
                event?.preventDefault?.();
                router.push(primary.href as never);
              }}
              iconRight={<Icon arrowRight primaryForeground />}
            >
              {primary.label}
            </Button>
            <Button outline large href={secondary.url} external onPress={() => Linking.openURL(secondary.url)} iconRight={<Icon arrowUpRight />}>
              {secondary.label}
            </Button>
          </Row>
          <Row loose wrap rowsSnug>
            {heroStats(COMPONENTS.length).map((stat) => <Typography key={stat} caption mono muted singleLeading>{stat}</Typography>)}
          </Row>
        </Column>
        <HeroCollage testID="library-collage" panels={CollagePanels()} />
      </Grid>
    </AuroraFrame>
  );
}

function Principles() {
  return (
    <Grid minTileWidth={260} spacious>
      {PRINCIPLES.map((principle) => (
        <Card key={principle.num} cozy>
          <Typography caption mono primary medium singleLeading>{principle.num}</Typography>
          <Typography cardTitle level={2}>{principle.title}</Typography>
          <Typography cardBody>{principle.body}</Typography>
        </Card>
      ))}
    </Grid>
  );
}

function Index() {
  const router = useRouter();
  const go = (href: string) => (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();
    router.push(href as never);
  };
  const templates = getAllTemplates().length;
  return (
    <Column loose testID="library-index">
      <Container xl start>
        <Column cozy>
          <Typography h1 level={2}>{INDEX_COPY.title(COMPONENTS.length)}</Typography>
          <Typography lead>{INDEX_COPY.lead}</Typography>
          <Typography subtle>
            {INDEX_COPY.body.before}
            <Typography mono>{INDEX_COPY.body.mono}</Typography>
            {INDEX_COPY.body.after}
          </Typography>
        </Column>
      </Container>
      <Grid minTileWidth={158} comfortable>
        {LIBRARY_INDEX.map((column) => (
          <Column key={column.id}>
          <Card compact snug testID={`library-index-${column.id}`}>
            <Column tight>
              <Typography eyebrow primary>{column.num}</Typography>
              <Row between baseline snug>
                <Typography h5 href={column.href} onPress={go(column.href)}>{column.title}</Typography>
                <Typography caption mono subtle>{column.items.length}</Typography>
              </Row>
            </Column>
            <Divider />
            <Column snug>
              {column.items.map((item) => (
                <Row key={item.slug} snug alignCenter>
                  <TierTag tier={item.tier} />
                  <Typography small subtle numberOfLines={1} href={item.href} onPress={go(item.href)}>{item.name}</Typography>
                </Row>
              ))}
            </Column>
          </Card>
          </Column>
        ))}
      </Grid>
      <Row wrap relaxed>
        {TIER_LEGEND.map((entry) => (
          <Row key={entry.tier} snug alignCenter>
            <TierTag tier={entry.tier} />
            <Typography caption mono subtle>{entry.label}</Typography>
          </Row>
        ))}
      </Row>
      <Column cozy>
        <Card>
          <Row between wrap snug>
            <Typography eyebrow subtle>{SUB_COMPONENTS_HEADING}</Typography>
            <Typography eyebrow subtle>{`${SUB_COMPONENT_COUNT} exports`}</Typography>
          </Row>
          <Grid minTileWidth={320} relaxed>
            {SUB_COMPONENTS.map((group) => (
              <Row key={group.parent} cozy alignStart>
                <Column span={4}>
                  <Typography small medium href={group.href} onPress={go(group.href)}>{group.parent}</Typography>
                </Column>
                <Column span={8}>
                  <Typography caption mono subtle>{group.names.join(" · ")}</Typography>
                </Column>
              </Row>
            ))}
          </Grid>
        </Card>
        <Card selected>
          <Row between alignCenter wrap cozy>
            <Column tight>
              <Typography h5 level={2}>{TEMPLATES_CALL.title(templates)}</Typography>
              <Typography small subtle>{TEMPLATES_CALL.body}</Typography>
            </Column>
            <Button primary raised href={TEMPLATES_CALL.href} onPress={go(TEMPLATES_CALL.href)} iconRight={<Icon arrowRight primaryForeground />}>
              {TEMPLATES_CALL.label}
            </Button>
          </Row>
        </Card>
      </Column>
    </Column>
  );
}

export function Home() {
  return (
    <Page lead={<><LibraryHero /><Divider /></>}>
      <Container padLoose>
        <Column chapter>
          <Principles />
          <Index />
        </Column>
      </Container>
    </Page>
  );
}
