import { registerRootComponent } from "expo";
import { NavigationContainer } from "expo-router/react-navigation";
import { createNativeStackNavigator } from "expo-router/build/react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useState } from "react";
import { Appearance, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Chart,
  Icon,
  OverlayProvider,
  Switch,
  ThemeProvider,
} from "@nannier/canvas";
import { CanvasMark } from "../src/brand/canvas-mark";
import { CANVAS_FONTS, useDocsFonts } from "../src/ui/fonts";

const DESIGN_WIDTH = 402;
const DESIGN_HEIGHT = 872;
const HEADLINE_FACE = "BricolageGrotesque_600SemiBold_opsz56";
const APP_FACE = "InstrumentSans_600SemiBold";
const MONO_FACE = "JetBrainsMono_500Medium";

const PERIODS = [
  { label: "Daily revenue", total: "$18,400", values: [11, 13, 10, 16, 14, 20, 24], ticks: ["12a", "4a", "8a", "12p", "4p", "8p", "12a"] },
  { label: "Weekly revenue", total: "$32,094", values: [12, 18, 14, 19, 18, 24, 28], ticks: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  { label: "Monthly revenue", total: "$128,400", values: [11, 15, 13, 21, 19, 26, 30], ticks: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"] },
];

function Aurora() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden>
      <Svg width="100%" height="100%" viewBox="0 0 402 872" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="ink" x1="0" y1="0" x2="402" y2="872" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#171526" />
            <Stop offset=".53" stopColor="#0b0c16" />
            <Stop offset="1" stopColor="#090b14" />
          </LinearGradient>
          <RadialGradient id="violet" cx="64" cy="475" rx="292" ry="350" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#713bf0" stopOpacity=".48" />
            <Stop offset=".5" stopColor="#492296" stopOpacity=".3" />
            <Stop offset="1" stopColor="#30165c" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="cyan" cx="397" cy="582" rx="263" ry="286" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#1cc5e7" stopOpacity=".3" />
            <Stop offset=".53" stopColor="#1289a9" stopOpacity=".17" />
            <Stop offset="1" stopColor="#12304b" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="bottom" x1="0" y1="690" x2="0" y2="872" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#0a0b14" stopOpacity="0" />
            <Stop offset="1" stopColor="#080a11" stopOpacity=".88" />
          </LinearGradient>
        </Defs>
        <Rect width="402" height="872" fill="url(#ink)" />
        <Rect width="402" height="872" fill="url(#violet)" />
        <Rect width="402" height="872" fill="url(#cyan)" />
        <Rect width="402" y="690" height="182" fill="url(#bottom)" />
      </Svg>
    </View>
  );
}

function LeadSpecimens({ tablet }: { tablet: boolean }) {
  const [period, setPeriod] = useState(2);
  const [preview, setPreview] = useState(true);
  const [published, setPublished] = useState(false);
  const metric = PERIODS[period];
  return (
    <>
      <View style={[styles.revenue, tablet && styles.revenueTablet]}>
        <Card raised largeCorners style={styles.revenueCard}>
          <View style={styles.summary}>
            <View>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{metric.total}</Text>
            </View>
            <Badge success soft>+18.2%</Badge>
          </View>
          <Chart
            key={period}
            plain
            data={metric.ticks.map((label, i) => ({ label, value: metric.values[i] }))}
            max={32}
            formatValue={(value) => '$' + value + 'k'}
            selected={preview ? 5 : null}
          />
        </Card>
      </View>
      <View style={[styles.period, tablet && styles.periodTablet]}>
        <ButtonGroup
          block large rounded
          items={["Day", "Week", "Month"]}
          active={period}
          onSelect={setPeriod}
          accessibilityLabel="Revenue period"
        />
      </View>
      <View style={[styles.actions, tablet && styles.actionsTablet]}>
        <Card raised largeCorners style={styles.actionsCard}>
          <View style={styles.switchRow}>
            <Icon layers size={23} color="#b6a6ff" decorative />
            <Text style={styles.switchLabel}>Liquid Glass</Text>
            <Switch defaultChecked accessibilityLabel="Liquid Glass" />
          </View>
          <View style={styles.buttons}>
            <View style={styles.preview}>
              <Button secondary large block onPress={() => setPreview(value => !value)}>Preview</Button>
            </View>
            <View style={styles.publish}>
              <Button
                primary large block
                iconRight={<Icon arrowUpRight size={19} decorative />}
                onPress={() => setPublished(true)}
              >
                {published ? "Published" : "Publish"}
              </Button>
            </View>
          </View>
        </Card>
      </View>
    </>
  );
}

