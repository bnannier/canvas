import type { ReactNode } from "react";
import { View, Text, useTheme, alpha } from "@nannier/canvas";
import Svg, { Path, Circle, Line, Polyline } from "react-native-svg";
import { geist, geistMono } from "../ui/fonts";
import type { CatTile } from "./tile";

// ── Molecules previews ───────────────────────────────────────────────────────
// Hand-authored mini-mockups for the Molecules category. Each Preview renders
// just the centered mockup; the Tile wrapper supplies the 16:9 stage, the muted
// wash, and the padding.

// Amber and green literals for the alert/status accents, from the source's hsl()
// values (these stay literal, not token-derived).
const AMBER = "#eab308"; // hsl(38 92% 50%)
const AMBER_TEXT = "#ca8a04"; // hsl(38 92% 45%)
const GREEN = "#22c55e"; // hsl(143 70% 45%)
const GREEN_TEXT = "#16a34a"; // hsl(143 70% 40%)

// ── Action Panels ────────────────────────────────────────────────────────────
function ActionPanelsPreview() {
  const { tokens } = useTheme();
  return (
    <View
      style={{
        width: "100%",
        maxWidth: 220,
        padding: 12,
        borderWidth: 1,
        borderColor: tokens.border,
        borderRadius: 8,
        backgroundColor: tokens.card,
      }}
    >
      <Text style={{ fontFamily: geist("600"), fontSize: 11, color: tokens["card-foreground"], marginBottom: 4 }}>
        Delete account
      </Text>
      <Text style={{ fontFamily: geist("400"), fontSize: 10, color: tokens["muted-foreground"], marginBottom: 8 }}>
        Permanent and irreversible.
      </Text>
      <View style={{ alignSelf: "flex-start" }}>
        <View
          style={{
            height: 24,
            paddingHorizontal: 8,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: tokens.destructive,
            backgroundColor: tokens.destructive,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontFamily: geist("500"), fontSize: 10, color: "#fff" }}>Delete</Text>
        </View>
      </View>
    </View>
  );
}

