import { Chip, Icon, Row, Column } from "@nannier/canvas";

export const Default = () => (
  <Row wrap>
    <Chip>Neutral</Chip>
    <Chip primary>Accent</Chip>
    <Chip outline>Outline</Chip>
  </Row>
);

export const Hues = () => (
  <Row wrap>
    <Chip red>Bug</Chip>
    <Chip orange>Chore</Chip>
    <Chip amber>Docs</Chip>
    <Chip green>Feature</Chip>
    <Chip teal>Design</Chip>
    <Chip blue>Backend</Chip>
    <Chip indigo>Frontend</Chip>
    <Chip violet>Research</Chip>
    <Chip purple>Infra</Chip>
    <Chip pink>Growth</Chip>
    <Chip gray>Archived</Chip>
  </Row>
);

export const Status = () => (
  <Row wrap>
    <Chip success>Passing</Chip>
    <Chip warning>Flaky</Chip>
    <Chip destructive>Failing</Chip>
    <Chip info>Queued</Chip>
    <Chip neutral>Skipped</Chip>
  </Row>
);

export const Slots = () => (
  <Column>
    <Row wrap>
      <Chip success icon={<Icon check size={14} />}>Verified</Chip>
      <Chip onRemove={() => {}}>Role: Admin</Chip>
      <Chip link href="/components/switch" trailing={<Icon arrowUpRight size={12} />}>Switch</Chip>
    </Row>
    <Row>
      <Chip selectable defaultSelected>Design</Chip>
      <Chip selectable>Engineering</Chip>
    </Row>
  </Column>
);
