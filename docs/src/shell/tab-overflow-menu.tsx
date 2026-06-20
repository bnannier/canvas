import { Text, Pressable, Drawer, useTheme } from "@olympusoss/canvas";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NAV_ROUTES } from "../data/nav";
import { geist } from "../ui/fonts";

// The overflow menu for a native tab's contextual header: a kit Drawer bottom sheet
// listing the tab's overflow routes. Each row navigates and closes; tapping the scrim
// dismisses. (Native iOS/Android only; the web uses the sidebar.)
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
    <Drawer
      open={visible}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      bottom
      style={{ paddingTop: 8, paddingBottom: insets.bottom + 8 }}
    >
      {routeKeys.map((key) => {
        const r = NAV_ROUTES[key];
        return (
          <Pressable key={key} onPress={() => go(r.href)} style={{ paddingHorizontal: 20, paddingVertical: 14 }}>
            <Text style={{ fontFamily: geist("500"), fontSize: 16, color: tokens.foreground }}>{r.label}</Text>
          </Pressable>
        );
      })}
    </Drawer>
  );
}
