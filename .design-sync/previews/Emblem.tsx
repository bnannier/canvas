import { Emblem, Icon, Row } from "@nannier/canvas";

export const Tones = () => (
  <Row snug>
    <Emblem primary><Icon shield /></Emblem>
    <Emblem success><Icon check /></Emblem>
    <Emblem warning><Icon circleAlert /></Emblem>
    <Emblem destructive><Icon trash /></Emblem>
    <Emblem muted><Icon bell /></Emblem>
    <Emblem cyan circle><Icon globe /></Emblem>
    <Emblem secondary><Icon layers /></Emblem>
  </Row>
);

export const Sizes = () => (
  <Row snug alignCenter>
    <Emblem small><Icon bell /></Emblem>
    <Emblem><Icon bell /></Emblem>
    <Emblem large><Icon bell /></Emblem>
  </Row>
);

export const Soft = () => (
  <Row snug>
    <Emblem primary soft><Icon arrowUpRight /></Emblem>
    <Emblem destructive soft><Icon trash2 /></Emblem>
    <Emblem label="U" />
  </Row>
);
