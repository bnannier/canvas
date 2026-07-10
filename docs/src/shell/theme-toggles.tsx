import { View, Text, Icon, Button, ButtonGroup, useTheme, liquidGlassAvailable } from "@olympusoss/canvas";
import { useDocsTheme } from "../theme/docs-theme";
import { geist } from "../ui/fonts";

// The scheme + frost toggles, shared by the mobile web drill-down sheet's footer and the
// native Android overflow sheet (iOS hosts the same controls as native UIMenu rows in
// the header instead). The Frost pair only shows where glass is opt-in; on iOS 26 the
// platform default is already glass, matching the OS.
export function ThemeToggles() {
  const { tokens } = useTheme();
  const { scheme, surface, toggleScheme, setSurface } = useDocsTheme();
  return (
    <>
      <Text style={{ fontFamily: geist("500"), fontSize: 13, color: tokens["muted-foreground"] }}>Appearance</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {!liquidGlassAvailable() ? (
          <ButtonGroup
            segmented
            small
            items={["Solid", "Frost"]}
            active={surface === "solid" ? 0 : 1}
            onSelect={(i) => setSurface(i === 0 ? "solid" : "glass")}
          />
        ) : null}
        <Button
          ghost
          icon
          small
          accessibilityLabel="Toggle color scheme"
          iconLeft={scheme === "dark" ? <Icon sun size={16} /> : <Icon moon size={16} />}
          onPress={toggleScheme}
        />
      </View>
    </>
  );
}
