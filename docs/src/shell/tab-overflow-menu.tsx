import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, BackHandler, Platform, StyleSheet, useWindowDimensions } from "react-native";
import { Text, Pressable, ScrollView, View, Icon, useTheme } from "@olympusoss/canvas";
import { useRouter } from "expo-router";
import type { MenuNode } from "../data/nav";
import { geist } from "../ui/fonts";

// The overflow menu for a native tab's contextual header: a bottom sheet that walks the
// recursive menu tree (see nativeMenuFor) as an N-LEVEL drill-down. A leaf row navigates and
// closes; a submenu row drills one level deeper (e.g. Home -> Components -> Atoms -> a page);
// the back row (or hardware back) pops. Tapping the scrim dismisses. (iOS uses the native
// UIMenu, so this renders on Android + mobile-web in practice; desktop web uses the sidebar.)
//
// It is an IN-CONTENT overlay, NOT a full-screen Modal. A Modal portals into its own native
// window ABOVE the app, so on Android it painted over the native bottom tab bar and clipped its
// active pill. Rendered as a plain absolutely-positioned layer inside the screen body instead,
// the persistent native chrome — the top app bar and the bottom tab bar — naturally paints on
// top of it (they are native views outside the React screen), so both bars stay fully visible
// and crisp while the sheet is open. `bottomInset` lifts the sheet's content clear of the tab
// bar that now sits on top of it (the native tab bar's height on Android; 0 on mobile-web,
// where the kit TabBar is an in-flow sibling below the content area this overlay fills).
export function TabOverflowMenu({
  visible,
  onClose,
  menu,
  activeGroup,
  activeSlug,
  bottomInset = 0,
  footer,
}: {
  visible: boolean;
  onClose: () => void;
  menu: MenuNode[];
  /** The current page's category, so the drill-down reopens pre-drilled into it. */
  activeGroup?: string | null;
  /** The current page's slug, to mark it in the list. */
  activeSlug?: string;
  /** Space to lift the sheet's content clear of a tab bar painting on top of it (native). */
  bottomInset?: number;
  /** Optional sheet footer (e.g. the mobile-web theme toggles, kept off the iOS-style bar). */
  footer?: ReactNode;
}) {
  const { tokens } = useTheme();
  const { height } = useWindowDimensions();
  const router = useRouter();
  const useDriver = Platform.OS !== "web";

  // The drill path: a stack of levels (the root, then each submenu drilled into). The top of
  // the stack is what renders; `title` labels the back row.
  const [stack, setStack] = useState<{ title?: string; nodes: MenuNode[] }[]>([{ nodes: menu }]);
  const wasVisible = useRef(false);
  const slide = useRef(new Animated.Value(0)).current;

  // Open/close lifecycle: kept mounted through the exit slide, then unmounted so a closed sheet
  // never sits over the content eating touches. `progress` (0 closed -> 1 open) drives both the
  // scrim fade and the sheet rise; opacity + translateY are transform-safe on Android New Arch.
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [sheetH, setSheetH] = useState(0);

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

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, { toValue: 1, duration: 220, useNativeDriver: useDriver }).start();
    } else if (mounted) {
      Animated.timing(progress, { toValue: 0, duration: 180, useNativeDriver: useDriver }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, mounted, progress, useDriver]);

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

  // Android hardware back pops one drill level, or closes at the root (matching the back row /
  // scrim). Only wired while open; a no-op on iOS/web.
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setStack((s) => {
        if (s.length > 1) {
          animateIn(-1);
          return s.slice(0, -1);
        }
        onClose();
        return s;
      });
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!mounted) return null;

  const level = stack[stack.length - 1];
  const depth = stack.length - 1;
  const sheetTravel = sheetH || Math.round(height * 0.7);

  return (
    // Tell assistive tech the content behind the open sheet is inert (iOS VoiceOver honors this;
    // a no-op elsewhere). No Modal window, so the native top + bottom bars stay above this layer.
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      {/* Dim scrim: a fade-in over the content. pointerEvents none so taps fall to the dismiss
          catcher below it. */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: "#000", opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }) }]}
      />
      {/* The dismiss affordance is not a control to land on: keep it out of the focus order and
          unannounced (matching the kit's overlay backdrops). */}
      <Pressable accessible={false} style={StyleSheet.absoluteFill} onPress={onClose} />
      <Animated.View
        onLayout={(e) => setSheetH(e.nativeEvent.layout.height)}
        style={[
          styles.sheet,
          {
            backgroundColor: tokens.card,
            borderColor: tokens.border,
            paddingBottom: bottomInset + 8,
            transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [sheetTravel, 0] }) }],
          },
        ]}
      >
        <View style={styles.grabber(tokens)} />
        {depth > 0 ? (
          <Pressable
            onPress={pop}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderColor: tokens.border }}
          >
            <Icon chevronLeft size={18} />
            <Text style={{ fontFamily: geist("600"), fontSize: 16, color: tokens.foreground }}>{level.title ?? ""}</Text>
          </Pressable>
        ) : null}
        {/* flexShrink lets this scroll area collapse when the list is longer than the sheet's
            maxHeight (so the ScrollView is bounded and scrolls); a short list keeps the sheet
            sized to its content. */}
        <Animated.View style={{ flexShrink: 1, transform: [{ translateX: slide }] }}>
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
        {footer ? (
          <View style={{ borderTopWidth: 1, borderColor: tokens.border, marginTop: 4, paddingTop: 12, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            {footer}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = {
  sheet: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "82%" as const,
    borderTopStartRadius: 28,
    borderTopEndRadius: 28,
    borderTopWidth: 1,
    paddingTop: 8,
    overflow: "hidden" as const,
  },
  grabber: (tokens: ReturnType<typeof useTheme>["tokens"]) => ({
    alignSelf: "center" as const,
    width: 32,
    height: 4,
    borderRadius: 9999,
    backgroundColor: tokens.border,
    marginBottom: 4,
  }),
};

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
