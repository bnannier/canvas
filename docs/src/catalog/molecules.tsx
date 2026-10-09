import { ActionPanel, Alert, Card, DescriptionList, EmptyState, Feed, Field, Form, GridList, Icon, Input, MediaObject, StackedList, Stats, Typography, useToast } from "@nannier/canvas";
import type { CatTile } from "./tile";

function ActionPanelsPreview() {
  const { toast } = useToast();
  return (
    <ActionPanel
      title="Export your data"
      description="Download everything in this workspace as a ZIP archive."
      actionLabel="Export"
      onAction={() => toast({ success: true, message: "Export requested" })}
    />
  );
}

function AlertsPreview() {
  return (
    <Alert
      info
      icon={<Icon info size={16} />}
      title="Heads up"
      description="Maintenance window scheduled for Sunday 2:00 UTC."
    />
  );
}

function CardsPreview() {
  return (
    <Card>
      <Typography caption medium>Active identities</Typography>
      <Typography h3 bold>12,348</Typography>
      <Typography tiny muted>+142 today</Typography>
    </Card>
  );
}

function DescriptionListsPreview() {
  return (
    <DescriptionList
      items={[
        { term: "Full name", value: "Rachel Chen" },
        { term: "Email", value: "rachel.chen@example.com" },
        { term: "Role", value: "Admin" }
      ]}
    />
  );
}

function EmptyStatesPreview() {
  return (
    <EmptyState
      icon={<Icon search />}
      title="No results found"
      description="Try adjusting your search filters."
    />
  );
}

function FieldPreview() {
  return (
    <Field label="Email" helper="We'll never share your email.">
      <Input placeholder="you@example.com" />
    </Field>
  );
}

function FeedsPreview() {
  return (
    <Feed
      items={[
        { actor: "Rachel Chen", action: "approved the request", time: "2 hours ago" },
        { actor: "Ada Lovelace", action: "merged", target: "release/4.2", time: "5 hours ago" },
        { actor: "System", action: "created the project", time: "3 days ago" }
      ]}
    />
  );
}

function FormLayoutsPreview() {
  const { toast } = useToast();
  return (
    <Form accessibilityLabel="Sign in" submitLabel="Sign in" onSubmit={() => toast({ success: true, message: "Demo form submitted" })}>
      <Input label="Email" placeholder="you@example.com" />
      <Input label="Password" secureTextEntry />
    </Form>
  );
}

function GridListsPreview() {
  return (
    <GridList
      items={[
        { title: "Rachel Chen", subtitle: "Engineering Lead", avatar: "RC", badge: "Active" },
        { title: "Ada Lovelace", subtitle: "Staff Engineer", avatar: "AL", badge: "Active" },
        { title: "Kevin Turner", subtitle: "Product Designer", avatar: "KT", badge: "Away" }
      ]}
    />
  );
}

function MediaObjectsPreview() {
  return (
    <MediaObject
      avatar="RC"
      title="Rachel Chen"
      description="Engineering Lead"
      body="Reviewed the latest pull request and left comments on the auth middleware changes."
      bordered
    />
  );
}

function StackedListsPreview() {
  return (
    <StackedList
      items={[
        { name: "Rachel Chen", detail: "rachel.chen@example.com", meta: "admin" },
        { name: "Ada Lovelace", detail: "ada@example.com", meta: "editor" },
        { name: "Kevin Turner", detail: "kevin@example.com", meta: "viewer" }
      ]}
    />
  );
}

function StatsPreview() {
  return (
    <Stats
      items={[
        { label: "Active users", value: "71,897", delta: "+12.3% vs. last 30 days" }
      ]}
    />
  );
}

export const MOLECULES_TILES: CatTile[] = [
  { title: "ActionPanel", href: "/components/action-panels", Preview: ActionPanelsPreview },
  { title: "Alert", href: "/components/alert", Preview: AlertsPreview },
  { title: "Card", href: "/components/card", Preview: CardsPreview },
  { title: "DescriptionList", href: "/components/description-lists", Preview: DescriptionListsPreview },
  { title: "EmptyState", href: "/components/empty-state", Preview: EmptyStatesPreview },
  { title: "Field", href: "/components/field", Preview: FieldPreview },
  { title: "Feed", href: "/components/feeds", Preview: FeedsPreview },
  { title: "Form", href: "/components/form", Preview: FormLayoutsPreview },
  { title: "GridList", href: "/components/grid-lists", Preview: GridListsPreview },
  { title: "MediaObject", href: "/components/media-objects", Preview: MediaObjectsPreview },
  { title: "StackedList", href: "/components/stacked-lists", Preview: StackedListsPreview },
  { title: "Stats", href: "/components/stats", Preview: StatsPreview },
];
