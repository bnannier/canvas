import { Button, Column, Drawer, Input, Typography } from "@nannier/canvas";

// Open drawers as an app shows them: the panel at its edge over the page's dim. The
// card renders single, full-bleed, so each panel sits at the card's own edge.

export const RightPanel = () => (
  <Drawer open right accessibilityLabel="Invite people" header={<Typography h5>Invite people</Typography>}>
    <Column cozy>
      <Input label="Email" placeholder="name@company.com" />
      <Button primary block>Send invite</Button>
    </Column>
  </Drawer>
);

export const LeftNavigation = () => (
  <Drawer open accessibilityLabel="Navigation">
    <Column padLoose cozy>
      <Typography lead semibold>Menu</Typography>
      <Button ghost block>Home</Button>
      <Button ghost block>Components</Button>
      <Button ghost block>Settings</Button>
    </Column>
  </Drawer>
);

export const BottomSheet = () => (
  <Drawer open bottom accessibilityLabel="Actions">
    <Column padLoose snug>
      <Typography lead semibold>Actions</Typography>
      <Typography small muted>A sheet that rises from the bottom edge.</Typography>
    </Column>
  </Drawer>
);

export const HeaderAndFooter = () => (
  <Drawer
    open
    plain
    instant
    right
    width={440}
    accessibilityLabel="Agent details"
    header={<Typography h3 bold>Scout</Typography>}
    footer={<Button secondary>Pause</Button>}
  >
    <Typography>Recent work and trace details.</Typography>
  </Drawer>
);
