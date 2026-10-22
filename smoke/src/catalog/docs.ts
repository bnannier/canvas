// Every component's generated docs module, through docgen's static index
// (docs/src/core/docs-index.ts). The docs app's own registry loads them through a lazy
// require.context, which Metro resolves against the wrong root for a project outside
// the docs app, so the smoke app imports the static index instead.
import { ALL_COMPONENT_DOCS } from "../../../docs/src/core/docs-index";
import type { ComponentDocs } from "../../../docs/src/core/scope";

const byDir = new Map<string, ComponentDocs>(ALL_COMPONENT_DOCS.map((docs) => [docs.dir, docs]));

/** The generated docs for a component's source directory, or undefined if it has none. */
export function componentDocs(dir: string): ComponentDocs | undefined {
  return byDir.get(dir);
}
