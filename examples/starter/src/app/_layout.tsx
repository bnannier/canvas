import { useState } from "react";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Button, Column, Drawer, Dropdown, Icon, Navbar, OverlayProvider, ThemeProvider, Typography, View, useTheme } from "@nannier-com/canvas";
import { SessionProvider, useSession } from "../state/session";

function AppFrame() {
  const { tokens, dark } = useTheme();
  const session = useSession();
  const router = useRouter();
  const path = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = (index: number) => {
    setDrawerOpen(false);
    router.navigate(index === 1 ? "/preferences" : "/");
  };
  return (
    <OverlayProvider>
      {/* Safe-area and navigator sizing are app-frame plumbing, not control styling. */}
      <SafeAreaView edges={["top", "right", "bottom", "left"]} style={{ flex: 1, backgroundColor: tokens.background }}>
        <StatusBar style={dark ? "light" : "dark"} />
        <View role="banner">
          <Navbar
            bordered brand="Canvas Starter" links={["Workspace", "Preferences"]}
            active={path === "/preferences" ? 1 : path === "/" ? 0 : -1} onSelect={navigate}
            actions={<Button ghost accessibilityLabel="Open workspace menu" iconLeft={<Icon settings decorative />} onPress={() => setDrawerOpen(true)} />}
          />
        </View>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: tokens.background } }} />
        <Drawer right open={drawerOpen} onOpenChange={setDrawerOpen} accessibilityLabel="Workspace menu">
          <Column padLoose loose>
            <Column tight>
              <Typography h2>Workspace menu</Typography>
              <Typography muted>{session.workspace.name}</Typography>
            </Column>
            <Dropdown
              trigger="Navigate to" label="Screens"
              items={[{ label: "Workspace", icon: "layers" }, { label: "Preferences", icon: "settings" }]}
              onSelect={(_item, index) => navigate(index)}
            />
            <Typography small muted>Reset restores the sample workspace and preferences for this session.</Typography>
            <Button destructive onPress={() => { session.resetSession(); setDrawerOpen(false); router.navigate("/"); }}>Reset session</Button>
            <Button outline onPress={() => setDrawerOpen(false)}>Close menu</Button>
          </Column>
        </Drawer>
      </SafeAreaView>
    </OverlayProvider>
  );
}

function ThemedApp() {
  const { preferencesDraft } = useSession();
  return (
    <ThemeProvider dark={preferencesDraft.appearance === "dark"} light={preferencesDraft.appearance === "light"}>
      <AppFrame />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return <SafeAreaProvider><SessionProvider><ThemedApp /></SessionProvider></SafeAreaProvider>;
}
