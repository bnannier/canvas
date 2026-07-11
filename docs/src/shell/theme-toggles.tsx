import { View, Text, Icon, Button, ButtonGroup, useTheme, liquidGlassAvailable } from "@olympusoss/canvas";
import { useDocsTheme } from "../theme/docs-theme";
import { geist } from "../ui/fonts";

// The scheme + frost toggles, shown always-visible in the native Android top app bar
// (`compact`) and in the mobile web drill-down sheet's footer (labeled). iOS hosts the same
// controls as native UIMenu rows in the header instead. The Frost pair only shows where glass
// is opt-in; on iOS 26 the platform default is already glass, matching the OS.
export function ThemeToggles({ compact = false }: { compact?: boolean }) {
  const { tokens } = useTheme();
  const { scheme, surface, toggleScheme, setSurface } = useDocsTheme();
  const frostAvailable = !liquidGlassAvailable();

  const schemeToggle = (
    <Button
      ghost
      icon
      small
      accessibilityLabel="Toggle color scheme"
      iconLeft={scheme === "dark" ? <Icon sun size={16} /> : <Icon moon size={16} />}
      onPress={toggleScheme}
    />
  );

  // Compact form (the native Android top app bar): icon-only controls so the app-bar
  // title keeps its room. The surface toggle is a single layers icon that flips
  // Solid<->Frost, tinted primary when frost is on and muted when solid so its state
  // reads at a glance; the scheme is the shared sun/moon icon. (The wide labeled
  // Solid/Frost segmented control is kept for the roomier surfaces below.)
  if (compact) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
        {frostAvailable ? (
          <Button
            ghost
            icon
            small
            accessibilityLabel={surface === "glass" ? "Frost surface on; tap for solid" : "Solid surface; tap for frost"}
            iconLeft={surface === "glass" ? <Icon layers size={16} primary /> : <Icon layers size={16} muted />}
            onPress={() => setSurface(surface === "glass" ? "solid" : "glass")}
          />
        ) : null}
        {schemeToggle}
      </View>
    );
  }

  return (
    <>
      <Text style={{ fontFamily: geist("500"), fontSize: 13, color: tokens["muted-foreground"] }}>Appearance</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {frostAvailable ? (
          <ButtonGroup
            segmented
            small
            items={["Solid", "Frost"]}
            active={surface === "solid" ? 0 : 1}
            onSelect={(i) => setSurface(i === 0 ? "solid" : "glass")}
          />
        ) : null}
        {schemeToggle}
      </View>
    </>
  );
}
