import { ScrollView, View, Text, useTheme } from "@olympusoss/canvas";
import { Markdown } from "@/components/markdown";
import { Toc } from "@/components/toc";
import scrollCode from "./snippets/rn-primitives/scroll.md?raw";
import imageCode from "./snippets/rn-primitives/image.md?raw";
import textInputCode from "./snippets/rn-primitives/text-input.md?raw";
import escapeCode from "./snippets/rn-primitives/escape.md?raw";

const tocItems = [
  { id: "two-layers", label: "Two layers" },
  { id: "primitives", label: "The primitives" },
  { id: "scroll", label: "ScrollView" },
  { id: "image", label: "Image" },
  { id: "textinput", label: "TextInput vs Input" },
  { id: "not-wrapped", label: "What Canvas does not wrap" },
  { id: "escape-hatch", label: "Styling your own" },
];

// One row per re-exported primitive: the name, the react-native component it IS,
// and what its style object controls.
const PRIproprietaryIVES = [
  { name: "View", wraps: "View", styles: "The box: layout, background, border, radius. A flex container by default." },
  { name: "Text", wraps: "Text", styles: "The text run: color, fontSize, fontWeight, textAlign." },
  { name: "Pressable", wraps: "Pressable", styles: "A pressable surface; its style accepts ({ pressed }) => ... for press feedback." },
  { name: "Image", wraps: "Image", styles: "Size, radius, aspect. source / resizeMode pass through." },
  { name: "TextInput", wraps: "TextInput", styles: "The raw field text and box. A low-level primitive (see below)." },
  { name: "ScrollView", wraps: "ScrollView", styles: "style is the scroll frame; contentContainerStyle is the content." },
];

// Things Canvas deliberately does NOT re-export, with the reason and the thing to
// reach for instead. Keeps the boundary explicit, not arbitrary.
const NOT_WRAPPED = [
  { from: "FlatList / SectionList", why: "Virtualization; the styling surface is your renderItem cells.", instead: "Import from react-native; build cells with View / Text." },
  { from: "Modal", why: "Canvas overlays render their open state inline, so there is no Modal to dogfood.", instead: "Use Dialog / Popover / Tooltip, or import Modal." },
  { from: "Animated, Animated.View", why: "Animation is a behavior driven by Animated.Value, not a static style.", instead: "Build the style object from tokens and animate it on Animated.View (the Skeleton recipe)." },
  { from: "Dimensions", why: "useResponsive already reads useWindowDimensions for responsive values.", instead: "Pick values with useResponsive, or import useWindowDimensions for raw numbers." },
  { from: "KeyboardAvoidingView / SafeAreaView / RefreshControl", why: "Behavior primitives whose value is platform behavior, not styling.", instead: "Import from react-native (or react-native-safe-area-context)." },
];

const SCROLL_ROWS = ["Ada Lovelace", "Grace Hopper", "Kira Tanaka", "Liang Bao", "Marcus Allen", "Noor Park", "Rachel Chen"];

