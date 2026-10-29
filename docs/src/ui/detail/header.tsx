import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { View, Column, Row, Typography, Badge, Breadcrumb, Button, CodeBlock, Divider, Icon } from "@nannier/canvas";
import navConfig from "../../data/nav.config.json";
import type { ComponentDoc } from "../../core/data/types";
import { InlineMarkdown } from "../prose";

// The detail page's header (Component.dc.html `<header>`): where the component sits in the
// library, its name and tier, its lead, the import line, its source and its section, then
// the strip of jumps to the sections below.

/**
 * The tier pill a category wears: Badge's `tier` tag (Component.dc.html's `TIER` table,
 * `height:24px;padding:0 10px;...;font:500 11px/1 var(--fm);letter-spacing:.06em;
 * text-transform:uppercase`), in the tone the table gives the tier (Atom
 * `background:var(--sf3);color:var(--tx2)`, the secondary pill).
 */
const TIER: Record<ComponentDoc["category"], { label: string; badge: "secondary" | "soft" | "outline" }> = {
  Atoms: { label: "Atom", badge: "secondary" },
  Molecules: { label: "Molecule", badge: "soft" },
  Organisms: { label: "Organism", badge: "outline" },
  Charts: { label: "Chart", badge: "outline" },
};

const REPOSITORY = "https://github.com/bnannier/canvas/tree/main";

/** A section's own docs route, when the docs have one (the section pages land with the v4 shell). */
export function sectionHref(section: string): string | undefined {
  const routes = (navConfig as { routes: Record<string, { label: string; href: string }> }).routes;
  const slug = section.toLowerCase().replace(/&/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return Object.values(routes).find((r) => r.href.startsWith("/sections/") && (r.href === `/sections/${slug}` || r.label === section))?.href;
}

export interface Jump {
  label: string;
  onPress: () => void;
}

export function DetailHeader({ comp, description, sourcePath, exports, jumps }: {
  comp: ComponentDoc;
  description: string;
  /** The component's source directory, `src/<category>/<dir>`. */
  sourcePath: string;
  /** The names the import line brings in. */
  exports: readonly string[];
  jumps: readonly Jump[];
}) {
  const router = useRouter();
  const tier = TIER[comp.category];
  const section = sectionHref(comp.section);
  const importLine = `import { ${exports.join(", ")} } from "@nannier/canvas";`;
  return (
    <View {...(Platform.OS === "web" ? ({ dataSet: { detailSection: "header" } } as object) : null)}>
      <Column airy>
        <Breadcrumb
          slash
          subtle
          items={["Library", comp.section, comp.name]}
          onItemPress={(_, index) => {
            if (index === 0) router.push("/components" as never);
            else if (index === 1 && section) router.push(section as never);
          }}
        />
        <Row roomy alignCenter wrap>
          {/* The hand-off's fluid title (`clamp(40px, 5vw, 64px)/1`), the kit pageTitle role. */}
          <Typography pageTitle>{comp.name}</Typography>
          {/* The tier pill (line 139): 24 tall, `padding:0 10px`, `font:500 11px/1 var(--fm);letter-spacing:.06em;text-transform:uppercase`. */}
          <Badge tier mono uppercase secondary={tier.badge === "secondary"} soft={tier.badge === "soft"} outline={tier.badge === "outline"}>{tier.label}</Badge>
        </Row>
        <Typography pageLead><InlineMarkdown text={description} pageLead /></Typography>
        <Row snug wrap alignCenter>
          <CodeBlock inline copy language="tsx" code={importLine} />
          <Button pageLink mono external href={`${REPOSITORY}/${sourcePath}`} iconLeft={<Icon code size={14} decorative />}>{sourcePath}</Button>
          {section ? (
            <Button pageLink href={section} onPress={() => router.push(section as never)} iconRight={<Icon arrowUpRight size={14} decorative />}>{`View in ${comp.section}`}</Button>
          ) : null}
        </Row>
        <Column relaxed>
          <Divider />
          <Row wrap compact>
            {jumps.map((jump) => <Button key={jump.label} jumpLink onPress={jump.onPress}>{jump.label}</Button>)}
          </Row>
        </Column>
      </Column>
    </View>
  );
}
