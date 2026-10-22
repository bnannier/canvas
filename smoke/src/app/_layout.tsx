import { useState } from "react";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Button, Column, Drawer, Navbar, OverlayProvider, ScrollView, ThemeProvider, Typography, View, useTheme } from "@nannier/canvas";
import { JOURNEYS } from "../catalog/journeys";

function AppFrame() {
  const { tokens, dark } = useTheme();
  const router = useRouter();
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (route: string) => {
    setMenuOpen(false);
    router.navigate(route);
  };
  return (
    <OverlayProvider>
      {/* Safe-area and navigator sizing are app-frame plumbing, not control styling. */}
      <SafeAreaView edges={["top", "right", "bottom", "left"]} style={{ flex: 1, backgroundColor: tokens.background }}>
        <StatusBar style={dark ? "light" : "dark"} />
        <View role="banner">
          <Navbar bordered brand="Canvas Smoke Test" onMenu={() => setMenuOpen(true)} />
        </View>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: tokens.background } }} />
        <Drawer open={menuOpen} onOpenChange={setMenuOpen} accessibilityLabel="Smoke test menu">
          <ScrollView style={{ flex: 1 }}>
            <Column padLoose loose>
              <Button ghost selected={path === "/"} onPress={() => go("/")}>Home</Button>
              <Column tight>
                <Typography h3>Journeys</Typography>
                {JOURNEYS.map((journey) => (
                  <Button key={journey.route} ghost selected={path === journey.route} onPress={() => go(journey.route)}>{journey.title}</Button>
                ))}
              </Column>
            </Column>
          </ScrollView>
        </Drawer>
      </SafeAreaView>
    </OverlayProvider>
  );
}

export default function RootLayout() {
  return <SafeAreaProvider><ThemeProvider><AppFrame /></ThemeProvider></SafeAreaProvider>;
}
