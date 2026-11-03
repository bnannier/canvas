import { Markdown } from "@nannier/canvas";

export const Document = () => (
  <Markdown>{`# Release notes

Canvas **4.1** ships a refreshed navigation and *faster* tables.

## Highlights

- Floating pill navbar with palette swatches
- Container-measured responsive layouts
- New \`Steps\` progress style

1. Update the package
2. Run the codemod
3. Review the changelog

> Glass surfaces fall back to solid under Reduce Transparency.

\`\`\`bash
bun add @nannier/canvas
\`\`\`
`}</Markdown>
);

export const Compact = () => (
  <Markdown compact>{`### Deploy checklist

Confirm the **staging** build before promoting.

- Migrations applied
- Feature flags reviewed
- Rollback plan written
`}</Markdown>
);
