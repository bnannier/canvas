import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { Redirect } from "expo-router";
import { HeaderHeightContext } from "expo-router/react-navigation";
import { View, Column, Alert, useTheme, ICON_NAMES } from "@nannier/canvas";
import { DETAIL_SPECS } from "../../core/data/detail-specs";
import type { ComponentDoc } from "../../core/data/types";
import type { DocGuidanceBlock, DocProse } from "../../core/scope";
import { componentDescription } from "../../core/descriptions";
import { useComponentDocs } from "../../core/use-component-docs";
import { variantSlug } from "../../lib/variant";
import { DocsHead } from "../docs-head";
import { usePageScroller } from "../page";
import { DetailHeader, type Jump } from "./header";
import { PlaygroundSection, scopeFor } from "./playground";
import { VariantsSection, SizesSection, StatesSection } from "./specimens";
import { AnatomySection } from "./anatomy";
import { PropsSection } from "./props";
import { AccessibilitySection } from "./accessibility";
import { PlatformSkinsSection } from "./platform-skins";
import { UsageSection, TokensSection, PrevNext } from "./sections";
import { componentName, controlledProps, initialKnobs, jsxCode, knobProps, type KnobState, type KnobValue } from "./knobs";
import { type SpecimenBase } from "./frame";
import { HOST, type DocsPlatform } from "../../core/platforms-shown";
import { MobileComponentIndex } from "./mobile-index";
import { presentationFor, referenceGuidance, referenceNotes, referenceTokens, referenceVariants } from "./presentation";

// The v4 component detail page (Component.dc.html, audit/v4-redesign/PLAN.md decisions P1
// to P3), behind the pilot gate in ./gate.ts. Everything on it is generated data: the
// component's docs module (examples, props, semantics, skin tokens, related components),
// its hand-off detail spec (knobs, sizes, states, anatomy, keyboard) and its section.
//
// In order: the header; the Playground, whose knob state also drives the Sizes, States and
// Anatomy specimens; every Variant; the Props; Accessibility and keyboard; the Platform
// skins, the page's comparison stage, showing the selected example; Usage with the .md's
// guidance; Do & Don't; Tokens with the related components; and the previous and next
// components. The sections stand 64 apart (the kit's `chapter` step).
//
// Selecting an example works as the Playground page's rail did: local state seeded once
// from the URL variant, the address bar rewritten in place (no navigation, so nothing
// remounts), and a variant segment that names the default or nothing redirects to the
// bare component URL so each example keeps exactly one canonical address.

/** Icon's glyph names, the props its glyph knob drives. */
const GLYPHS = ICON_NAMES.map((name) => name.key);

/** The scroll margin the jump strip leaves above a section (the hand-off's `scroll-margin-top`),
 *  which clears the web's floating navbar. */
const JUMP_MARGIN = 80;
/** The room a native jump leaves between the stack header and the section. */
const NATIVE_JUMP_MARGIN = 16;

type SectionId = "playground" | "variants" | "sizes" | "states" | "anatomy" | "props" | "a11y" | "platforms" | "usage" | "tokens";

