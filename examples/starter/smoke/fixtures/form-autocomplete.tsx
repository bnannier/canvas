import { useEffect, useState } from "react";
import { Autocomplete, Column, Command, Drawer, Form, Input, Switch, Typography, useOverlayHost, useWindowDimensions } from "@nannier-com/canvas";

export const FRUIT = [
  "Apple", "Apricot", "Banana", "Cherry", "Dates", "Elderberry", "Fig", "Grapefruit",
  "Guava", "Kiwi", "Lemon", "Mango", "Nectarine", "Orange", "Papaya", "Peach",
  "Pear", "Pineapple", "Plum", "Raspberry", "Strawberry", "Tangerine", "Watermelon",
];

interface OutletSample {
  windowHeight: number;
  outletHeight: number;
  visibleHeight: number;
}

// A content-sized outlet can stay tall while its inherited viewport shrinks.
// Record each actual measurement and retain the smallest visible viewport.
function OverlayOutletMeasurement() {
  const host = useOverlayHost();
  const { width, height } = useWindowDimensions();
  const [samples, setSamples] = useState<{ initial: OutletSample; smallest: OutletSample } | null>(null);
  useEffect(() => {
    let active = true;
    let frame: number | undefined;
    let revision = 0;
    const scheduleMeasurement = () => {
      const requestedRevision = ++revision;
      if (frame != null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        host?.measureOutlet((_x, _y, _width, outletHeight) => {
          host.measureVisibleBounds?.(({ height: visibleHeight }) => {
            if (!active || requestedRevision !== revision || height <= 0 || outletHeight <= 0 || visibleHeight <= 0) return;
            const sample = {
              windowHeight: Math.round(height),
              outletHeight: Math.round(outletHeight),
              visibleHeight: Math.round(visibleHeight),
            };
            setSamples((previous) => previous == null
              ? { initial: sample, smallest: sample }
              : sample.visibleHeight < previous.smallest.visibleHeight
                ? { initial: previous.initial, smallest: sample }
                : previous);
          });
        });
      });
    };
    const unsubscribe = host?.subscribeLayout?.(scheduleMeasurement);
    scheduleMeasurement();
    return () => {
      active = false;
      if (frame != null) cancelAnimationFrame(frame);
      unsubscribe?.();
    };
  }, [host, width, height]);

  const resized = samples != null && samples.smallest.visibleHeight < samples.initial.visibleHeight;
  const observation = !host ? "No overlay host"
    : !host.measureVisibleBounds ? "Visible bounds unavailable"
      : resized ? "Visible overlay height shrank"
        : "No smaller visible overlay height observed";
  return (
    <Column tight>
      <Typography small testID="overlay-window-measurement">
        {samples ? `Window: ${samples.initial.windowHeight} to ${samples.smallest.windowHeight}` : "Window: awaiting measurement"}
      </Typography>
      <Typography small testID="overlay-outlet-measurement">
        {samples ? `Outlet: ${samples.initial.outletHeight} to ${samples.smallest.outletHeight}` : "Outlet: awaiting measurement"}
      </Typography>
      <Typography small testID="overlay-visible-measurement">
        {samples ? `Visible: ${samples.initial.visibleHeight} to ${samples.smallest.visibleHeight}` : "Visible: awaiting measurement"}
      </Typography>
      <Typography small testID="overlay-resize-observation">{observation}</Typography>
    </Column>
  );
}

const COMMAND_GROUPS = ["First work items", "More work items"].map((heading, group) => ({
  heading,
  items: Array.from({ length: 20 }, (_, index) => ({ label: `Work item ${String(group * 20 + index + 1).padStart(2, "0")}` })),
}));

function CommandKeyboardBody() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("None");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selections, setSelections] = useState(0);
  return (
    <Column relaxed>
      <Command trigger footer testID="keyboard-command" placeholder="Search work items" groups={COMMAND_GROUPS}
        query={query} onQueryChange={setQuery} onSelect={(item, index) => {
          setSelected(item.label);
          setSelectedIndex(index);
          setSelections((count) => count + 1);
        }} />
      <Typography testID="command-query">Query: {query || "Empty"}</Typography>
      <Typography testID="command-selected">Selected: {selected}</Typography>
      <Typography testID="command-selected-index">Selected index: {selectedIndex}</Typography>
      <Typography testID="command-selections">Selections: {selections}</Typography>
      <OverlayOutletMeasurement />
    </Column>
  );
}

export function FormAutocompleteBody({ scenario }: { scenario?: string }) {
  const [value, setValue] = useState(scenario === "clear" ? "Apple" : "");
  const [disabled, setDisabled] = useState(scenario === "disabled");
  const [submits, setSubmits] = useState(0);
  const [selections, setSelections] = useState(0);
  const [changes, setChanges] = useState(0);
  if (scenario === "command-keyboard") return <CommandKeyboardBody />;
  return (
    scenario === "modal" || scenario === "modal-keyboard" ? (
        <Drawer trigger="Open fruit drawer" onOpenChange={(next) => { if (!next) setSubmits((count) => count + 1); }}>
          {scenario === "modal-keyboard" ? (
            <Column relaxed>
              <Autocomplete label="Drawer fruit" testID="drawer-fruit-input" options={FRUIT} />
              <OverlayOutletMeasurement />
            </Column>
          ) : <Autocomplete label="Drawer fruit" testID="drawer-fruit-input" options={FRUIT} />}
        </Drawer>
      ) : (
      <Column relaxed>
        <Switch checked={disabled} onChange={setDisabled}>Lock fruit</Switch>
        <Form submitLabel="Save choice" onSubmit={() => setSubmits((count) => count + 1)}>
          <Input label="Name" placeholder="Your name" />
          <Autocomplete label="Fruit" testID="fruit-input" options={FRUIT} value={value} disabled={disabled}
            helperText="Arrow keys highlight a fruit. Enter selects it before saving the form."
            onValueChange={(next) => { setValue(next); setChanges((count) => count + 1); }}
            onSelect={() => setSelections((count) => count + 1)} />
        </Form>
        <Typography testID="fruit-value">{value === "" ? "No fruit selected" : value}</Typography>
        <Typography testID="submit-count">{submits}</Typography>
        <Typography testID="selection-count">{selections}</Typography>
        <Typography testID="value-change-count">{changes}</Typography>
        {scenario === "keyboard" ? <OverlayOutletMeasurement /> : null}
      </Column>
      )
  );
}
