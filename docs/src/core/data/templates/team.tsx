import { Fragment, useState } from "react";
import type { TemplateDoc, TemplateScreenProps } from "../types";

// The hand-off's Team (`Canvas v4.0.0 Templates.dc.html`, `t.team`): the heading, the
// invite card (email, a role that cycles, Send invite), the pending invitations with
// Revoke, and the members with their role and status. Every part is a kit component from
// the frame's scope.

const ROLES = ["Editor", "Viewer", "Admin"] as const;

const MEMBERS = [
  { name: "Ada Lovelace", email: "ada@ionize.io", photo: "/ada-lovelace.jpg", role: "Owner", status: "Active" },
  { name: "Grace Hopper", email: "grace@ionize.io", photo: "/grace-hopper.jpg", role: "Admin", status: "Active" },
  { name: "Kira Tanaka", email: "kira@ionize.io", photo: "/kira-tanaka.jpg", role: "Editor", status: "Invited" },
  { name: "Noor Park", email: "noor@ionize.io", photo: "/noor-park.jpg", role: "Editor", status: "Active" },
  { name: "Marcus Allen", email: "marcus@ionize.io", photo: "/marcus-allen.jpg", role: "Viewer", status: "Locked" },
];

const STATUS_TONE = { Active: "success", Invited: "info", Locked: "error" } as const;

interface Invite {
  email: string;
  role: string;
  sent: string;
}

function TeamScreen({ K, phone }: TemplateScreenProps) {
  const { Row, Column, Card, Typography, Button, Icon, Input, Emblem, Badge, Avatar, Divider, useToast } = K;
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);
  const [invites, setInvites] = useState<Invite[]>([{ email: "liang@ionize.io", role: "Viewer", sent: "2d ago" }]);

  const invite = () => {
    const value = email.trim();
    if (!value) {
      toast({ message: "Add an email first" });
      return;
    }
    setInvites((prev) => [{ email: value, role: ROLES[roleIndex]!, sent: "just now" }, ...prev]);
    setEmail("");
    toast({ message: `Invite sent to ${value}` });
  };

  return (
    <Column relaxed>
      {phone ? null : (
        <Column tight>
          <Typography h3 level={2}>Team</Typography>
          <Typography small subtle>Invite teammates and manage what they can change.</Typography>
        </Column>
      )}
      <Card>
        <Column cozy>
          <Typography body semibold>Invite a teammate</Typography>
          <Row snug wrap>
            <Column fill>
              <Input placeholder="name@company.com" accessibilityLabel="Teammate email" value={email} onChangeText={setEmail} onSubmitEditing={invite} />
            </Column>
            <Button outline iconRight={<Icon chevronsUpDown muted decorative />} accessibilityLabel={`Role: ${ROLES[roleIndex]}`} onPress={() => setRoleIndex((i) => (i + 1) % ROLES.length)}>{ROLES[roleIndex]}</Button>
            <Button primary raised onPress={invite}>Send invite</Button>
          </Row>
        </Column>
      </Card>
      <Card flush clip>
        <Column pad>
          <Typography body semibold>Pending invitations <Typography caption mono subtle>{String(invites.length)}</Typography></Typography>
        </Column>
        {invites.map((inv, i) => (
          <Fragment key={`${inv.email}-${i}`}>
            <Divider />
            <Column pad>
              <Row cozy alignCenter>
                <Emblem primary><Icon mail decorative /></Emblem>
                <Column fill>
                  <Typography small medium numberOfLines={1}>{inv.email}</Typography>
                  <Typography caption subtle>{`${inv.role} · sent ${inv.sent}`}</Typography>
                </Column>
                <Button ghost small onPress={() => setInvites((prev) => prev.filter((_, j) => j !== i))}>Revoke</Button>
              </Row>
            </Column>
          </Fragment>
        ))}
      </Card>
      <Card flush clip>
        <Column pad>
          <Typography body semibold>Members <Typography caption mono subtle>24</Typography></Typography>
        </Column>
        {MEMBERS.map((m) => (
          <Fragment key={m.email}>
            <Divider />
            <Column pad>
              <Row cozy alignCenter>
                <Avatar src={m.photo} name={m.name} />
                <Column fill>
                  <Typography small medium>{m.name}</Typography>
                  <Typography caption subtle numberOfLines={1}>{m.email}</Typography>
                </Column>
                <Badge secondary>{m.role}</Badge>
                <Badge soft {...{ [STATUS_TONE[m.status as keyof typeof STATUS_TONE]]: true }}>{m.status}</Badge>
              </Row>
            </Column>
          </Fragment>
        ))}
      </Card>
    </Column>
  );
}

export const TEAM_TEMPLATE: TemplateDoc = {
  slug: "team",
  name: "Team",
  group: "App",
  icon: "userCog",
  description: "Invite teammates, manage member roles and track pending invitations.",
  path: "team",
  app: true,
  Screen: TeamScreen,
};
