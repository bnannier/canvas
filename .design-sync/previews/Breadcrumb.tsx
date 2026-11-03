import { Breadcrumb, Column } from "@nannier/canvas";

const trail = ["Projects", "Identity Platform", "Settings"];

export const Default = () => <Breadcrumb items={trail} />;

export const Separators = () => (
  <Column>
    <Breadcrumb items={trail} slash />
    <Breadcrumb items={trail} dot />
    <Breadcrumb items={trail} chevron />
    <Breadcrumb items={trail} homeIcon />
  </Column>
);

export const Collapsed = () => (
  <Breadcrumb maxItems={3} items={["Projects", "Identity Platform", "Settings", "Avatar", "Edit"]} />
);

export const Subtle = () => <Breadcrumb items={["Library", "Controls", "Button"]} slash subtle />;
