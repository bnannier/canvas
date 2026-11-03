import { Card, Column, DragDropProvider, DragHandle, Draggable, DropZone, Row, Typography } from "@nannier/canvas";

const card = (id: string, zone: string, title: string) => (
  <Draggable key={id} id={id} data={{ id, zone }} label={title}>
    <Card compact>
      <Row between alignCenter>
        <Typography small>{title}</Typography>
        <DragHandle label={`Reorder ${title}`} />
      </Row>
    </Card>
  </Draggable>
);

export const Queue = () => (
  <DragDropProvider>
    <DropZone bordered id="queue" label="Queue">
      <Column snug>
        {card("t1", "queue", "Rotate secrets")}
        {card("t2", "queue", "Draft the review")}
      </Column>
    </DropZone>
  </DragDropProvider>
);

export const TwoZones = () => (
  <DragDropProvider>
    <Row>
      <DropZone bordered id="todo" label="To do">
        <Column snug>{card("a", "todo", "Audit log export")}</Column>
      </DropZone>
      <DropZone bordered id="doing" label="Doing">
        <Column snug>{card("b", "doing", "SSO rollout")}</Column>
      </DropZone>
    </Row>
  </DragDropProvider>
);
