import { useState } from "react";
import { Card, Carousel, Column, Typography } from "@nannier-com/canvas";

const SLIDES = Array.from({ length: 6 }, (_, index) => ({
  key: `page-${index + 1}`,
  content: (
    <Card testID={`carousel-slide-${index + 1}`}>
      <Column loose>
        <Typography h3 testID={`carousel-page-${index + 1}`}>Page {index + 1}</Typography>
        <Typography>Swipe this card to turn the page.</Typography>
        <Typography muted>The page picker can jump directly to another card.</Typography>
      </Column>
    </Card>
  ),
}));

export function CarouselBody() {
  const [current, setCurrent] = useState(1);
  const [changes, setChanges] = useState(0);
  return (
    <Column loose>
      <Carousel testID="native-carousel" items={SLIDES} defaultIndex={1} showDots showArrows={false}
        onIndexChange={(next) => { setCurrent(next); setChanges((count) => count + 1); }} />
      <Typography testID="carousel-current">Current page: {current + 1}</Typography>
      <Typography testID="carousel-changes">Page changes: {changes}</Typography>
    </Column>
  );
}
