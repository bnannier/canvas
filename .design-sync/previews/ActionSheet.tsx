import { ActionSheet } from "@nannier/canvas";

export const ShareSheet = () => (
  <ActionSheet
    embedded
    open
    title="Share photo"
    actions={[
      { label: "Copy Link", onPress: () => {} },
      { label: "Send by Email", onPress: () => {} },
      { label: "Print", onPress: () => {}, disabled: true },
    ]}
  />
);

export const DestructiveAction = () => (
  <ActionSheet
    embedded
    open
    title="Photo"
    actions={[
      { label: "Take Photo", onPress: () => {} },
      { label: "Choose from Library", onPress: () => {} },
      { label: "Remove Photo", destructive: true, onPress: () => {} },
    ]}
  />
);

export const WithMessage = () => (
  <ActionSheet
    embedded
    open
    title="Discard draft?"
    message="Your unsaved changes will be lost."
    actions={[
      { label: "Discard Changes", destructive: true, onPress: () => {} },
      { label: "Keep Editing", onPress: () => {} },
    ]}
  />
);
