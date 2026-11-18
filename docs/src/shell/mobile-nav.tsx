import { Navbar, Icon, TabBar } from "@nannier/canvas";
import { useRouter } from "expo-router";
import { useAtScrollEdge } from "./scroll-edge";
import { sectionFor } from "../data/nav";
import { CanvasMark } from "../brand/canvas-mark";

const SECTIONS = [
  { key: "home", label: "Home", href: "/", icon: (active: boolean) => <Icon home primary={active} muted={!active} size={22} /> },
  { key: "components", label: "Components", href: "/components", icon: (active: boolean) => <Icon layoutGrid primary={active} muted={!active} size={22} /> },
  { key: "utilities", label: "Utilities", href: "/tokens/colors", icon: (active: boolean) => <Icon palette primary={active} muted={!active} size={22} /> },
];
const TABS = [...SECTIONS, { key: "search", label: "Search", icon: () => <Icon search muted size={22} /> }];

export function mobileSectionRoot(pathname: string): string {
  return SECTIONS.find((section) => section.key === sectionFor(pathname))?.href ?? "/";
}

export function MobileNavBar({ title, pathname, onMenu }: { title: string; pathname: string; onMenu: () => void }) {
  const router = useRouter();
  const atEdge = useAtScrollEdge();
  const atRoot = SECTIONS.some((section) => section.href === pathname);
  return <Navbar bare={atEdge} brand={title}
    brandHref={pathname === "/" ? "/" : undefined}
    onBrandPress={pathname === "/" ? (event) => { event.preventDefault(); router.push("/"); } : undefined}
    brandContent={atRoot ? <CanvasMark size={24} /> : undefined}
    onBack={!atRoot ? () => router.canGoBack() ? router.back() : router.push(mobileSectionRoot(pathname) as never) : undefined}
    onMenu={onMenu}
    menuLabel="Menu"
  />;
}

export function MobileTabs({ pathname, bottomInset, onSearch }: { pathname: string; bottomInset: number; onSearch: () => void }) {
  const router = useRouter();
  return <TabBar items={TABS} active={sectionFor(pathname)} bottomInset={bottomInset}
    onSelect={(key) => {
      if (key === "search") onSearch();
      else {
        const section = SECTIONS.find((item) => item.key === key);
        if (section) router.push(section.href as never);
      }
    }}
  />;
}
