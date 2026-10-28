import { useState } from "react";
import type { IconName } from "@nannier/canvas";
import type { TemplateDoc, TemplateScreenProps } from "../template-types";

// The hand-off's Settings (`Canvas v4.0.0 Templates.dc.html`, `t.settings`): the section
// list (General, Notifications, Appearance) beside the open section's card, then the save
// bar. Every part is a kit component from the frame's scope. The hand-off's theme picker
// also repaints its page; here the choice stays in the screen (the docs' own scheme switch
// is the pill's), so picking a theme or an accent only moves the selection.

const SECTIONS: readonly { label: string; icon: IconName }[] = [
  { label: "General", icon: "settings2" },
  { label: "Notifications", icon: "bell" },
  { label: "Appearance", icon: "palette" },
];

const SWITCHES = [
  { key: "a", label: "Mentions", description: "When someone tags you" },
  { key: "b", label: "Weekly digest", description: "Monday summary of your boards" },
  { key: "c", label: "Release notes", description: "When the kit ships a version" },
  { key: "d", label: "Security alerts", description: "New sign-ins and key changes" },
] as const;

const THEMES: readonly { key: string; label: string; icon: IconName }[] = [
  { key: "dark", label: "Dark", icon: "moon" },
  { key: "light", label: "Light", icon: "sun" },
  { key: "system", label: "System", icon: "monitor" },
];

const ACCENTS = ["violet", "cyan", "mint", "rose", "amber"] as const;

function SettingsScreen({ K, phone }: TemplateScreenProps) {
  const { Row, Column, Grid, Card, Typography, Button, Icon, Input, Select, Switch, Sidebar, Tabs, Swatch, Divider, useToast } = K;
  const { toast } = useToast();
  const [section, setSection] = useState(0);
  const [on, setOn] = useState<Record<string, boolean>>({ a: true, b: false, c: true, d: true });
  const [theme, setTheme] = useState("dark");
  const [accent, setAccent] = useState<(typeof ACCENTS)[number]>("violet");

  const nav = phone ? (
    <Tabs pills wrap tabs={SECTIONS.map((s) => s.label)} active={section} onSelect={setSection} />
  ) : (
    <Sidebar
      embedded
      accessibilityLabel="Settings sections"
      active={section}
      onSelect={(_, index) => setSection(index)}
      items={SECTIONS.map((s) => ({ id: s.label, label: s.label, icon: s.icon }))}
    />
  );

  const body = (
    <Column relaxed>
      {section === 0 ? (
        <Card>
          <Column roomy>
            <Grid minTileWidth={220} cozy>
              <Input label="Workspace name" placeholder="Riskora" />
              <Select label="Language" defaultValue="English (UK)" options={["English (UK)", "English (US)", "Deutsch", "Français"]} />
            </Grid>
            <Input label="Workspace URL" prefix="riskora.app/" defaultValue="team" />
          </Column>
        </Card>
      ) : null}
      {section === 1 ? (
        <Card>
          <Column>
            {SWITCHES.map((w, i) => (
              <Column key={w.key} roomy>
                {i ? <Divider /> : null}
                <Switch checked={!!on[w.key]} onValueChange={(next) => setOn((x) => ({ ...x, [w.key]: next }))} description={w.description}>
                  {w.label}
                </Switch>
              </Column>
            ))}
          </Column>
        </Card>
      ) : null}
      {section === 2 ? (
        <Card>
          <Column roomy>
            <Typography small medium subtle>Theme</Typography>
            <Grid minTileWidth={72} columns={3} snug>
              {THEMES.map((t) => (
                <Card key={t.key} compact selected={theme === t.key} onPress={() => setTheme(t.key)} accessibilityLabel={t.label}>
                  <Column snug alignCenter>
                    <Icon {...{ [t.icon]: true }} size={20} primary={theme === t.key} muted={theme !== t.key} decorative />
                    <Typography small medium primary={theme === t.key} subtle={theme !== t.key}>{t.label}</Typography>
                  </Column>
                </Card>
              ))}
            </Grid>
            <Typography small medium subtle>Accent · repaints every page</Typography>
            <Row cozy alignCenter>
              {ACCENTS.map((a) => (
                <Swatch key={a} {...{ [a]: true }} selected={accent === a} onPress={() => setAccent(a)} />
              ))}
            </Row>
          </Column>
        </Card>
      ) : null}
      <Row end snug alignCenter>
        <Button ghost onPress={() => toast({ message: "Changes discarded" })}>Discard</Button>
        <Button primary raised onPress={() => toast({ message: "Preferences saved" })}>Save changes</Button>
      </Row>
    </Column>
  );

  return (
    <Column relaxed>
      {phone ? null : (
        <Column tight>
          <Typography h3 level={2}>Settings</Typography>
          <Typography small subtle>Workspace preferences for Riskora.</Typography>
        </Column>
      )}
      {phone ? (
        <Column relaxed>{nav}{body}</Column>
      ) : (
        <Row stacks relaxed>
          <Column span={3}>{nav}</Column>
          <Column span={9}>{body}</Column>
        </Row>
      )}
    </Column>
  );
}

export const SETTINGS_TEMPLATE: TemplateDoc = {
  slug: "settings",
  name: "Settings",
  group: "Account",
  icon: "settings",
  description: "Grouped preferences with switches, an appearance picker and a save bar.",
  path: "settings",
  app: true,
  Screen: SettingsScreen,
};
