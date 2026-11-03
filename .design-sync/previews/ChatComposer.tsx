import { ChatComposer, Typography } from "@nannier/canvas";

const noop = () => {};

export const WithDraft = () => (
  <ChatComposer
    value="Review the release plan"
    onChangeText={noop}
    onSend={noop}
    footer={<Typography tiny muted>Only reviewed requirements continue to execution.</Typography>}
  />
);

export const Empty = () => <ChatComposer value="" onChangeText={noop} onSend={noop} />;
