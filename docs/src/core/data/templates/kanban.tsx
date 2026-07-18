import { Row, Column, Card, Typography, Button, Badge, Chip, Avatar, ScrollView, Icon } from "@nannier/canvas";
import type { TemplateDoc } from "../types";

// Kanban board built from real Canvas components: three status columns of task
// Cards inside a horizontal ScrollView, so the board pans on narrow screens
// instead of crushing its columns.

type Task = { title: string; detail: string; tag: string; hue: "info" | "warning" | "success"; who: string };

const COLUMNS: { name: string; tasks: Task[] }[] = [
  {
    name: "To do",
    tasks: [
      { title: "Rotate webhook secrets", detail: "Coordinate with integrations before the cutover.", tag: "security", hue: "warning", who: "RC" },
      { title: "Draft Q3 access review", detail: "Pull the stale-grant report first.", tag: "compliance", hue: "info", who: "AL" },
      { title: "Update billing FAQ", detail: "New yearly pricing needs a pass.", tag: "docs", hue: "success", who: "KT" },
    ],
  },
  {
    name: "In progress",
    tasks: [
      { title: "SSO rollout", detail: "Okta pilot group is live; SAML certs next.", tag: "identity", hue: "info", who: "RC" },
      { title: "Invoice PDF redesign", detail: "Header lockup approved, totals table left.", tag: "billing", hue: "warning", who: "SM" },
    ],
  },
  {
    name: "Done",
    tasks: [
      { title: "Enforce 2FA for admins", detail: "Grace period ended Monday.", tag: "security", hue: "success", who: "KT" },
      { title: "Prune unused API keys", detail: "Revoked 14 keys idle for 90+ days.", tag: "cleanup", hue: "success", who: "AL" },
    ],
  },
];

function TaskCard({ task }: { task: Task }) {
  return (
    <Card compact>
      <Column tight>
        <Typography small medium>{task.title}</Typography>
        <Typography tiny>{task.detail}</Typography>
        <Row between alignCenter>
          <Chip info={task.hue === "info"} warning={task.hue === "warning"} success={task.hue === "success"}>{task.tag}</Chip>
          <Avatar small name={task.who} />
        </Row>
      </Column>
    </Card>
  );
}

export const KANBAN_TEMPLATE: TemplateDoc = {
  slug: "kanban",
  name: "Kanban",
  description: "Status board: three columns of task Cards with tag Chips and assignees, panning horizontally on narrow screens. Built from live Canvas components.",
  sections: [
    {
      title: "Board",
      anatomy: "Horizontal ScrollView of fixed-width columns; each column heads with its count Badge and stacks compact task Cards. On phones the board pans instead of squeezing.",
      render: () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Row relaxed alignStart>
            {COLUMNS.map((col) => (
              <Column key={col.name} snug style={{ width: 260 }}>
                <Row between alignCenter>
                  <Typography small semibold>{col.name}</Typography>
                  <Badge secondary>{col.tasks.length}</Badge>
                </Row>
                {col.tasks.map((t) => (
                  <TaskCard key={t.title} task={t} />
                ))}
                <Button ghost small iconLeft={<Icon plus size={16} />}>
                  Add task
                </Button>
              </Column>
            ))}
          </Row>
        </ScrollView>
      ),
    },
  ],
};
