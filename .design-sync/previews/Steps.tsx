import { Steps } from "@nannier/canvas";

export const Horizontal = () => (
  <Steps steps={[{ label: "Account" }, { label: "Profile" }, { label: "Review" }]} defaultCurrent={1} />
);

export const VerticalWithProgress = () => (
  <Steps
    vertical
    defaultCurrent={1}
    steps={[
      { label: "Create workspace", description: "Northwind · EU Frankfurt" },
      { label: "Import components", description: "Restyling 72 of 107", progress: 67 },
      { label: "Invite your team", description: "Optional" },
    ]}
  />
);

export const Segmented = () => (
  <Steps
    segmented
    defaultCurrent={1}
    steps={[
      { label: "Account", description: "Done" },
      { label: "Workspace", description: "Current" },
      { label: "Invite team", description: "Next" },
    ]}
  />
);

export const ProgressBar = () => <Steps progress steps={[]} value={68} />;
