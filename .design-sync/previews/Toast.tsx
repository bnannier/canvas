import { Column, Toast } from "@nannier/canvas";

export const Default = () => <Toast message="Your changes were saved" description="They are live for everyone." />;

export const Intents = () => (
  <Column>
    <Toast success message="Profile updated" />
    <Toast destructive message="Upload failed" />
    <Toast warning message="Storage almost full" />
    <Toast info message="A new version is available" onDismiss={() => {}} />
  </Column>
);

export const WithAction = () => <Toast message="Message archived" action={{ label: "Undo", onPress: () => {} }} />;

export const LongMessage = () => (
  <Toast
    destructive
    message="We were unable to complete your request because the server returned an unexpected error and the operation was rolled back"
  />
);
