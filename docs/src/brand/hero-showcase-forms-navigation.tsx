import { Card, Column, FilterPanel, Form, Icon, Input, Navbar, Row, Sidebar, TabBar, TextInput, Typography, View } from "@nannier/canvas";
import { useDemonstrationStep } from "./hero-showcase-activity";

export const HERO_FORM_NAV_CENTER = ["filter-panel", "form", "sidebar"] as const;
export const HERO_FORM_NAV_SMALL = ["navbars", "tab-bar", "text-input"] as const;
type Kind = typeof HERO_FORM_NAV_CENTER[number] | typeof HERO_FORM_NAV_SMALL[number];

export function HeroFormNavigationSpecimen({ kind }: { kind: Kind }) {
  const step = useDemonstrationStep(kind === "text-input" ? 280 : 1200);
  const phase = step % 4;
  const testID = `hero-form-nav-${kind}`;
  switch (kind) {
    case "filter-panel":
      return <FilterPanel bordered compact groups={[{ title: "Project status", options: [
        { label: "Active", checked: phase !== 1, count: "24" },
        { label: "In review", checked: phase > 1, count: "8" },
        { label: "Archived", checked: phase === 3, count: "3" },
      ] }]} testID={testID} />;
    case "form":
      return <Column pad relaxed>
        <Typography h4>Invite your team</Typography>
        <Form accessibilityLabel="Invite a teammate" submitLabel={phase === 3 ? "Invite sent" : "Send invite"} cancelLabel="Cancel" testID={testID}>
          <Input small readOnly label="Name" value={["Ada", "Ada Chen", "Ada Chen", "Ada Chen"][phase]} />
          <Input small readOnly label="Email" value={phase > 1 ? "ada@example.com" : "ada@"} />
        </Form>
      </Column>;
    case "sidebar":
      return <Column pad>
        <Sidebar embedded compact markers active={["Overview", "Projects", "Inbox", "Team"][phase]}
          header={<Typography h4>Studio</Typography>} sections={[{ title: "Workspace", items: [
            { label: "Overview", icon: "home" }, { label: "Projects", icon: "folder" },
            { label: "Inbox", icon: "inbox", badge: String(phase + 2) }, { label: "Team", icon: "users" },
          ] }]} testID={testID} />
      </Column>;
    case "navbars":
      return <Navbar compact floating scrolls brand="Studio" links={["Work", "Team", "Inbox"]} active={step % 3} testID={testID} />;
    case "tab-bar":
      return <TabBar active={["home", "inbox", "profile"][step % 3]} items={[
        { key: "home", label: "Home", icon: selected => <Icon home primary={selected} muted={!selected} /> },
        { key: "inbox", label: "Inbox", unread: phase < 2, icon: selected => <Icon inbox primary={selected} muted={!selected} /> },
        { key: "profile", label: "Profile", icon: selected => <Icon user primary={selected} muted={!selected} /> },
      ]} testID={testID} />;
    case "text-input": {
      const message = "Make something people love.";
      return <View style={{ width: 235 }}><Card cozy><Column tight>
        <Row snug alignCenter><Icon pencil size={14} muted /><Typography caption muted>Quick note</Typography></Row>
        <TextInput accessibilityLabel="Quick note" multiline numberOfLines={2}
          value={step === 0 ? message : message.slice(0, Math.min(message.length, 8 + step % (message.length + 5)))} editable={false} testID={testID} />
      </Column></Card></View>;
    }
  }
}
