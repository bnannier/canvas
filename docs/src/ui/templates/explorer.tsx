import { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ButtonGroup, Column, Container, OverlayProvider, Row, ScrollView, Sidebar, Typography, useTheme } from "@nannier/canvas";
import { buildScopes } from "../../core/build-scopes";
import { getTemplate, templateGroups, templateNumber, DEFAULT_TEMPLATE } from "../../core/data/templates";
import type { TemplateDoc, TemplatePlatform } from "../../core/data/types";
import { Page } from "../page";
import { DocsHead } from "../docs-head";
import { TEMPLATES_PAGE } from "../../data/rooms";
import { PLATFORMS_SHOWN, PLATFORM_LABELS } from "../../core/platforms-shown";
import { TemplateFrame, TemplateStage } from "./frame";
import { AndroidTopBar, IosHeader, PhoneTabBar, WebSidebar, WebTopBar } from "./app-chrome";

// The Templates page (`Canvas v4.0.0 Templates.dc.html`): the template list grouped by
// Auth, App, Account and States on the start side; beside it the open template's number,
// group, name and description, the platform switch and the skin's metrics, the template
// framed in a browser window, an iPhone or a Pixel, and the note under the stage. The bare
// `/templates` opens the hand-off's default (the dashboard) and `/templates/<slug>` a given
// one; the platform rides along as `?platform=ios` so moving between templates keeps it.
//
// The hand-off's own header bar (the brand, the back link, the hue swatches and the scheme
// toggle) is the docs' floating pill here, which carries the same swatches and switch; the
// platform switch moves into the page header beside the skin's metrics.

// Each platform's switch label, icon and skin metrics (the hand-off's SKINS labels) are kept
// per platform in ../../core/platforms-shown, so a native app carries only its own.
const ORDER: readonly TemplatePlatform[] = PLATFORMS_SHOWN;

/** The web frame's sidebar shows once the window is this wide (the hand-off's `webSide`). */
const SIDEBAR_MIN = 760;

export function TemplatesExplorer({ slug }: { slug?: string }) {
  const template = getTemplate(slug ?? DEFAULT_TEMPLATE) ?? getTemplate(DEFAULT_TEMPLATE)!;
  const router = useRouter();
  const params = useLocalSearchParams<{ platform?: string }>();
  const { tokens } = useTheme();
  // The web build previews all three skins; a device previews its own (build-scopes.native).
  const scopes = useMemo(() => buildScopes(tokens), [tokens]);
  const available = ORDER.filter((p) => scopes.some((s) => s.platform === p));
  const asked = params.platform as TemplatePlatform | undefined;
  const platform: TemplatePlatform = asked && available.includes(asked) ? asked : available[0]!;
  const K = scopes.find((s) => s.platform === platform)!.scope;
  const query = platform === available[0] ? "" : `?platform=${platform}`;
  const go = (next: string) => router.push(`/templates/${next}${query}` as never);
  const pick = (next: TemplatePlatform) => router.setParams({ platform: next === available[0] ? undefined : next } as never);

  return (
    <Page>
      <DocsHead title={slug ? template.name : TEMPLATES_PAGE.title} />
      <Row stacks stackBreakpoint="md" generous>
        <Column span={2}>
          <TemplateList active={template.slug} go={go} />
        </Column>
        <Column span={10}>
          <Column airy>
            <Row stacks stackBreakpoint="md" cozy>
              <Column span={8}>
                <Container xl start>
                  <Column>
                    <Typography eyebrow primary>{`${templateNumber(template.slug)} · ${template.group}`}</Typography>
                    <Column comfortable>
                      <Typography h2 level={1}>{template.name}</Typography>
                      <Typography subtle>{template.description}</Typography>
                    </Column>
                  </Column>
                </Container>
              </Column>
              <Column span={4} snug alignEnd end>
                {available.length > 1 ? (
                  <ButtonGroup
                    small
                    accessibilityLabel="Platform"
                    active={available.indexOf(platform)}
                    onSelect={(i) => pick(available[i]!)}
                    items={available.map((p) => ({ label: PLATFORM_LABELS[p]!.label, icon: PLATFORM_LABELS[p]!.template.icon }))}
                  />
                ) : null}
                <Typography caption mono subtle right>{PLATFORM_LABELS[platform]!.template.skin}</Typography>
              </Column>
            </Row>
            <TemplateStage>
              <FramedScreen key={`${template.slug}:${platform}`} template={template} platform={platform} K={K} go={go} />
            </TemplateStage>
            <Typography caption mono subtle>
              Same tree on every platform. The skin swaps control shape, field shape, type, elevation and touch heights; phones drop the sidebar for a tab bar and every grid reflows on its own.
            </Typography>
          </Column>
        </Column>
      </Row>
    </Page>
  );
}

/** The template list: the kit Sidebar's groups, each row numbered by its place in the mono face. */
function TemplateList({ active, go }: { active: string; go: (slug: string) => void }) {
  return (
    <Sidebar
      embedded
      accessibilityLabel="Templates"
      active={active}
      onSelect={(item) => { if (item.id != null) go(String(item.id)); }}
      sections={templateGroups().map(({ group, templates }) => ({
        id: group,
        title: group,
        items: templates.map((t) => ({ id: t.slug, label: t.name, icon: t.icon, meta: templateNumber(t.slug) })),
      }))}
    />
  );
}

/** One template in its device: the frame, the app chrome an app screen sits in, and the screen. */
function FramedScreen({ template, platform, K, go }: {
  template: TemplateDoc;
  platform: TemplatePlatform;
  K: ReturnType<typeof buildScopes>[number]["scope"];
  go: (slug: string) => void;
}) {
  const [width, setWidth] = useState(0);
  const phone = platform !== "web";
  const { Screen } = template;
  // The toast host comes from the frame's scope: each platform's useToast reads its own skin's provider.
  const { ToastProvider } = K;
  const sidebar = platform === "web" && template.app && width >= SIDEBAR_MIN;
  const pad = phone ? 16 : 28;
  const padBottom = platform === "ios" && template.app ? 96 : phone ? 20 : 28;
  return (
    <TemplateFrame platform={platform} path={template.path} onLayout={setWidth}>
      {sidebar ? <WebSidebar K={K} slug={template.slug} go={go} /> : null}
      <OverlayProvider viewport style={styles.column}>
        <ToastProvider single brief bottomInset={platform === "ios" && template.app ? 84 : 20}>
          {template.app ? (
            platform === "web" ? <WebTopBar K={K} /> : platform === "ios" ? <IosHeader K={K} title={template.name} /> : <AndroidTopBar K={K} title={template.name} />
          ) : null}
          <ScrollView style={styles.body} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: pad, paddingTop: pad, paddingBottom: padBottom }}>
            <Screen K={K} phone={phone} go={go} />
          </ScrollView>
          {platform === "ios" && template.app ? <PhoneTabBar K={K} slug={template.slug} go={go} floating /> : null}
          {platform === "android" && template.app ? <PhoneTabBar K={K} slug={template.slug} go={go} floating={false} /> : null}
        </ToastProvider>
      </OverlayProvider>
    </TemplateFrame>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, minWidth: 0, flexDirection: "column" },
  body: { flex: 1, minHeight: 0 },
});
