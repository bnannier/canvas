import { Column, GridList } from "@nannier/canvas";

export const People = () => (
  <GridList
    cols3
    label="Team members"
    items={[
      { title: "Rachel Chen", subtitle: "Engineering Lead", avatar: "RC", badge: "Active", actions: [{ label: "Message", outline: true, onPress: () => {} }] },
      { title: "Ada Lovelace", subtitle: "Staff Engineer", avatar: "AL", badge: "Active", actions: [{ label: "Message", outline: true, onPress: () => {} }] },
      { title: "Kevin Turner", subtitle: "Product Designer", avatar: "KT", badge: "Away", actions: [{ label: "Message", outline: true, onPress: () => {} }] },
    ]}
  />
);

export const Gallery = () => (
  <GridList
    gallery
    cols3
    items={[
      { title: "hero-banner.png", subtitle: "1.2 MB", color: "primary" },
      { title: "icon-set.svg", subtitle: "340 KB", color: "blue-500" },
      { title: "product-shot.jpg", subtitle: "2.8 MB", color: "emerald-500" },
    ]}
  />
);

export const TwoColumnsTappable = () => (
  <Column cozy>
    <GridList
      cols2
      onPressItem={() => {}}
      items={[
        { title: "Rachel Chen", subtitle: "Engineering Lead", avatar: "RC" },
        { title: "Ada Lovelace", subtitle: "Staff Engineer", avatar: "AL" },
        { title: "Kevin Turner", subtitle: "Product Designer", avatar: "KT" },
        { title: "Grace Hopper", subtitle: "Principal Engineer", avatar: "GH" },
      ]}
    />
  </Column>
);
