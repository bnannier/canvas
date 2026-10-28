import { Fragment } from "react";
import type { TemplateDoc, TemplateScreenProps } from "../template-types";

// The hand-off's Detail + sidebar (`Canvas v4.0.0 Templates.dc.html`, `t.detail`): the
// Orders breadcrumb, the order's heading with its status badges, Refund and Mark fulfilled,
// then the Items and the fulfilment Timeline beside a metadata sidebar (the customer, the
// copyable ids, the shipping address and the totals) that stacks under them on narrow
// screens. Every part is a kit component from the frame's scope.

const ITEMS = [
  { icon: "users", tone: "primary", name: "Team seat", qty: "24 × $12.00", price: "$288.00" },
  { icon: "lifeBuoy", tone: "success", name: "Priority support", qty: "1 × $40.00", price: "$40.00" },
  { icon: "layers", tone: "muted", name: "Audit log add-on", qty: "1 × included", price: "$0.00" },
] as const;

const TIMELINE = [
  { label: "Payment captured", description: "Oct 24 · 14:03" },
  { label: "Seats provisioned", description: "Oct 24 · 14:04" },
  { label: "Awaiting fulfilment", description: "support onboarding call" },
];

function DetailScreen({ K }: TemplateScreenProps) {
  const { Row, Column, Card, Typography, Button, Badge, Breadcrumb, Divider, Emblem, Icon, Avatar, Steps, DescriptionList, useToast } = K;
  const { toast } = useToast();
  const copied = () => toast({ message: "Copied to clipboard" });
  return (
    <Column airy>
      <Breadcrumb chevron items={["Orders", "#4821"]} />
      <Row between alignEnd wrap cozy>
        <Column tight shrink>
          <Row snug alignCenter wrap>
            <Typography h3 level={2}>Order #4821</Typography>
            <Badge soft success>Paid</Badge>
            <Badge soft warning>Unfulfilled</Badge>
          </Row>
          <Typography small subtle>Placed Oct 24, 2026 at 14:02 · 3 items</Typography>
        </Column>
        <Row snug wrap>
          <Button outline onPress={() => toast({ message: "Refund drafted for #4821" })}>Refund</Button>
          <Button primary raised onPress={() => toast({ message: "Marked #4821 fulfilled" })}>Mark fulfilled</Button>
        </Row>
      </Row>
      <Row stacks stackBreakpoint="sm" cozy>
        <Column span={8}>
          <Column cozy>
            <Card flush>
              <Column>
                <Column pad><Typography body semibold>Items</Typography></Column>
                {ITEMS.map((item) => (
                  <Fragment key={item.name}>
                    <Divider />
                    <Column pad>
                      <Row cozy alignCenter>
                        <Emblem {...{ [item.tone]: true }}><Icon {...{ [item.icon]: true }} decorative /></Emblem>
                        <Column fill>
                          <Typography small medium>{item.name}</Typography>
                          <Typography caption mono subtle>{item.qty}</Typography>
                        </Column>
                        <Typography small mono semibold>{item.price}</Typography>
                      </Row>
                    </Column>
                  </Fragment>
                ))}
              </Column>
            </Card>
            <Card>
              <Column cozy>
                <Typography body semibold>Timeline</Typography>
                <Steps vertical current={2} steps={TIMELINE} />
              </Column>
            </Card>
          </Column>
        </Column>
        <Column span={4}>
          <Column cozy>
            <Card onPress={() => toast({ message: "Grace Hopper" })}>
              <Row cozy alignCenter>
                <Avatar src="/grace-hopper.jpg" name="Grace Hopper" />
                <Column fill>
                  <Typography small semibold>Grace Hopper</Typography>
                  <Typography caption subtle>grace@ionize.io · 12 orders</Typography>
                </Column>
                <Icon chevronRight muted size={16} decorative />
              </Row>
            </Card>
            <DescriptionList
              card
              divided
              onCopy={copied}
              items={[
                { term: "Order ID", value: "ord_4821_9Kq", mono: true, copyValue: "ord_4821_9Kq" },
                { term: "Payment", value: "pi_3Xc71", mono: true, copyValue: "pi_3Xc71" },
              ]}
            />
            <Card>
              <Column snug>
                <Typography small subtle>Ships to</Typography>
                <Typography>{"Riskora GmbH\nTorstraße 140\n10119 Berlin, DE"}</Typography>
              </Column>
            </Card>
            <DescriptionList
              card
              divided
              items={[
                { term: "Subtotal", value: "$328.00", mono: true },
                { term: "VAT 19%", value: "$62.32", mono: true },
                { term: <Typography small semibold>Total</Typography>, value: <Typography small mono semibold>$390.32</Typography> },
              ]}
            />
          </Column>
        </Column>
      </Row>
    </Column>
  );
}

export const DETAIL_SIDEBAR_TEMPLATE: TemplateDoc = {
  slug: "detail-sidebar",
  name: "Detail + sidebar",
  group: "App",
  icon: "panelRight",
  description: "Order record: items and timeline beside a metadata sidebar that stacks on phones.",
  path: "detail",
  app: true,
  Screen: DetailScreen,
};
