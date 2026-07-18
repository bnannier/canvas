import { Row, Column, Card, Typography, Button, Badge, DataTable, Progress, Field, Divider, Emblem, Icon } from "@nannier/canvas";
import type { TemplateDoc } from "../types";

// Billing settings built from real Canvas components: current plan + usage
// meters side by side, the payment method row, and invoice history.

const USAGE = [
  { label: "Storage", detail: "62 GB of 100 GB", value: 0.62 },
  { label: "Members", detail: "8 of 10 seats", value: 0.8 },
  { label: "API requests", detail: "1.2M of 2M", value: 0.6 },
];

function paidBadge() {
  return (
    <Badge status success>
      Paid
    </Badge>
  );
}

export const BILLING_TEMPLATE: TemplateDoc = {
  slug: "billing",
  name: "Billing",
  description: "Current plan, usage meters, payment method, and invoice history. Built from live Canvas components.",
  sections: [
    {
      title: "Plan and usage",
      anatomy: "Two Cards side by side (stacking on phones): the current plan with its renewal Field rows and actions, and per-resource usage meters (Progress). ",
      render: () => (
        <Row relaxed wrap>
          <Card grow style={{ flexBasis: 300, minWidth: 280 }}>
            <Column cozy>
              <Row between alignCenter>
                <Column tight fill>
                  <Typography h4>Pro plan</Typography>
                  <Typography small>$24 per member / month, billed monthly</Typography>
                </Column>
                <Badge status success>Active</Badge>
              </Row>
              <Divider />
              <Field
                rows={[
                  { label: "Renews", value: "Aug 17, 2026" },
                  { label: "Seats", value: "8 of 10" },
                  { label: "Billing email", value: "ap@acme.com" },
                ]}
              />
              <Row snug>
                <Button outline small>Change plan</Button>
                <Button ghost small>Cancel subscription</Button>
              </Row>
            </Column>
          </Card>
          <Card grow style={{ flexBasis: 300, minWidth: 280 }}>
            <Column cozy>
              <Typography h4>Usage this cycle</Typography>
              {USAGE.map((u) => (
                <Column key={u.label} tight>
                  <Row between>
                    <Typography small medium>{u.label}</Typography>
                    <Typography small>{u.detail}</Typography>
                  </Row>
                  <Progress block value={u.value} accessibilityLabel={`${u.label} usage`} />
                </Column>
              ))}
              <Typography tiny>Usage resets at the start of each billing cycle.</Typography>
            </Column>
          </Card>
        </Row>
      ),
    },
    {
      title: "Payment method",
      anatomy: "Card row: Emblem card icon + brand and expiry, with an update action.",
      render: () => (
        <Card>
          <Row between alignCenter wrap>
            <Row snug alignCenter>
              <Emblem muted>
                <Icon creditCard />
              </Emblem>
              <Column tight>
                <Typography small medium>Visa ending in 4242</Typography>
                <Typography tiny>Expires 04 / 2028</Typography>
              </Column>
            </Row>
            <Button outline small>Update</Button>
          </Row>
        </Card>
      ),
    },
    {
      title: "Invoices",
      anatomy: "Invoice history DataTable; the status cell is a live Badge.",
      render: () => (
        <DataTable
          bordered
          columns={["Invoice", "Date", "Amount", "Status"]}
          rows={[
            ["INV-2026-007", "Jul 1, 2026", "$192.00", paidBadge()],
            ["INV-2026-006", "Jun 1, 2026", "$192.00", paidBadge()],
            ["INV-2026-005", "May 1, 2026", "$168.00", paidBadge()],
            ["INV-2026-004", "Apr 1, 2026", "$168.00", paidBadge()],
          ]}
        />
      ),
    },
  ],
};
