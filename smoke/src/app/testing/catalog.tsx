import { Typography } from "@nannier/canvas";
import { Screen } from "../../app-frame/screen";
import { CatalogBody } from "../../testing/catalog";

export default function CatalogRoute() {
  return <Screen><Typography h2>Component catalog</Typography><CatalogBody /></Screen>;
}
