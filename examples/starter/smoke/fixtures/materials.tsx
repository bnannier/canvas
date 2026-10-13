import { useEffect, useRef, useState } from "react";
import { ActionSheet, Button, ButtonGroup, Card, Column, Dialog, Drawer, Dropdown, GlassModalBlurTarget, Input, PhoneInput, Radio, RadioGroup, Row, Slider, Switch, ThemeProvider, Typography } from "@nannier-com/canvas";

type Stats = { hosts: number; activeHosts: number; recordings: number; frostViews: number; frameListeners: number };
declare const require: (name: string) => unknown;
let capture: { available?: boolean; getCaptureStats?: () => Stats } | undefined;
try {
  capture = require("@nannier/canvas-blur") as typeof capture;
} catch { /* Omitted in the optional-peer consumer matrix. */ }

let nextEditor = 0;

const statsLine = (stats: Stats | null) => stats
  ? `Hosts: ${stats.hosts}; active: ${stats.activeHosts}; recordings: ${stats.recordings}; frost: ${stats.frostViews}; listeners: ${stats.frameListeners}`
  : "Capture not inspected";

function LiveEditor({ onFocus }: { onFocus: () => void }) {
  const [identity] = useState(() => ++nextEditor);
  const [edits, setEdits] = useState(0);
  return <Card>
    <Column snug>
      <Input label="Material editor" defaultValue="Keep this selection" onFocus={onFocus} onChangeText={() => setEdits((count) => count + 1)} testID="material-editor" />
      <Typography testID="material-editor-identity">Editor instance: {identity}; edits: {edits}</Typography>
      <Switch defaultChecked testID="material-switch">Live updates</Switch>
      <Slider defaultValue={40} accessibilityLabel="Material intensity" testID="material-slider" />
      <ButtonGroup items={["Overview", "Activity", "Settings"]} defaultActive={1} testID="material-segments" />
    </Column>
  </Card>;
}

export function MaterialsBody() {
  const [glass, setGlass] = useState(false);
  const [dark, setDark] = useState(false);
  // The palette driver: Dark Factory's mint against its blush, for the frost's mint row.
  const [mint, setMint] = useState(false);
  const [nested, setNested] = useState(false);
  const [message, setMessage] = useState("Ready");
  const [scheduledFrom, setScheduledFrom] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingFocus = useRef(false);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const schedule = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    pendingFocus.current = true;
    setMessage("Focus an editor to start the switch");
  };
  const focusEditor = () => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    setScheduledFrom(glass ? "glass" : "solid");
    setMessage("Switch scheduled");
    timer.current = setTimeout(() => {
      setGlass((value) => !value);
      setMessage("Switch complete");
      timer.current = null;
    }, 3000);
  };
  const inspect = () => setStats(capture?.getCaptureStats?.() ?? null);
  return <ThemeProvider glass={glass} solid={!glass} dark={dark} light={!dark} mint={mint}>
    <Column relaxed>
      <Typography h3>Material lifecycle</Typography>
      <Typography testID="material-mode">Mode: {glass ? "glass" : "solid"}; scheme: {dark ? "dark" : "light"}</Typography>
      <Typography testID="material-palette">Palette: {mint ? "mint" : "blush"}</Typography>
      <Row snug wrap>
        <Button onPress={() => setGlass((value) => !value)} testID="material-toggle">Switch material</Button>
        <Button onPress={() => setDark((value) => !value)}>Switch scheme</Button>
        <Button onPress={() => setMint((value) => !value)} testID="material-palette-toggle">Switch palette</Button>
        <Button onPress={schedule} testID="material-schedule">Switch after focusing editor</Button>
        <Button onPress={inspect} testID="material-inspect">Inspect capture</Button>
      </Row>
      <Typography testID="material-timer">{message}</Typography>
      <Typography testID="material-focus-mode">{scheduledFrom ? `Focus began in ${scheduledFrom}` : "No focused switch yet"}</Typography>
      <Typography testID="material-native">Native capture: {capture?.available ? "available" : "unavailable"}</Typography>
      <Typography testID="material-capture-stats">{statsLine(stats)}</Typography>
      <LiveEditor onFocus={focusEditor} />
      {/* Android in-page glass has no safe capture target (the owner's P3a decision), so an
          open overlay is where capture runs: an inspecting row reads the counters while
          its menu's frost still captures the page. */}
      <Dropdown trigger="Material menu" items={[{ label: "Keep editor" }, { label: "Review settings" }, { label: "Inspect capture from menu" }]}
        onSelect={(item) => { if (item.label === "Inspect capture from menu") inspect(); }} />
      <Dialog trigger="Material dialog" title="Live dialog" withBody overlay />
      {/* A Modal is a window of its own, so on Android its glass samples the page through
          GlassModalBlurTarget: the drawer and the sheet read the counters while open. */}
      <Drawer trigger="Material drawer" right><Column relaxed>
        <Typography h3>Native window</Typography>
        <Input label="Drawer editor" defaultValue="Retain me" onFocus={focusEditor} />
        <Dropdown trigger="Drawer menu" items={[{ label: "Nested choice" }]} />
        <Button onPress={schedule}>Switch after focusing editor</Button>
        <Button onPress={inspect} testID="material-drawer-inspect">Inspect capture from drawer</Button>
        <Typography testID="material-drawer-capture-stats">{statsLine(stats)}</Typography>
      </Column></Drawer>
      <ActionSheet trigger="Material sheet" title="Live sheet" message="The sheet's frost samples the page behind it."
        actions={[{ label: "Keep editing", onPress: () => {} }, { label: "Inspect capture from sheet", onPress: inspect }]} />
      {/* The bridge belongs only inside a Modal. Here, in the page, Android refuses the plane
          it hands this card, and the card keeps its solid skin with no frost mounted; iOS
          and the web ignore the bridge, so the card takes the page's material there. */}
      <GlassModalBlurTarget>
        <Card><Typography testID="material-misplaced">On Android, a bridge in the page keeps the solid skin.</Typography></Card>
      </GlassModalBlurTarget>
      {/* The state washes (the owner's GP-2 and GP-2b decisions): an errored field and a
          selected card keep the solid recipe's ink at 4.5:1, on the page and on a content
          pane. The error wash is none in every palette and the selection wash is solid's own
          5 percent tint, so the border carries the state as in solid. */}
      <Typography h3>State washes</Typography>
      <Column snug testID="material-washes">
        <Input label="Amount" prefix="$" placeholder="0.00" error testID="material-wash-field" />
        <PhoneInput label="Phone" error testID="material-wash-phone" />
        <RadioGroup defaultValue="pro" label="Plan">
          <Radio value="pro" card description="For growing teams.">Pro</Radio>
        </RadioGroup>
        <Card selected><Typography>Selected card</Typography><Typography muted>The selection wash under its text.</Typography></Card>
      </Column>
      <Switch checked={nested} onChange={setNested} testID="material-nested">Nested glass</Switch>
      <ThemeProvider glass={nested} solid={!nested}>
        <Card><Typography>Nested glass remains active while its parent is solid.</Typography></Card>
        <Dropdown trigger="Nested menu" items={[{ label: "Inspect nested capture" }]} onSelect={() => inspect()} />
      </ThemeProvider>
    </Column>
  </ThemeProvider>;
}
