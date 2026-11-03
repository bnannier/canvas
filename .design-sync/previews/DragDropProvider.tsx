import { Card, Column, DragDropProvider, DragHandle, Draggable, DropZone, Row, Typography } from "@nannier/canvas";

const task = (id: string, title: string, disabled?: boolean) => (
  <Draggable key={id} id={id} data={{ id, zone: "list" }} label={title} disabled={disabled}>
    <Card>
      <Row between alignCenter>
        <Typography>{title}</Typography>
        <DragHandle label={`Reorder ${title}`} />
      </Row>
    </Card>
  </Draggable>
);

export const TaskList = () => (
  <DragDropProvider>
    <DropZone bordered id="list" label="Tasks">
      <Column snug>
        {task("a", "Design review")}
        {task("b", "Write the tests")}
        {task("c", "Ship the release")}
      </Column>
    </DropZone>
  </DragDropProvider>
);
