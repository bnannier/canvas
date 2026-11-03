import { Button, Chat, Input, Typography, Wizard } from "@nannier/canvas";

export const MembersStep = () => (
  <Wizard
    open
    embedded
    onOpenChange={() => {}}
    title="Create workspace"
    steps={[{ label: "Name" }, { label: "Members" }, { label: "Theme" }, { label: "Review" }]}
    current={1}
    status="Step 2 of 4"
    previous={{ label: "Back", onPress: () => {} }}
    actions={<Button primary>Continue</Button>}
  >
    <Typography body medium natural>Invite your team</Typography>
    <Input compact placeholder="noor@nannier.com" accessibilityLabel="First teammate email" />
    <Input compact placeholder="liang@nannier.com" accessibilityLabel="Second teammate email" />
  </Wizard>
);

export const FirstStep = () => (
  <Wizard
    open
    embedded
    onOpenChange={() => {}}
    title="Set up a project"
    description="Choose the basics, then review your project."
    steps={[{ label: "Details" }, { label: "Review" }]}
    current={0}
    status="Step 1 of 2"
    actions={<Button primary>Review project</Button>}
  >
    <Typography h3>Project details</Typography>
    <Input label="Project name" defaultValue="Customer portal" />
  </Wizard>
);

export const LastStep = () => (
  <Wizard
    open
    embedded
    onOpenChange={() => {}}
    title="Set up a project"
    steps={[{ label: "Details" }, { label: "Review" }]}
    current={1}
    status="Step 2 of 2"
    previous={{ label: "Details", onPress: () => {} }}
    actions={<Button primary>Create project</Button>}
  >
    <Typography h3>Ready to create</Typography>
    <Typography body>Customer portal is ready to create.</Typography>
  </Wizard>
);
