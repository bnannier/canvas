import { afterEach, describe, expect, it } from "bun:test";
import { act, cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { AnatomyProvider, type AnatomyRects } from "../src/style/anatomy.tsx";
import { anatomyParts } from "./fixtures/anatomy-parts.tsx";
import { Dialog } from "../src/organisms/dialog/dialog.tsx";
import { Dialog as DialogIOS } from "../src/organisms/dialog/dialog.ios.tsx";
import { AlertDialog } from "../src/molecules/alert-dialog/alert-dialog.tsx";
import { Drawer } from "../src/organisms/drawer/drawer.tsx";
import { ActionSheet } from "../src/organisms/action-sheet/action-sheet.tsx";
import { Popover } from "../src/atoms/popover/popover.tsx";
import { Tooltip } from "../src/atoms/tooltip/tooltip.tsx";
import { Dropdown } from "../src/atoms/dropdown/dropdown.tsx";
import { Command } from "../src/organisms/command/command.tsx";
import { Wizard } from "../src/organisms/wizard/wizard.tsx";
import { Toast } from "../src/organisms/toast/toast.tsx";
import { Alert } from "../src/molecules/alert/alert.tsx";
import { EmptyState } from "../src/molecules/empty-state/empty-state.tsx";
import { Progress } from "../src/atoms/progress/progress.tsx";
import { Spinner } from "../src/atoms/spinner/spinner.tsx";
import { Skeleton } from "../src/atoms/skeleton/skeleton.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { Icon } from "../src/atoms/icon/icon.tsx";

// The anatomy parts the overlay and feedback components register with an AnatomyProvider:
// each, held open in place as its docs specimen draws it, reports every part its hand-off
// `an` list names, and the kit Buttons, Inputs and Icons inside it register none of theirs.

afterEach(cleanup);

const sorted = (parts: string[]) => [...parts].sort();
const noop = () => {};

describe("overlay anatomy parts", () => {
  it("Dialog: a form held open in place, and the footer and close Buttons register nothing", async () => {
    expect(await anatomyParts(
      <Dialog form open embedded dismissible title="Invite teammates" description="They get edit access to this board only." footer={<Button primary>Send invites</Button>}>
        <Input label="Emails" defaultValue="noor@nannier.com" />
      </Dialog>,
    )).toEqual(sorted(["Scrim", "Panel", "Title", "Description", "Body", "Actions", "Close"]));
  });

  it("Dialog: the plain dialog draws its built-in body and action row, and no close", async () => {
    expect(await anatomyParts(<Dialog open embedded title="Refund payment" description="Posts in 2 to 3 days." withBody />))
      .toEqual(sorted(["Scrim", "Panel", "Title", "Description", "Body", "Actions"]));
    cleanup();
    expect(await anatomyParts(<DialogIOS open embedded title="Refund payment" description="Posts in 2 to 3 days." withBody />))
      .toEqual(sorted(["Scrim", "Panel", "Title", "Description", "Body", "Actions"]));
  });

  it("AlertDialog", async () => {
    expect(await anatomyParts(<AlertDialog open embedded destructive title="Delete Northwind?" description="24 members lose access now." confirmLabel="Delete" />))
      .toEqual(sorted(["Scrim", "Panel", "Icon", "Title", "Description", "Actions"]));
  });

  it("Drawer", async () => {
    expect(await anatomyParts(
      <Drawer open embedded right header={<Button ghost>Filters</Button>} footer={<Button primary>Apply</Button>}>
        <Input label="Search" />
      </Drawer>,
    )).toEqual(sorted(["Scrim", "Panel", "Header", "Body", "Footer"]));
  });

  it("ActionSheet", async () => {
    expect(await anatomyParts(
      <ActionSheet open embedded title="Share board" message="Choose where to send it" actions={[{ label: "Copy link", onPress: noop }, { label: "Delete board", destructive: true, onPress: noop }]} />,
    )).toEqual(sorted(["Scrim", "Sheet", "Title", "Action", "Destructive action", "Cancel"]));
  });

  it("Popover: inline (the docs specimen, with no trigger) and anchored to its trigger", async () => {
    expect(await anatomyParts(<Popover inline bottom title="Glass intensity" description="Frost and tint for every pane." actionLabel="Apply" />))
      .toEqual(sorted(["Panel", "Arrow", "Title", "Description", "Action"]));
    cleanup();
    expect(await anatomyParts(<Popover open trigger="Glass" title="Glass intensity" description="Frost and tint for every pane." actionLabel="Apply" />))
      .toEqual(sorted(["Trigger", "Panel", "Arrow", "Title", "Description", "Action"]));
  });

  it("Tooltip", async () => {
    expect(await anatomyParts(<Tooltip open iconTrigger label="Copy snippet" />)).toEqual(sorted(["Trigger", "Bubble", "Arrow"]));
  });

  it("Dropdown: open and inline", async () => {
    const items = [
      { label: "Rename", icon: "pencil" as const, shortcut: "⌘ R" },
      { label: "Duplicate", icon: "copy" as const },
      { label: "Delete", icon: "trash2" as const, destructive: true },
    ];
    const all = sorted(["Trigger", "Menu", "Section label", "Item", "Shortcut", "Destructive item"]);
    expect(await anatomyParts(<Dropdown open trigger="Project" label="Northwind" items={items} />)).toEqual(all);
    cleanup();
    expect(await anatomyParts(<Dropdown inline trigger="Project" label="Northwind" items={items} />)).toEqual(all);
  });

  it("Command: the bare card and the embedded one", async () => {
    const groups = [
      { heading: "Navigate", items: [{ label: "Components", icon: "layers" as const }, { label: "Themes", icon: "palette" as const }] },
      { heading: "Actions", items: [{ label: "Copy link", icon: "copy" as const, shortcut: "⌘ L" }] },
    ];
    const all = sorted(["Panel", "Search field", "Group label", "Item", "Active item", "Footer hints"]);
    expect(await anatomyParts(<Command footer groups={groups} defaultActive={1} />)).toEqual(all);
    cleanup();
    expect(await anatomyParts(<Command embedded footer groups={groups} />)).toEqual(all);
  });

  it("Wizard: the Dialog it is built on registers only the Wizard's Panel", async () => {
    expect(await anatomyParts(
      <Wizard open embedded onOpenChange={noop} title="Create workspace" status="Step 2 of 4" current={1}
        steps={[{ label: "Name" }, { label: "Members" }, { label: "Theme" }, { label: "Review" }]}
        previous={{ label: "Back", onPress: noop }} actions={<Button primary>Continue</Button>}>
        <Input compact placeholder="noor@nannier.com" accessibilityLabel="Email" />
      </Wizard>,
    )).toEqual(sorted(["Panel", "Steps", "Body", "Footer actions"]));
  });
});

describe("feedback anatomy parts", () => {
  it("Toast", async () => {
    expect(await anatomyParts(<Toast info message="Changes saved" description="Your tokens are live on every platform." action={{ label: "Undo", onPress: noop }} />))
      .toEqual(sorted(["Toast", "Icon", "Message", "Description", "Action"]));
  });

  it("Alert: the banner and the announcement bar", async () => {
    const all = sorted(["Container", "Icon", "Title", "Description", "Dismiss", "Actions"]);
    expect(await anatomyParts(<Alert info dismissible title="Glass needs Chrome or Safari" description="Firefox falls back to solid surfaces." actions={<Button small>Learn more</Button>} />)).toEqual(all);
    cleanup();
    expect(await anatomyParts(<Alert announcement dismissible title="Canvas 4" description="Light as material." action={{ label: "Read", onPress: noop }} />)).toEqual(all);
  });

  it("EmptyState: bare and bordered", async () => {
    const all = sorted(["Container", "Icon", "Title", "Description", "Action"]);
    expect(await anatomyParts(<EmptyState icon={<Icon search />} title="No components match" description="Try another name." actionLabel="Clear filters" />)).toEqual(all);
    cleanup();
    expect(await anatomyParts(<EmptyState bordered icon={<Icon search />} title="No components match" description="Try another name." actionLabel="Clear filters" />)).toEqual(all);
  });

  it("Progress: continuous and segmented", async () => {
    const all = sorted(["Label", "Track", "Fill", "Value"]);
    expect(await anatomyParts(<Progress value={0.64} showValue>Uploading tokens</Progress>)).toEqual(all);
    cleanup();
    expect(await anatomyParts(<Progress value={0.64} segments={4} showValue>Uploading tokens</Progress>)).toEqual(all);
  });

  it("Progress: the measured bar's Fill registers on a plain host, not the translated Animated fill", async () => {
    // A live page measures the track, which swaps the percent fallback for the eased
    // Animated fill: report a track width to every layout handler, as a browser would.
    const reports: AnatomyRects[] = [];
    render(
      <ThemeProvider dark solid>
        <AnatomyProvider onMeasure={(parts) => reports.push(parts)}><Progress value={0.64} showValue>Uploading tokens</Progress></AnatomyProvider>
      </ThemeProvider>,
    );
    for (const node of document.body.querySelectorAll("*")) {
      const handler = (node as unknown as { __reactLayoutHandler?: (event: unknown) => void }).__reactLayoutHandler;
      if (typeof handler === "function") act(() => handler({ nativeEvent: { layout: { x: 0, y: 0, width: 240, height: 6 } }, timeStamp: 1 }));
    }
    await act(() => new Promise((resolve) => setTimeout(resolve, 5)));
    expect(Object.keys(reports.at(-1) ?? {}).sort()).toEqual(sorted(["Label", "Track", "Fill", "Value"]));
    const fill = [...document.body.querySelectorAll("div")].find((node) => node.getAttribute("style")?.includes("width: 64%"));
    expect(fill).toBeDefined();
  });

  it("Spinner", async () => {
    expect(await anatomyParts(<Spinner>Loading components</Spinner>)).toEqual(sorted(["Ring", "Label"]));
    cleanup();
    expect(await anatomyParts(<Spinner />)).toEqual(["Ring"]);
  });

  it("Skeleton: a line, a card and a table", async () => {
    expect(await anatomyParts(<Skeleton animate />)).toEqual(["Placeholder block"]);
    cleanup();
    expect(await anatomyParts(<Skeleton card />)).toEqual(["Placeholder block"]);
    cleanup();
    expect(await anatomyParts(<Skeleton table />)).toEqual(["Placeholder block"]);
  });
});
