import { View, Navbar, Button, Icon } from "@nannier/canvas";

export function MobileNavBar({ title, showBack, onBack, onMenu }: {
  title: string; showBack: boolean; onBack: () => void; onMenu: () => void;
}) {
  return <View role="banner"><Navbar brand={title}
    brandContent={showBack ? <Button ghost icon small accessibilityLabel="Back" iconLeft={<Icon chevronLeft />} onPress={onBack} /> : undefined}
    actions={<Button ghost icon small accessibilityLabel="Menu" iconLeft={<Icon menu />} onPress={onMenu} />}
  /></View>;
}
