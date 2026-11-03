import { Column, Container, TextInput, Typography } from "@nannier/canvas";

export const Filled = () => (
  <Container xs>
    <Column cozy>
      <Typography caption medium muted>Your name</Typography>
      <TextInput accessibilityLabel="Your name" defaultValue="Ada Lovelace" />
    </Column>
  </Container>
);

export const Placeholder = () => (
  <Container xs>
    <Column cozy>
      <Typography caption medium muted>Search</Typography>
      <TextInput accessibilityLabel="Search components" placeholder="Search components..." />
    </Column>
  </Container>
);

export const Multiline = () => (
  <Container xs>
    <Column cozy>
      <Typography caption medium muted>Notes</Typography>
      <TextInput accessibilityLabel="Notes" multiline defaultValue={"Follow up with design on the onboarding flow.\nShip the draft by Friday."} />
    </Column>
  </Container>
);

export const Disabled = () => (
  <Container xs>
    <Column cozy>
      <Typography caption medium muted>Plan</Typography>
      <TextInput accessibilityLabel="Plan" defaultValue="Pro" editable={false} aria-disabled />
    </Column>
  </Container>
);
