import { afterEach, describe, expect, it } from "bun:test";
import { cleanup } from "@testing-library/react";
import { anatomyParts } from "./fixtures/anatomy-parts.tsx";
import { ButtonGroup } from "../src/atoms/button-group/button-group.tsx";
import { Switch } from "../src/atoms/switch/switch.tsx";
import { Checkbox } from "../src/atoms/checkbox/checkbox.tsx";
import { Radio, RadioGroup } from "../src/atoms/radio/radio.tsx";
import { Slider } from "../src/atoms/slider/slider.tsx";
import { Stepper } from "../src/atoms/stepper/stepper.tsx";
import { Chip } from "../src/atoms/chip/chip.tsx";
import { Avatar } from "../src/atoms/avatar/avatar.tsx";
import { Badge } from "../src/atoms/badge/badge.tsx";
import { Kbd } from "../src/atoms/kbd/kbd.tsx";
import { Switch as IosSwitch } from "../src/atoms/switch/switch.ios.tsx";
import { Checkbox as IosCheckbox } from "../src/atoms/checkbox/checkbox.ios.tsx";

// Pins the anatomy parts the controls batch registers with an AnatomyProvider (ButtonGroup,
// Switch, Checkbox, Radio, Slider, Stepper, Chip, Avatar, Badge, Kbd): every part the docs
// spec names, on a render that draws them all, and that a nested kit component (a Chip's
// count Badge) registers nothing of its own.

afterEach(cleanup);

// A one-pixel GIF: a photo that loads under happy-dom, where a relative URL fails to load and the
// avatar falls back to its initials.
const PHOTO = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

describe("controls anatomy parts", () => {
  it("ButtonGroup: the track, a segment and the active thumb", async () => {
    expect(await anatomyParts(<ButtonGroup items={["Day", "Week", "Month"]} defaultActive={1} />)).toEqual(["Active thumb", "Segment", "Track"]);
  });

  it("Switch: track, thumb, label and description", async () => {
    expect(await anatomyParts(<Switch defaultChecked description="Frost on every pane">Glass surfaces</Switch>)).toEqual(["Description", "Label", "Thumb", "Track"]);
  });

  it("Switch on iOS numbers the same parts", async () => {
    expect(await anatomyParts(<IosSwitch defaultChecked description="Frost on every pane">Glass surfaces</IosSwitch>)).toEqual(["Description", "Label", "Thumb", "Track"]);
  });

  it("Checkbox: box, check mark, label and description", async () => {
    expect(await anatomyParts(<Checkbox defaultChecked description="One message per stable version">Email me release notes</Checkbox>)).toEqual(["Box", "Check mark", "Description", "Label"]);
  });

  it("Checkbox as a selection on iOS keeps the box parts", async () => {
    expect(await anatomyParts(<IosCheckbox selection defaultChecked description="One message per stable version">Email me release notes</IosCheckbox>)).toEqual(["Box", "Check mark", "Description", "Label"]);
  });

  it("Checkbox as a one-setting switch on iOS numbers the switch's parts that share a name", async () => {
    expect(await anatomyParts(<IosCheckbox defaultChecked description="One message per stable version">Email me release notes</IosCheckbox>)).toEqual(["Description", "Label", "Thumb", "Track"]);
  });

  it("Radio: ring, dot, label and description", async () => {
    expect(await anatomyParts(<Radio checked description="Ships every few weeks">Stable</Radio>)).toEqual(["Description", "Dot", "Label", "Ring"]);
  });

  it("RadioGroup: only the first option registers", async () => {
    expect(await anatomyParts(
      <RadioGroup defaultValue="stable">
        <Radio value="stable" description="Ships every few weeks">Stable</Radio>
        <Radio value="beta" description="Weekly">Beta</Radio>
      </RadioGroup>,
    )).toEqual(["Description", "Dot", "Label", "Ring"]);
  });

  it("Slider: track, fill, thumb, label and value", async () => {
    expect(await anatomyParts(<Slider defaultValue={62} percent showValue>Glass intensity</Slider>)).toEqual(["Fill", "Label", "Thumb", "Track", "Value"]);
  });

  it("Stepper: decrement, value, increment and label", async () => {
    expect(await anatomyParts(<Stepper label="Spacing" defaultValue={2} />)).toEqual(["Decrement", "Increment", "Label", "Value"]);
  });

  it("Chip: container, leading icon, label, count and trailing control, and the count Badge does not leak", async () => {
    expect(await anatomyParts(<Chip icon={<Badge>i</Badge>} count={12} trailing={<Badge>x</Badge>}>Design</Chip>)).toEqual(["Container", "Count", "Label", "Leading icon", "Trailing control"]);
  });

  it("Chip: a pressable chip with a remove control numbers the remove control as the trailing control", async () => {
    expect(await anatomyParts(<Chip onPress={() => {}} onRemove={() => {}} count={3}>Design</Chip>)).toEqual(["Container", "Count", "Label", "Trailing control"]);
  });

  it("Avatar: frame, image and ring", async () => {
    expect(await anatomyParts(<Avatar ring uri={PHOTO} />)).toEqual(["Frame", "Image or initials", "Ring"]);
  });

  it("Avatar with initials numbers the glyph", async () => {
    expect(await anatomyParts(<Avatar ring name="Ada Lovelace" />)).toEqual(["Frame", "Image or initials", "Ring"]);
  });

  it("Badge: container, status dot and label", async () => {
    expect(await anatomyParts(<Badge success dot>Operational</Badge>)).toEqual(["Container", "Label", "Status dot"]);
  });

  it("Kbd: keycap, glyph and separator of a sequence", async () => {
    expect(await anatomyParts(<Kbd keys="G C" sequence />)).toEqual(["Glyph", "Keycap", "Separator"]);
  });

  it("Kbd: a single cap has no separator", async () => {
    expect(await anatomyParts(<Kbd>Esc</Kbd>)).toEqual(["Glyph", "Keycap"]);
  });
});
