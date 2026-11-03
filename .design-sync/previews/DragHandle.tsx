import { Card, DragDropProvider, DragHandle, Draggable, DropZone, Row, Typography } from "@nannier/canvas";

export const InCard = () => (
  <DragDropProvider>
    <DropZone bordered id="queue" label="Queue">
      <Draggable id="tokens" data={{ id: "tokens", zone: "queue" }} label="Tokens">
        <Card compact>
          <Row between alignCenter>
            <Typography small>Tokens</Typography>
            <DragHandle label="Reorder Tokens" />
          </Row>
        </Card>
      </Draggable>
    </DropZone>
  </DragDropProvider>
);
