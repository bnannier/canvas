import { View } from "@olympusoss/canvas";
import { Page, PageHeader } from "../ui/page";
import { Section } from "../ui/section";
import { P, H3 } from "../ui/prose";
import { Table } from "../ui/table";
import { PageNav } from "../ui/page-nav";

const NOTES = [
  {
    title: "Native uses no CSS",
    body: "On iOS and Android there is no browser and no CSS feature floor. Components read the active tokens with useTheme and build their RN styles from them; the native minimums come from React Native 0.74 and react-native-svg.",
  },
  {
    title: "The web floor comes from the stylesheet",
    body: "Components resolve to inline styles through react-native-web and run in much older browsers. It's the single shipped stylesheet, canvas.css (a Tailwind v4 token layer), that sets the modern-browser baseline.",
  },
];

export default function BrowserSupportScreen() {
  return (
    <Page>
      <PageHeader
        title="Platform & Browser Support"
        description="The platforms Canvas runs on (iOS, Android, and the web through react-native-web) and the web browser baseline."
      />

      <Section title="Platforms">
        <Table
          headers={["Platform", "Runtime", "Minimum"]}
          rows={[
            ["iOS", "React Native (native)", "iOS 13.4+"],
            ["Android", "React Native (native)", "Android 6.0+ (API 23)"],
            ["Web", "react-native-web + canvas.css", "Modern browsers"],
          ]}
        />
      </Section>

      <Section title="Peer dependencies">
        <Table
          headers={["Package", "Range"]}
          rows={[
            ["react", ">=18"],
            ["react-native", ">=0.74"],
            ["react-native-svg", ">=13"],
          ]}
          mono
        />
      </Section>

      <Section title="Web browser baseline">
        <P muted>Set by the canvas.css token layer (Tailwind v4):</P>
        <Table
          headers={["Browser", "Minimum"]}
          rows={[
            ["Chrome / Edge", "111+"],
            ["Safari", "16.4+"],
            ["Firefox", "128+"],
          ]}
        />
      </Section>

      <Section title="Notes">
        <View style={{ gap: 12 }}>
          {NOTES.map((n) => (
            <View key={n.title} style={{ gap: 4 }}>
              <H3>{n.title}</H3>
              <P muted>{n.body}</P>
            </View>
          ))}
        </View>
      </Section>

      <PageNav />
    </Page>
  );
}
