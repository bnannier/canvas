import { Breadcrumb, Column } from "@nannier/canvas";

export const Trail = () => (
  <Breadcrumb items={["Projects", "Identity Platform", "Settings"]} />
);

export const WithHome = () => (
  <Column>
    <Breadcrumb homeIcon items={["Settings"]} />
    <Breadcrumb homeIcon slash items={["Projects", "Identity Platform"]} />
  </Column>
);
