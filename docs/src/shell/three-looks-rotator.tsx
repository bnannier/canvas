import { useState } from "react";
import { Column, Container, Grid, Typography, Button, Row, Icon, Image } from "@nannier/canvas";
import { useRouter } from "expo-router";
import { COMPONENTS } from "../core/data/components";
import { FIRST_EXAMPLE_CODE } from "../core/previews";
import { LOOKS_SHOTS, LOOKS_ASPECT } from "./looks-shots";
import { DeviceFrame } from "./device-frames";

// The landing page's comparison hero: full device-screen captures of each atom's docs
// page, taken on the iPhone 17 Pro simulator, the Android emulator retargeted to that
// same screen, and phone-width web, stepping alphabetically through every atom with a
// captured set on the reader's own chevrons (nothing advances or fades on its own).
// Baked images (not live renders) so each pane is the platform's true full-screen view,
// status bar and tab bar included; the drawn DeviceFrame supplies the bezel and camera
// cutout around it. The code chip and the "Open <Atom>" CTA follow the atom on stage.
// Regenerate the shots with `bun scripts/capture-looks.ts`.

const PLATFORMS = [
  { key: "ios", label: "iOS", device: "iPhone 17 Pro" },
  { key: "android", label: "Android", device: "Pixel 10 Pro" },
  { key: "web", label: "Web", device: "Chrome" },
] as const;

// The code chip quotes each atom's first example from the generated previews map (a
// few kilobytes of strings) rather than the component docs modules, which are the
// component pages' own chunks in the web export and have no business on the home page.
const ATOMS = COMPONENTS.filter((c) => c.category === "Atoms" && LOOKS_SHOTS[c.slug])
  .map((c) => ({ ...c, code: FIRST_EXAMPLE_CODE[c.dir ?? c.slug] }))
  .sort((a, b) => a.name.localeCompare(b.name));

// False on native, where looks-shots.ts resolves to the empty fallback map: the
// section is web-only (on a device you ARE the platform), and gating on the data
// keeps the home shell free of Platform branches.
export const LOOKS_AVAILABLE = ATOMS.length > 0;

// First line of the example's JSX, elided when the fence is longer: the chip is a
// scent of the API, the component page has the full code.
function codePreview(code: string) {
  const lines = code.split("\n");
  const first = lines[0].trim();
  const clipped = first.length > 64 ? `${first.slice(0, 63)}…` : first;
  return lines.length > 1 && clipped === first ? `${first} …` : clipped;
}

// LOOKS_AVAILABLE is the real gate (home.tsx checks it before rendering this); the
// repeat here is the safety net for any other call site, since the body below indexes
// ATOMS unconditionally. It sits in this hook-free shell rather than inside the body:
// an early return above a hook call makes every hook after it conditional, which is a
// rules-of-hooks violation and would break as soon as the shot map went from empty to
// populated (or back) within one bundle.
export function ThreeLooksRotator() {
  if (!LOOKS_AVAILABLE) return null; // shot map not generated for this platform
  return <Rotator />;
}

function Rotator() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const atom = ATOMS[index % ATOMS.length];
  const shots = LOOKS_SHOTS[atom.slug];
  const code = atom.code;

  const step = (delta: number) => setIndex((i) => (i + delta + ATOMS.length) % ATOMS.length);

  return <Column relaxed>
    <Row snug alignCenter>
      <Button ghost icon small iconLeft={<Icon chevronLeft />} accessibilityLabel="Previous atom" onPress={() => step(-1)} />
      <Column fill alignCenter flush>
        <Typography h3>{atom.name}</Typography>
        <Typography tiny subtle>{(index % ATOMS.length) + 1}/{ATOMS.length}</Typography>
      </Column>
      <Button ghost icon small iconLeft={<Icon chevronRight />} accessibilityLabel="Next atom" onPress={() => step(1)} />
    </Row>
    <Container wider>
      <Grid columns={3} minTileWidth={256} relaxed>
        {PLATFORMS.map(p => <Column key={p.key} snug alignCenter>
          <Typography small semibold>{p.label}</Typography>
          <Typography tiny subtle>{p.device}</Typography>
          <DeviceFrame variant={p.key} aspect={LOOKS_ASPECT} label={p.device}>
            <Image cover source={shots[p.key]} accessibilityLabel={`The ${atom.name} docs page as it renders on ${p.label}`} width="100%" height="100%" />
          </DeviceFrame>
        </Column>)}
      </Grid>
    </Container>
    <Column relaxed alignCenter>
      {code ? <Typography code>{codePreview(code)}</Typography> : null}
      <Row cozy wrap center>
        <Button primary large href="/components" iconRight={<Icon arrowRight primaryForeground />} onPress={() => router.push("/components" as never)}>See every component live</Button>
        <Button outline large href={`/components/${atom.slug}`} onPress={() => router.push(`/components/${atom.slug}` as never)}>Open {atom.name}</Button>
      </Row>
    </Column>
  </Column>;
}
