import { View, Text, DataTable, useTheme } from "@olympusoss/canvas";
import { Page, PageHeader } from "../../ui/page";
import { Section } from "../../ui/section";
import { P, H3, InlineCode, Rule, MONO } from "../../ui/prose";
import { Surface } from "../../ui/tokens-kit";
import { PageNav } from "../../ui/page-nav";

const PLATFORMS = [
  ["iOS", "React Native (native)", "iOS 13.4+"],
  ["Android", "React Native (native)", "Android 6.0+ (API 23)"],
  ["Web", "react-native-web + the canvas.css token layer", "Modern browsers (see baseline below)"],
];

const PEERS = [
  ["react", ">=18", "The React runtime Canvas builds on."],
  ["react-native", ">=0.74", "Native iOS / Android host, and the module aliased to react-native-web on the web."],
  ["react-native-svg", ">=13", "Vector icons and the chart primitives."],
];

const WEB_BASELINE = [
  ["Chrome / Edge", "111+", "Tailwind v4 token layer (canvas.css)"],
  ["Safari", "16.4+", "Tailwind v4 token layer (canvas.css)"],
  ["Firefox", "128+", "Tailwind v4 token layer (canvas.css)"],
];

const NOTES = [
  {
    title: "Why these versions",
    description:
      "The floor is set by the modern CSS that Tailwind v4 (and so canvas.css) builds on: the @property at-rule, color-mix(), oklch() colors, and cascade layers. The versions above are where each engine shipped that feature set; Firefox lags to 128 because @property landed there last (mid 2024). The color primitives themselves, oklch() and color-mix(), have been Baseline \"widely available\" across Chrome, Edge, Safari, and Firefox since May 2023. Older browsers are served by Tailwind v3.4 instead.",
  },
  {
    title: "Native uses no CSS",
    description:
      "On iOS and Android there is no browser and no CSS feature floor. Components read the active design tokens with useTheme and build their React Native styles from them; the native minimums above come from React Native 0.74 and react-native-svg, the package's peer dependencies.",
  },
  {
    title: "The web floor comes from the stylesheet, not the components",
    description:
      "Canvas components resolve to inline styles through react-native-web and run in much older browsers. It is the single shipped stylesheet, canvas.css (a Tailwind v4 token layer), that sets the modern-browser baseline above. If you must support older browsers, supply the design tokens as plain CSS custom properties yourself; canvas.css is the only stylesheet Canvas ships.",
  },
  {
    title: "Accessibility and motion",
    description:
      "Reduced-motion and other accessibility preferences are handled at the platform layer (React Native on native, react-native-web in the browser), not through bundled CSS pattern files.",
  },
];

export default function BrowserSupportScreen() {
  const { tokens } = useTheme();
  return (
    <Page>
      <View style={{ gap: 28 }}>
        <PageHeader
          title="Platform & Browser Support"
          description="The platforms Canvas runs on (iOS, Android, and the web through react-native-web) and the web browser baseline."
        />

        <Section title="Platforms">
          <P muted>
            Canvas is a universal React Native UI kit. It runs natively on iOS and Android, and on the web through{" "}
            <InlineCode>react-native-web</InlineCode>.
          </P>
          <DataTable bordered columns={["Platform", "Runtime", "Minimum"]} rows={PLATFORMS} />
        </Section>

        <Rule />

        <Section title="Peer Dependencies">
          <P muted>
            These peers set the platform floor. Install them alongside <InlineCode>@olympusoss/canvas</InlineCode>.
          </P>
          <DataTable
            bordered
            columns={["Package", "Range", "Role"]}
            rows={PEERS.map(([pkg, range, role]) => [
              <Text key="pkg" style={{ fontFamily: MONO, fontSize: 14, lineHeight: 20, color: tokens.foreground }}>
                {pkg}
              </Text>,
              range,
              role,
            ])}
          />
        </Section>

        <Rule />

        <Section title="Web Browser Baseline">
          <P muted>
            On the web, the modern-browser floor is set by the <InlineCode>canvas.css</InlineCode> token layer, which is
            Tailwind v4. Tailwind v4 targets these versions:
          </P>
          <DataTable bordered columns={["Browser", "Minimum Version", "Reason"]} rows={WEB_BASELINE} />
        </Section>

        <Rule />

        <Section title="Notes">
          <View style={{ gap: 16 }}>
            {NOTES.map((n) => (
              <Surface key={n.title} padding={16}>
                <View style={{ gap: 4 }}>
                  <H3>{n.title}</H3>
                  <P muted>{n.description}</P>
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
