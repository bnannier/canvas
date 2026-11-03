import { Spinner, Row } from "@nannier/canvas";

export const Default = () => <Spinner />;

export const Labeled = () => <Spinner description="This usually takes a few seconds.">Syncing workspace</Spinner>;

export const Stacked = () => <Spinner stacked large description="Preparing your dashboard">Loading</Spinner>;

export const Tones = () => (
  <Row alignCenter>
    <Spinner primary />
    <Spinner muted />
    <Spinner foreground />
  </Row>
);

export const Sizes = () => (
  <Row alignCenter>
    <Spinner small />
    <Spinner />
    <Spinner large />
  </Row>
);
