import { View, Text, Pressable, useTheme } from "@olympusoss/canvas";
import { useRouter } from "expo-router";
import { COMPONENTS } from "docs-core/data/components";
import { CATEGORIES } from "docs-core/data/types";
import { Page, PageHeader } from "../../ui/page";
import { H2 } from "../../ui/prose";
import { stripHtml } from "../../lib/html";

export default function ComponentsIndex() {
  const { tokens } = useTheme();
  const router = useRouter();
  return (
    <Page>
      <PageHeader title="All components" description="Every Canvas component, grouped by atomic level." />
      {CATEGORIES.map((cat) => {
        const items = COMPONENTS.filter((c) => c.category === cat).sort((a, b) => a.name.localeCompare(b.name));
        return (
          <View key={cat} style={{ gap: 12 }}>
            <H2>{cat}</H2>
            <View style={{ gap: 8 }}>
              {items.map((c) => (
                <Pressable
                  key={c.slug}
                  onPress={() => router.push(`/components/${c.slug}` as never)}
                  style={{ borderRadius: 12, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 14, gap: 4 }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "600", color: tokens.foreground }}>{c.name}</Text>
                  <Text style={{ fontSize: 12, lineHeight: 17, color: tokens["muted-foreground"] }} numberOfLines={2}>
                    {stripHtml(c.description)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}
    </Page>
  );
}
