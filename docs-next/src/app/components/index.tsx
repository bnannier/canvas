import { View, Text, Pressable, useTheme } from "@olympusoss/canvas";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { COMPONENTS } from "docs-core/data/components";
import { CATEGORIES } from "docs-core/data/types";
import { Page, PageHeader } from "../../ui/page";
import { H2 } from "../../ui/prose";
import { PageNav } from "../../ui/page-nav";
import { stripHtml } from "../../lib/html";
import { geist } from "../../ui/fonts";
import { NAV_GROUPS } from "../../data/nav";

// A group heading with the Vite catalog's per-group count badge.
function GroupHeading({ label, count, unit }: { label: string; count: number; unit: string }) {
  const { tokens } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
      <H2>{label}</H2>
      <Text style={{ fontFamily: geist("500"), fontSize: 12.5, color: tokens["muted-foreground"] }}>
        {count} {unit}
      </Text>
    </View>
  );
}

function LinkCard({ name, description, href }: { name: string; description?: string; href: string }) {
  const { tokens } = useTheme();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(href as never)}
      style={{ flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 14 }}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontFamily: geist("600"), fontSize: 14, color: tokens.foreground }}>{name}</Text>
        {description ? (
          <Text style={{ fontFamily: geist("400"), fontSize: 12, lineHeight: 17, color: tokens["muted-foreground"] }} numberOfLines={2}>
            {stripHtml(description)}
          </Text>
        ) : null}
      </View>
      <ChevronRight size={15} color={tokens["muted-foreground"]} />
    </Pressable>
  );
}

// The Tokens / Templates / Patterns groups are previewed off the shared nav data, so the
// catalog mirrors the Vite index's six-group layout (the 3 component categories plus those).
const EXTRA_GROUPS = ["Tokens & Utilities", "Templates", "Patterns"];

export default function ComponentsIndex() {
  return (
    <Page>
      <PageHeader
        title="All components"
        description="A catalog of every Canvas component, grouped by atomic level, plus the tokens, templates, and patterns. Tap any entry to open its full reference."
      />

      {CATEGORIES.map((cat) => {
        const items = COMPONENTS.filter((c) => c.category === cat).sort((a, b) => a.name.localeCompare(b.name));
        return (
          <View key={cat} style={{ gap: 12 }}>
            <GroupHeading label={cat} count={items.length} unit="components" />
            <View style={{ gap: 8 }}>
              {items.map((c) => (
                <LinkCard key={c.slug} name={c.name} description={c.description} href={`/components/${c.slug}`} />
              ))}
            </View>
          </View>
        );
      })}

      {EXTRA_GROUPS.map((label) => {
        const group = NAV_GROUPS.find((g) => g.label === label);
        if (!group) return null;
        const unit = label === "Templates" ? "templates" : label === "Patterns" ? "patterns" : "pages";
        return (
          <View key={label} style={{ gap: 12 }}>
            <GroupHeading label={label} count={group.items.length} unit={unit} />
            <View style={{ gap: 8 }}>
              {group.items.map((it) => (
                <LinkCard key={it.href} name={it.label} href={it.href} />
              ))}
            </View>
          </View>
        );
      })}

      <PageNav />
    </Page>
  );
}
