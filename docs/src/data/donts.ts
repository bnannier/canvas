// Do / Don't examples rendered with the REAL Canvas components.
//
// The component pages used to render guidance examples from hand-authored HTML
// strings (data/components.ts `donts`), styled to imitate the components. This
// map replaces them with `El` descriptor trees the page renders through the
// registry's renderTree, so a Do/Don't shows the actual <Button>, <ButtonGroup>,
// etc. from @olympusoss/canvas, the same single-source path the playground uses.
//
// Each side is normally a `tree` (a real component). The exception is a Don't
// that depicts an anti-pattern the real component cannot produce (e.g. a split
// button with no divider, which the real ButtonGroup always draws): those keep a
// self-contained `html` mock, since the whole point is the component does it
// right. component-page.tsx renders `tree` via renderTree, else the `html`.
//
// A slug present here wins over its legacy `donts` in data/components.ts; a slug
// absent here still falls back to that legacy HTML.

import type { El } from "@/jsx-code";

export interface DontDoSide {
  /** A real-component element tree, resolved against the registry COMPONENT_MAP. */
  tree?: El;
  /** Fallback static markup, only for anti-patterns the real component can't show. */
  html?: string;
  caption: string;
}

export interface DontDoExample {
  title?: string;
  dont: DontDoSide;
  do: DontDoSide;
}

export const DONTS: Record<string, DontDoExample[]> = {
  "button-group": [
    {
      title: "Segmented",
      dont: {
        tree: { type: "ButtonGroup", props: { segmented: true, active: 0, items: ["Day", "Week", "Month", "Quarter", "Year", "5Y", "All"] } },
        caption: "Past ~4 options a segmented control gets cramped and hard to scan; reach for a select.",
      },
      do: {
        tree: { type: "ButtonGroup", props: { segmented: true, active: 0, items: ["Day", "Week", "Month"] } },
        caption: "Keep a segmented control to a few mutually-exclusive views.",
      },
    },
    {
      title: "Attached",
      dont: {
        tree: { type: "ButtonGroup", props: { segmented: true, active: -1, items: ["Save", "Delete", "Export"] } },
        caption: "Attaching unrelated actions implies they belong to one control.",
      },
      do: {
        tree: { type: "ButtonGroup", props: { stepper: true, active: 1, items: ["Yesterday", "Today", "Tomorrow"] } },
        caption: "Reserve attached groups for closely-related actions like prev / today / next.",
      },
    },
    {
      title: "Split",
      dont: {
        // The real ButtonGroup split always draws the hairline divider, so the
        // anti-pattern (a split with no divider) can only be a static mock.
        html: `<div class="inline-flex"><button class="inline-flex items-center justify-center h-9 px-4 rounded-l-md bg-primary text-primary-foreground text-sm font-medium">Save</button><button class="inline-flex items-center justify-center h-9 px-2 rounded-r-md bg-primary text-primary-foreground"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button></div>`,
        caption: "With no divider the chevron looks like part of one button, hiding the menu.",
      },
      do: {
        tree: { type: "ButtonGroup", props: { split: true, items: ["Save"], menu: ["Save as draft", "Save and close", "Save a copy"] } },
        caption: "Separate the chevron with a hairline so the secondary menu reads as distinct.",
      },
    },
  ],
};