// ── Alerts ───────────────────────────────────────────────────────────────────
function AlertsPreview() {
  return (
    <View style={{ width: "100%", maxWidth: 220, gap: 6 }}>
      <View
        style={{
          borderRadius: 4,
          borderWidth: 1,
          borderColor: alpha(AMBER, 0.3),
          backgroundColor: alpha(AMBER, 0.1),
          paddingVertical: 4,
          paddingHorizontal: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={AMBER_TEXT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <Line x1="12" y1="9" x2="12" y2="13" />
          <Line x1="12" y1="17" x2="12.01" y2="17" />
        </Svg>
        <Text style={{ fontFamily: geist("400"), fontSize: 10, color: AMBER_TEXT }}>Warning</Text>
      </View>
      <View
        style={{
          borderRadius: 4,
          borderWidth: 1,
          borderColor: alpha(GREEN, 0.3),
          backgroundColor: alpha(GREEN, 0.08),
          paddingVertical: 4,
          paddingHorizontal: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={GREEN_TEXT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <Polyline points="22 4 12 14.01 9 11.01" />
        </Svg>
        <Text style={{ fontFamily: geist("400"), fontSize: 10, color: GREEN_TEXT }}>All set</Text>
      </View>
    </View>
  );
}

// ── Cards ────────────────────────────────────────────────────────────────────
function CardsPreview() {
  const { tokens } = useTheme();
  return (
    <View style={{ width: "100%", maxWidth: 220 }}>
      <View
        style={{
          padding: 12,
          borderWidth: 1,
          borderColor: tokens.border,
          borderRadius: 8,
          backgroundColor: tokens.card,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <Text
            style={{
              fontFamily: geist("500"),
              fontSize: 10,
              letterSpacing: 0.4,
              textTransform: "uppercase",
              color: tokens["muted-foreground"],
            }}
          >
            Users
          </Text>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={tokens["muted-foreground"]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4-4v2" />
            <Circle cx="9" cy="7" r="4" />
            <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </Svg>
        </View>
        <Text style={{ fontFamily: geist("600"), fontSize: 22, letterSpacing: -0.44, color: tokens.foreground }}>12.3k</Text>
        <Text style={{ fontFamily: geist("500"), fontSize: 10, marginTop: 4, color: GREEN_TEXT }}>+8%</Text>
      </View>
    </View>
  );
}

// ── Description Lists ────────────────────────────────────────────────────────
function DescriptionListsPreview() {
  const { tokens } = useTheme();
  return (
    <View style={{ width: "100%", maxWidth: 220 }}>
      <View style={{ flexDirection: "row", paddingVertical: 4 }}>
        <Text style={{ flex: 1, fontFamily: geist("400"), fontSize: 11, color: tokens["muted-foreground"] }}>Name</Text>
        <Text style={{ flex: 2, fontFamily: geist("400"), fontSize: 11, color: tokens.foreground }}>Ada Lovelace</Text>
      </View>
      <View style={{ flexDirection: "row", paddingVertical: 4, borderTopWidth: 1, borderColor: tokens.border }}>
        <Text style={{ flex: 1, fontFamily: geist("400"), fontSize: 11, color: tokens["muted-foreground"] }}>Email</Text>
        <Text style={{ flex: 2, fontFamily: geist("400"), fontSize: 11, color: tokens.foreground }}>ada@...</Text>
      </View>
    </View>
  );
}

// ── Field ────────────────────────────────────────────────────────────────────
function FieldPreview() {
  const { tokens } = useTheme();
  return (
    <View style={{ gap: 6, width: 168 }}>
      <View style={{ height: 8, width: 40, borderRadius: 2, backgroundColor: tokens.foreground }} />
      <View
        style={{
          height: 30,
          borderWidth: 1,
          borderColor: tokens.destructive,
          borderRadius: 8,
          backgroundColor: tokens.background,
        }}
      />
      <View style={{ height: 6, width: 104, borderRadius: 2, backgroundColor: tokens.destructive }} />
    </View>
  );
}

// ── Empty States ─────────────────────────────────────────────────────────────
function EmptyStatesPreview() {
  const { tokens } = useTheme();
  return (
    <View
      style={{
        alignItems: "center",
        gap: 4,
        padding: 16,
        borderWidth: 1,
        borderColor: tokens.border,
        borderRadius: 12,
        backgroundColor: tokens.card,
      }}
    >
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={tokens["muted-foreground"]} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4-4v2" />
        <Circle cx="9" cy="7" r="4" />
        <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </Svg>
      <Text style={{ fontFamily: geist("600"), fontSize: 12, color: tokens.foreground }}>No items</Text>
      <Text style={{ fontFamily: geist("400"), fontSize: 10, color: tokens["muted-foreground"] }}>Create one to start.</Text>
    </View>
  );
}

// ── Feeds ────────────────────────────────────────────────────────────────────
function FeedsPreview() {
  const { tokens } = useTheme();
  const items: { icon: ReactNode; label: string }[] = [
    {
      icon: <Path d="M12 5v14M5 12h14" />,
      label: "created",
    },
    {
      icon: <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />,
      label: "commented",
    },
    {
      icon: <Path d="M20 6L9 17l-5-5" />,
      label: "merged",
    },
  ];
  return (
    <View style={{ width: "100%", maxWidth: 220, gap: 6 }}>
      {items.map((item) => (
        <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: alpha(tokens.primary, 0.15),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={tokens.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              {item.icon}
            </Svg>
          </View>
          <Text style={{ flex: 1, fontSize: 10 }}>
            <Text style={{ fontFamily: geist("600"), fontSize: 10, color: tokens.foreground }}>Ada</Text>
            <Text style={{ fontFamily: geist("400"), fontSize: 10, color: tokens["muted-foreground"] }}>{" " + item.label}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── Form Layouts ─────────────────────────────────────────────────────────────
function FormLayoutsPreview() {
  const { tokens } = useTheme();
  const field = (placeholder: string) => (
    <View
      style={{
        flex: 1,
        height: 28,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: tokens.input,
        backgroundColor: tokens.background,
        paddingHorizontal: 10,
        justifyContent: "center",
      }}
    >
      <Text style={{ fontFamily: geist("400"), fontSize: 12, color: tokens["muted-foreground"] }} numberOfLines={1}>
        {placeholder}
      </Text>
    </View>
  );
  return (
    <View style={{ width: "100%", maxWidth: 200, gap: 6 }}>
      {field("Name")}
      <View style={{ flexDirection: "row", gap: 4 }}>
        {field("First")}
        {field("Last")}
      </View>
    </View>
  );
}

// ── Grid Lists ───────────────────────────────────────────────────────────────
function GridListsPreview() {
  const { tokens } = useTheme();
  return (
    <View style={{ width: "100%", maxWidth: 220, flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View
          key={i}
          style={{
            width: "31%",
            aspectRatio: 1,
            borderRadius: 4,
            backgroundColor: alpha(tokens.muted, 0.6),
          }}
        />
      ))}
    </View>
  );
}

// ── Media Objects ────────────────────────────────────────────────────────────
function MediaObjectsPreview() {
  const { tokens } = useTheme();
  return (
    <View style={{ width: "100%", maxWidth: 220, flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: tokens.muted,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontFamily: geist("500"), fontSize: 10, color: tokens["muted-foreground"] }}>AL</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: geist("600"), fontSize: 11, color: tokens.foreground }}>Ada Lovelace</Text>
        <Text style={{ fontFamily: geist("400"), fontSize: 10, color: tokens["muted-foreground"] }}>Principal eng.</Text>
      </View>
    </View>
  );
}

// ── Stacked Lists ────────────────────────────────────────────────────────────
function StackedListsPreview() {
  const { tokens } = useTheme();
  const rows: { initials: string; name: string }[] = [
    { initials: "AL", name: "Ada Lovelace" },
    { initials: "GH", name: "Grace Hopper" },
    { initials: "LB", name: "Linus Berg" },
  ];
  return (
    <View
      style={{
        width: "100%",
        maxWidth: 220,
        borderWidth: 1,
        borderColor: tokens.border,
        borderRadius: 8,
        backgroundColor: tokens.card,
        overflow: "hidden",
      }}
    >
      {rows.map((row, i) => (
        <View
          key={row.initials}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            borderTopWidth: i > 0 ? 1 : 0,
            borderColor: tokens.border,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: tokens.muted,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontFamily: geist("500"), fontSize: 10, color: tokens["muted-foreground"] }}>{row.initials}</Text>
          </View>
          <Text style={{ flex: 1, fontFamily: geist("400"), fontSize: 10, color: tokens.foreground }} numberOfLines={1}>
            {row.name}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── Stats ────────────────────────────────────────────────────────────────────
function StatsPreview() {
  const { tokens } = useTheme();
  const cell = (label: string, value: string) => (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ fontFamily: geist("400"), fontSize: 10, color: tokens["muted-foreground"] }}>{label}</Text>
      <Text style={{ fontFamily: geist("600"), fontSize: 14, color: tokens.foreground }}>{value}</Text>
    </View>
  );
  return (
    <View style={{ width: "100%", maxWidth: 220, flexDirection: "row", gap: 6 }}>
      {cell("Users", "71.8k")}
      {cell("Revenue", "$58")}
    </View>
  );
}

export const MOLECULES_TILES: CatTile[] = [
  { title: "ActionPanel", href: "/components/action-panels", Preview: ActionPanelsPreview },
  { title: "Alert", href: "/components/alert", Preview: AlertsPreview },
  { title: "Card", href: "/components/card", Preview: CardsPreview },
  { title: "DescriptionList", href: "/components/description-lists", Preview: DescriptionListsPreview },
  { title: "EmptyState", href: "/components/empty-state", Preview: EmptyStatesPreview },
  { title: "Field", href: "/components/field", Preview: FieldPreview },
  { title: "Feed", href: "/components/feeds", Preview: FeedsPreview },
  { title: "Form", href: "/components/form", Preview: FormLayoutsPreview },
  { title: "GridList", href: "/components/grid-lists", Preview: GridListsPreview },
  { title: "MediaObject", href: "/components/media-objects", Preview: MediaObjectsPreview },
  { title: "StackedList", href: "/components/stacked-lists", Preview: StackedListsPreview },
  { title: "Stats", href: "/components/stats", Preview: StatsPreview },
];
