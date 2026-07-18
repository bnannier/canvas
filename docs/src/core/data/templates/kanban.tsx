import { useState } from "react";
import { Row, Column, Card, Typography, Button, Badge, Chip, Avatar, ScrollView, Icon, useToast } from "@nannier/canvas";
import type { TemplateDoc } from "../types";

// Kanban board built from real Canvas components: three status columns of
// pressable task Cards inside a horizontal ScrollView, so the board pans on
// narrow screens instead of crushing its columns. Each column's "Add task"
// appends a canned task to that column (count Badges update live), and
// pressing a Card opens (toasts) that task.

type Task = { id: string; title: string; detail: string; tag: string; hue: "info" | "warning" | "success"; who: string };
type BoardColumn = { name: string; tasks: Task[] };

const SEED_COLUMNS: BoardColumn[] = [
  {
    name: "To do",
    tasks: [
      { id: "seed-1", title: "Rotate webhook secrets", detail: "Coordinate with integrations before the cutover.", tag: "security", hue: "warning", who: "RC" },
      { id: "seed-2", title: "Draft Q3 access review", detail: "Pull the stale-grant report first.", tag: "compliance", hue: "info", who: "AL" },
      { id: "seed-3", title: "Update billing FAQ", detail: "New yearly pricing needs a pass.", tag: "docs", hue: "success", who: "KT" },
    ],
  },
  {
    name: "In progress",
    tasks: [
      { id: "seed-4", title: "SSO rollout", detail: "Okta pilot group is live; SAML certs next.", tag: "identity", hue: "info", who: "RC" },
      { id: "seed-5", title: "Invoice PDF redesign", detail: "Header lockup approved, totals table left.", tag: "billing", hue: "warning", who: "SM" },
    ],
  },
  {
    name: "Done",
    tasks: [
      { id: "seed-6", title: "Enforce 2FA for admins", detail: "Grace period ended Monday.", tag: "security", hue: "success", who: "KT" },
      { id: "seed-7", title: "Prune unused API keys", detail: "Revoked 14 keys idle for 90+ days.", tag: "cleanup", hue: "success", who: "AL" },
    ],
  },
];

// Canned backlog for the "Add task" buttons; a shared counter cycles through
// the pool so successive adds (in any column) produce different tasks.
const EXTRA_TASKS: Omit<Task, "id">[] = [
  { title: "Audit log retention", detail: "Decide between 90 and 365 day retention.", tag: "compliance", hue: "info", who: "AL" },
  { title: "Rate-limit public API", detail: "Burst limits need to land before GA.", tag: "platform", hue: "warning", who: "RC" },
  { title: "Refresh brand icons", detail: "Swap the legacy glyph set for the new one.", tag: "design", hue: "success", who: "SM" },
  { title: "Migrate staging database", detail: "Schedule the Postgres 16 upgrade window.", tag: "infra", hue: "info", who: "KT" },
];

function TaskCard({ task, onPress }: { task: Task; onPress: () => void }) {
  return (
    <Card compact onPress={onPress}>
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

// The whole board shares one state, so adding a task visibly appends its Card
// to the pressed column and bumps that column's count Badge.
function BoardLive() {
  const { toast } = useToast();
  const [columns, setColumns] = useState(SEED_COLUMNS);
  const [added, setAdded] = useState(0);

  const openTask = (task: Task) => {
    toast({ message: task.title, description: `${task.detail} The task detail would open here.` });
  };

  const addTask = (columnIndex: number) => {
    const canned = EXTRA_TASKS[added % EXTRA_TASKS.length];
    if (!canned) return;
    const task: Task = { ...canned, id: `extra-${added}` };
    setColumns((prev) => prev.map((col, i) => (i === columnIndex ? { ...col, tasks: [...col.tasks, task] } : col)));
    setAdded((n) => n + 1);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Row relaxed alignStart>
        {columns.map((col, columnIndex) => (
          <Column key={col.name} snug style={{ width: 260 }}>
            <Row between alignCenter>
              <Typography small semibold>{col.name}</Typography>
              <Badge secondary>{col.tasks.length}</Badge>
            </Row>
            {col.tasks.map((t) => (
              <TaskCard key={t.id} task={t} onPress={() => openTask(t)} />
            ))}
            <Button ghost small iconLeft={<Icon plus size={16} />} onPress={() => addTask(columnIndex)}>
              Add task
            </Button>
          </Column>
        ))}
      </Row>
    </ScrollView>
  );
}

export const KANBAN_TEMPLATE: TemplateDoc = {
  slug: "kanban",
  name: "Kanban",
  description: "Status board: three columns of task Cards with tag Chips and assignees, panning horizontally on narrow screens. Built from live Canvas components.",
  sections: [
    {
      title: "Board",
      anatomy: "Horizontal ScrollView of fixed-width columns; each column heads with its live count Badge, stacks pressable task Cards (press one to open it), and appends a canned task from its Add task button. On phones the board pans instead of squeezing.",
      render: () => <BoardLive />,
    },
  ],
};
