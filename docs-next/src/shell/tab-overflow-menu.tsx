import { Modal } from "react-native";
import { Text, Pressable, useTheme, GlassSurface } from "@olympusoss/canvas";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NAV_ROUTES } from "../data/nav";
import { TOPBAR_HEIGHT } from "./topbar";
import { geist } from "../ui/fonts";

// The hamburger overflow for a tab's contextual header: a Liquid Glass sheet that
// drops below the header listing the tab's overflow routes. Each row navigates and
// closes. Tapping the scrim dismisses.
export function TabOverflowMenu({
  visible,
  onClose,
  routeKeys,
}: {
  visible: boolean;
  onClose: () => void;
  routeKeys: string[];
}) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const go = (href: string) => {
    onClose();
    router.push(href as never);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", paddingTop: insets.top + TOPBAR_HEIGHT + 4, paddingHorizontal: 12 }}
        onPress={onClose}
      >
        <Pressable onPress={() => {}}>
          <GlassSurface
            style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: tokens.border,
              paddingVertical: 6,
              overflow: "hidden",
              alignSelf: "flex-end",
              minWidth: 220,
            }}
          >
            {routeKeys.map((key) => {
              const r = NAV_ROUTES[key];
              return (
                <Pressable key={key} onPress={() => go(r.href)} style={{ paddingHorizontal: 18, paddingVertical: 12 }}>
                  <Text style={{ fontFamily: geist("500"), fontSize: 15, color: tokens.foreground }}>{r.label}</Text>
                </Pressable>
              );
            })}
          </GlassSurface>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
