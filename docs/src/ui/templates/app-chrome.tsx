import { StyleSheet } from "react-native";
import { Column, Row, View, useTheme, type IconName } from "@nannier/canvas";
import type { ExampleScope } from "../../core/scope";

// The Riskora app's chrome around an app template's screen (`Canvas v4.0.0 Templates.dc.html`,
// the frame's `webSide`, `webApp`, `iosApp` and `andApp` blocks): the kit Sidebar and a top
// bar of kit controls on the web, a large-title header and the floating TabBar on an iPhone,
// the Material 3 top app bar and navigation bar on a Pixel. Each part is taken from the
// frame's scope `K`, so it renders in that platform's skin. The bands' insets and heights
// are the hand-off's (docs frame scaffolding; the kit has no app chrome of this shape).

/** The web sidebar's rows: the hand-off's SIDE table, by template slug. */
const SIDE: readonly { slug: string; icon: IconName; label: string }[] = [
  { slug: "dashboard", icon: "layoutDashboard", label: "Overview" },
  { slug: "activity", icon: "activity", label: "Activity" },
  { slug: "identities", icon: "users", label: "Identities" },
  { slug: "team", icon: "userCog", label: "Team" },
  { slug: "inbox", icon: "inbox", label: "Inbox" },
  { slug: "chat", icon: "messagesSquare", label: "Assistant" },
  { slug: "calendar", icon: "calendarDays", label: "Calendar" },
  { slug: "kanban", icon: "columns2", label: "Board" },
  { slug: "detail-sidebar", icon: "receipt", label: "Orders" },
  { slug: "profile", icon: "circleUser", label: "Profile" },
  { slug: "settings", icon: "settings", label: "Settings" },
  { slug: "billing", icon: "creditCard", label: "Billing" },
  { slug: "api-keys", icon: "keyRound", label: "API keys" },
  { slug: "pricing", icon: "tags", label: "Plans" },
];

/** The phone tab bar's destinations: the hand-off's TABS table, by template slug. */
const TABS: readonly { slug: string; icon: IconName; label: string }[] = [
  { slug: "dashboard", icon: "home", label: "Home" },
  { slug: "inbox", icon: "inbox", label: "Inbox" },
  { slug: "kanban", icon: "columns2", label: "Board" },
  { slug: "chat", icon: "messageCircle", label: "Chat" },
  { slug: "settings", icon: "settings", label: "Settings" },
];

/**
 * The web app's sidebar: the kit Sidebar's groups embedded in the hand-off's 220 px rail
 * (the sunken fill and the end hairline), the Riskora lockup over the fourteen destinations.
 */
export function WebSidebar({ K, slug, go }: { K: ExampleScope; slug: string; go: (slug: string) => void }) {
  const { Sidebar, Avatar, Typography, ScrollView } = K;
  const { tokens } = useTheme();
  return (
    <View style={[styles.side, { backgroundColor: tokens["surface-sunken"], borderColor: tokens.border }]}>
      <ScrollView contentContainerStyle={styles.sideContent}>
        <Sidebar
          embedded
          accessibilityLabel="Riskora"
          active={slug}
          onSelect={(item) => { if (item.id != null) go(String(item.id)); }}
          header={
            <Row snug alignCenter>
              <Avatar logo initials="Rk" accessibilityLabel="Riskora" />
              <Column>
                <Typography small semibold>Riskora</Typography>
                <Typography tiny subtle>24 members</Typography>
              </Column>
            </Row>
          }
          items={SIDE.map((row) => ({ id: row.slug, label: row.label, icon: row.icon }))}
        />
      </ScrollView>
    </View>
  );
}

/** The web app's top bar: the kit Navbar holding the search field, the notifications button and the account photo. */
export function WebTopBar({ K }: { K: ExampleScope }) {
  const { Navbar, Input, Button, Icon, Avatar, useToast } = K;
  const { toast } = useToast();
  return (
    <Navbar
      brandContent={<Input small xs start leadingIcon icon="search" suffix="⌘K" placeholder="Search Riskora…" accessibilityLabel="Search Riskora" />}
      actions={
        <>
          <Button
            outline
            largeIcon
            accessibilityLabel="Notifications"
            iconLeft={<Icon bell decorative />}
            onPress={() => toast({ message: "3 new notifications" })}
          />
          <Avatar small src="/liang-bao.jpg" name="Liang Bao" />
        </>
      }
    />
  );
}

/** The iPhone's large-title header: the trailing actions over the screen's name. */
export function IosHeader({ K, title }: { K: ExampleScope; title: string }) {
  const { Icon, Typography } = K;
  return (
    <View style={styles.iosHead}>
      <Row end relaxed alignCenter>
        <Icon search primary size={20} accessibilityLabel="Search" />
        <Icon circlePlus primary size={20} accessibilityLabel="New" />
      </Row>
      <Typography h3 bold level={1}>{title}</Typography>
    </View>
  );
}

/** The Pixel's Material 3 top app bar: the kit Navbar in its Android skin, the menu, the screen's name, search and the account photo. */
export function AndroidTopBar({ K, title }: { K: ExampleScope; title: string }) {
  const { Navbar, Button, Icon, Avatar, useToast } = K;
  const { toast } = useToast();
  return (
    <Navbar
      brand={title}
      onMenu={() => toast({ message: "Menu opened" })}
      actions={
        <>
          <Button ghost largeIcon accessibilityLabel="Search" iconLeft={<Icon search decorative />} onPress={() => toast({ message: "Search opened" })} />
          <Avatar small src="/liang-bao.jpg" name="Liang Bao" />
        </>
      }
    />
  );
}

/** The phones' tab bar: the kit TabBar in the frame's skin, the floating capsule on iOS. */
export function PhoneTabBar({ K, slug, go, floating }: { K: ExampleScope; slug: string; go: (slug: string) => void; floating: boolean }) {
  const { TabBar, Icon } = K;
  const bar = (
    <TabBar
      active={TABS.some((t) => t.slug === slug) ? slug : ""}
      onSelect={go}
      items={TABS.map((tab) => ({
        key: tab.slug,
        label: tab.label,
        icon: (active: boolean) => <Icon {...{ [tab.icon]: true }} size={19} primary={active} muted={!active} decorative />,
      }))}
    />
  );
  return floating ? <View style={styles.floatingTabs} pointerEvents="box-none">{bar}</View> : bar;
}

const styles = StyleSheet.create({
  side: { width: 220, flexShrink: 0, borderRightWidth: 1 },
  sideContent: { paddingVertical: 16, paddingHorizontal: 12 },
  iosHead: { flexShrink: 0, paddingTop: 6, paddingHorizontal: 20, paddingBottom: 10 },
  floatingTabs: { position: "absolute", left: 12, right: 12, bottom: 10 },
});