export function RnPrimitivesPage() {
  const { tokens } = useTheme();
  return (
    <div className="docs-content">
      <div style={{ minWidth: 0 }}>
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="page-header-title"><h1>React Native primitives</h1></div>
            <p className="sub">How Canvas builds on React Native, and the boundary between the Canvas components and raw react-native.</p>
          </div>
        </div>

        <section id="two-layers" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Two layers, one rule</h2>
          <p className="small muted" style={{ marginBottom: "0.5rem" }}>
            Canvas ships semantic-prop <strong>components</strong> (Button, Input, Card) on top of React Native's own
            {" "}<strong>primitives</strong> (View, Text, Pressable, Image, TextInput, ScrollView). Components carry flat
            boolean style props and style themselves; the primitives are the raw react-native components, which you
            style with a plain RN <code className="code">style</code> object. The boolean-prop philosophy applies to
            components, not these low-level primitives.
          </p>
          <p className="small muted">
            You build a primitive's style object from the brand <strong>tokens</strong>, read with
            {" "}<code className="code">useTheme()</code> so colors follow light / dark and the glass surface, plus the
            {" "}<code className="code">useResponsive</code>, <code className="code">shadow</code>, and
            {" "}<code className="code">alpha</code> helpers. There is no className layer and no build step: a style is a
            JS object, and <code className="code">style=&#123;[a, b]&#125;</code> merges left to right, so the last entry wins.
          </p>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="primitives" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>The primitives</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            Canvas re-exports the six primitives you compose with most:
            {" "}<code className="code">View</code>, <code className="code">Text</code>,
            {" "}<code className="code">Pressable</code>, <code className="code">Image</code>,
            {" "}<code className="code">TextInput</code>, <code className="code">ScrollView</code>. They are
            react-native's own components, re-exported for a single import alongside the components and helpers; importing
            them from <code className="code">react-native</code> is equivalent.
          </p>
          <table className="dt-table">
            <thead><tr><th>Primitive</th><th>Is (react-native)</th><th>style controls</th></tr></thead>
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
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>ScrollView: two style surfaces</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            ScrollView has two style targets: <code className="code">style</code> sizes the scroll
            {" "}<strong>frame</strong> (the clipped viewport: height, max-height, border) and
            {" "}<code className="code">contentContainerStyle</code> styles the inner <strong>content</strong> (padding,
            gap, centering). The single most common mistake is putting padding on <code className="code">style</code>
            {" "}instead of <code className="code">contentContainerStyle</code>. On the web the frame needs a bounded
            height (a fixed/max height or a flex parent) to actually scroll.
          </p>
          <div className="card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
            <ScrollView
              style={{ maxHeight: 160, borderRadius: 6, borderWidth: 1, borderColor: tokens.border }}
              contentContainerStyle={{ padding: 12, gap: 8 }}
            >
              {SCROLL_ROWS.map((label) => (
                <View key={label} style={{ borderRadius: 6, backgroundColor: tokens.muted, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>{label}</Text>
                </View>
              ))}
            </ScrollView>
          </div>
          <Markdown source={scrollCode} />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="image" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Image</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            <code className="code">Image</code> is RN's Image, so <code className="code">source</code>,
            {" "}<code className="code">resizeMode</code>, and <code className="code">accessibilityLabel</code> are its own
            props; <code className="code">style</code> carries size, radius, and aspect. To clip a photo to a circle, wrap
            it in an overflow-hidden parent (the Avatar pattern); <code className="code">resizeMode="cover"</code> maps to
            {" "}<code className="code">object-fit: cover</code> on react-native-web.
          </p>
          <Markdown source={imageCode} />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="textinput" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>TextInput vs Input / Textarea</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            <code className="code">TextInput</code> is the low-level, style-it-yourself field. It does
            {" "}<strong>not</strong> include a focus border or the react-native-web focus-outline reset. Reach for the
            {" "}<code className="code">Input</code> or <code className="code">Textarea</code> <strong>components</strong> for a real form
            field with semantic props (<code className="code">error</code>, <code className="code">small</code>,
            {" "}<code className="code">large</code>, addons, the outline reset, the focus border). Reach for
            {" "}<code className="code">TextInput</code> only when building a field Canvas does not ship.
          </p>
          <Markdown source={textInputCode} />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="not-wrapped" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>What Canvas does not wrap</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            <code className="code">react-native</code> and <code className="code">react-native-svg</code> are peer dependencies,
            not bundled. Beyond the six primitives above, Canvas does not re-export raw react-native (that would duplicate
            the peer surface and risk version skew). Import these directly from <code className="code">react-native</code>:
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
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Styling your own</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            For any RN component Canvas does not ship, build the style object from tokens yourself and pass it as
            {" "}<code className="code">style</code>. New visual variation belongs on a component's boolean props, not on
            new primitives; a component also takes a <code className="code">style</code> prop, applied last, for layout
            composition (a margin, a width) without restyling it.
          </p>
          <Markdown source={escapeCode} />
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
