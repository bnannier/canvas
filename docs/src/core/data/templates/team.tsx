import { Row, Column, Card, Typography, Button, Badge, DataTable, Input, Select, Avatar, StackedList } from "@nannier/canvas";
import type { TemplateDoc } from "../types";

// Team management built from real Canvas components: an invite composer, the
// member table with live role and status cells, and pending invitations.

function member(name: string, initials: string, email: string, role: string, active: boolean) {
  return [
    <Row key="who" snug alignCenter>
      <Avatar small name={initials} />
      <Typography small medium>{name}</Typography>
    </Row>,
    email,
    role === "Admin" ? <Badge key="role">Admin</Badge> : <Badge key="role" secondary>{role}</Badge>,
    active ? (
      <Badge key="st" status success>Active</Badge>
    ) : (
      <Badge key="st" status warning>Invited</Badge>
    ),
  ];
}

export const TEAM_TEMPLATE: TemplateDoc = {
  slug: "team",
  name: "Team",
  description: "Invite teammates, manage member roles, and track pending invitations. Built from live Canvas components.",
  sections: [
    {
      title: "Invite a teammate",
      anatomy: "Email Input + role Select + primary CTA on one wrapping row.",
      render: () => (
        <Card>
          <Row snug wrap alignEnd>
            <Column fill style={{ minWidth: 220 }}>
              <Input label="Email address" placeholder="teammate@company.com" block />
            </Column>
            <Select label="Role" defaultValue="Editor" options={["Admin", "Editor", "Viewer"]} />
            <Button primary>Send invite</Button>
          </Row>
        </Card>
      ),
    },
    {
      title: "Members",
      anatomy: "DataTable with Avatar + name cells, role Badges, and live status Badges.",
      render: () => (
        <DataTable
          bordered
          columns={["Member", "Email", "Role", "Status"]}
          rows={[
            member("Rachel Chen", "RC", "rachel.chen@acme.com", "Admin", true),
            member("Ada Lovelace", "AL", "ada@acme.com", "Editor", true),
            member("Kevin Turner", "KT", "kevin@acme.com", "Editor", true),
            member("Linus Berg", "LB", "linus@acme.com", "Viewer", true),
            member("Sofia Marques", "SM", "sofia@acme.com", "Viewer", false),
          ]}
        />
      ),
    },
    {
      title: "Pending invitations",
      anatomy: "StackedList of outstanding invites with when they were sent; resend or revoke per row.",
      render: () => (
        <Column cozy>
          <StackedList
            items={[
              { name: "sofia@acme.com", detail: "Invited as Viewer", meta: "2 days ago" },
              { name: "devon@acme.com", detail: "Invited as Editor", meta: "5 days ago" },
            ]}
          />
          <Row snug>
            <Button outline small>Resend all</Button>
            <Button ghost small>Revoke expired</Button>
          </Row>
        </Column>
      ),
    },
  ],
};
