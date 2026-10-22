import { MaterialsBody } from "../../../../../smoke/src/testing/materials";
import { Page } from "../../../ui/page";

export default function MaterialLifecycleFixture() {
  return <Page viewportOverlays><MaterialsBody /></Page>;
}
