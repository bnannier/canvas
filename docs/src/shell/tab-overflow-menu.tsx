import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Platform, useWindowDimensions } from "react-native";
import { Text, Pressable, ScrollView, View, Drawer, Icon, useTheme } from "@olympusoss/canvas";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { MenuNode } from "../data/nav";
import { geist } from "../ui/fonts";

// The overflow menu for a native tab's contextual header: a kit Drawer bottom sheet that
// walks the recursive menu tree (see nativeMenuFor) as an N-LEVEL drill-down. A leaf row
// navigates and closes; a submenu row drills one level deeper (e.g. Home -> Components ->
// Atoms -> a page); the back row pops. Tapping the scrim dismisses. (iOS uses the native
// UIMenu, so this renders on Android + mobile-web in practice; desktop web uses the sidebar.)
export function TabOverflowMenu({
  visible,
  onClose,
  menu,
  activeGroup,
  activeSlug,
  footer,
}: {
  visible: boolean;
  onClose: () => void;
  menu: MenuNode[];
  /** The current page's category, so the drill-down reopens pre-drilled into it. */
  activeGroup?: string | null;
  /** The current page's slug, to mark it in the list. */
  activeSlug?: string;
  /** Optional sheet footer (e.g. the mobile-web theme toggles, kept off the iOS-style bar). */
  footer?: ReactNode;
}) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const router = useRouter();
  const useDriver = Platform.OS !== "web";
  const panelHeight = Math.round(height * 0.55);

  // The drill path: a stack of levels (the root, then each submenu drilled into). The top of
  // the stack is what renders; `title` labels the back row.
  const [stack, setStack] = useState<{ title?: string; nodes: MenuNode[] }[]>([{ nodes: menu }]);
  const wasVisible = useRef(false);
  const slide = useRef(new Animated.Value(0)).current;

  // On OPEN (a false->true transition only, so a manual drill survives parent re-renders),
  // reset to the root, pre-drilling into the active category when the current page sits in one
  // (so Components reopens on the category you're in). Home has no active top-level submenu, so
  // it opens at the root site map.
  useEffect(() => {
    if (visible && !wasVisible.current) {
      let next: { title?: string; nodes: MenuNode[] }[] = [{ nodes: menu }];
      if (activeGroup) {
        const g = menu.find((n) => n.kind === "submenu" && n.label === activeGroup);
        if (g && g.kind === "submenu") next = [{ nodes: menu }, { title: g.label, nodes: g.items }];
      }
      setStack(next);
      slide.setValue(0);
    }
    wasVisible.current = visible;
  }, [visible, activeGroup, menu, slide]);

  // A short directional slide-in on each level change (forward from the right, back from the
  // left), transform-only so it is safe on Android's New Architecture.
  const animateIn = (dir: 1 | -1) => {
    slide.setValue(dir * 24);
    Animated.timing(slide, { toValue: 0, duration: 200, useNativeDriver: useDriver }).start();
  };
  const push = (node: Extract<MenuNode, { kind: "submenu" }>) => {
    setStack((s) => [...s, { title: node.label, nodes: node.items }]);
    animateIn(1);
  };
  const pop = () => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
    animateIn(-1);
  };
  const go = (href: string) => {
    onClose();
    router.push(href as never);
  };

  const level = stack[stack.length - 1];
  const depth = stack.length - 1;

  return (
    <Drawer
      open={visible}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      bottom
      style={{ paddingTop: 8, paddingBottom: insets.bottom + 8 }}
    >
      <View style={{ height: panelHeight }}>
        {depth > 0 ? (
          <Pressable
            onPress={pop}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderColor: tokens.border }}
          >
            <Icon chevronLeft size={18} />
            <Text style={{ fontFamily: geist("600"), fontSize: 16, color: tokens.foreground }}>{level.title ?? ""}</Text>
          </Pressable>
        ) : null}
        <Animated.View style={{ flex: 1, transform: [{ translateX: slide }] }}>
          <ScrollView>
            {level.nodes.map((n) =>
              n.kind === "leaf" ? (
                <MenuRow key={n.href} label={n.label} active={n.slug === activeSlug} onPress={() => go(n.href)} />
              ) : (
                <MenuRow key={"submenu:" + n.label} label={n.label} chevron onPress={() => push(n)} />
              ),
            )}
          </ScrollView>
        </Animated.View>
      </View>
      {footer ? (
        <View style={{ borderTopWidth: 1, borderColor: tokens.border, marginTop: 4, paddingTop: 12, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          {footer}
        </View>
      ) : null}
    </Drawer>
  );
}

// A single tappable row; `chevron` adds the trailing drill-in affordance for submenu rows,
// `active` marks the current page (primary label + a trailing check).
function MenuRow({ label, onPress, chevron, active }: { label: string; onPress: () => void; chevron?: boolean; active?: boolean }) {
  const { tokens } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 }}
    >
      <Text style={{ fontFamily: geist(active ? "600" : "500"), fontSize: 16, color: active ? tokens.primary : tokens.foreground }}>{label}</Text>
      {active ? <Icon check primary size={18} /> : chevron ? <Icon chevronRight size={18} muted /> : null}
    </Pressable>
  );
}
