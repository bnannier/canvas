import { Row, Column, Card, Typography, Button, Input, Select, Chip, Feed } from "@nannier/canvas";
import type { TemplateDoc } from "../types";

// Audit log built from real Canvas components: a filter toolbar, day-grouped
// activity Feeds, and a load-more footer.

export const ACTIVITY_TEMPLATE: TemplateDoc = {
  slug: "activity",
  name: "Activity",
  description: "Audit log with a filter toolbar and a day-grouped activity timeline. Built from live Canvas components.",
  sections: [
    {
      title: "Filter toolbar",
      anatomy: "Search Input + actor Select + active filter Chips (removable) on one wrapping row.",
      render: () => (
        <Card>
          <Column snug>
            <Row snug wrap alignEnd>
              <Column fill style={{ minWidth: 220 }}>
                <Input leadingIcon icon="search" placeholder="Search events" block />
              </Column>
              <Select label="Actor" defaultValue="Anyone" options={["Anyone", "Rachel Chen", "Ada Lovelace", "System"]} />
              <Button outline>Export</Button>
            </Row>
            <Row tight wrap>
              <Chip info onRemove={() => {}}>event: session</Chip>
              <Chip onRemove={() => {}}>last 7 days</Chip>
            </Row>
          </Column>
        </Card>
      ),
    },
    {
      title: "Timeline",
      anatomy: "One Feed per day group under a muted date heading; connector line ties the day's events together.",
      render: () => (
        <Column relaxed>
          <Column snug>
            <Typography tiny semibold>TODAY</Typography>
            <Feed
              connector
              items={[
                { actor: "Rachel Chen", action: "revoked API key cnv_live_c41d", time: "2 min ago" },
                { actor: "Ada Lovelace", action: "invited sofia@acme.com as Viewer", time: "1 hour ago" },
                { actor: "System", action: "rotated the webhook signing secret", time: "4 hours ago" },
              ]}
            />
          </Column>
          <Column snug>
            <Typography tiny semibold>YESTERDAY</Typography>
            <Feed
              connector
              items={[
                { actor: "Kevin Turner", action: "enabled two-factor authentication", time: "18 hours ago" },
                { actor: "Rachel Chen", action: "changed the workspace name to Acme Corp", time: "22 hours ago" },
                { actor: "System", action: "completed the nightly backup", time: "1 day ago" },
              ]}
            />
          </Column>
          <Row center>
            <Button outline small>Load older events</Button>
          </Row>
        </Column>
      ),
    },
  ],
};