export function DetailPage({ comp, variant }: { comp: ComponentDoc; variant?: string }) {
  const entry = useComponentDocs(comp.dir ?? comp.slug);
  const spec = DETAIL_SPECS[comp.slug];
  const { tokens } = useTheme();
  const scroller = usePageScroller();
  const headerHeight = useContext(HeaderHeightContext);
  const examples = entry?.examples ?? [];
  const variantIdx = variant ? examples.findIndex((e) => variantSlug(e.label) === variant) : 0;
  const selected = variantIdx < 0 ? 0 : variantIdx;
  const initial = useMemo(() => initialKnobs(spec?.knobs ?? []), [spec]);
  const [knobs, setKnobs] = useState<KnobState>(initial);
  const [platform, setPlatform] = useState<DocsPlatform>(HOST);
  const sections = useRef<Partial<Record<SectionId, View | null>>>({});
  const refFor = useCallback((id: SectionId) => (node: View | null) => {
    sections.current[id] = node;
  }, []);

  if (variant !== undefined && variantIdx <= 0) return <Redirect href={`/components/${comp.slug}`} />;
  if (!entry || !spec) return <Alert title="No detail data for this component yet." />;

  const hrefFor = (i: number) => {
    const label = examples[i]?.label;
    return i <= 0 || !label ? `/components/${comp.slug}` : `/components/${comp.slug}/${variantSlug(label)}`;
  };

  // Brings a section to the top of the page scroller, below the floating navbar (web) or
  // the stack header (native). The native header's height comes from the navigator; the
  // part of it that lies over the scroller (all of it on iOS, where the header is drawn
  // over the content, none on Android, which lays the screen out below it) is the
  // scroller's own top in the window subtracted from it, as the audit driver reads it.
  const jumpTo = (id: SectionId) => {
    const node = sections.current[id];
    const scroll = scroller?.current;
    // The content view's instance, not its node handle: Fabric's measureLayout takes a
    // ref to a native component, and react-native-web returns the same view. React
    // Native's TypeScript declarations omit the method its ScrollView implements.
    const content = (scroll as (typeof scroll & { getInnerViewRef?: () => View | null }) | undefined)?.getInnerViewRef?.();
    if (!node || !scroll || !content) return;
    node.measureLayout(content as never, (_x, y) => {
      const go = (above: number) => scroll.scrollTo({ y: y - above, animated: true });
      if (headerHeight === undefined) return go(JUMP_MARGIN);
      scroll.getNativeScrollRef()?.measureInWindow((_fx, frameTop) => go(Math.max(0, headerHeight - frameTop) + NATIVE_JUMP_MARGIN));
    }, () => {});
  };

  const name = componentName(spec, knobs);
  const props = knobProps(spec.knobs, knobs);
  const code = jsxCode(name, props);
  const scope = scopeFor(tokens, platform).scope;
  const dir = comp.dir ?? comp.slug;
  const sourcePath = `src/${entry.category}/${dir}`;
  const presentation = presentationFor(comp.slug);
  const variants = referenceVariants(examples, presentation);
  const a11yNotes = entry.guidance?.find((g) => g.title === "Accessibility");
  const allGuidance = (entry.guidance ?? []).filter((g) => g !== a11yNotes);
  const guidance = referenceGuidance(allGuidance, presentation);
  const documentationNotes = referenceNotes(a11yNotes ? a11yProse(a11yNotes.blocks) : [componentDescription(comp), ...(entry.overview ?? []), ...allGuidance.flatMap((g) => a11yProse(g.blocks))], presentation);
  const usage = examples[0];
  // The specimens' data: the props the first example rendering the component gives it, under the knobs'.
  const base: SpecimenBase = { examples: examples.map((example) => example.render), controlled: controlledProps(spec, GLYPHS), open: spec.specimen?.props };

  const jumps: Jump[] = (
    [
      ["playground", "Playground", true],
      ["variants", "Variants", variants.length > 0],
      ["sizes", "Sizes", (spec.sizes?.options.length ?? 0) > 0],
      ["states", "States", (spec.states?.length ?? 0) > 0],
      ["anatomy", "Anatomy", spec.anatomy.parts.length > 0],
      ["props", "Props", true],
      ["a11y", "Accessibility", true],
      ["platforms", "Platforms", examples.length > 0],
      ["usage", "Usage", true],
      ["tokens", "Tokens", true],
    ] as const
  )
    .filter(([, , shown]) => shown)
    .map(([id, label]) => ({ label, onPress: () => jumpTo(id) }));

  return (
    <Column chapter style={{ paddingBottom: 24 }}>
      {/* The canonical address tracks the selected example through every in-page switch. */}
      <DocsHead title={comp.name} path={hrefFor(selected)} />
      <MobileComponentIndex slug={comp.slug} />
      <DetailHeader comp={comp} description={componentDescription(comp)} sourcePath={sourcePath} exports={[name]} jumps={jumps} />
      <PlaygroundSection
        spec={spec}
        component={name}
        props={props}
        code={code}
        state={knobs}
        onChange={(key: string, value: KnobValue) => setKnobs((s) => ({ ...s, [key]: value }))}
        onReset={() => setKnobs(initial)}
        tokens={tokens}
        platform={platform}
        onPlatformChange={setPlatform}
        base={base}
        sectionRef={refFor("playground")}
      />
      {variants.length ? <VariantsSection examples={variants} path={`${sourcePath}/${dir}.md`} scope={scope} sectionRef={refFor("variants")} /> : null}
      <SizesSection spec={spec} component={name} props={props} base={base} scope={scope} sectionRef={refFor("sizes")} />
      <StatesSection spec={spec} component={name} props={props} base={base} scope={scope} sectionRef={refFor("states")} />
      <AnatomySection spec={spec} component={name} props={props} base={base} scope={scope} sectionRef={refFor("anatomy")} />
      <PropsSection groups={entry.props} propsInterface={spec.propsInterface} sectionRef={refFor("props")} />
      <AccessibilitySection keyboard={spec.keyboard} semantics={entry.semantics} notes={documentationNotes} sectionRef={refFor("a11y")} />
      <PlatformSkinsSection component={name} props={props} base={base} tokens={tokens} example={variant ? examples[selected] : undefined} sectionRef={refFor("platforms")} />
      <UsageSection note={usage?.note} code={usage?.code} overview={presentation ? entry.overview?.slice(0, presentation.introCount) : entry.overview} guidance={guidance} sectionRef={refFor("usage")} />
      <TokensSection roles={referenceTokens(presentation, knobs) ?? entry.tokens} related={presentation?.related ?? entry.related} tokens={tokens} sectionRef={refFor("tokens")} />
      <PrevNext slug={comp.slug} />
    </Column>
  );
}

/** The prose of the .md's Accessibility section, without its headings and examples. */
function a11yProse(blocks: readonly DocGuidanceBlock[]): DocProse[] {
  return blocks.filter((b): b is DocProse => typeof b === "string" || "list" in b);
}
