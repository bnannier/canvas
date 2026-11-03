import { BarList, Card } from "@nannier/canvas";

export const WithDeltas = () => (
  <BarList
    title="Top pages"
    items={[
      { label: "/pricing", value: 18400, delta: "+12%" },
      { label: "/docs", value: 12100, delta: "+4%" },
      { label: "/blog/launch", value: 8700, delta: "-2%", down: true },
    ]}
  />
);

export const Share = () => (
  <BarList
    share
    title="Traffic sources"
    items={[
      { label: "google", value: 412 },
      { label: "email", value: 318 },
      { label: "github", value: 142 },
    ]}
  />
);

export const Pressable = () => (
  <BarList
    onPressItem={() => {}}
    title="Referrers"
    items={[
      { label: "news.ycombinator.com", value: 4210 },
      { label: "reddit.com", value: 2380 },
      { label: "linkedin.com", value: 1240 },
    ]}
  />
);

export const InsideCard = () => (
  <Card>
    <BarList
      plain
      items={[
        { label: "Deploys", value: 42 },
        { label: "Rollbacks", value: 3 },
        { label: "Incidents", value: 1 },
      ]}
    />
  </Card>
);
