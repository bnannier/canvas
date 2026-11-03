import { Button, Icon, Row } from "@nannier/canvas";

export const Intents = () => (
  <Row wrap snug alignCenter>
    <Button>Save changes</Button>
    <Button secondary>Save changes</Button>
    <Button outline>Save changes</Button>
    <Button ghost>Save changes</Button>
    <Button destructive>Delete</Button>
    <Button link>Learn more</Button>
  </Row>
);

export const Sizes = () => (
  <Row wrap snug alignCenter>
    <Button small>Save changes</Button>
    <Button>Save changes</Button>
    <Button large>Save changes</Button>
  </Row>
);

export const WithIcons = () => (
  <Row wrap snug alignCenter>
    <Button iconLeft={<Icon sparkles size={16} />} iconRight={<Icon chevronDown size={16} />}>Generate</Button>
    <Button secondary iconLeft={<Icon plus size={16} />}>New project</Button>
    <Button destructive iconLeft={<Icon trash2 size={16} />}>Delete</Button>
    <Button outline icon accessibilityLabel="Add item" iconLeft={<Icon plus size={16} />} />
  </Row>
);

export const States = () => (
  <Row wrap snug alignCenter>
    <Button disabled>Save changes</Button>
    <Button loading>Saving</Button>
    <Button secondary rounded>Rounded</Button>
  </Row>
);

export const Block = () => <Button block>Create account</Button>;
