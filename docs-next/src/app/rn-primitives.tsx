import { Page, PageHeader } from "../ui/page";
import { Section } from "../ui/section";
import { P } from "../ui/prose";
import { Table } from "../ui/table";
import { PageNav } from "../ui/page-nav";

const PRIproprietaryIVES = [
  ["View", "Flex layout container"],
  ["Text", "All text must live in a Text"],
  ["Pressable", "Touchable; exposes press state"],
  ["Image", "Local or remote images"],
  ["TextInput", "Single / multi-line text entry"],
  ["ScrollView", "Scrollable container"],
];

const NOT_WRAPPED = [
  ["FlatList", "Long, virtualized lists"],
  ["SectionList", "Grouped virtualized lists"],
  ["Modal", "Native modal host"],
  ["Animated / Reanimated", "Animation"],
  ["useWindowDimensions", "Viewport size"],
];

export default function RnPrimitivesScreen() {
  return (
    <Page>
      <PageHeader
        title="React Native Primitives"
        description="Canvas re-exports the raw RN primitives it builds on, styled with plain RN style objects — identical on every platform."
      />

      <Section title="The primitives">
        <P muted>Re-exported from @olympusoss/canvas, so you can compose custom UI without a second import.</P>
        <Table headers={["Primitive", "Purpose"]} rows={PRIproprietaryIVES} mono />
      </Section>

      <Section title="What Canvas does not wrap">
        <P muted>Reach for React Native directly for these — Canvas intentionally leaves them to the platform.</P>
        <Table headers={["API", "Use for"]} rows={NOT_WRAPPED} mono />
      </Section>

      <Section title="Styling your own">
        <P muted>Build styles from the active tokens (useTheme) so custom views stay on-brand and theme-aware.</P>
      </Section>

      <PageNav />
    </Page>
  );
}
