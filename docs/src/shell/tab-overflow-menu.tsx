import { useEffect, useRef, useState } from "react";
import { Animated, Platform, useWindowDimensions, type LayoutChangeEvent } from "react-native";
import { Text, Pressable, ScrollView, View, Drawer, Icon, useTheme } from "@olympusoss/canvas";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeMenu, MenuGroup } from "../data/nav";
import { geist } from "../ui/fonts";

// The overflow menu for a native tab's contextual header: a kit Drawer bottom sheet.
// Flat sections (Home/Utilities) list their links directly; the Components section is a
// two-level drill-down — categories first, sliding over to the chosen category's component
// pages. Each leaf navigates and closes; tapping the scrim dismisses. (iOS uses the native
// UIMenu, so this renders on Android in practice; the web uses the sidebar.)
export function TabOverflowMenu({
  visible,
  onClose,
  menu,
}: {
  visible: boolean;
  onClose: () => void;
  menu: NativeMenu;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const go = (href: string) => {
    onClose();
    router.push(href as never);
  };

  return (
    <Drawer
      open={visible}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      bottom
      style={{ paddingTop: 8, paddingBottom: insets.bottom + 8 }}
    >
      {menu.kind === "flat" ? (
        menu.items.map((it) => <MenuRow key={it.href} label={it.label} onPress={() => go(it.href)} />)
      ) : (
        <DrillDown menu={menu} visible={visible} onSelect={go} />
      )}
    </Drawer>
  );
}

// A single tappable row; `chevron` adds the trailing drill-in affordance for category rows.
function MenuRow({ label, onPress, chevron }: { label: string; onPress: () => void; chevron?: boolean }) {
  const { tokens } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 }}
    >
      <Text style={{ fontFamily: geist("500"), fontSize: 16, color: tokens.foreground }}>{label}</Text>
      {chevron ? <Icon chevronRight size={18} muted /> : null}
    </Pressable>
  );
}

// The Components drill-down: two equal-width panels (categories | the active category's
// components) laid out side by side in a clipped row, slid horizontally with one Animated
// value. The clip width is measured (onLayout) rather than assumed, so it tracks whatever
// the bottom sheet hands us. A fixed panel height keeps the sheet from jumping between
// levels and lets long category lists scroll.
function DrillDown({
  menu,
  visible,
  onSelect,
}: {
  menu: Extract<NativeMenu, { kind: "groups" }>;
  visible: boolean;
  onSelect: (href: string) => void;
}) {
  const { tokens } = useTheme();
  const { height } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<MenuGroup | null>(null);
  const x = useRef(new Animated.Value(0)).current;
  const useDriver = Platform.OS !== "web";
  const panelHeight = Math.round(height * 0.55);

  // Reopen at the category list whenever the sheet is dismissed.
  useEffect(() => {
    if (!visible) {
      x.setValue(0);
      setActive(null);
    }
  }, [visible, x]);

  const slideTo = (level: 0 | 1, after?: () => void) => {
    Animated.timing(x, { toValue: level, duration: 220, useNativeDriver: useDriver }).start(after ? () => after() : undefined);
  };
  const openGroup = (g: MenuGroup) => {
    setActive(g);
    slideTo(1);
  };
  const back = () => slideTo(0, () => setActive(null));

  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [0, -width] });

  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} style={{ height: panelHeight, overflow: "hidden" }}>
      <Animated.View style={{ flexDirection: "row", width: width * 2, height: panelHeight, transform: [{ translateX }] }}>
        {/* Level 0: categories */}
        <View style={{ width }}>
          <ScrollView>
            {menu.groups.map((g) => (
              <MenuRow key={g.label} label={g.label} chevron onPress={() => openGroup(g)} />
            ))}
          </ScrollView>
        </View>
        {/* Level 1: the active category's components */}
        <View style={{ width }}>
          <Pressable
            onPress={back}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderColor: tokens.border }}
          >
            <Icon chevronLeft size={18} />
            <Text style={{ fontFamily: geist("600"), fontSize: 16, color: tokens.foreground }}>{active?.label ?? ""}</Text>
          </Pressable>
          <ScrollView>
            {active?.items.map((it) => <MenuRow key={it.href} label={it.label} onPress={() => onSelect(it.href)} />)}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}
