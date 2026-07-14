import { View, Text, Icon, useTheme, alpha } from "@nannier/canvas";
import { Page, PageHeader } from "../../../ui/page";
import { Section } from "../../../ui/section";
import { P, H3, InlineCode, Rule } from "../../../ui/prose";
import { Surface } from "../../../ui/tokens-kit";
import { PageNav } from "../../../ui/page-nav";
import { geist } from "../../../ui/fonts";

// Placeholder for the Boilerplate section: a ready-to-clone starter application built on
// Canvas. The page is intentionally a stub for now; the real boilerplate app and its setup
// guide are being prepared. The "What this will include" cards describe the planned content
// so the section reads as work-in-progress rather than empty.
const PLANNED = [
  {
    title: "Clone and run",
    description:
      "A starter app pre-wired with @nannier/canvas, the ThemeProvider, and the Geist fonts, so you get a running iOS, Android, and web app from the first commit instead of a blank Expo project.",
  },
  {
    title: "Opinionated structure",
    description:
      "A sensible project layout (navigation shell, theming, example screens) you can pick up and build features on, following the same conventions as these docs.",
  },
  {
    title: "Universal by default",
    description:
      "One codebase targeting iOS, Android, and the web through React Native Web, matching the Canvas react-native-everywhere principle out of the box.",
  },
];

export default function BoilerplateScreen() {
  const { tokens } = useTheme();
  return (
    <Page>
      <View style={{ gap: 28 }}>
        <PageHeader
          title="Boilerplate"
          description="A ready-to-clone starter application built on Canvas: pick it up and start developing on iOS, Android, and the web from the first commit."
        />

        {/* Coming-soon callout. Placeholder until the boilerplate app + setup guide land. */}
        <Surface
          padding={16}
          style={{ borderColor: alpha(tokens.primary, 0.32), backgroundColor: alpha(tokens.primary, 0.08) }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Icon rocket size={18} primary />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: geist("600"), fontSize: 14, color: tokens.foreground }}>Coming soon</Text>
              <Text style={{ fontFamily: geist("400"), fontSize: 13, lineHeight: 19, color: tokens["muted-foreground"] }}>
                This section is a placeholder. The boilerplate application and its setup guide are being prepared.
              </Text>
            </View>
          </View>
        </Surface>

        <Rule />

        <Section title="What this will include">
          <P muted>
            The boilerplate will be a real Canvas app you can <InlineCode>git clone</InlineCode> and run, not a snippet.
            Here is what it is shaping up to cover:
          </P>
          <View style={{ gap: 16, marginTop: 4 }}>
            {PLANNED.map((item) => (
              <Surface key={item.title} padding={16}>
                <View style={{ gap: 4 }}>
                  <H3>{item.title}</H3>
                  <P muted>{item.description}</P>
                </View>
              </Surface>
            ))}
          </View>
        </Section>

        <PageNav />
      </View>
    </Page>
  );
}
