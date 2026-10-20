import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Markdown as IosMarkdown } from "../src/organisms/chat/chat.ios.tsx";
import { Markdown as AndroidMarkdown } from "../src/organisms/chat/chat.android.tsx";
import { Markdown, ChatMessage } from "../src/organisms/chat/chat.tsx";
import { markdownBlocks } from "../src/organisms/chat/markdown.logic.ts";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);
const document = `# Epic scope
## Acceptance Criteria
- [ ] Given saved work, then the result stays scoped.
- [x] **Recorded** direction
### In Scope
1. Verify saved identity
  - Preserve immutable history
#### Implementation
##### Verification
###### Evidence
| Story | Priority | Status |
| --- | --- | --- |
| Feature A | Must | Backlog |
| Feature B | Should | Ready |
> Keep the supplied original.
`;
test.each([["web", Markdown], ["ios", IosMarkdown], ["android", AndroidMarkdown]] as const)("%s document headings, static checklists and all template table columns remain readable", (_platform, Markdown) => {
  const { container } = render(<ThemeProvider light solid><Markdown compact>{document}</Markdown></ThemeProvider>);
  for (let level = 1; level <= 6; level++) expect(screen.getByRole("heading", { level })).toBeTruthy();
  expect(screen.getByRole("checkbox", { name: "Given saved work, then the result stays scoped." }).getAttribute("aria-checked")).toBe("false");
  expect(screen.getByRole("checkbox", { name: "Recorded direction" }).getAttribute("aria-checked")).toBe("true");
  expect(screen.getByRole("checkbox", { name: "Recorded direction" }).getAttribute("aria-disabled")).toBe("true");
  for (const label of ["Story", "Priority", "Status"]) expect(screen.getByRole("columnheader", { name: label })).toBeTruthy();
  expect(screen.getByText("Feature A")).toBeTruthy();
  expect(screen.getByText("Backlog")).toBeTruthy();
  expect(container.textContent).not.toContain("| --- |");
  expect(container.textContent).not.toContain("[x]");
});
test("Chat and documents share template blocks while raw HTML, image and URL syntax stay inert", () => {
  const source = '# Contract\n\n<img src="https://example.test/tracker">\n\n![Tracking](https://example.test/pixel)\n\n[Open](javascript:alert(1))\n\n- [ ] Safe criterion\n\n~~~html\n<script>danger()</script>\n~~~';
  const { container } = render(<ThemeProvider light solid><ChatMessage message={{ id: "markdown", role: "assistant", content: source }} /></ThemeProvider>);
  expect(container.querySelector("img,a,script,iframe")).toBeNull();
  expect(screen.getByText('<img src="https://example.test/tracker">')).toBeTruthy();
  expect(screen.getByText('<script>danger()</script>')).toBeTruthy();
  expect(screen.getByRole("checkbox", { name: "Safe criterion" })).toBeTruthy();
});
test("pipe tables preserve escaped and inline-code pipes, blank cells and long row contents", () => {
  expect(markdownBlocks('| Name | Contract | Status |\n| --- | :---: | ---: |\n| A \\| B | `x|y` | |')).toEqual([{ kind: "table", text: "", columns: ["Name", "Contract", "Status"], rows: [["A | B", "`x|y`", ""]] }]);
  const blocks = markdownBlocks('### Parent scope\n  - Nested child\n\n````ts\n```\n# literal heading');
  expect(blocks[0]).toMatchObject({ kind: "heading", level: 3 });
  expect(blocks[1]).toMatchObject({ kind: "list", indent: 1, text: "Nested child" });
  expect(blocks[2]).toEqual({ kind: "code", text: "```\n# literal heading" });
});
