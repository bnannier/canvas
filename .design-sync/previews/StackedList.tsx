import { Button, StackedList } from "@nannier/canvas";

export const Team = () => (
  <StackedList
    card
    title="Team members"
    action={<Button ghost small>Invite</Button>}
    items={[
      { name: "Rachel Chen", detail: "rachel.chen@example.com", meta: "admin" },
      { name: "Ada Lovelace", detail: "ada@example.com", meta: "editor" },
      { name: "Kevin Turner", detail: "kevin@example.com", meta: "viewer" },
    ]}
  />
);

export const StatusTones = () => (
  <StackedList
    card
    title="Services"
    items={[
      { name: "Kratos", detail: "Identity", badge: "Healthy", success: true },
      { name: "Hydra", detail: "OAuth2", badge: "Degraded", warning: true },
      { name: "Postgres", detail: "Database", badge: "Down", error: true },
    ]}
  />
);

export const Clickable = () => (
  <StackedList
    clickable
    label="Recent contacts"
    items={[
      { name: "Rachel Chen", detail: "rachel.chen@example.com", meta: "2h ago" },
      { name: "Ada Lovelace", detail: "ada@example.com", meta: "5h ago" },
      { name: "Kevin Turner", detail: "kevin@example.com", meta: "1d ago" },
    ]}
  />
);

export const Reorderable = () => (
  <StackedList
    reorderable
    card
    title="Priorities"
    items={[
      { id: "rachel", name: "Rachel Chen", detail: "rachel.chen@example.com" },
      { id: "ada", name: "Ada Lovelace", detail: "ada@example.com" },
      { id: "kevin", name: "Kevin Turner", detail: "kevin@example.com" },
    ]}
  />
);
