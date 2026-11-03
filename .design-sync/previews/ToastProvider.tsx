import { Button, Column, ToastProvider, Typography, useToast } from "@nannier/canvas";

const SaveButton = () => {
  const { toast } = useToast();
  return <Button primary onPress={() => toast({ message: "Profile updated" })}>Save profile</Button>;
};

export const WithTrigger = () => (
  <ToastProvider>
    <Column>
      <Typography small muted>Press the button to raise a toast from anywhere under the provider.</Typography>
      <SaveButton />
    </Column>
  </ToastProvider>
);
