import { Scroll, Box, Text } from "@olympusoss/canvas";
import { CodeBlock } from "@/components/code-block";
import { Toc } from "@/components/toc";

const tocItems = [
  { id: "two-layers", label: "Two layers" },
  { id: "primitives", label: "The styled primitives" },
  { id: "scroll", label: "Scroll" },
  { id: "image", label: "Image" },
  { id: "textinput", label: "TextInput vs Input" },
  { id: "not-wrapped", label: "What Canvas does not wrap" },
  { id: "escape-hatch", label: "Escape hatch" },
];

// One row per styled primitive: the Canvas name, the react-native component it
// wraps, and what its className styles.
const PRIproprietaryIVES = [
  { name: "Box", wraps: "View", styles: "The view box: layout, background, border, radius." },
  { name: "Text", wraps: "Text", styles: "The text run: color, size, weight, alignment." },
  { name: "Pressable", wraps: "Pressable", styles: "The pressable surface, plus a pressed-state restyle (active:*)." },
  { name: "Image", wraps: "Image", styles: "Size, radius, aspect. source / resizeMode pass through." },
  { name: "TextInput", wraps: "TextInput", styles: "The field text and box. A low-level primitive (see below)." },
  { name: "Scroll", wraps: "ScrollView", styles: "The scroll frame; contentClassName styles the content." },
];

// Things Canvas deliberately does NOT wrap, with the principled reason and the
// thing to reach for instead. Keeps the boundary explicit, not arbitrary.
const NOT_WRAPPED = [
  { from: "FlatList / SectionList", why: "Virtualization; the styling surface is your renderItem cells.", instead: "Import from react-native; build cells with Box / Text." },
  { from: "Modal", why: "Canvas overlays render their open state inline, so there is no Modal to dogfood.", instead: "Use Dialog / Popover / Tooltip, or import Modal." },
  { from: "Animated, Animated.View", why: "Animation is a behavior driven by Animated.Value, not a static className.", instead: "Spread a resolved useStyles() value onto Animated.View (the Skeleton recipe)." },
  { from: "Dimensions / useWindowDimensions", why: "The engine already consumes useWindowDimensions for responsive resolution.", instead: "React with responsive className variants, or import for raw values." },
  { from: "KeyboardAvoidingView / SafeAreaView / RefreshControl", why: "Behavior primitives whose value is platform behavior, not styling.", instead: "Import from react-native (or react-native-safe-area-context)." },
];

const scrollCode = `import { Scroll, Box, Text } from "@olympusoss/canvas";

// className styles the FRAME (give it a bounded height so it scrolls);
// contentClassName styles the inner content container (padding, gap, centering).
<Scroll
  className="max-h-[160px] rounded-md border border-border"
  contentClassName="p-3 gap-2"
>
  {rows.map((label) => (
    <Box key={label} className="rounded-md bg-muted px-3 py-2">
      <Text className="text-sm text-foreground">{label}</Text>
    </Box>
  ))}
</Scroll>`;

const imageCode = `import { Image, Box } from "@olympusoss/canvas";

// className carries size + radius; source / resizeMode are normal RN ImageProps.
// RN clips a photo to the circle via an overflow-hidden parent.
<Box className="w-12 h-12 overflow-hidden rounded-full">
  <Image className="w-full h-full" source={{ uri: photo }} resizeMode="cover" />
</Box>`;

const textInputCode = `import { TextInput, useTheme } from "@olympusoss/canvas";

// Low-level primitive: no focus border and no react-native-web outline reset.
// Prefer the Input / Textarea COMPONENTS for real form fields. RN does not take
// the placeholder color through style, so pass placeholderTextColor directly.
function PinField() {
  const { tokens } = useTheme();
  return (
    <TextInput
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
      placeholder="000000"
      placeholderTextColor={tokens["muted-foreground"]}
      keyboardType="number-pad"
    />
  );
}`;

const escapeCode = `import { useStyles } from "@olympusoss/canvas";
import { FlatList } from "react-native";

// For any RN component Canvas does not wrap, resolve a className yourself and
// spread it onto the component's style. The missing-wrapper case is never a dead end.
function Rows({ data }) {
  const frame = useStyles("flex-1");
  const content = useStyles("p-4 gap-2");
  return (
    <FlatList
      style={frame}
      contentContainerStyle={content}
      data={data}
      renderItem={({ item }) => <Row item={item} />}
    />
  );
}`;

const SCROLL_ROWS = ["Ada Lovelace", "Grace Hopper", "Kira Tanaka", "Liang Bao", "Marcus Allen", "Noor Park", "Rachel Chen"];

