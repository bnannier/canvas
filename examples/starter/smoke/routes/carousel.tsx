import { Typography } from "@nannier-com/canvas";
import { Screen } from "../../app-frame/screen";
import { CarouselBody } from "../../testing/carousel";

export default function CarouselRoute() {
  return <Screen><Typography h2>Native carousel paging</Typography><CarouselBody /></Screen>;
}
