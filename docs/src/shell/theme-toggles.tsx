import { Typography, Row, Icon, Button, ButtonGroup, liquidGlassAvailable, type Palette } from "@nannier/canvas";
import { useDocsTheme } from "../theme/docs-theme";

// The docs' appearance controls. The scheme + surface toggles show always-visible in the
// native Android AND iOS top bars (`compact`, placed beside the hamburger) and in the
// mobile web drill-down sheet's footer (labeled). The compact form always offers the
// Solid/Glass toggle (both looks are worth switching between even where glass is the OS
// default); the labeled form only shows it where glass is opt-in. The label names the
// surface MODE, not the material a given platform happens to paint for it (Liquid Glass,
// a lens, or a frost).
//
// The palette control lists the kit's five accent hues and shows in both schemes, since
// a palette paints its accent in either: in the labeled form, as the Android menu
// drawer's footer row (PaletteRow), and as the Palette section of the iOS header menu
// (paletteMenuSection). The desktop web Topbar does not carry it: the bar is narrowest at
// the desktop cut, where the longest page title leaves no room for five segments. A
// tablet-width window shows the narrow shell instead, whose drawer carries the labeled
// form.

export type { Palette };

/** The palettes in the order every palette control lists them, the kit's default first. */
const PALETTE_OPTIONS: readonly { value: Palette; label: string }[] = [
  { value: "violet", label: "Violet" },
  { value: "cyan", label: "Cyan" },
  { value: "mint", label: "Mint" },
  { value: "rose", label: "Rose" },
  { value: "amber", label: "Amber" },
];

/** The palette segmented control. */
export function PaletteToggle() {
  const { palette, setPalette } = useDocsTheme();
  return (
    <ButtonGroup
      segmented
      small
      accessibilityLabel="Palette"
      items={PALETTE_OPTIONS.map((p) => p.label)}
      active={PALETTE_OPTIONS.findIndex((p) => p.value === palette)}
      onSelect={(i) => setPalette(PALETTE_OPTIONS[i].value)}
    />
  );
}

// The Android menu drawer's footer: the palette control under its own label, as the
// labeled form titles its row. The bar above the drawer already carries the compact
// surface and scheme toggles, so the drawer adds only the palette.
export function PaletteRow() {
  return (
    <>
      <Typography small subtle>Palette</Typography>
      <Row snug alignCenter>
        <PaletteToggle />
      </Row>
    </>
  );
}

/** A native UIMenu action, in the shape the iOS header's trailing menu takes. */
export interface PaletteMenuAction {
  type: "action";
  label: string;
  onPress: () => void;
  state?: "on";
}

/** An inline UIMenu section: its rows sit in the parent menu under the section's title. */
export interface PaletteMenuSection {
  type: "submenu";
  label: string;
  inline: true;
  items: PaletteMenuAction[];
}

/**
 * The iOS header menu's Palette section: the five hues as native rows, the palette in
 * force check-marked, the way an iOS menu marks the one choice of several.
 */
export function paletteMenuSection(palette: Palette, setPalette: (p: Palette) => void): PaletteMenuSection[] {
  return [
    {
      type: "submenu",
      label: "Palette",
      inline: true,
      items: PALETTE_OPTIONS.map((p) => ({
        type: "action",
        label: p.label,
        onPress: () => setPalette(p.value),
        ...(p.value === palette ? { state: "on" as const } : {}),
      })),
    },
  ];
}

export function ThemeToggles({ compact = false }: { compact?: boolean }) {
  const { scheme, surface, toggleScheme, setSurface } = useDocsTheme();
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
        <PaletteToggle />
        {schemeToggle}
      </Row>
    </>
  );
}
