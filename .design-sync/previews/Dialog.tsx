import { Button, Column, Dialog, Icon, Input, Row, Typography } from "@nannier/canvas";

export const Confirm = () => (
  <Dialog
    open
    embedded
    title="Refund payment"
    description="The refund posts to the original card in 2 to 3 business days."
    medium
    confirmLabel="Refund"
    cancelLabel="Cancel"
  />
);

export const Destructive = () => (
  <Dialog
    open
    embedded
    title="Delete workspace"
    description="This removes all projects and cannot be undone."
    medium
    destructive
    confirmLabel="Delete"
    cancelLabel="Cancel"
  />
);

export const FormContent = () => (
  <Dialog open embedded large>
    <Column relaxed>
      <Column tight>
        <Typography lead semibold>Edit profile</Typography>
        <Typography>Update how your name and email appear to teammates.</Typography>
      </Column>
      <Column relaxed>
        <Input label="Name" defaultValue="Ada Lovelace" />
        <Input label="Email" defaultValue="ada@example.com" />
      </Column>
      <Row end snug alignCenter>
        <Button outline small>Cancel</Button>
        <Button primary small>Save changes</Button>
      </Row>
    </Column>
  </Dialog>
);

export const BandedForm = () => (
  <Dialog
    open
    embedded
    form
    banded
    icon={<Icon arrowUpRight decorative />}
    title="Publish release"
    description="Ship the changes to everyone in the workspace."
    footer={<Button primary>Publish</Button>}
  >
    <Input label="Release name" defaultValue="Canvas 4.0" />
  </Dialog>
);
