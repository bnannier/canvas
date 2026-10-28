import { useState } from "react";
import type { TemplateDoc, TemplateScreenProps } from "../types";

// The hand-off's API keys (`Canvas v4.0.0 Templates.dc.html`, `t.apikeys`): create a key
// (its secret shown once), the active keys with their scopes and Revoke, the empty state
// once none are left, and the Revoke all danger zone. Every part is a kit component from
// the frame's scope.

interface Key { name: string; prefix: string; scopes: string[]; used: string }

const KEYS: Key[] = [
  { name: "Production", prefix: "cv_live_7Hq2", scopes: ["read", "write"], used: "2m ago" },
  { name: "CI runner", prefix: "cv_test_9Xk4", scopes: ["read"], used: "1d ago" },
];

const secret = () => `cv_live_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;

function ApiKeysScreen({ K, phone }: TemplateScreenProps) {
  const { Row, Column, Card, Typography, Button, Icon, Emblem, Badge, Input, Alert, Divider, EmptyState, ActionPanel, useToast } = K;
  const { toast } = useToast();
  const [keys, setKeys] = useState<Key[]>(KEYS);
  const [name, setName] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);

  const create = () => {
    const value = secret();
    setKeys((list) => [{ name: name.trim() || "Untitled key", prefix: value.slice(0, 12), scopes: ["read"], used: "never" }, ...list]);
    setFresh(value);
    setName("");
  };

  return (
    <Column relaxed>
      {phone ? null : (
        <Column tight>
          <Typography h3 level={2}>API keys</Typography>
          <Typography small subtle>Keys act as your workspace. Treat them like passwords.</Typography>
        </Column>
      )}
      <Card>
        <Column cozy>
          <Typography body semibold>Create a key</Typography>
          <Row stacks snug>
            <Column fill><Input placeholder="Key name, e.g. Staging" accessibilityLabel="Key name" value={name} onChangeText={setName} onSubmitEditing={create} /></Column>
            <Button primary raised iconLeft={<Icon plus decorative />} onPress={create}>Create key</Button>
          </Row>
          {fresh ? (
            <Alert warning title="Copy this secret now. You won't see it again.">
              <Column cozy>
                <Row snug alignCenter wrap>
                  <Column fill><Typography small mono>{fresh}</Typography></Column>
                  <Button outline small iconLeft={<Icon copy decorative />} onPress={() => toast({ message: "Copied to clipboard" })}>Copy</Button>
                </Row>
                <Row><Button ghost small onPress={() => setFresh(null)}>I've stored it</Button></Row>
              </Column>
            </Alert>
          ) : null}
        </Column>
      </Card>
      <Card flush>
        <Column flush>
          <Column pad><Typography body semibold>Active keys</Typography></Column>
          {keys.map((k, i) => (
            <Column key={`${k.prefix}-${i}`} flush>
              <Divider />
              <Column pad>
                <Row cozy alignCenter>
                  <Emblem muted><Icon keyRound decorative /></Emblem>
                  <Column fill flush>
                    <Typography small medium>{k.name}</Typography>
                    <Typography caption mono subtle>{`${k.prefix}•••• · used ${k.used}`}</Typography>
                  </Column>
                  <Row tight>
                    {k.scopes.map((s) => <Badge key={s} mono small>{s}</Badge>)}
                  </Row>
                  <Button ghost small onPress={() => { setKeys((list) => list.filter((_, j) => j !== i)); toast({ message: `${k.name} revoked` }); }}>Revoke</Button>
                </Row>
              </Column>
            </Column>
          ))}
          {keys.length === 0 ? (
            <Column flush>
              <Divider />
              <EmptyState compact icon="keyRound" title="No active keys" description="Create one above when a service needs access." />
            </Column>
          ) : null}
        </Column>
      </Card>
      <ActionPanel
        destructive
        inline
        title="Revoke all keys"
        description="Every integration using a key stops at once."
        actionLabel="Revoke all"
        onAction={() => { setKeys([]); toast({ message: "All keys revoked" }); }}
      />
    </Column>
  );
}

export const API_KEYS_TEMPLATE: TemplateDoc = {
  slug: "api-keys",
  name: "API keys",
  group: "Account",
  icon: "keyRound",
  description: "Create, reveal and revoke keys, with scoped access badges and a danger zone.",
  path: "apikeys",
  app: true,
  Screen: ApiKeysScreen,
};