export function RnPrimitivesPage() {
  return (
    <div className="docs-content">
      <div style={{ minWidth: 0 }}>
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="page-header-title"><h1>React Native primitives</h1></div>
            <p className="sub">How Canvas builds on React Native, and the boundary between Canvas primitives and raw react-native.</p>
          </div>
        </div>

        <section id="two-layers" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Two layers, one rule</h2>
          <p className="small muted" style={{ marginBottom: "0.5rem" }}>
            Canvas ships semantic-prop <strong>components</strong> (Button, Input, Card) on top of a thin set of
            className-driven engine <strong>primitives</strong> (Box, Text, Pressable, Image, TextInput, Scroll).
            Components carry flat boolean style props; primitives carry a <code className="code">className</code> and
            nothing semantic. The boolean-prop philosophy applies to components, not these low-level primitives.
          </p>
          <p className="small muted">
            Each primitive extends its react-native counterpart's props, adds a single
            {" "}<code className="code">className</code>, resolves it with <code className="code">useStyles</code> for the
            active theme and viewport (desktop-first responsive), and renders
            {" "}<code className="code">style=&#123;[resolved, style]&#125;</code> so a caller-supplied style always wins. This is
            the same wrapper that <code className="code">Box</code>, <code className="code">Text</code>, and
            {" "}<code className="code">Pressable</code> already use.
          </p>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="primitives" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>The styled primitives</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            Primitives use Canvas names, not RN names (<code className="code">Box</code> not
            {" "}<code className="code">View</code>, <code className="code">Scroll</code> not
            {" "}<code className="code">ScrollView</code>). Import them from <code className="code">@olympusoss/canvas</code>.
          </p>
          <table className="dt-table">
            <thead><tr><th>Primitive</th><th>Wraps (react-native)</th><th>className styles</th></tr></thead>
            <tbody>
              {PRIproprietaryIVES.map((p) => (
                <tr key={p.name}>
                  <td><code className="code">{p.name}</code></td>
                  <td><code className="code">{p.wraps}</code></td>
                  <td className="small muted">{p.styles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="scroll" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Scroll: two style surfaces</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            ScrollView has two style targets and <code className="code">Scroll</code> exposes both:
            {" "}<code className="code">className</code> styles the scroll <strong>frame</strong> (the clipped viewport:
            height, max-height, border) and <code className="code">contentClassName</code> styles the inner
            <strong> content</strong> container (padding, gap, centering), mapped to RN's
            {" "}<code className="code">contentContainerStyle</code>. The single most common mistake is putting padding on
            {" "}<code className="code">className</code> instead of <code className="code">contentClassName</code>. On the web the
            frame needs a bounded height (a fixed/max height or a flex parent) to actually scroll.
          </p>
          <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
            <Scroll
              className="max-h-[160px] rounded-md border border-border"
              contentClassName="p-3 gap-2"
            >
              {SCROLL_ROWS.map((label) => (
                <Box key={label} className="rounded-md bg-muted px-3 py-2">
                  <Text className="text-sm text-foreground">{label}</Text>
                </Box>
              ))}
            </Scroll>
          </div>
          <CodeBlock code={scrollCode} language="tsx" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="image" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Image</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            <code className="code">Image</code> extends RN <code className="code">ImageProps</code>, so
            {" "}<code className="code">source</code>, <code className="code">resizeMode</code>, and
            {" "}<code className="code">accessibilityLabel</code> pass straight through; <code className="code">className</code> carries
            size, radius, and aspect. To clip a photo to a circle, wrap it in an overflow-hidden parent (the Avatar
            pattern); <code className="code">resizeMode="cover"</code> maps to <code className="code">object-fit: cover</code> on
            react-native-web.
          </p>
          <CodeBlock code={imageCode} language="tsx" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="textinput" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>TextInput vs Input / Textarea</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            <code className="code">TextInput</code> is the low-level, styled-only-by-your-className primitive. It does
            {" "}<strong>not</strong> include a focus border or the react-native-web focus-outline reset. Reach for the
            {" "}<code className="code">Input</code> or <code className="code">Textarea</code> <strong>components</strong> for a real form
            field with semantic props (<code className="code">error</code>, <code className="code">small</code>,
            {" "}<code className="code">large</code>, addons, the outline reset, the focus border). Reach for
            {" "}<code className="code">TextInput</code> only when building a field Canvas does not ship.
          </p>
          <CodeBlock code={textInputCode} language="tsx" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="not-wrapped" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>What Canvas does not wrap</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            <code className="code">react-native</code> and <code className="code">react-native-svg</code> are peer dependencies,
            not bundled. Canvas does not re-export raw react-native (that would duplicate the peer surface and risk
            version skew). Import these directly from <code className="code">react-native</code>:
          </p>
          <table className="dt-table">
            <thead><tr><th>From react-native</th><th>Why not wrapped</th><th>Use instead</th></tr></thead>
            <tbody>
              {NOT_WRAPPED.map((n) => (
                <tr key={n.from}>
                  <td><code className="code">{n.from}</code></td>
                  <td className="small muted">{n.why}</td>
                  <td className="small">{n.instead}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="escape-hatch" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Escape hatch</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            For any RN component Canvas does not wrap, call <code className="code">useStyles(className)</code> yourself and
            spread the result onto the component's style. New visual variation belongs on a component's boolean props,
            not on new primitives, so add a styled primitive only when a real component is already styling a raw RN
            component via <code className="code">useStyles</code> and a wrapper would remove that boilerplate.
          </p>
          <CodeBlock code={escapeCode} language="tsx" />
        </section>
      </div>

      <div style={{ display: "none" }} className="docs-toc-col">
        <Toc items={tocItems} />
      </div>
      <style>{`
        @media (min-width: 1280px) {
          .docs-toc-col { display: block !important; }
        }
      `}</style>
    </div>
  );
}
