import { Column, Typography, DataTable, Button, Card, ScrollView } from "@nannier/canvas";
import { useRouter } from "expo-router";
import { Page, PageHeader } from "../../ui/page";
import { Section } from "../../ui/section";
import { P, InlineCode } from "../../ui/prose";
import { CodeBlock } from "../../ui/code-block";
import { PageNav } from "../../ui/page-nav";

const PRIMITIVES = [
  ["View", "view", "The low-level layout host beneath Canvas containers and surfaces."],
  ["Text", "text", "The native text host beneath Typography and control labels."],
  ["Pressable", "pressable", "Press, hover, and focus behavior beneath interactive components."],
  ["TextInput", "text-input", "Native text entry beneath Input and Textarea."],
  ["ScrollView", "scroll-view", "A native scroll viewport with bounded content."],
];
const ROWS = ["Ada Lovelace", "Grace Hopper", "Kira Tanaka", "Liang Bao", "Marcus Allen", "Noor Park", "Rachel Chen"];

// The viewport needs a bounded height to demonstrate scrolling; all visible content
// and spacing come from kit components.
function ScrollExample() {
  return <Card flush><ScrollView style={{ maxHeight: 160 }}>
    <Column pad snug>{ROWS.map(name => <Typography key={name}>{name}</Typography>)}</Column>
  </ScrollView></Card>;
}

export default function RnPrimitivesScreen() {
  const router = useRouter();
  return <Page>
    <PageHeader title="React Native primitives" description="The foundations beneath Canvas, and when to use them." />
    <Section title="Use the component for the job">
      <P>Canvas builds on React Native primitives and re-exports the five most common hosts. Use the kit's semantic components for visible UI: <InlineCode>Button</InlineCode> for an action, <InlineCode>Input</InlineCode> for a field, <InlineCode>Typography</InlineCode> for text, and <InlineCode>Card</InlineCode> for a panel.</P>
      <P muted>Arrange components with Row, Column, Container, and Grid. Their semantic spacing, alignment, and measure props keep the layout responsive and consistent. A missing capability belongs in the kit; do not recreate a control with a styled primitive.</P>
      <CodeBlock code={'<Container sm start>\n  <Column relaxed>\n    <Input label="Email" />\n    <Button primary>Continue</Button>\n  </Column>\n</Container>'} />
    </Section>
    <Section title="The primitive layer">
      <DataTable bordered columns={["Primitive", "Purpose"]} rows={PRIMITIVES.map(([name, slug, detail]) => [
        <Button link small key={slug} href={`/components/${slug}`} onPress={() => router.push(`/components/${slug}` as never)}>{name}</Button>, detail,
      ])} />
      <P muted>These hosts carry React Native behavior. Their styling APIs are implementation tools for kit internals and necessary infrastructure, not an alternative styling vocabulary for application UI. Image is a Canvas atom with semantic fit props.</P>
    </Section>
    <Section title="A bounded scroll viewport">
      <P>A scroll viewport needs a bounded height. Inside it, a Column owns spacing and Typography owns text. The viewport below is docs infrastructure for demonstrating scrolling.</P>
      <ScrollExample />
      <CodeBlock code={'<ScrollView>\n  <Column pad snug>\n    {rows.map(name => <Typography key={name}>{name}</Typography>)}\n  </Column>\n</ScrollView>'} />
    </Section>
    <Section title="Native behavior">
      <DataTable bordered columns={["Need", "Use"]} rows={[
        ["Text entry", "Input or Textarea; extend the kit for a missing field capability."],
        ["Overlay", "Dialog, Drawer, Popover, or Tooltip."],
        ["Responsive arrangement", "Intrinsic sizing first, then measured containers. Viewport hooks belong to app chrome."],
        ["Large virtualized content", "React Native FlatList or SectionList with Canvas components as cells."],
        ["Safe area and keyboard", "The platform APIs in the application shell; Canvas controls inside."],
      ]} />
      <P muted>React Native and react-native-svg are peer dependencies. Native navigation and behavior infrastructure can use the platform APIs directly while every visible control uses Canvas.</P>
    </Section>
    <PageNav />
  </Page>;
}
