import { Fragment, useState } from "react";
import type { TemplateDoc, TemplateScreenProps } from "../types";

// The hand-off's Profile (`Canvas v4.0.0 Templates.dc.html`, `t.profile`): the hero identity
// card (photo, name, role and status badges, Message and Edit profile, the four-figure stat
// strip), then underline Tabs over three facets: Overview (the person's details beside their
// teams), Security (two-factor, password, passkeys) and Sessions (revocable devices). Every
// part is a kit component from the frame's scope.

const STATS = [
  { value: "18", label: "Boards" },
  { value: "142", label: "Reviews" },
  { value: "64", label: "Tokens edited" },
  { value: "2021", label: "Member since" },
];

/** The hand-off's SESS0. */
const SESSIONS = [
  { name: "MacBook Pro · Safari", where: "Berlin · active now", icon: "monitor" },
  { name: "iPhone 16 · Canvas app", where: "Berlin · 2h ago", icon: "smartphone" },
  { name: "Pixel 9 · Canvas app", where: "Seoul · 3d ago", icon: "smartphone" },
] as const;

function ProfileScreen({ K }: TemplateScreenProps) {
  const { Row, Column, Card, Grid, Typography, Button, Badge, Avatar, Divider, Tabs, DescriptionList, Chip, Switch, Emblem, Icon, useToast } = K;
  const { toast } = useToast();
  const [tab, setTab] = useState(0);
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessions, setSessions] = useState<readonly (typeof SESSIONS)[number][]>(SESSIONS);
  return (
    <Column airy>
      <Card>
        <Column relaxed>
          <Row between alignCenter wrap relaxed>
            <Row relaxed alignCenter shrink>
              <Avatar spotlight glow src="/ada-lovelace.jpg" name="Ada Lovelace" />
              <Column snug shrink>
                <Typography h4 level={2}>Ada Lovelace</Typography>
                <Row tight alignCenter wrap>
                  <Badge soft primary>Owner</Badge>
                  <Badge soft success>Active</Badge>
                  <Typography small subtle>ada@ionize.io · Berlin</Typography>
                </Row>
              </Column>
            </Row>
            <Row snug>
              <Button outline onPress={() => toast({ message: "Copied to clipboard" })}>Message</Button>
              <Button primary onPress={() => toast({ message: "Preferences saved" })}>Edit profile</Button>
            </Row>
          </Row>
          <Divider />
          <Grid minTileWidth={130} cozy>
            {STATS.map((s) => (
              <Column key={s.label}>
                <Typography h4 semibold>{s.value}</Typography>
                <Typography caption subtle>{s.label}</Typography>
              </Column>
            ))}
          </Grid>
        </Column>
      </Card>
      <Column cozy>
        <Tabs underline tabs={["Overview", "Security", "Sessions"]} active={tab} onSelect={setTab} />
        {tab === 0 ? (
          <Row stacks stackBreakpoint="sm" cozy>
            <Column span={7}>
              <DescriptionList
                card
                divided
                items={[
                  { term: "Full name", value: "Ada Lovelace" },
                  { term: "Team", value: "Platform" },
                  { term: "Timezone", value: "Europe/Berlin" },
                  { term: "Manager", value: "Grace Hopper" },
                ]}
              />
            </Column>
            <Column span={5}>
              <Card>
                <Column snug>
                  <Typography body semibold>Teams</Typography>
                  <Row tight wrap>
                    <Chip>Platform</Chip>
                    <Chip>Design system</Chip>
                    <Chip>Security</Chip>
                  </Row>
                </Column>
              </Card>
            </Column>
          </Row>
        ) : null}
        {tab === 1 ? (
          <Card>
            <Column relaxed>
              <Switch checked={twoFactor} onValueChange={setTwoFactor} description="Authenticator app, required for owners">Two-factor authentication</Switch>
              <Divider />
              <Row between alignCenter cozy>
                <Column shrink>
                  <Typography small medium>Password</Typography>
                  <Typography caption subtle>Changed 3 months ago</Typography>
                </Column>
                <Button outline small onPress={() => toast({ message: "Preferences saved" })}>Change</Button>
              </Row>
              <Divider />
              <Row between alignCenter cozy>
                <Column shrink>
                  <Typography small medium>Passkeys</Typography>
                  <Typography caption subtle>2 registered</Typography>
                </Column>
                <Button outline small onPress={() => toast({ message: "Passkey prompt opened" })}>Add</Button>
              </Row>
            </Column>
          </Card>
        ) : null}
        {tab === 2 ? (
          <Card>
            <Column cozy>
              {sessions.length === 0 ? <Typography small subtle>No other sessions. You're only signed in here.</Typography> : null}
              {sessions.map((s, i) => (
                <Fragment key={s.name}>
                  {i > 0 ? <Divider /> : null}
                  <Row cozy alignCenter>
                    <Emblem muted><Icon {...{ [s.icon]: true }} decorative /></Emblem>
                    <Column fill>
                      <Typography small medium>{s.name}</Typography>
                      <Typography caption subtle>{s.where}</Typography>
                    </Column>
                    <Button ghost small onPress={() => { setSessions((list) => list.filter((x) => x.name !== s.name)); toast({ message: "Session revoked" }); }}>Revoke</Button>
                  </Row>
                </Fragment>
              ))}
            </Column>
          </Card>
        ) : null}
      </Column>
    </Column>
  );
}

export const PROFILE_TEMPLATE: TemplateDoc = {
  slug: "profile",
  name: "Profile",
  group: "App",
  icon: "circleUser",
  description: "Hero identity card, a stat strip and tabbed facets: overview, security, sessions.",
  path: "profile",
  app: true,
  Screen: ProfileScreen,
};
