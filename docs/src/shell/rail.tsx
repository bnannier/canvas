import { useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { View, ScrollView, Sidebar, Input, useTheme } from "@nannier/canvas";
import type { Room } from "../data/rooms";
import { SHELL } from "./page-look";

// The web shell's rail: the hand-off's room index (`CanvasRail.dc.html`, and the detail
// page's own copy in `Canvas v4.0.0 Component.dc.html`), the kit Sidebar `embedded compact
// markers` under a filter field. It stands at the frame's start edge (the 24 px gutter of
// a frame capped at 1440 px and centred), 96 px down and 200 px wide, and scrolls itself;
// the shell renders it only on a page of a room in a window of 760 px or more (S9).
//
// On a room's own page every row is the current place (the section `current`: the heading
// in the accent's text ink, the rows in the foreground ink, each with the hairline dot);
// on a component's page the heading and rows rest in the quieter inks and only the
// component's own row is lit, as the hand-off's detail page draws its rail.
export function Rail({ room, active }: { room: Room; active?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const items = room.items.filter((item) => !q || item.label.toLowerCase().includes(q));
  const current = active == null;
  return (
    // The frame: a column capped at 1440 px and centred over the window, its 24 px gutter
    // inside, holding the rail's 200 px column from 96 px down to the window's foot.
    // Untouchable itself, so the page under its empty band keeps its pointer.
    <View style={styles.layer}>
      <View style={styles.frame}>
        <View
          // Marked for the document root's pre-hydration rule (docs/src/app/+html.tsx):
          // the server renders the rail for a window it cannot measure, and a phone hides
          // it until the bundle runs. A web-only attribute.
          {...(Platform.OS === "web" ? ({ dataSet: { shellRail: "" } } as object) : null)}
          style={{ flex: 1, width: SHELL.railWidth }}
        >
          <ScrollView contentContainerStyle={{ paddingTop: 4, paddingRight: 6, paddingBottom: 32 }}>
            <Sidebar
              embedded
              compact
              markers
              active={active ?? -1}
              // The rail's navigation landmark, named by its room ("Controls components",
              // "Guides"), apart from the pill's Primary navigation and any Sidebar a page
              // shows as an example.
              accessibilityLabel={room.id === "guides" ? room.title : `${room.title} components`}
              header={
                <RailFilter
                  placeholder={`Filter ${room.items.length} ${room.id === "guides" ? "pages" : "components"}`}
                  accessibilityLabel={room.id === "guides" ? "Filter pages" : "Filter components"}
                  value={query}
                  onChangeText={setQuery}
                />
              }
              sections={[
                {
                  id: room.id,
                  title: room.title,
                  count: items.length,
                  current,
                  items: items.map((item) => ({ id: item.id, label: item.label, href: item.href })),
                },
              ]}
              onSelect={(item) => {
                if (item.href) router.push(item.href as never);
              }}
            />
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

/** The rail's 36 px search well from Component.dc.html, shared with its phone index. */
export function RailFilter(props: { placeholder: string; accessibilityLabel: string; value: string; onChangeText: (value: string) => void }) {
  const { tokens } = useTheme();
  return <Input small leadingIcon icon="search" {...props} style={{ height: 36, borderRadius: 10, backgroundColor: tokens.popover, borderColor: tokens["field-border"] ?? tokens.border }} />;
}

// box-none lives in a StyleSheet.create style: react-native-web compiles its box-none
// polyfill only there, and an inline `{ pointerEvents }` object computes to `auto`, so the
// layer would take every click in the content column (see src/style/portal.tsx).
const styles = StyleSheet.create({
  layer: { position: "absolute", top: SHELL.railTop, bottom: 0, left: 0, right: 0, zIndex: 20, alignItems: "center", pointerEvents: "box-none" },
  frame: { flex: 1, width: "100%", maxWidth: SHELL.frameMax, paddingHorizontal: SHELL.gutter, pointerEvents: "box-none" },
});
