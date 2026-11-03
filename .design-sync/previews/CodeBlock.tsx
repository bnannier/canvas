import { CodeBlock, Column } from "@nannier/canvas";

export const Typescript = () => (
  <CodeBlock
    language="ts"
    copy
    code={`const theme = getTheme();
setTheme(theme === "dark" ? "light" : "dark");`}
  />
);

export const Jsx = () => (
  <CodeBlock
    language="tsx"
    filename="save-button.tsx"
    numbered
    code={`<Button primary large>
  Save changes
</Button>`}
  />
);

export const Terminal = () => (
  <CodeBlock terminal code={`$ bun add @nannier/canvas
$ bun run dev`} />
);

export const Diff = () => (
  <CodeBlock
    diff
    language="ts"
    code={`  const plan = getPlan(user);
- const seats = 5;
+ const seats = plan.seats;
  return seats;`}
  />
);

export const InstallTabs = () => (
  <Column cozy>
    <CodeBlock
      copy
      tabs={[
        { label: "bun", code: "bun add @nannier/canvas" },
        { label: "npm", code: "npm install @nannier/canvas" },
        { label: "pnpm", code: "pnpm add @nannier/canvas" },
      ]}
    />
    <CodeBlock inline copy code="import { Button } from '@nannier/canvas'" />
  </Column>
);
