import { Row, Column, Button, Divider } from "@nannier/canvas";
import { usePathname, useRouter } from "expo-router";
import { FLAT_PAGES, getActiveSlug } from "../data/nav";

export function PageNav() {
  const pathname = usePathname();
  const router = useRouter();
  const idx = FLAT_PAGES.findIndex((p) => p.slug === getActiveSlug(pathname));
  if (idx === -1) return null;
  const prev = FLAT_PAGES[idx - 1];
  const next = FLAT_PAGES[idx + 1];
  return <Column relaxed>
    <Divider />
    <Row between cozy wrap>
      <Column shrink>{prev ? <Button link small href={prev.href} onPress={() => router.push(prev.href as never)}>← {prev.label}</Button> : null}</Column>
      <Column shrink>{next ? <Button link small href={next.href} onPress={() => router.push(next.href as never)}>{next.label} →</Button> : null}</Column>
    </Row>
  </Column>;
}
