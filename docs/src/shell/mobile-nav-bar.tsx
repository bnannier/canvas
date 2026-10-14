import { View, Navbar, Button, Icon } from "@nannier/canvas";
import { useAtScrollEdge } from "./scroll-edge";

export function MobileNavBar({ title, showBack, onBack, onMenu }: {
  title: string; showBack: boolean; onBack: () => void; onMenu: () => void;
}) {
  // Clear on the frame until content scrolls under the bar (./scroll-edge.tsx).
  const atEdge = useAtScrollEdge();
  return <View role="banner"><Navbar bare={atEdge} brand={title}
    brandContent={showBack ? <Button ghost icon small accessibilityLabel="Back" iconLeft={<Icon chevronLeft />} onPress={onBack} /> : undefined}
    actions={<Button ghost icon small accessibilityLabel="Menu" iconLeft={<Icon menu />} onPress={onMenu} />}
  /></View>;
}