function LeadArtboard() {
  const { width, height } = useWindowDimensions();
  const [loaded] = useDocsFonts();
  const tablet = width >= 700;
  const artWidth = tablet ? 592 : DESIGN_WIDTH;
  const artHeight = tablet ? 850 : DESIGN_HEIGHT;
  const scale = Math.min(width / artWidth, height / artHeight);
  return (
    <ThemeProvider dark glass fonts={CANVAS_FONTS}>
      <OverlayProvider>
        <View style={styles.root}>
          <Aurora />
          {loaded ? <View
            style={[
              styles.layout,
              { width: artWidth, height: artHeight, left: (width - artWidth) / 2, top: (height - artHeight) / 2, transform: [{ scale }] },
            ]}
            testID="store-lead-artwork"
          >
            <View style={[styles.brand, tablet && styles.brandTablet]}>
              <CanvasMark size={35} />
              <Text style={styles.wordmark}>Canvas</Text>
            </View>
            <View style={[styles.titleBlock, tablet && styles.titleBlockTablet]}>
              <Text style={[styles.headline, tablet && styles.headlineTablet]} numberOfLines={1} adjustsFontSizeToFit>Explore <Text style={styles.number}>108</Text></Text>
              <Text style={[styles.headline, styles.secondaryLine, tablet && styles.headlineTablet]} numberOfLines={1} adjustsFontSizeToFit>live components.</Text>
            </View>
            <LeadSpecimens tablet={tablet} />
          </View> : null}
        </View>
      </OverlayProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0b14" },
  layout: { position: "absolute", width: DESIGN_WIDTH, height: DESIGN_HEIGHT },
  brand: { position: "absolute", top: 57, left: 34, flexDirection: "row", gap: 9, alignItems: "center" },
  wordmark: { color: "#f3f0fc", fontFamily: APP_FACE, fontSize: 26, letterSpacing: -0.8 },
  titleBlock: { position: "absolute", left: 34, right: 27, top: 118 },
  brandTablet: { left: 46, top: 50 },
  titleBlockTablet: { left: 47, right: 35, top: 108 },
  headlineTablet: { fontFamily: "BricolageGrotesque_600SemiBold_opsz72", fontSize: 76, lineHeight: 78, letterSpacing: -4.4 },
  headline: { color: "#f5f2ff", fontFamily: HEADLINE_FACE, fontSize: 56, lineHeight: 62, letterSpacing: -3.5 },
  number: { color: "#bbabff" },
  secondaryLine: { color: "#ebe6fb", marginTop: -1 },
  revenue: { position: "absolute", left: 26, top: 313, width: 350, transform: [{ rotate: "-3deg" }] },
  revenueTablet: { left: 41, top: 311, width: 492 },
  revenueCard: {
    backgroundColor: "#202035",
    borderColor: "#4e416d",
    padding: 22,
    gap: 10,
    boxShadow: "0px 31px 80px rgba(6,5,16,.65)",
  },
  summary: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  metricLabel: { fontFamily: MONO_FACE, color: "#b6afc8", fontSize: 10, letterSpacing: 1.05, textTransform: "uppercase" },
  metricValue: { fontFamily: HEADLINE_FACE, color: "#f7f3ff", fontSize: 43, lineHeight: 48, letterSpacing: -2, marginTop: 5 },
  period: {
    position: "absolute", left: 88, top: 270, width: 283, transform: [{ rotate: "3deg" }],
    boxShadow: "0px 16px 30px rgba(7,7,19,.35)",
  },
  periodTablet: { left: 190, top: 269, width: 342 },
  actionsTablet: { left: 167, top: 652, width: 371 },
  actions: { position: "absolute", left: 70, top: 613, width: 302, transform: [{ rotate: "3deg" }] },
  actionsCard: {
    backgroundColor: "#252436",
    borderColor: "#574c73",
    padding: 17,
    gap: 16,
    boxShadow: "0px 28px 60px rgba(7,7,19,.62)",
  },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  switchLabel: { flex: 1, fontFamily: APP_FACE, fontSize: 20, color: "#f4f0fc", letterSpacing: -0.3 },
  buttons: { flexDirection: "row", alignItems: "center", gap: 9 },
  preview: { flex: 1 },
  publish: { flex: 1.15 },
});

const Stack = createNativeStackNavigator();

function ArtworkApp() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            statusBarHidden: true,
            autoHideHomeIndicator: true,
            animation: "none",
            contentStyle: { backgroundColor: "#0a0b14" },
          }}
        >
          <Stack.Screen name="Artwork" component={LeadArtboard} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

Appearance.setColorScheme("dark");
registerRootComponent(ArtworkApp);
