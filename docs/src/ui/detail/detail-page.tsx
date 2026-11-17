import { useCallback, useContext, useMemo, useRef } from "react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
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
import { componentName, controlledProps, initialKnobs, knobKey, knobProps, type KnobValue } from "./knobs";
import { exampleKnobs } from "./example-knobs";
import { readPlaygroundProps, writePlaygroundProps } from "./playground-link";
import { type SpecimenBase } from "./frame";
import { HOST, PLATFORMS_SHOWN } from "../../core/platforms-shown";
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
// Documented examples retain their variant paths. Playground edits live in the `props`
// query, so a copied URL restores the controls, live example and generated code together.

/** Icon's glyph names, the props its glyph knob drives. */
const GLYPHS = ICON_NAMES.map((name) => name.key);

/** The scroll margin the jump strip leaves above a section (the hand-off's `scroll-margin-top`),
 *  which clears the web's floating navbar. */
const JUMP_MARGIN = 80;
/** The room a native jump leaves between the stack header and the section. */
const NATIVE_JUMP_MARGIN = 16;

type SectionId = "playground" | "variants" | "sizes" | "states" | "anatomy" | "props" | "a11y" | "platforms" | "usage" | "tokens";

export function DetailPage({ comp, variant }: { comp: ComponentDoc; variant?: string }) {
  const router = useRouter();
  const query = useLocalSearchParams<{ props?: string | string[]; platform?: string }>();
  const entry = useComponentDocs(comp.dir ?? comp.slug);
  const spec = DETAIL_SPECS[comp.slug];
  const { tokens } = useTheme();
  const scroller = usePageScroller();
  const headerHeight = useContext(HeaderHeightContext);
  const examples = entry?.examples ?? [];
  const variantIdx = variant ? examples.findIndex((e) => variantSlug(e.label) === variant) : 0;
  const selected = variantIdx < 0 ? 0 : variantIdx;
  const platform = PLATFORMS_SHOWN.find(p => p === query.platform) ?? HOST;
  const scope = useMemo(() => scopeFor(tokens, platform).scope, [tokens, platform]);
  const initial = useMemo(() => spec && entry ? exampleKnobs(scope, spec, entry.examples, entry.props) : initialKnobs(spec?.knobs ?? []), [scope, spec, entry]);
  const knobEdits = useMemo(() => readPlaygroundProps(query.props, spec?.knobs ?? [], GLYPHS), [query.props, spec]);
  const knobs = { ...initial, ...knobEdits };
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
  const edited = spec.knobs.filter(knob => Object.prototype.hasOwnProperty.call(knobEdits, knobKey(knob)));
  const editedSpec = { ...spec, knobs: edited, sizes: undefined, states: undefined, specimen: undefined };
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
        props={knobProps(edited, knobs, true)}
        examples={examples}
        state={knobs}
        onChange={(key: string, value: KnobValue) => router.setParams({ props: writePlaygroundProps({ ...knobEdits, [key]: value }) })}
        onReset={() => router.setParams({ props: writePlaygroundProps({}) })}
        tokens={tokens}
        platform={platform}
        onPlatformChange={(next) => router.setParams({ platform: next })}
        controlled={controlledProps(editedSpec, GLYPHS)}
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
