import { Board, Chip } from "@nannier/canvas";

const columns = [
  { id: "todo", label: "To do" },
  { id: "doing", label: "Doing" },
];

export const Kanban = () => (
  <Board
    columns={columns}
    defaultItems={[
      { id: "t1", columnId: "todo", title: "Rotate webhook secrets" },
      { id: "t2", columnId: "todo", title: "Draft the design review" },
      { id: "t3", columnId: "doing", title: "SSO rollout" },
      { id: "t4", columnId: "doing", title: "Upgrade the CI runners" },
    ]}
  />
);

export const WithChipsAndBadge = () => (
  <Board
    columns={[
      { id: "todo", label: "To do", badge: "WIP 2" },
      { id: "doing", label: "Doing" },
    ]}
    defaultItems={[
      { id: "t1", columnId: "todo", title: "Rotate webhook secrets", menu: [{ label: "Edit", icon: "pencil" }, { label: "Delete", icon: "trash", destructive: true }] },
      { id: "t2", columnId: "doing", title: "SSO rollout", chips: <Chip>identity</Chip> },
    ]}
    emptyLabel="Drop tasks here"
  />
);

export const Compact = () => (
  <Board
    compact
    columns={[{ id: "todo", label: "To do" }, { id: "doing", label: "Doing" }]}
    defaultItems={[
      { id: "t1", columnId: "todo", title: "Rotate webhook secrets" },
      { id: "t2", columnId: "todo", title: "Draft the design review" },
      { id: "t3", columnId: "doing", title: "SSO rollout" },
    ]}
  />
);
