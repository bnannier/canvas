import { Carousel, Column, Typography } from "@nannier/canvas";

const slide = (title: string, body: string) => (
  <Column alignCenter center padLoose>
    <Typography lead medium>{title}</Typography>
    <Typography small muted>{body}</Typography>
  </Column>
);

export const Default = () => (
  <Carousel
    showArrows
    showDots
    items={[
      { key: "a", content: slide("Photos", "248 items synced today") },
      { key: "b", content: slide("Albums", "12 shared albums") },
      { key: "c", content: slide("Shared", "Ada added 6 photos") },
    ]}
  />
);

export const SecondSlide = () => (
  <Carousel
    defaultIndex={1}
    showDots
    items={[
      { key: "x", content: slide("Plan", "Outline the launch milestones") },
      { key: "y", content: slide("Build", "Ship the beta to early users") },
      { key: "z", content: slide("Launch", "Announce to everyone") },
    ]}
  />
);

export const NoArrows = () => (
  <Carousel
    showArrows={false}
    showDots
    items={[
      { key: "a", content: slide("Featured", "Hand-picked this week") },
      { key: "b", content: slide("Popular", "Most downloaded kits") },
    ]}
  />
);
