import { useState } from "react";
import type { TemplateDoc, TemplateScreenProps } from "../types";

// The hand-off's Billing (`Canvas v4.0.0 Templates.dc.html`, `t.billing`): the current plan
// (with its inline cancel confirmation) beside this cycle's usage meters, the payment
// method, and the invoice history with downloads. Every part is a kit component from the
// frame's scope.

const USAGE = [
  { label: "Seats", value: "24 / 30", share: 0.8 },
  { label: "Storage", value: "82.4 / 100 GB", share: 0.82, warning: true },
  { label: "API calls", value: "1.2M / 2M", share: 0.6 },
];

const INVOICES = [
  { date: "Oct 1, 2026", id: "INV-0042", amount: "$48.00", status: "Paid" },
  { date: "Sep 1, 2026", id: "INV-0041", amount: "$48.00", status: "Paid" },
  { date: "Aug 1, 2026", id: "INV-0040", amount: "$48.00", status: "Paid" },
  { date: "Jul 1, 2026", id: "INV-0039", amount: "$36.00", status: "Refunded" },
];

function BillingScreen({ K, phone, go }: TemplateScreenProps) {
  const { Row, Column, Card, Typography, Button, Icon, Emblem, Badge, Progress, Divider, useToast } = K;
  const { toast } = useToast();
  const [asking, setAsking] = useState(false);
  return (
    <Column relaxed>
      {phone ? null : (
        <Column tight>
          <Typography h3 level={2}>Billing</Typography>
          <Typography small subtle>Plan, usage, payment method and invoices.</Typography>
        </Column>
      )}
      <Row stacks relaxed>
        <Column span={6}><Card grow>
          <Column cozy>
            <Typography eyebrow subtle>Current plan</Typography>
            <Row snug baseline wrap>
              <Typography h3>Team</Typography>
              <Typography subtle>$48 / month</Typography>
            </Row>
            <Typography small subtle>24 of 30 seats · renews Nov 1, 2026 · billed yearly</Typography>
            {asking ? (
              <Column cozy>
                <Typography small>Cancel your plan? You keep access until Nov 1.</Typography>
                <Row snug wrap>
                  <Button outline small onPress={() => setAsking(false)}>Keep plan</Button>
                  <Button destructive small onPress={() => { setAsking(false); toast({ message: "Plan will end on Nov 1" }); }}>Cancel plan</Button>
                </Row>
              </Column>
            ) : (
              <Row snug wrap>
                <Button outline onPress={() => go("pricing")}>Change plan</Button>
                <Button ghost onPress={() => setAsking(true)}>Cancel plan</Button>
              </Row>
            )}
          </Column>
        </Card></Column>
        <Column span={6}><Card grow>
          <Column cozy>
            <Typography eyebrow subtle>Usage this cycle</Typography>
            {USAGE.map((u) => (
              <Column key={u.label} tight>
                <Row between>
                  <Typography small subtle>{u.label}</Typography>
                  <Typography caption mono semibold>{u.value}</Typography>
                </Row>
                <Progress small warning={u.warning} value={u.share} accessibilityLabel={`${u.label} used`} />
              </Column>
            ))}
          </Column>
        </Card></Column>
      </Row>
      <Card>
        <Row cozy alignCenter>
          <Emblem large muted><Icon creditCard decorative /></Emblem>
          <Column fill>
            <Typography semibold>Visa •••• 4242</Typography>
            <Typography caption subtle>Expires 08/28 · billing@ionize.io</Typography>
          </Column>
          <Button outline onPress={() => toast({ message: "Card update opened" })}>Update</Button>
        </Row>
      </Card>
      <Card flush>
        <Column flush>
          <Column pad><Typography body semibold>Invoices</Typography></Column>
          {INVOICES.map((iv) => (
            <Column key={iv.id} flush>
              <Divider />
              <Column pad>
                <Row cozy alignCenter>
                  <Column fill flush>
                    <Typography small medium>{iv.date}</Typography>
                    <Typography caption mono subtle>{iv.id}</Typography>
                  </Column>
                  <Typography small mono semibold>{iv.amount}</Typography>
                  {iv.status === "Paid" ? <Badge success>Paid</Badge> : <Badge neutral>{iv.status}</Badge>}
                  <Button ghost compactIcon accessibilityLabel={`Download ${iv.id}`} iconLeft={<Icon download decorative />} onPress={() => toast({ message: `${iv.id} downloaded` })} />
                </Row>
              </Column>
            </Column>
          ))}
        </Column>
      </Card>
    </Column>
  );
}

export const BILLING_TEMPLATE: TemplateDoc = {
  slug: "billing",
  name: "Billing",
  group: "Account",
  icon: "creditCard",
  description: "Current plan, usage meters, payment method and invoice history.",
  path: "billing",
  app: true,
  Screen: BillingScreen,
};
