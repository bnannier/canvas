import { useState } from "react";
import type { TemplateDoc, TemplateScreenProps } from "../types";

// The hand-off's Pricing (`Canvas v4.0.0 Templates.dc.html`, `t.pricing`): the heading and
// the billing-cycle switch, the three plan cards (Team selected and Popular), the feature
// comparison table and the billing FAQ. Every part is a kit component from the frame's scope.

const PLANS = [
  { name: "Starter", monthly: 0, yearly: 0, blurb: "For side projects", features: ["3 workspaces", "10 boards each", "Community support"] },
  { name: "Team", monthly: 15, yearly: 12, blurb: "For product teams", features: ["Unlimited workspaces", "Unlimited boards", "Audit log", "Priority support"] },
  { name: "Enterprise", monthly: null, yearly: null, blurb: "For regulated orgs", features: ["SSO and SCIM", "Dedicated region", "99.99% SLA", "Custom terms"] },
] as const;

const COMPARE = [
  ["Workspaces", "3", "Unlimited", "Unlimited"],
  ["Unlimited boards", "-", "y", "y"],
  ["Audit log", "-", "y", "y"],
  ["SSO / SCIM", "-", "-", "y"],
  ["Support", "Community", "Priority", "Dedicated"],
] as const;

const FAQ = [
  { q: "Can I switch plans later?", a: "Yes. Upgrades apply right away and are prorated; downgrades apply at renewal." },
  { q: "Do you offer refunds?", a: "Within 14 days of any charge, no questions asked." },
  { q: "What counts as a seat?", a: "Anyone who can sign in. Guests on a single board are free." },
];

function PricingScreen({ K }: TemplateScreenProps) {
  const { Row, Column, Grid, Card, Typography, Button, Icon, Badge, ButtonGroup, DataTable, Accordion, useToast } = K;
  const { toast } = useToast();
  const [yearly, setYearly] = useState(true);
  return (
    <Column airy>
      <Column cozy alignCenter>
        <Typography h3 center level={2}>Plans that scale with your team</Typography>
        <Typography small subtle center>Every plan includes web, iOS and Android apps.</Typography>
        <ButtonGroup small accessibilityLabel="Billing cycle" active={yearly ? 1 : 0} onSelect={(i) => setYearly(i === 1)} items={["Monthly", "Yearly −20%"]} />
      </Column>
      <Grid minTileWidth={230} relaxed>
        {PLANS.map((p, i) => {
          const price = p.monthly === null ? "Custom" : `$${yearly ? p.yearly : p.monthly}`;
          const per = p.monthly === null ? "talk to us" : p.monthly === 0 ? "free forever" : "per seat / mo";
          const cta = p.monthly === null ? "Contact sales" : p.monthly === 0 ? "Start free" : "Start trial";
          const featured = i === 1;
          return (
            <Card key={p.name} grow selected={featured}>
              <Column roomy grow>
                <Row between alignCenter>
                  <Typography body semibold>{p.name}</Typography>
                  {featured ? <Badge solid primary small>Popular</Badge> : null}
                </Row>
                <Row snug baseline wrap>
                  <Typography h2>{price}</Typography>
                  <Typography small subtle>{per}</Typography>
                </Row>
                <Typography small subtle>{p.blurb}</Typography>
                <Column snug grow>
                  {p.features.map((f) => (
                    <Row key={f} snug alignCenter>
                      <Icon check primary size={16} decorative />
                      <Typography small>{f}</Typography>
                    </Row>
                  ))}
                </Column>
                <Button
                  block
                  primary={featured}
                  raised={featured}
                  secondary={!featured}
                  onPress={() => toast({ message: p.monthly === null ? "Sales will reach out" : `${p.name} selected` })}
                >
                  {cta}
                </Button>
              </Column>
            </Card>
          );
        })}
      </Grid>
      <DataTable
        columns={["Feature", "Starter", "Team", "Enterprise"]}
        rows={COMPARE.map(([feature, ...cells]) => [
          <Typography key="f" small medium>{feature}</Typography>,
          ...cells.map((c, j) =>
            c === "y" ? <Icon key={j} check success size={16} accessibilityLabel="Included" />
              : c === "-" ? <Icon key={j} minus muted size={16} accessibilityLabel="Not included" />
                : c,
          ),
        ])}
      />
      <Accordion defaultValue="0" items={FAQ.map((f, i) => ({ key: String(i), title: f.q, content: f.a }))} />
    </Column>
  );
}

export const PRICING_TEMPLATE: TemplateDoc = {
  slug: "pricing",
  name: "Pricing",
  group: "Account",
  icon: "tags",
  description: "Plan tiers with a billing-cycle toggle, a comparison table and a billing FAQ.",
  path: "pricing",
  app: true,
  Screen: PricingScreen,
};
