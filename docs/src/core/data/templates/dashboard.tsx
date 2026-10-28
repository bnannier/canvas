import { useState } from "react";
import type { TemplateDoc, TemplateScreenProps } from "../types";

// The hand-off's Dashboard (`Canvas v4.0.0 Templates.dc.html`, `t.dashboard`): the
// Overview heading with Export and New report, four stat cards with their trend bars,
// Recent activity beside the range-switchable Sign-ins chart, then Sign-in methods,
// Service health and Storage. Every part is a kit component from the frame's scope.

// Each stat's tone paints its delta pill and its trend bars (the hand-off's ok, bad, warn).
const STATS = [
  { label: "Active users", value: "12,480", delta: "+8.2%", tone: "success", spark: [30, 38, 34, 44, 42, 50, 48, 58, 56, 62, 66, 74] },
  { label: "Sign-ins", value: "48.2k", delta: "+12.4%", tone: "success", spark: [40, 44, 42, 50, 48, 46, 58, 56, 64, 60, 70, 80] },
  { label: "Failed logins", value: "312", delta: "+3.1%", tone: "error", spark: [20, 22, 18, 26, 24, 30, 28, 34, 30, 40, 44, 52] },
  { label: "Avg. session", value: "14m 20s", delta: "−0.6%", tone: "warning", spark: [60, 58, 62, 56, 60, 54, 58, 52, 56, 50, 54, 50] },
] as const;

/** The Sparkline tone of a stat's tone: the kit's Sparkline has no warning tone, so a warning trend is muted. */
const SPARK_TONE = { success: "success", error: "destructive", warning: "muted" } as const;

const RANGES = [
  { tab: "24 h", from: "24h ago", values: [22, 30, 26, 38, 34, 46, 40, 52, 48, 60, 56, 64, 58, 70] },
  { tab: "7 d", from: "7 days ago", values: [30, 36, 40, 38, 46, 52, 50, 58, 62, 60, 70, 74, 72, 80] },
  { tab: "30 d", from: "30 days ago", values: [40, 38, 46, 52, 50, 58, 56, 64, 70, 68, 76, 80, 86, 92] },
];

const FEED = [
  { icon: "gitMerge", tone: "success", text: "Kira merged #482 into main", when: "2m" },
  { icon: "userPlus", tone: "primary", text: "Noor joined the Mobile team", when: "18m" },
  { icon: "shieldAlert", tone: "warning", text: "3 failed sign-ins from 10.0.4.2", when: "1h" },
  { icon: "creditCard", tone: "muted", text: "Invoice INV-0042 was paid", when: "3h" },
] as const;

const METHODS = [
  { label: "Password", share: 46 },
  { label: "Passkey", share: 31 },
  { label: "SSO", share: 18 },
  { label: "Magic link", share: 5 },
];

const HEALTH = [
  { label: "API", detail: "Operational · 42 ms" },
  { label: "Auth", detail: "Operational · 38 ms" },
  { label: "Webhooks", detail: "Degraded · 310 ms", degraded: true },
];

function DashboardScreen({ K, phone, go }: TemplateScreenProps) {
  const { Row, Column, Grid, Card, Typography, Button, Icon, Emblem, Badge, Sparkline, ButtonGroup, AreaChart, Progress, ServiceHealthList, StackedBar, useToast } = K;
  const { toast } = useToast();
  const [range, setRange] = useState(1);
  const r = RANGES[range]!;
  return (
    <Column airy>
      <Row between alignEnd wrap cozy>
        {phone ? null : (
          <Column tight>
            <Typography h3 level={2}>Overview</Typography>
            <Typography small subtle>Riskora · last 30 days</Typography>
          </Column>
        )}
        <Row snug wrap>
          <Button outline iconLeft={<Icon download decorative />} onPress={() => toast({ message: "Export started · CSV" })}>Export</Button>
          <Button primary raised iconLeft={<Icon plus decorative />} onPress={() => toast({ message: "Report draft created" })}>New report</Button>
        </Row>
      </Row>
      <Grid minTileWidth={170} cozy>
        {STATS.map((stat) => (
          <Card key={stat.label} compact>
            <Column comfortable>
              <Row between alignCenter snug>
                <Typography caption subtle>{stat.label}</Typography>
                <Badge small {...{ [stat.tone]: true }}>{stat.delta}</Badge>
              </Row>
              <Typography statValue tabular>{stat.value}</Typography>
              <Sparkline compact track={false} {...{ [SPARK_TONE[stat.tone]]: true }} values={[...stat.spark]} accessibilityLabel={`${stat.label}, last 12 periods`} />
            </Column>
          </Card>
        ))}
      </Grid>
      <Grid minTileWidth={300} cozy>
        <Card>
          <Column roomy>
            <Row between alignCenter>
              <Typography body semibold>Recent activity</Typography>
              <Button link small onPress={() => go("activity")}>View all</Button>
            </Row>
            {FEED.map((f) => (
              <Row key={f.text} cozy alignCenter>
                <Emblem small {...{ [f.tone]: true }}><Icon {...{ [f.icon]: true }} decorative /></Emblem>
                <Column fill><Typography small>{f.text}</Typography></Column>
                <Typography caption mono subtle>{f.when}</Typography>
              </Row>
            ))}
          </Column>
        </Card>
        <Card>
          <Column roomy>
            <Row between alignCenter wrap snug>
              <Typography body semibold>Sign-ins</Typography>
              <ButtonGroup small accessibilityLabel="Range" active={range} onSelect={setRange} items={RANGES.map((x) => x.tab)} />
            </Row>
            <AreaChart key={r.tab} compact curved hideLegend hideAxes labels={r.values.map((_, i) => String(i))} series={[{ label: "Sign-ins", values: r.values }]} />
            <Row between>
              <Typography caption mono subtle>{r.from}</Typography>
              <Typography caption mono subtle>now</Typography>
            </Row>
          </Column>
        </Card>
      </Grid>
      <Grid minTileWidth={240} cozy>
        <Card>
          <Column cozy>
            <Typography body semibold>Sign-in methods</Typography>
            {METHODS.map((m) => (
              <Progress key={m.label} small value={m.share / 100} showValue accessibilityLabel={`${m.label} share of sign-ins`}>{m.label}</Progress>
            ))}
          </Column>
        </Card>
        <Card>
          <Column cozy>
            <Typography body semibold>Service health</Typography>
            <ServiceHealthList plain compact items={HEALTH} />
          </Column>
        </Card>
        <Card>
          <Column cozy>
            <Row between>
              <Typography body semibold>Storage</Typography>
              <Typography caption mono subtle>82.4 / 100 GB</Typography>
            </Row>
            <StackedBar track hideLegend label="Storage" segments={[{ label: "Boards", value: 38 }, { label: "Tokens", value: 22 }, { label: "Docs", value: 14 }, { label: "Media", value: 8 }]} />
            <Row>
              <Button outline small onPress={() => go("billing")}>Manage storage</Button>
            </Row>
          </Column>
        </Card>
      </Grid>
    </Column>
  );
}

export const DASHBOARD_TEMPLATE: TemplateDoc = {
  slug: "dashboard",
  name: "Dashboard",
  group: "App",
  icon: "layoutDashboard",
  description: "Hero stats with trends, activity beside a range-switchable sign-ins chart, then secondary widgets.",
  path: "dashboard",
  app: true,
  Screen: DashboardScreen,
};
