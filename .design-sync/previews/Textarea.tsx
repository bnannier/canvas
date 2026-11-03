import { Textarea, Column } from "@nannier/canvas";

export const Message = () => <Textarea label="Message" placeholder="Tell us what you need help with" rows={4} />;

export const Filled = () => (
  <Textarea label="Bio" rows={3} showCount maxLength={160} defaultValue="Designer and engineer building tools for creative teams." />
);

export const Error = () => <Textarea label="Feedback" required invalid defaultValue="Too short" rows={3} />;

export const Disabled = () => <Textarea label="Notes" disabled defaultValue="Notes are locked while the review is open." rows={3} />;

export const Sizes = () => (
  <Column>
    <Textarea small placeholder="Small" rows={2} accessibilityLabel="Small" />
    <Textarea large placeholder="Large" rows={2} accessibilityLabel="Large" />
  </Column>
);
