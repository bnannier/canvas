import { Linking } from "react-native";
import { View, Button, DataTable, Icon } from "@nannier/canvas";
import { Page, PageHeader } from "../../ui/page";
import { Section } from "../../ui/section";
import { P, H3, InlineCode, Rule } from "../../ui/prose";
import { Surface } from "../../ui/tokens-kit";
import { DocsSurface } from "../../ui/surface";
import { PageNav } from "../../ui/page-nav";

// The privacy policy for the Canvas app (the docs app shipped to the App Store and Google
// Play). Both stores require a publicly reachable policy URL, and the answers here must
// match the App Privacy / Data Safety declarations filed with the listings, so this page is
// the single source of truth for both. Keep it factual: every claim below is verifiable from
// the source (there is no analytics SDK, no account system, and exactly two outbound hosts).

const ISSUES_URL = "https://github.com/bnannier/canvas/issues";

// Effective date is stated rather than computed so the page does not silently claim to have
// changed on every rebuild.
const EFFECTIVE = "24 July 2026";

const CONNECTIONS = [
  [
    "registry.npmjs.org",
    "Reads the latest published version of @nannier/canvas for the version pill in the header.",
    "Standard web request metadata (IP address, user agent). No app data is sent.",
  ],
  [
    "u.expo.dev",
    "Checks for over-the-air updates to the app, so fixes can ship without a store release.",
    "The app's update channel, runtime version, and platform, plus standard web request metadata.",
  ],
];

const NOT_DONE = [
  {
    title: "No accounts and no sign-in",
    description:
      "The app has no login, no user profiles, and no way to submit personal information. Every screen is available immediately on launch.",
  },
  {
    title: "No analytics and no tracking",
    description:
      "The app bundles no analytics, attribution, advertising, or crash-reporting SDK. Your usage is not measured, profiled, or shared with anyone, and nothing follows you across other apps or websites.",
  },
  {
    title: "No advertising",
    description:
      "There are no ads and no ad networks, so there is no advertising identifier and nothing to opt out of.",
  },
  {
    title: "Nothing is sold or shared",
    description:
      "Because no personal information is collected, there is none to sell, rent, or share with third parties.",
  },
];

export default function PrivacyScreen() {
  return (
    <Page>
      <View style={{ gap: 28 }}>
        <PageHeader
          title="Privacy Policy"
          description="Canvas collects no personal information. This page explains exactly what the app does and does not do, and it matches the App Privacy and Data Safety declarations filed with the App Store and Google Play."
        />

        <Section title="Summary">
          <P muted>
            Canvas is a free, open-source reference app for the <InlineCode>@nannier/canvas</InlineCode> React Native UI
            kit. It collects no personal information, creates no user accounts, and contains no analytics, tracking, or
            advertising code. Effective {EFFECTIVE}.
          </P>
        </Section>

        <Rule />

        <Section title="What Canvas does not do">
          <View style={{ gap: 16 }}>
            {NOT_DONE.map((n) => (
              <Surface key={n.title} padding={16}>
                <View style={{ gap: 4 }}>
                  <H3>{n.title}</H3>
                  <P muted>{n.description}</P>
                </View>
              </Surface>
            ))}
          </View>
        </Section>

        <Rule />

        <Section title="Network connections">
          <P muted>
            The app contacts exactly two hosts, both for the app itself rather than for anything about you. Like any
            web request, each one necessarily reveals your device's IP address to that service; neither is used to
            identify you, and Canvas stores nothing from either response.
          </P>
          <DocsSurface bordered>
            <DataTable columns={["Host", "Why it is contacted", "What it receives"]} rows={CONNECTIONS} />
          </DocsSurface>
          <P muted>
            These two services are operated by npm, Inc. and Expo, respectively, and their own privacy policies govern
            the request logs they keep. The app works offline apart from these checks, which fail silently when the
            network is unavailable.
          </P>
        </Section>

        <Rule />

        <Section title="Data stored on your device">
          <P muted>
            On the web, your light or dark theme choice is saved in your browser's local storage so the site opens the
            way you left it. That value never leaves your device and is not readable by anyone else. The iOS and Android
            apps store no preferences at all, and the app writes no other files, cookies, or identifiers.
          </P>
        </Section>

        <Rule />

        <Section title="Children">
          <P muted>
            Canvas is a developer reference tool rather than a children's app, and it is not directed to children. Since
            it collects no personal information from anyone, it collects none from children either.
          </P>
        </Section>

        <Rule />

        <Section title="Changes and contact">
          <P muted>
            If this policy changes, the effective date above changes with it, and the revision history is public in the
            same repository as the app's source code. Questions, corrections, and privacy requests are all welcome as
            GitHub issues.
          </P>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <Button
              outline
              iconRight={<Icon arrowRight size={15} />}
              onPress={() => Linking.openURL(ISSUES_URL)}
            >
              Open an issue
            </Button>
          </View>
        </Section>

        <PageNav />
      </View>
    </Page>
  );
}
