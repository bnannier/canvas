import { afterEach, describe, expect, it } from "bun:test";
import { act, cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { AnatomyProvider, type AnatomyRects } from "../src/style/anatomy.tsx";
import { Text } from "react-native";
import { anatomyParts } from "./fixtures/anatomy-parts.tsx";
import { Tabs } from "../src/organisms/tabs/tabs.tsx";
import { TabBar } from "../src/organisms/tab-bar/tab-bar.tsx";
import { Navbar } from "../src/organisms/navbars/navbars.tsx";
import { Sidebar } from "../src/organisms/sidebar/sidebar.tsx";
import { Breadcrumb } from "../src/atoms/breadcrumb/breadcrumb.tsx";
import { Pagination } from "../src/atoms/pagination/pagination.tsx";
import { Steps } from "../src/organisms/steps/steps.tsx";
import { RowMenu } from "../src/organisms/row-menu/row-menu.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Badge } from "../src/atoms/badge/badge.tsx";

// Pins the anatomy parts the navigation batch registers with an AnatomyProvider (Tabs, TabBar,
// Navbar, Sidebar, Breadcrumb, Pagination, Steps, RowMenu): every part the docs spec names, on
// a render that draws them all, and that the kit Buttons, Badges and caller content nested in
// them register nothing of their own.

afterEach(cleanup);

const icon = () => <Text>i</Text>;

describe("navigation anatomy parts", () => {
  it("Tabs: the tab list, a tab, the active indicator and a count badge", async () => {
    expect(await anatomyParts(<Tabs tabs={["Overview", { label: "Activity", badge: "12" }, "Settings"]} />)).toEqual(["Active indicator", "Badge", "Tab", "Tab list"]);
  });

  it("TabBar: the bar, a destination, the active indicator and a label", async () => {
    expect(await anatomyParts(<TabBar items={[{ key: "home", label: "Home", icon }, { key: "inbox", label: "Inbox", icon }]} />)).toEqual(["Active indicator", "Bar", "Item", "Label"]);
  });

  it("Navbar: the bar, brand, links, the active link and the actions, with its Button and Avatar silent", async () => {
    expect(await anatomyParts(<Navbar brand="Canvas" links={["Docs", "Blog"]} actionLabel="Sign in" avatar="Grace Hopper" />)).toEqual(["Actions", "Active link", "Bar", "Brand", "Links"]);
  });

  it("Sidebar: the rail, a section label, an item, the active item and the footer, with its Badges silent", async () => {
    expect(await anatomyParts(
      <Sidebar
        defaultActive="Layers"
        footer={<Text>Grace Hopper</Text>}
        sections={[{ title: "Library", items: [{ label: "Overview", icon: "layoutDashboard", badge: "3" }, { label: "Layers", icon: "layers" }] }]}
      />,
    )).toEqual(["Active item", "Footer", "Item", "Rail", "Section label"]);
  });

  it("Breadcrumb: the trail, a crumb, a separator and the current page", async () => {
    expect(await anatomyParts(<Breadcrumb items={["Library", "Controls", "Button"]} />)).toEqual(["Crumb", "Current page", "Separator", "Trail"]);
  });

  it("Pagination: previous, a page, the current page, an ellipsis and next", async () => {
    expect(await anatomyParts(<Pagination total={12} defaultPage={1} />)).toEqual(["Current page", "Ellipsis", "Next", "Page", "Previous"]);
  });

  it("Steps: a step, its marker, the connector and the label", async () => {
    expect(await anatomyParts(<Steps current={1} steps={[{ label: "Account" }, { label: "Profile" }, { label: "Done" }]} />)).toEqual(["Connector", "Label", "Marker", "Step"]);
  });

  it("RowMenu: the trigger, the held-open menu, an item and a destructive item", async () => {
    expect(await anatomyParts(<RowMenu open items={[{ label: "Edit", icon: "pencil" }, { label: "Delete", icon: "trash", destructive: true }]} />)).toEqual(["Destructive item", "Item", "Menu", "Trigger"]);
  });

  it("scoping: Buttons and Badges inside caller content register nothing of their own", async () => {
    const names = await anatomyParts(
      <Navbar brand="Canvas" links={["Docs"]} actions={<><Button>Label</Button><Badge>Count</Badge></>} />,
    );
    expect(names).toEqual(["Actions", "Active link", "Bar", "Brand", "Links"]);
  });

  it("Navbar fills its stage inside a provider, so a wide stage keeps its links out of the menu button", async () => {
    render(
      <ThemeProvider dark solid>
        <AnatomyProvider>
          <Navbar testID="bar" brand="Canvas" links={["Docs"]} />
        </AnatomyProvider>
      </ThemeProvider>,
    );
    expect(getComputedStyle(document.querySelector('[data-testid="bar"]') as Element).width).toBe("100%");
  });

  it("RowMenu: Item and Destructive item survive a re-render (their refs stay attached)", async () => {
    const reports: AnatomyRects[] = [];
    const menu = (triggerLabel: string) => (
      <ThemeProvider dark solid>
        <AnatomyProvider onMeasure={(parts) => reports.push(parts)}>
          <RowMenu open triggerLabel={triggerLabel} items={[{ label: "Edit" }, { label: "Delete", destructive: true }]} />
        </AnatomyProvider>
      </ThemeProvider>
    );
    const view = render(menu("Row actions"));
    view.rerender(menu("More"));
    await act(() => new Promise((resolve) => setTimeout(resolve, 5)));
    expect(Object.keys(reports.at(-1) ?? {}).sort()).toContain("Item");
    expect(Object.keys(reports.at(-1) ?? {}).sort()).toContain("Destructive item");
  });
});
