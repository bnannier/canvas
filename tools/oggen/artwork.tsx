import { AppRegistry, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Stop, Text as SvgText, TSpan } from "react-native-svg";
import { Row, Text, ThemeProvider, Typography, View, useTheme } from "../../src/index";
import { CanvasMark } from "../../docs/src/brand/canvas-mark";
import { useHeroPanels } from "../../docs/src/brand/hero-panels";
import { AURORA, COLLAGE, GRADIENT_TEXT, auroraDiscs, panelTransform, type CollagePanel } from "../../docs/src/brand/library-hero-look";

const DISCS = auroraDiscs(1200, 630);
const PANELS: readonly CollagePanel[] = [...COLLAGE.panels].sort((a, b) => a.z - b.z);

// Fixed-format brand artwork, sharing the homepage's actual illustration, tokens,
// perspective and glow. The output bounds never change a component skin.
function HeroArtwork() {
  const { tokens } = useTheme();
  const panels = useHeroPanels();
  return (
    <View testID="social-artwork" style={{ width: 1200, height: 630, backgroundColor: tokens.background, overflow: "hidden" }}>
      <Svg width={1200} height={630} style={{ position: "absolute" }} opacity={AURORA.opacity.dark}>
        <Defs>
          {DISCS.map((disc, i) => <RadialGradient key={i} id={`glow${i}`} cx="50%" cy="50%" r="50%">
            {disc.stops.map((stop, j) => <Stop key={j} offset={stop.offset} stopColor={tokens[disc.role]} stopOpacity={stop.opacity} />)}
          </RadialGradient>)}
        </Defs>
        {DISCS.map((disc, i) => <Circle key={i} cx={disc.cx} cy={disc.cy} r={disc.r} fill={`url(#glow${i})`} />)}
      </Svg>
      <View style={{ position: "absolute", left: 60, top: 62 }}>
        <Row alignCenter cozy>
          <CanvasMark size={52} />
          <Text style={{ fontFamily: "Bricolage Grotesque", fontSize: 40, fontWeight: "600", color: tokens.foreground, letterSpacing: -1.6 }}>Canvas</Text>
        </Row>
      </View>
      <View style={{ position: "absolute", left: 60, top: 218, width: 520 }}>
        <Svg width={520} height={140}>
          <Defs>
            <LinearGradient id="headline" gradientUnits="userSpaceOnUse" x1={235} y1={0} x2={340} y2={0}>
              {GRADIENT_TEXT.stops.map(stop => <Stop key={stop.role} offset={stop.offset} stopColor={tokens[stop.role]} />)}
            </LinearGradient>
            <LinearGradient id="platforms" x1="0%" y1="0%" x2="100%" y2="0%">
              {GRADIENT_TEXT.stops.map(stop => <Stop key={stop.role} offset={stop.offset} stopColor={tokens[stop.role]} />)}
            </LinearGradient>
          </Defs>
          <SvgText x={0} y={78} fill={tokens.foreground} fontFamily="Bricolage Grotesque" fontSize={86} fontWeight="500" letterSpacing={-3.87}>One UI <TSpan fill="url(#headline)">Kit.</TSpan></SvgText>
          <SvgText x={2} y={127} fill="url(#platforms)" fontFamily="Instrument Sans" fontSize={30} fontWeight="500" letterSpacing={-0.6}>iOS, Android, and Web.</SvgText>
        </Svg>
        <Text style={{ marginTop: 20, fontFamily: "Instrument Sans", fontSize: 21, lineHeight: 31, color: tokens["muted-foreground"] }}>Native controls. Customizable themes.{"\n"}One universal React Native UI kit.</Text>
      </View>
      <View style={{ position: "absolute", left: 62, bottom: 58 }}>
        <Typography body mono muted>canvas.nannier.com</Typography>
      </View>
      <View testID="social-collage" style={{ position: "absolute", left: 615, top: 82, width: 648, height: COLLAGE.height, transformOrigin: [0, 0, 0], transform: [{ scale: 0.93 }] }}>
        {PANELS.map(panel => <View key={panel.id} testID={`social-panel-${panel.id}`} style={{ position: "absolute", left: panel.x, top: panel.y, width: panel.width, transformOrigin: [0, 0, 0], transform: panelTransform(panel, 648) as ViewStyle["transform"] }}>{panels[panel.id]}</View>)}
      </View>
    </View>
  );
}

function ShareArtwork() {
  return <ThemeProvider dark solid fonts={{ sans: "Instrument Sans", display: "Bricolage Grotesque", mono: "JetBrains Mono" }}><HeroArtwork /></ThemeProvider>;
}

AppRegistry.registerComponent("CanvasSocialArtwork", () => ShareArtwork);
AppRegistry.runApplication("CanvasSocialArtwork", { rootTag: document.getElementById("root") });
