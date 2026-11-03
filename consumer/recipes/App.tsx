import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Column, Container, Navbar, OverlayProvider, ScrollView, Switch, ThemeProvider, Typography, useTheme } from "@nannier/canvas";
import config from "./recipe-config.json";
import packageMetadata from "./package.json";
import { Settings, useSettings } from "./src/recipes/settings";
import { Dashboard, useDashboard } from "./src/recipes/dashboard";
import { Booking, useBooking } from "./src/recipes/booking";

const recipes = ["settings", "dashboard", "booking"];
function Recipes({ dark, onDarkChange }: { dark: boolean; onDarkChange: (dark: boolean) => void }) {
  const { tokens } = useTheme();
  const [active, setActive] = useState(Math.max(0, recipes.indexOf(config.initialRecipe)));
  // State lives above the navigation, so switching recipes preserves each draft.
  const settings = useSettings();
  const dashboard = useDashboard();
  const booking = useBooking();
  return <OverlayProvider>
    {/* App-frame plumbing supplies the viewport; semantic Canvas containers bound the content. */}
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.background }}>
      <StatusBar style={dark ? "light" : "dark"} />
      <Navbar bordered scrolls brand="Canvas Recipes" links={["Settings", "Dashboard", "Booking"]} active={active} onSelect={setActive} actions={<Switch chip checked={dark} onChange={onDarkChange}>Dark mode</Switch>} />
      <ScrollView key={active} role="main" keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
        <Container page><Column pad relaxed>
          {active === 0 ? <Settings model={settings} /> : active === 1 ? <Dashboard model={dashboard} /> : <Booking model={booking} />}
          <Typography small muted>Built with @nannier/canvas {packageMetadata.dependencies["@nannier/canvas"]} · Frontend state only · Reload to reset</Typography>
        </Column></Container>
      </ScrollView>
    </SafeAreaView>
  </OverlayProvider>;
}
export default function App() {
  const [dark, setDark] = useState(false);
  return <SafeAreaProvider><ThemeProvider light={!dark} dark={dark} solid><Recipes dark={dark} onDarkChange={setDark} /></ThemeProvider></SafeAreaProvider>;
}
