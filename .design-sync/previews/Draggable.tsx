import { Card, Column, DragDropProvider, DragHandle, Draggable, DropZone, Row, Typography } from "@nannier/canvas";

export const EnabledAndLocked = () => (
  <DragDropProvider>
    <DropZone bordered id="list" label="Tasks">
      <Column snug>
        <Draggable id="a" data={{ id: "a", zone: "list" }} label="Design review">
          <Card>
            <Row between alignCenter>
              <Typography>Design review</Typography>
              <DragHandle label="Reorder Design review" />
            </Row>
          </Card>
        </Draggable>
        <Draggable id="b" data={{ id: "b", zone: "list" }} disabled label="Locked task">
          <Card>
            <Row between alignCenter>
              <Typography>Locked task</Typography>
              <DragHandle label="Locked task" />
            </Row>
          </Card>
        </Draggable>
      </Column>
    </DropZone>
  </DragDropProvider>
);
