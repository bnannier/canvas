import { ButtonGroup, Column, Container } from "@nannier/canvas";

export const Default = () => <ButtonGroup defaultActive={0} items={["Day", "Week", "Month"]} accessibilityLabel="Range" />;

export const Sizes = () => (
  <Column>
    <ButtonGroup small defaultActive={0} items={["Day", "Week", "Month"]} />
    <ButtonGroup defaultActive={1} items={["Day", "Week", "Month"]} />
    <ButtonGroup large defaultActive={2} items={["Day", "Week", "Month"]} />
  </Column>
);

export const Modes = () => (
  <Column>
    <ButtonGroup segmented defaultActive={0} items={["Day", "Week", "Month"]} />
    <ButtonGroup spaced items={["Edit", "Duplicate", "Archive"]} />
    <ButtonGroup stepper active={1} items={["Yesterday", "Today", "Tomorrow"]} />
    <ButtonGroup split items={["Save"]} menu={["Save as draft", "Save and close", "Save a copy"]} />
  </Column>
);

export const IconsOnly = () => (
  <ButtonGroup
    iconsOnly
    defaultActive={2}
    items={[
      { label: "Phone width", icon: "smartphone" },
      { label: "Tablet width", icon: "tablet" },
      { label: "Desktop width", icon: "monitor" },
    ]}
  />
);

export const Disabled = () => <ButtonGroup disabled items={["Day", "Week", "Month"]} />;

export const Block = () => (
  <Container>
    <ButtonGroup block defaultActive={0} items={["Day", "Week", "Month"]} />
  </Container>
);
