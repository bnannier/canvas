import { useState } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { Pressable, Column, Icon, Typography, Sidebar, useTheme } from "@nannier/canvas";
import { roomFor } from "../../data/rooms";
import { useRailFits } from "../../shell/frame";
import { RailFilter } from "../../shell/rail";

/** Component.dc.html's phone-only section index disclosure, ahead of the header. */
export function MobileComponentIndex({ slug }: { slug: string }) {
  const wide = useRailFits();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { tokens } = useTheme();
  const place = roomFor(`/components/${slug}`);
  if (Platform.OS !== "web" || wide || !place) return null;
  const { room } = place;
  const items = room.items.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <Column roomy alignStart>
      {open ? (
        <Sidebar embedded compact markers active={slug} accessibilityLabel={`${room.title} components`} header={<RailFilter placeholder={`Filter ${room.items.length} components`} accessibilityLabel="Filter components" value={query} onChangeText={setQuery} />} sections={[{ id: room.id, title: room.title, count: items.length, items: items.map((item) => ({ id: item.id, label: item.label, href: item.href })) }]} onSelect={(item) => { setOpen(false); if (item.href) router.push(item.href as never); }} />
      ) : null}
      <Pressable accessibilityRole="button" onPress={() => setOpen(!open)} accessibilityState={{ expanded: open }} aria-expanded={open} style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 36, paddingHorizontal: 14, borderWidth: 1, borderRadius: 9999, borderColor: tokens["field-border"] ?? tokens.border, backgroundColor: tokens.popover }}>
        <Icon layoutList size={14} decorative />
        <Typography small medium style={{ lineHeight: 13 }}>{open ? "Hide components" : "Components in this section"}</Typography>
      </Pressable>
    </Column>
  );
}
