import { Button, Card, Column, Drawer, Input, Typography } from "@nannier/canvas";

export const RightPanel = () => (
  <Card>
    <Column padLoose>
      <Typography lead semibold>Project overview</Typography>
      <Typography muted>Activity, members and billing for the Platform Core workspace.</Typography>
      <Typography muted>Last updated 2 hours ago by Ada Lovelace.</Typography>
      <Typography muted>14 open issues across 3 milestones.</Typography>
      <Typography muted>Next release is scheduled for Friday.</Typography>
      <Typography muted>Review pending on 4 pull requests.</Typography>
    </Column>
  <Drawer embedded open right accessibilityLabel="Invite people" header={<Typography h5>Invite people</Typography>}>
      <Input label="Email" placeholder="name@company.com" />
    </Drawer>
    </Card>
);

export const LeftNavigation = () => (
  <Card>
    <Column padLoose>
      <Typography lead semibold>Project overview</Typography>
      <Typography muted>Activity, members and billing for the Platform Core workspace.</Typography>
      <Typography muted>Last updated 2 hours ago by Ada Lovelace.</Typography>
      <Typography muted>14 open issues across 3 milestones.</Typography>
      <Typography muted>Next release is scheduled for Friday.</Typography>
      <Typography muted>Review pending on 4 pull requests.</Typography>
    </Column>
  <Drawer embedded open left width={260} accessibilityLabel="Navigation">
      <Column padLoose cozy>
        <Typography lead semibold>Menu</Typography>
        <Button ghost block>Home</Button>
        <Button ghost block>Components</Button>
        <Button ghost block>Settings</Button>
      </Column>
    </Drawer>
    </Card>
);

export const BottomSheet = () => (
  <Card>
    <Column padLoose>
      <Typography lead semibold>Project overview</Typography>
      <Typography muted>Activity, members and billing for the Platform Core workspace.</Typography>
      <Typography muted>Last updated 2 hours ago by Ada Lovelace.</Typography>
      <Typography muted>14 open issues across 3 milestones.</Typography>
      <Typography muted>Next release is scheduled for Friday.</Typography>
      <Typography muted>Review pending on 4 pull requests.</Typography>
    </Column>
  <Drawer embedded open bottom accessibilityLabel="Actions">
      <Column padLoose snug>
        <Typography lead semibold>Actions</Typography>
        <Typography small muted>A sheet that rises from the bottom edge.</Typography>
      </Column>
    </Drawer>
    </Card>
);

export const HeaderAndFooter = () => (
  <Drawer
    embedded
    open
    plain
    right
    width={440}
    accessibilityLabel="Agent details"
    header={<Typography h3 bold>Scout</Typography>}
    footer={<Button secondary>Pause</Button>}
  >
    <Typography>Recent work and trace details.</Typography>
  </Drawer>
);
