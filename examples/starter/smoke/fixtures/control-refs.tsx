import { useCallback, useRef, useState } from "react";
import {
  Button, Checkbox, Column, Dialog, Radio, RadioGroup, Row, Select, Slider, Switch, Typography,
  type View,
} from "@nannier-com/canvas";

// Shared by the docs and the independent native consumer. These refs come only
// from the public package and target the real platform host.
export function ControlRefsBody() {
  const button = useRef<View>(null);
  const checkbox = useRef<View>(null);
  const toggle = useRef<View>(null);
  const radio = useRef<View>(null);
  const select = useRef<View>(null);
  const slider = useRef<View>(null);
  const buttonRef = useCallback((node: View | null) => {
    button.current = node;
    return () => { button.current = null; };
  }, []);
  const [mounted, setMounted] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [changes, setChanges] = useState(0);
  const [requested, setRequested] = useState("None");
  const [attached, setAttached] = useState("Not inspected");
  const [measurement, setMeasurement] = useState("Not measured");
  const changed = () => setChanges((count) => count + 1);
  const controls = [
    ["Button", button], ["Checkbox", checkbox], ["Switch", toggle],
    ["Radio", radio], ["Select", select], ["Slider", slider],
  ] as const;

  return (
    <Column relaxed testID="control-ref-checks">
      <Typography muted>
        Browser focus is supported. Native focus follows the device and React Native version;
        a focus request is separate from accessibility focus.
      </Typography>
      <Row snug wrap>
        <Button outline onPress={() => setMounted((value) => !value)}>{mounted ? "Unmount controls" : "Mount controls"}</Button>
        <Button outline onPress={() => setDisabled((value) => !value)}>{disabled ? "Enable controls" : "Disable controls"}</Button>
        <Button outline onPress={() => setAttached(String(controls.filter(([, ref]) => ref.current != null).length))}>Inspect refs</Button>
        <Button outline onPress={() => slider.current?.measure((_x, _y, width, height) => setMeasurement(`${Math.round(width)} × ${Math.round(height)}`))}>Measure Slider</Button>
      </Row>
      <Row snug wrap>
        {controls.map(([name, ref]) => (
          <Button key={name} secondary onPress={() => { ref.current?.focus(); setRequested(name); }}>Focus {name}</Button>
        ))}
      </Row>
      <Typography small muted testID="ref-requested">Requested: {requested}</Typography>
      <Typography small muted testID="ref-attached">Attached: {attached}</Typography>
      <Typography small muted testID="ref-measurement">Measured: {measurement}</Typography>
      <Typography small muted testID="ref-changes">Changes: {changes}</Typography>
      {mounted ? (
        <Column relaxed>
          <Button ref={buttonRef} disabled={disabled} testID="ref-button" onPress={() => { changed(); setOpen(true); }}>Open ref dialog</Button>
          <Checkbox ref={checkbox} disabled={disabled} testID="ref-checkbox" onChange={changed} description="The label is part of this focus target.">Accept terms</Checkbox>
          <Switch ref={toggle} disabled={disabled} testID="ref-switch" onChange={changed} description="Focus does not change the connection.">Wi-Fi</Switch>
          <RadioGroup defaultValue="daily" disabled={disabled} label="Delivery" onChange={changed}>
            <Radio ref={radio} value="daily" testID="ref-radio">Daily</Radio>
            <Radio value="weekly">Weekly</Radio>
          </RadioGroup>
          <Select ref={select} disabled={disabled} testID="ref-select" label="Fruit" options={["Apple", "Pear"]} onSelect={changed} />
          <Slider ref={slider} disabled={disabled} testID="ref-slider" defaultValue={40} onChange={changed} showValue description="The ref targets the adjustable track.">Volume</Slider>
        </Column>
      ) : null}
      <Dialog open={open} onOpenChange={setOpen} title="Ref dialog">
        <Typography>Closing this dialog restores focus to the button that opened it.</Typography>
        <Button onPress={() => setOpen(false)}>Close ref dialog</Button>
      </Dialog>
    </Column>
  );
}
