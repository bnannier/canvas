import { Input, Column } from "@nannier/canvas";

export const Default = () => (
  <Column>
    <Input label="Email" placeholder="rachel.chen@example.com" />
    <Input label="Full name" required placeholder="Rachel Chen" />
  </Column>
);

export const Adornments = () => (
  <Column>
    <Input leadingIcon icon="search" clearable placeholder="Search" defaultValue="example" />
    <Input prefix="https://" placeholder="canvas.dev" />
    <Input label="Storage" defaultValue="1024" suffix="GB" />
    <Input label="Password" leadingIcon icon="lock" secureTextEntry passwordToggle placeholder="••••••••" />
    <Input leadingIcon icon="search" shortcut="⌘K" placeholder="Search components…" />
  </Column>
);

export const Sizes = () => (
  <Column>
    <Input compact placeholder="noor@nannier.com" accessibilityLabel="Teammate email" />
    <Input placeholder="noor@nannier.com" accessibilityLabel="Email" />
  </Column>
);

export const States = () => (
  <Column>
    <Input error placeholder="rachel.chen@example.com" />
    <Input disabled placeholder="rachel.chen@example.com" />
    <Input readOnly accessibilityLabel="Workspace ID" defaultValue="ws_8f2k1" />
  </Column>
);
