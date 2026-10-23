import { useState } from "react";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Accordion, AppFrame, Button, Column, Drawer, Navbar, ThemeProvider, useTheme } from "@nannier/canvas";
import { CATALOG } from "../catalog/components";
import { JOURNEYS } from "../catalog/journeys";

function SmokeFrame() {
  const { tokens, dark } = useTheme();
  const router = useRouter();
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (route: string) => {
    setMenuOpen(false);
    router.navigate(route);
  };
  return (
    <AppFrame header={<Navbar bordered brand="Canvas Smoke Test" onMenu={() => setMenuOpen(true)} />}>
      <StatusBar style={dark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: tokens.background } }} />
      <Drawer navigation open={menuOpen} onOpenChange={setMenuOpen} accessibilityLabel="Smoke test menu">
        <Column padLoose loose>
          <Button ghost selected={path === "/"} onPress={() => go("/")}>Home</Button>
          <Accordion
            multiple
            defaultValue={path.startsWith("/components/") ? CATALOG.filter((group) => group.components.some((c) => path === `/components/${c.slug}`)).map((group) => group.category) : ["Journeys"]}
            items={[
              {
                key: "Journeys",
                title: "Journeys",
                description: `${JOURNEYS.length} verification screens`,
                content: (
                  <Column tight>
                    {JOURNEYS.map((journey) => (
                      <Button key={journey.route} ghost selected={path === journey.route} onPress={() => go(journey.route)}>{journey.title}</Button>
                    ))}
                  </Column>
                ),
              },
              ...CATALOG.map((group) => ({
                key: group.category,
                title: group.category,
                description: `${group.components.length} components`,
                content: (
                  <Column tight>
                    {group.components.map((component) => (
                      <Button key={component.slug} ghost selected={path === `/components/${component.slug}`} onPress={() => go(`/components/${component.slug}`)}>{component.name}</Button>
                    ))}
                  </Column>
                ),
              })),
            ]}
          />
        </Column>
      </Drawer>
    </AppFrame>
  );
}

export default function RootLayout() {
  return <ThemeProvider><SmokeFrame /></ThemeProvider>;
}
