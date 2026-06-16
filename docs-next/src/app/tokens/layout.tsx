import { View, Text, useTheme } from "@olympusoss/canvas";
import { Page, PageHeader } from "../../ui/page";
import { Section } from "../../ui/section";
import { P, InlineCode } from "../../ui/prose";
import { CodeBlock } from "../../ui/code-block";
import { PageNav } from "../../ui/page-nav";

function Box({ n }: { n: number }) {
  const { tokens } = useTheme();
  return (
    <View style={{ height: 36, minWidth: 36, paddingHorizontal: 8, borderRadius: 6, backgroundColor: tokens.primary, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: tokens["primary-foreground"], fontSize: 13, fontWeight: "600" }}>{n}</Text>
    </View>
  );
}

function Demo({ title, code, children }: { title: string; code: string; children: React.ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: tokens.foreground }}>{title}</Text>
      <View style={{ borderRadius: 10, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 16 }}>
        {children}
      </View>
      <CodeBlock code={code} />
    </View>
  );
}

export default function LayoutScreen() {
  return (
    <Page>
      <PageHeader
        title="Layout & Flexbox"
        description="Canvas lays out with React Native's flexbox — the same model on every platform. Compose with View, gap, flexDirection, and the alignment props."
      />

      <Section title="Row with gap">
        <Demo title="Horizontal row" code={`<View style={{ flexDirection: "row", gap: 8 }}>\n  <Box /> <Box /> <Box />\n</View>`}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Box n={1} />
            <Box n={2} />
            <Box n={3} />
          </View>
        </Demo>
      </Section>

      <Section title="Justify content">
        <Demo title="space-between" code={`<View style={{ flexDirection: "row", justifyContent: "space-between" }}>…</View>`}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Box n={1} />
            <Box n={2} />
            <Box n={3} />
          </View>
        </Demo>
      </Section>

      <Section title="Wrap">
        <Demo title="flexWrap" code={`<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>…</View>`}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <Box key={n} n={n} />
            ))}
          </View>
        </Demo>
      </Section>

      <P muted>
        For responsive layouts, read the viewport with <InlineCode>useResponsive()</InlineCode> (desktop-first) and switch
        styles by breakpoint.
      </P>

      <PageNav />
    </Page>
  );
}
