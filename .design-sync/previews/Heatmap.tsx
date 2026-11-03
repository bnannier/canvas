import { Card, Container, Heatmap } from "@nannier/canvas";

const week = [0.15, 0.4, 0.7, 1, 0.55, 0.25, 0.85, 0.35, 0.6, 0.9, 0.2, 0.5, 0.75, 0.3, 0.95, 0.45, 0.65, 0.1, 0.8, 0.4, 0.7];

export const Hero = () => (
  <Container xs>
    <Heatmap values={week} />
  </Container>
);

export const Calendar = () => (
  <Heatmap
    calendar
    label="Contribution activity"
    values={Array.from({ length: 371 }, (_, i) => {
      const noise = Math.sin(i * 12.9898) * 43758.5453;
      const r = noise - Math.floor(noise);
      const value = r < 0.5 ? 0 : (r - 0.5) / 0.5;
      return { value, count: Math.round(value * 14), date: new Date(Date.UTC(2025, 6, 6 + i)).toISOString().slice(0, 10) };
    })}
  />
);

export const InsideCard = () => (
  <Card padded>
    <Heatmap values={week} />
  </Card>
);
