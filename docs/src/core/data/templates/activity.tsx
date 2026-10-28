import { Fragment, useState } from "react";
import type { IconName } from "@nannier/canvas";
import type { TemplateDoc, TemplateScreenProps } from "../template-types";

// The hand-off's Activity (`Canvas v4.0.0 Templates.dc.html`, `t.activity`): the Audit
// log heading with Export CSV, the filter chips and the date range, then the day-grouped
// timeline, each event on a toned glyph tile. Every part is a kit component from the
// frame's scope.

type Kind = "security" | "members" | "billing";
type Tone = "success" | "primary" | "warning" | "muted";

const EVENTS: { day: string; kind: Kind; icon: IconName; tone: Tone; who: string; what: string; at: string }[] = [
  { day: "Today", kind: "security", icon: "shieldCheck", tone: "success", who: "Ada Lovelace", what: "enabled two-factor authentication", at: "09:41" },
  { day: "Today", kind: "members", icon: "userPlus", tone: "primary", who: "Grace Hopper", what: "invited noor@ionize.io as Editor", at: "09:12" },
  { day: "Today", kind: "billing", icon: "creditCard", tone: "muted", who: "System", what: "charged $48.00 for the Team plan", at: "08:00" },
  { day: "Yesterday", kind: "security", icon: "shieldAlert", tone: "warning", who: "System", what: "blocked 3 sign-ins from 10.0.4.2", at: "22:18" },
  { day: "Yesterday", kind: "members", icon: "userCog", tone: "primary", who: "Kira Tanaka", what: "made Liang Bao an Admin", at: "16:40" },
  { day: "Yesterday", kind: "billing", icon: "receipt", tone: "muted", who: "Bobby Nannier", what: "downloaded invoice INV-0041", at: "11:05" },
];

const FILTERS: { key: "all" | Kind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "security", label: "Security" },
  { key: "members", label: "Members" },
  { key: "billing", label: "Billing" },
];

function ActivityScreen({ K, phone }: TemplateScreenProps) {
  const { Row, Column, Card, Typography, Button, Chip, Icon, Emblem, Divider, useToast } = K;
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | Kind>("all");
  const shown = EVENTS.filter((e) => filter === "all" || e.kind === filter);
  const days = [...new Set(shown.map((e) => e.day))];
  return (
    <Column airy>
      <Row between alignEnd wrap cozy>
        {phone ? null : (
          <Column tight>
            <Typography h3 level={2}>Audit log</Typography>
            <Typography small subtle>Every change in Riskora, newest first.</Typography>
          </Column>
        )}
        <Button outline iconLeft={<Icon download decorative />} onPress={() => toast({ message: "Export started · CSV" })}>Export CSV</Button>
      </Row>
      <Row between alignCenter wrap snug>
        <Row snug wrap>
          {FILTERS.map((f) => (
            <Chip key={f.key} selectable selected={filter === f.key} onSelectedChange={() => setFilter(f.key)}>{f.label}</Chip>
          ))}
        </Row>
        <Chip icon={<Icon calendar decorative />} onPress={() => toast({ message: "Range: last 7 days" })}>Last 7 days</Chip>
      </Row>
      {days.map((day) => (
        <Column key={day} cozy>
          <Typography eyebrow subtle>{day}</Typography>
          <Card>
            <Column cozy>
              {shown.filter((e) => e.day === day).map((e, i) => (
                <Fragment key={`${e.who}-${e.at}`}>
                  {i > 0 ? <Divider /> : null}
                  <Row cozy alignStart>
                    <Emblem {...{ [e.tone]: true }}><Icon {...{ [e.icon]: true }} decorative /></Emblem>
                    <Column fill>
                      <Typography subtle><Typography semibold foreground>{e.who}</Typography>{` ${e.what}`}</Typography>
                    </Column>
                    <Typography caption mono subtle>{e.at}</Typography>
                  </Row>
                </Fragment>
              ))}
            </Column>
          </Card>
        </Column>
      ))}
    </Column>
  );
}

export const ACTIVITY_TEMPLATE: TemplateDoc = {
  slug: "activity",
  name: "Activity",
  group: "App",
  icon: "activity",
  description: "Audit log with a filter toolbar and a day-grouped activity timeline.",
  path: "activity",
  app: true,
  Screen: ActivityScreen,
};
