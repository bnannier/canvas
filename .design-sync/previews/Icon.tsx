import { Icon, Row, Typography } from "@nannier/canvas";

export const Tones = () => (
  <Row alignCenter relaxed>
    <Icon shield size={24} />
    <Icon shield primary size={24} />
    <Icon shield destructive size={24} />
    <Icon circleCheck success size={24} />
    <Icon alertTriangle warning size={24} />
    <Icon shield muted size={24} />
    <Icon shield subtle size={24} />
  </Row>
);

export const Sizes = () => (
  <Row alignCenter relaxed>
    <Icon home size={16} />
    <Icon search size={22} />
    <Icon bell size={28} />
    <Icon settings size={36} />
  </Row>
);

export const Inline = () => (
  <Row alignCenter snug>
    <Icon info muted size={16} />
    <Typography small muted>Optional, used only for recovery</Typography>
  </Row>
);
