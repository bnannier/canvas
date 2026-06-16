import { View, Text, Pressable, useTheme } from "@olympusoss/canvas";
import { useRouter } from "expo-router";
import { Page } from "../ui/page";
import { H2 } from "../ui/prose";

const PRINCIPLES = [
  { title: "Semantic props", body: "Flat boolean props named for meaning, so <Button primary large> reads like a sentence." },
  { title: "Universal", body: "One component runs on iOS, Android, and the web — including this very docs app, rendered natively." },
  { title: "Responsive by default", body: "Every component adapts from large desktop down to phone, authored desktop-first." },
  { title: "Token-themed", body: "Light, dark, and glass surfaces all flow from one theme provider. No per-component restyling." },
];

const LEVELS = [
  { name: "Atoms", body: "Primitives and the smallest UI: View, Text, Button, Input, Badge." },
  { name: "Molecules", body: "Small compositions: Card, Field, Alert, Stats, Form." },
  { name: "Organisms", body: "Full sections: Navbar, Sidebar, Tabs, Calendar, Charts." },
];

function Card({ title, body }: { title: string; body: string }) {
  const { tokens } = useTheme();
  return (
    <View style={{ borderRadius: 12, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 16, gap: 4 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: tokens.foreground }}>{title}</Text>
      <Text style={{ fontSize: 13, lineHeight: 19, color: tokens["muted-foreground"] }}>{body}</Text>
    </View>
  );
}

export default function Home() {
  const { tokens } = useTheme();
  const router = useRouter();
  return (
    <Page>
      <View style={{ gap: 14, paddingTop: 8 }}>
        <Text style={{ fontSize: 34, fontWeight: "800", letterSpacing: -0.6, color: tokens.foreground }}>Canvas</Text>
        <Text style={{ fontSize: 16, lineHeight: 24, color: tokens["muted-foreground"], maxWidth: 620 }}>
          A universal React Native UI kit. Native on iOS and Android, and on the web through React Native Web — including these docs.
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 2 }}>
          <Pressable onPress={() => router.push("/components" as never)} style={{ borderRadius: 999, backgroundColor: tokens.primary, paddingHorizontal: 18, paddingVertical: 11 }}>
            <Text style={{ color: tokens["primary-foreground"], fontWeight: "600", fontSize: 14 }}>Browse components</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/integration" as never)} style={{ borderRadius: 999, borderWidth: 1, borderColor: tokens.border, paddingHorizontal: 18, paddingVertical: 11 }}>
            <Text style={{ color: tokens.foreground, fontWeight: "600", fontSize: 14 }}>Get started</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <H2>Principles</H2>
        <View style={{ gap: 10 }}>
          {PRINCIPLES.map((p) => (
            <Card key={p.title} title={p.title} body={p.body} />
          ))}
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <H2>Atomic design</H2>
        <View style={{ gap: 10 }}>
          {LEVELS.map((l) => (
            <Card key={l.name} title={l.name} body={l.body} />
          ))}
        </View>
      </View>
    </Page>
  );
}
