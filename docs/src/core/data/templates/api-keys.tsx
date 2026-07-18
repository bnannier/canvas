import { Row, Column, Card, Typography, Button, Badge, DataTable, Input, Alert, Divider, Icon } from "@nannier/canvas";
import type { TemplateDoc } from "../types";

// Developer API keys built from real Canvas components: the freshly created
// key reveal, the key table with mono identifiers and scope badges, and the
// destructive danger zone.

function scopeBadges(scopes: string[]) {
  return (
    <Row tight wrap>
      {scopes.map((s) => (
        <Badge key={s} outline mono>{s}</Badge>
      ))}
    </Row>
  );
}

export const API_KEYS_TEMPLATE: TemplateDoc = {
  slug: "api-keys",
  name: "API keys",
  description: "Create, reveal, and revoke API keys, with scoped access badges and a danger zone. Built from live Canvas components.",
  sections: [
    {
      title: "Create a key",
      anatomy: "Name Input + primary CTA; the one-time reveal shows the new secret in a copyable Input inside a warning Alert.",
      render: () => (
        <Column cozy>
          <Card>
            <Row snug wrap alignEnd>
              <Column fill style={{ minWidth: 220 }}>
                <Input label="Key name" placeholder="production-backend" block />
              </Column>
              <Button primary>Create key</Button>
            </Row>
          </Card>
          <Alert
            warning
            icon={<Icon alertTriangle size={16} />}
            title="Copy your new key now"
            description="This is the only time the full secret is shown. Store it in your secrets manager."
          />
          <Input suffix="Copy" action value="cnv_live_8f2a9b4c7e1d03f6" block accessibilityLabel="New API key" />
        </Column>
      ),
    },
    {
      title: "Active keys",
      anatomy: "DataTable of keys: mono prefix, scope Badges, last-used column, revoke per row.",
      render: () => (
        <DataTable
          bordered
          columns={["Key", "Scopes", "Last used", ""]}
          rows={[
            ["cnv_live_8f2a…03f6", scopeBadges(["read", "write"]), "2 minutes ago", <Button key="r" ghost small>Revoke</Button>],
            ["cnv_live_c41d…9a8b", scopeBadges(["read"]), "3 hours ago", <Button key="r" ghost small>Revoke</Button>],
            ["cnv_test_77e0…12cd", scopeBadges(["read", "write", "admin"]), "12 days ago", <Button key="r" ghost small>Revoke</Button>],
          ]}
        />
      ),
    },
    {
      title: "Danger zone",
      anatomy: "Bordered Card of irreversible actions, each row pairing the consequence copy with a destructive outline Button.",
      render: () => (
        <Card>
          <Column cozy>
            <Typography h4 destructive>Danger zone</Typography>
            <Row between alignCenter wrap>
              <Column tight fill style={{ minWidth: 220 }}>
                <Typography small medium>Revoke all keys</Typography>
                <Typography tiny>Every integration stops working immediately.</Typography>
              </Column>
              <Button destructive small>Revoke all</Button>
            </Row>
            <Divider />
            <Row between alignCenter wrap>
              <Column tight fill style={{ minWidth: 220 }}>
                <Typography small medium>Rotate signing secret</Typography>
                <Typography tiny>Webhook signatures change; consumers must update.</Typography>
              </Column>
              <Button outline small>Rotate secret</Button>
            </Row>
          </Column>
        </Card>
      ),
    },
  ],
};
