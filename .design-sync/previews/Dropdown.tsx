import { Dropdown, Row } from "@nannier/canvas";

const items = [{ label: "Edit profile" }, { label: "Duplicate" }, { label: "Delete…", destructive: true, separatorBefore: true }];

export const Closed = () => (
  <Row wrap>
    <Dropdown trigger="Actions" items={items} />
    <Dropdown trigger="Actions" disabled items={items} />
  </Row>
);

export const Open = () => (
  <Row><Dropdown trigger="Actions" open items={items} /></Row>
);

export const Projects = () => (
  <Row><Dropdown
    compact
    menuWidth={250}
    trigger="Projects"
    label="Your projects"
    open
    items={[
      { label: "All my projects", value: "all", detail: "11", selected: true },
      { label: "Platform Core", value: "core", detail: "6", selected: false },
      { label: "Add project", value: "add", sectionBefore: "Manage projects", description: "Open project setup" },
    ]}
  /></Row>
);
