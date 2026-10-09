import { Typography, Row, Icon, Button, ButtonGroup, liquidGlassAvailable } from "@nannier/canvas";
import { useDocsTheme } from "../theme/docs-theme";

// The scheme + surface toggles, shown always-visible in the native Android AND iOS top bars
// (`compact`, placed beside the hamburger) and in the mobile web drill-down sheet's footer
// (labeled). The compact form always offers the Solid/Glass toggle (both looks are worth
// switching between even where glass is the OS default); the labeled form only shows it where
// glass is opt-in. The label names the surface MODE, not the material a given platform
// happens to paint for it (Liquid Glass, a lens, or a frost). The labeled form alone also
// carries the Blush/Mint palette control, in the light scheme only: the dark scheme has one
// palette, so the choice has nothing to paint there, and the Topbar has no room for it at
// tablet width.
export function ThemeToggles({ compact = false }: { compact?: boolean }) {
  const { scheme, surface, palette, toggleScheme, setSurface, setPalette } = useDocsTheme();
  const glassAvailable = !liquidGlassAvailable();

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
  // Solid<->Glass, tinted primary when glass is on and muted when solid so its state
  // reads at a glance; the scheme is the shared sun/moon icon. (The wide labeled
  // Solid/Glass segmented control is kept for the roomier surfaces below.)
  if (compact) {
    return (
      <Row tight alignCenter>
        <Button
          ghost
          icon
          small
          accessibilityLabel={surface === "glass" ? "Glass surface on; tap for solid" : "Solid surface; tap for glass"}
          iconLeft={surface === "glass" ? <Icon layers size={16} primary /> : <Icon layers size={16} muted />}
          onPress={() => setSurface(surface === "glass" ? "solid" : "glass")}
        />
        {schemeToggle}
      </Row>
    );
  }

  // The row wraps: at phone width the drawer footer cannot always seat two segmented
  // groups and the scheme button on one line.
  return (
    <>
      <Typography small subtle>Appearance</Typography>
      <Row snug alignCenter wrap>
        {glassAvailable ? (
          <ButtonGroup
            segmented
            small
            accessibilityLabel="Surface"
            items={["Solid", "Glass"]}
            active={surface === "solid" ? 0 : 1}
            onSelect={(i) => setSurface(i === 0 ? "solid" : "glass")}
          />
        ) : null}
        {scheme === "light" ? (
          <ButtonGroup
            segmented
            small
            accessibilityLabel="Palette"
            items={["Blush", "Mint"]}
            active={palette === "blush" ? 0 : 1}
            onSelect={(i) => setPalette(i === 0 ? "blush" : "mint")}
          />
        ) : null}
        {schemeToggle}
      </Row>
    </>
  );
}
