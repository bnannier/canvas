import { Card, StackedBar } from "@nannier/canvas";

export const Hero = () => (
  <StackedBar
    label="Traffic share (%)"
    segments={[
      { label: "Direct", value: 42 },
      { label: "Organic search", value: 28 },
      { label: "Social", value: 18 },
    ]}
  />
);

export const EmptyTrack = () => (
  <StackedBar
    track
    label="Courier queue"
    segments={[
      { label: "Sent", value: 0 },
      { label: "Queued", value: 0 },
    ]}
  />
);

export const TallSubtle = () => (
  <StackedBar
    tall
    subtle
    label="Verified identities"
    segments={[
      { label: "Verified", value: 1502 },
      { label: "Unverified", value: 345 },
    ]}
  />
);

export const Detailed = () => (
  <StackedBar
    detailed
    tall
    max={100}
    label="Storage used (GB)"
    segments={[
      { label: "Media", value: 38 },
      { label: "Docs", value: 22 },
      { label: "Code", value: 14 },
      { label: "Other", value: 8 },
    ]}
  />
);

export const InsideCard = () => (
  <Card padded>
    <StackedBar
      segments={[
        { label: "Direct", value: 42 },
        { label: "Organic search", value: 28 },
        { label: "Social", value: 18 },
        { label: "Referral", value: 12 },
      ]}
    />
  </Card>
);
