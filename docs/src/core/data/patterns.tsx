import { useEffect, useRef, useState } from "react";
import type { TextInput as NativeInput } from "react-native";
import {
  Row, Column, Container, Grid, GridItem, Card, Typography, Input, Button, CodeBlock,
  DataTable, Kbd, Field, Alert, Badge, Checkbox, Switch, Slider, Progress, Spinner,
  Skeleton, StackedList, Dialog, Tabs, Accordion, ThemeProvider, Sidebar,
  contrastRatio, useTheme, useFormFactor,
} from "@nannier/canvas";
import type { PatternDoc } from "./types";

// Patterns compose the public kit API. Their controls own real local state, and
// stable component identities keep it intact when their container changes size.
function Notes({ items }: { items: ReadonlyArray<readonly [string, string]> }) {
  return <Grid minTileWidth={220} relaxed>{items.map(([title, body]) => (
    <Card key={title}><Typography h4>{title}</Typography><Typography small muted>{body}</Typography></Card>
  ))}</Grid>;
}

function FocusDemo() {
  const field = useRef<NativeInput>(null);
  const [count, setCount] = useState(0);
  return <Column cozy>
    <Typography small muted>Use Tab to move through these controls. Focus input moves real focus into the field; no ring is painted onto an unfocused control.</Typography>
    <Row stacks cozy alignCenter>
      <Button onPress={() => setCount((value) => value + 1)}>Activated {count} times</Button>
      <Input ref={field} label="Focus example" defaultValue="Edit this text" />
      <Button outline onPress={() => field.current?.focus()}>Focus input</Button>
    </Row>
  </Column>;
}

function AriaDemo() {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  return <Column cozy>
    <Tabs tabs={["Overview", "Activity"]} active={tab} onSelect={setTab} />
    <Card><Typography>{tab === 0 ? "Overview selected" : "Activity selected"}</Typography></Card>
    <Switch defaultChecked description="The control announces its current checked state.">Notifications</Switch>
    <Row snug wrap>
      <Button outline onPress={() => setOpen(true)}>Open named dialog</Button>
      <Button outline onPress={() => setNotice((value) => !value)}>{notice ? "Clear alert" : "Show alert"}</Button>
    </Row>
    {notice ? <Alert success title="Settings saved" description="This alert is announced when it appears." /> : null}
    <Dialog overlay open={open} onOpenChange={setOpen} title="Accessible dialog" description="Tab stays inside while this dialog is open. Escape or Cancel closes it and returns focus to the opener." onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)} />
  </Column>;
}

function CrossPlatformDemo() {
  const [value, setValue] = useState(35);
  return <Column relaxed>
    <Accordion items={[{ key: "disclosure", title: "Disclosure", content: "Open state is exposed by the component on every platform." }]} />
    <Checkbox description="Standalone Checkbox uses the platform's appropriate control.">Email updates</Checkbox>
    <Slider value={value} onChange={setValue} accessibilityLabel="Example value" />
    <Progress value={value / 100} showValue>Example value</Progress>
  </Column>;
}

function ContrastDemo() {
  const { tokens } = useTheme();
  const pairs = [
    ["foreground / background", tokens.foreground, tokens.background],
    ["muted-foreground / background", tokens["muted-foreground"], tokens.background],
    ["primary-foreground / primary", tokens["primary-foreground"], tokens.primary],
  ];
  return <DataTable bordered compact stacks columns={["Token pair", "Measured ratio", "Normal text AA"]} rows={pairs.map(([label, ink, fill]) => {
    const ratio = contrastRatio(ink, fill);
    return [label, `${ratio.toFixed(2)}:1`, <Badge key={label} success={ratio >= 4.5} warning={ratio < 4.5}>{ratio >= 4.5 ? "Pass" : "Review"}</Badge>];
  })} />;
}

const emailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
function ValidationStates() {
  const [email, setEmail] = useState("bad-email");
  return <Grid minTileWidth={220} relaxed>
    <Field label="Default" helper="Type a value."><Input placeholder="Enter value" /></Field>
    <Field label="Focus" helper="Tab or tap here to see the actual focus state."><Input placeholder="Focus me" /></Field>
    <Field label="Email" error={!emailValid(email) ? "Please enter a valid email address." : undefined} helper="Email address is valid.">
      <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
    </Field>
    <Field label="Disabled" helper="Unavailable fields cannot be edited."><Input disabled defaultValue="Read only" /></Field>
  </Grid>;
}

function ValidationForm({ lifecycle = false }: { lifecycle?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const error = touched && !emailValid(email) ? "Enter a valid email address." : undefined;
  const passwordError = passwordTouched && password.length < 8 ? "Use at least 8 characters." : undefined;
  const submit = () => {
    setTouched(true);
    setPasswordTouched(true);
    setSubmitted(emailValid(email) && password.length >= 8);
  };
  return <Container sm start><Card><Column cozy>
    <Typography h4>{lifecycle ? "Try touch-on-blur" : "Sign in to Acme Corp"}</Typography>
    <Typography small muted>Demo only. Nothing is sent or stored.</Typography>
    <Field label="Email" required helper={touched && !error ? "Email address is valid." : "Validation starts when you leave the field."} error={error}>
      <Input value={email} onChangeText={(text) => { setEmail(text); setSubmitted(false); }} onBlur={() => setTouched(true)} keyboardType="email-address" autoCapitalize="none" />
    </Field>
    {!lifecycle ? <Field label="Password" required helper="Use at least 8 characters." error={passwordError}>
      <Input secureTextEntry value={password} onChangeText={(text) => { setPassword(text); setSubmitted(false); }} onBlur={() => setPasswordTouched(true)} />
    </Field> : null}
    {lifecycle ? <Button outline onPress={() => { setEmail(""); setTouched(false); }}>Reset validation</Button> : <Button primary block onPress={submit}>Sign in</Button>}
    {submitted ? <Alert success title="Demo sign-in complete" description="Both fields passed validation." /> : null}
  </Column></Card></Container>;
}

function GlassDemo() {
  const { dark, palette, tokens } = useTheme();
  const [glass, setGlass] = useState(false);
  const [saved, setSaved] = useState(false);
  return <Column cozy>
    <Switch checked={glass} onChange={setGlass} description="The provider changes material while the form remains mounted.">Request glass</Switch>
    <ThemeProvider dark={dark} light={!dark} mint={palette === "mint"} tokens={tokens} glass={glass} solid={!glass}>
      <Card><Column cozy>
        <Typography h4>{glass ? "Glass requested" : "Solid appearance"}</Typography>
        <Typography small muted>Available material follows the platform and accessibility settings.</Typography>
        <Input label="Project name" defaultValue="Keep my draft" />
        <Checkbox defaultChecked>Notify the team</Checkbox>
        <Button onPress={() => setSaved(true)}>Save example</Button>
        {saved ? <Alert success title="Example saved" /> : null}
      </Column></Card>
    </ThemeProvider>
  </Column>;
}

function useDemoDelay() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => { setLoading(false); setDone(true); }, 900);
    return () => clearTimeout(timer);
  }, [loading]);
  return { loading, done, start: () => { setDone(false); setLoading(true); } };
}

function LoadingButtonDemo() {
  const { loading, done, start } = useDemoDelay();
  return <Column cozy>
    <Button primary loading={loading} onPress={start}>{loading ? "Saving…" : "Save changes"}</Button>
    {done ? <Alert success title="Changes saved" /> : <Typography small muted>Press Save changes to run a short simulated request.</Typography>}
  </Column>;
}

function SkeletonDemo() {
  const { loading, done, start } = useDemoDelay();
  return <Column cozy>
    <Button outline disabled={loading} onPress={start}>{done ? "Reload members" : "Load members"}</Button>
    {loading ? <Skeleton list animate accessibilityLabel="Loading members" /> : <StackedList card title="Members" items={done ? [{ name: "Ada Lovelace", detail: "Engineering" }, { name: "Grace Hopper", detail: "Platform" }] : []} />}
  </Column>;
}

function ProgressDemo() {
  const [value, setValue] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setValue((previous) => Math.min(1, previous + 0.1)), 180);
    return () => clearInterval(timer);
  }, [running]);
  useEffect(() => { if (value >= 1) setRunning(false); }, [value]);
  return <Container md start><Card><Column cozy>
    <Progress value={value} showValue description={`${(value * 3.5).toFixed(1)} MB of 3.5 MB`}>{value >= 1 ? "Upload complete" : "Uploading report.pdf"}</Progress>
    <Row snug wrap>
      <Button disabled={running} onPress={() => { setValue(0); setRunning(true); }}>{value >= 1 ? "Upload again" : "Start upload"}</Button>
      <Button outline disabled={!running} onPress={() => setRunning(false)}>Pause</Button>
      <Button ghost disabled={running || value <= 0 || value >= 1} onPress={() => setRunning(true)}>Resume</Button>
    </Row>
  </Column></Card></Container>;
}

function ResponsiveSidebarDemo() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const desktop = useFormFactor() === "desktop";
  return <Column cozy>
    <Button outline onPress={() => desktop ? setCollapsed((value) => !value) : setOpen(true)}>{desktop ? "Toggle rail" : "Open navigation"}</Button>
    <Row stacks relaxed>
      <Sidebar responsive compact collapsed={collapsed} active={active} open={open} onOpenChange={setOpen} items={[{ id: "overview", label: "Overview", icon: "home" }, { id: "activity", label: "Activity", icon: "activity" }]} onSelect={(item) => { setActive(String(item.id)); setOpen(false); }} />
      <Column fill><Card><Typography h4>{active === "overview" ? "Overview" : "Activity"}</Typography><Input label="Draft preserved on resize" /></Card></Column>
    </Row>
  </Column>;
}

function DensityToolbar({ label, compact = false, comfortable = false }: { label: string; compact?: boolean; comfortable?: boolean }) {
  const [query, setQuery] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const items = ["Active project", "Archived project"].filter((item) => item.toLowerCase().includes(query.toLowerCase()) && (!activeOnly || item.startsWith("Active")));
  return <Column tight>
    <Typography small semibold>{label}</Typography>
    <Card compact={compact} comfortable={comfortable}>
      <Row stacks snug alignCenter>
        <Input accessibilityLabel={`${label} search`} placeholder="Search projects" small={compact} large={comfortable} value={query} onChangeText={setQuery} />
        <Checkbox checked={activeOnly} onChange={setActiveOnly}>Active only</Checkbox>
      </Row>
      <Typography small muted>{items.length} results</Typography>
    </Card>
  </Column>;
}

function ResponsiveLayoutDemo() {
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [names, setNames] = useState(["Build API", "Write guide", "Review release", "Ship update"]);
  const visible = names.filter((name, index) => name.toLowerCase().includes(query.toLowerCase()) && (!onlyActive || index % 2 === 0));
  return <Column relaxed>
    <Row stacks cozy alignCenter>
      <Input leadingIcon icon="search" label="Search runs" value={query} onChangeText={setQuery} />
      <Checkbox checked={onlyActive} onChange={setOnlyActive}>Active only</Checkbox>
      <Button onPress={() => setNames((items) => [...items, `Run ${items.length + 1}`])}>New run</Button>
    </Row>
    <Grid minTileWidth={140} columns={4} snug>{visible.map((name) => <Card key={name}><Typography>{name}</Typography></Card>)}</Grid>
    <Grid minTileWidth={180} columns={3} snug><GridItem wide><Card><Typography>Wide tile spans two cells when room is available.</Typography></Card></GridItem><Card><Typography>Regular tile</Typography></Card></Grid>
  </Column>;
}

const PATTERNS: PatternDoc[] = [
  // ── Accessibility ───────────────────────────────────────
  {
    slug: "accessibility",
    name: "Accessibility",
    description: "Focus rings, keyboard navigation, ARIA attributes, and color contrast. The baseline a11y requirements every Canvas surface must meet.",
    sections: [
      {
        title: "Focus ring",
        description: "Every interactive element gets a visible focus indicator on keyboard focus. The kit's Pressable colours the browser's own ring with the palette's ring token, 2px off the control; a field paints its own ring-coloured border instead, and a full-bleed row draws the ring just inside itself so its container cannot clip it.",
        anatomy: "The ring appears on keyboard focus only (the browser's :focus-visible), never on a mouse click, and follows the control's border-radius. Chromium paints it in the ring colour; Firefox and Safari keep their own ring colour unless the page loads the CSS hand-off, whose :focus-visible rule draws a solid 2px ring in --ring everywhere.",
        render: () => (<FocusDemo />),
      },
      {
        title: "Keyboard shortcuts",
        description: "Standard keyboard patterns used across Canvas components.",
        render: () => (<DataTable bordered compact stacks columns={["Action", "Keys"]} rows={[["Open command palette", <Row key="command" tight><Kbd>⌘</Kbd><Kbd>K</Kbd></Row>], ["Close dialog or drawer", <Kbd key="escape">Esc</Kbd>], ["Navigate list items", <Row key="arrows" tight><Kbd>↑</Kbd><Kbd>↓</Kbd></Row>], ["Select or activate", <Kbd key="enter">Enter</Kbd>], ["Move focus forward", <Kbd key="tab">Tab</Kbd>]]} />),
      },
      {
        title: "ARIA essentials",
        description: "Minimum ARIA attributes required on common Canvas patterns.",
        render: () => (<AriaDemo />),
      },
      {
        title: "Cross-platform support",
        description: "Canvas components announce their role and state to assistive tech on iOS, Android, and the web from one codebase, and the role follows the control each platform draws: a one-setting Checkbox is the switch on iOS and Android and announces as one there, while a selection Checkbox stays a checkbox everywhere. react-native-web does not forward accessibilityState or accessibilityValue to the DOM, so each component also carries the matching aria-* attribute (React Native maps it back to the native state). You get VoiceOver, TalkBack, and web screen-reader support from one codebase.",
        render: () => (<CrossPlatformDemo />),
      },
      {
        title: "Color contrast",
        description: "Canvas tokens are designed for WCAG AA contrast (4.5:1 for normal text, 3:1 for large text). Verify contrast when customizing theme colors.",
        render: () => (<ContrastDemo />),
      },
    ],
  },

  // ── Density ─────────────────────────────────────────────
  {
    slug: "density",
    name: "Density",
    description: "Density is a per-component axis of semantic boolean props: compact tightens a component's spacing, comfortable relaxes it, and omitting both gives the regular default. There is no app-wide density switch.",
    sections: [
      {
        title: "How it works",
        description: "Pass compact for tight spacing, comfortable for generous spacing, or neither for the regular default. Each component resolves its own padding and gaps from the prop; no document attribute or stylesheet changes density globally.",
        render: () => (
          <Grid minTileWidth={200} relaxed>
            {[
              { label: "Compact", code: "compact", blurb: "Tight spacing for dense data views (tables, admin panels)" },
              { label: "Regular", code: "default", blurb: "Balanced spacing for most interfaces", selected: true },
              { label: "Comfortable", code: "comfortable", blurb: "Generous spacing for reading-heavy or touch-friendly layouts" },
            ].map((d) => (
              <Card key={d.label} grow selected={d.selected}>
                <Column alignCenter tight>
                  <Typography semibold>{d.label}</Typography>
                  <Typography mono tiny muted>{d.code}</Typography>
                  <Typography small muted>{d.blurb}</Typography>
                </Column>
              </Card>
            ))}
          </Grid>
        ),
      },
      {
        title: "Live demo",
        description: "The same search toolbar rendered at each density level.",
        render: () => <Column relaxed>
          <DensityToolbar label="Compact" compact />
          <DensityToolbar label="Regular" />
          <DensityToolbar label="Comfortable" comfortable />
        </Column>,
      },
      {
        title: "Extending",
        anatomy: "Give your own components the same axis: accept compact and comfortable booleans and resolve the spacing from them, the way the built-ins do. To remember a user's choice on the web, setDensity persists it and getDensity reads it back; the app then applies it by passing the matching booleans down, because no stylesheet reads the stored preference.",
        render: () => (
          <CodeBlock
            language="tsx"
            code={`// The density axis is resolved by each component.
<Card compact>...</Card>
<Card comfortable>...</Card>

// An app may persist a preference, then apply it through props.
setDensity("compact");
const density = getDensity();
<Card compact={density === "compact"} comfortable={density === "comfy"}>...</Card>;`}
          />
        ),
      },
    ],
  },

  // ── Form Validation ─────────────────────────────────────
  {
    slug: "form-validation",
    name: "Form Validation",
    description: "Touch-on-blur validation pattern with visual states (default, focused, error, success, disabled) and inline error messages.",
    sections: [
      {
        title: "States",
        description: "Each state has a distinct visual treatment. Error and success states include helper text below the field.",
        render: () => (<ValidationStates />),
      },
      {
        title: "Validation lifecycle",
        description: "Touch-on-blur: validate when the field loses focus (not on every keystroke). Show errors inline. Clear errors as the user corrects them.",
        anatomy: "1. User focuses field. 2. User types and leaves (blur). 3. If invalid, show error state + message. 4. On next keystroke, re-validate live until valid. 5. Confirm valid input through Field’s helper text.",
        render: () => (<ValidationForm lifecycle />),
      },
      {
        title: "Example form",
        description: "A sign-in form demonstrating error states with inline helper text.",
        render: () => (<ValidationForm />),
      },
      {
        title: "Production stack",
        render: () => (<Card><Typography small>In production, a form-state library such as react-hook-form can own values and touched state, while a schema library such as zod validates them. Pass the resulting error through Field; Canvas owns the visual and accessible field anatomy.</Typography></Card>),
      },
    ],
  },

  // ── Glass Surface ───────────────────────────────────────
  {
    slug: "glass",
    name: "Glass Surface",
    description: "A theme-level material preference selected by surface role and context: stable frost for reading/content panes, Liquid Glass for eligible functional surfaces, and inherited treatment for unfilled anatomy. <ThemeProvider glass> requests glass, <ThemeProvider solid> selects complete opaque appearance, and omitting both uses the platform default (glass on supported iOS 26+, solid elsewhere).",
    sections: [
      {
        title: "What 'glass' means in Canvas",
        description: "Material, density, and motion are separate decisions. Reading panes, field wells, passive badges, and chart frames use stable frost. Functional floating shells and controls can use Liquid Glass where supported, with native feedback first. Labels, images, chart marks, layout wrappers, and unfilled variants inherit their host instead of gaining a pane. Shared GlassSurface and GlassPane rendering supplies the material; glass-tint, glass-tint-content, glass-tint-control, and glass-tint-dense control coverage without replacing semantic colors. A dense menu can remain Liquid Glass while keeping its rows legible. A liquid material names the surface, never a motion: nothing deforms, travels or springs.",
        anatomy: "Toggle with the Solid / Glass switch in the topbar, or pass the boolean to the provider: <ThemeProvider glass> forces glass, <ThemeProvider solid> forces flat, and omitting both picks the platform default (glass on iOS 26+ via liquidGlassAvailable(), solid elsewhere).",
        render: () => (<Card><Typography small>Component APIs stay the same. Shared rendering supplies native Liquid Glass where supported, Dark Factory’s plain frost on the web, and supported native blur elsewhere. Semantic card and popover colors stay opaque. Unavailable or unsafe material, Reduce Transparency, and Increase Contrast restore the complete solid appearance.</Typography></Card>),
      },
      {
        title: "The four ingredients",
        description: "Supported material combines a live backdrop, readable tint, and the platform skin's shape. The renderer keeps crisp content above it and restores the full solid skin when material is unavailable.",
        render: () => (<Notes items={[["Blur material", "Supported native Liquid Glass or native frost; the web uses a 24px plain backdrop blur."], ["Readable tint", "The functional, content, control, and dense layers each have a tint chosen for their role."], ["The skin’s shape", "Shared material rendering keeps the component’s radius and replaces its resting fill and border."], ["A safe live backdrop", "The renderer samples content behind the surface without capturing itself. Text and icons remain crisp."]]} />),
      },
      {
        title: "Surface inventory",
        description: "Representative surfaced roles and tint density. The component variant and surrounding context determine whether a pane exists. Reading content remains still, functional surfaces use supported liquid material, and unfilled variants inherit. Density does not select motion.",
        render: () => (<DataTable bordered compact stacks columns={["Surface", "Layer", "Treatment"]} rows={[["Navbar, Sidebar, Dialog, Drawer, Popover, Command", "Functional", "Supported glass with complete solid fallback"], ["Card, list, table, calendar, chart, alert", "Content", "Stable frost for reading"], ["Fields, buttons, tabs, chips, switches", "Control", "Role-appropriate material; bare variants stay bare"], ["Option menus, AlertDialog, Toast, Tooltip", "Dense", "Denser tint for legibility; inverse surfaces retain inverse ink"]]} />),
      },
      {
        title: "Live comparison",
        description: "A real Card and its controls under one ThemeProvider. Change the material and verify that the typed draft and checkbox state remain intact. The material falls back according to platform capabilities and accessibility preferences.",
        render: () => (<GlassDemo />),
      },
      {
        title: "When NOT to use glass",
        description: "Use the complete solid appearance when the material cannot preserve readability, performance, or accessibility. A static content frame is appropriate only when its content remains clear.",
        render: () => (<Notes items={[["Accessibility preferences", "Reduce Transparency and Increase Contrast use a complete opaque appearance."], ["Unsupported material", "A platform or capture configuration without safe blur falls back to solid."], ["Android page surfaces", "Android frosts only what floats over a separate capture plane: overlays in an OverlayProvider outlet and sheets in a window of their own. A surface in the page itself has no plane it can sample without capturing itself, so with glass requested it keeps its complete solid skin, by design."], ["Unfilled variants", "Layout wrappers and ghost or link actions inherit their surroundings without another pane."]]} />),
      },
      {
        title: "Implementation",
        description: "ThemeProvider carries the preference: pass glass or solid (glass wins if both are set), or omit both for the platform default reported by liquidGlassAvailable(). Shared rendering selects a supported material for each surfaced role, with complete opaque fallback when accessibility or capability requires it. Material changes preserve interaction state and native host identity. On the web, setSurface(\"glass\") persists the choice and sets data-surface for the CSS handoff's material mode and page backdrop. Also pass the choice from getSurface() to ThemeProvider so React Native components follow it. CSS variables do not style native components.",
        render: () => (<CodeBlock language="tsx" code={"// Request material through the provider.\n<ThemeProvider glass>...</ThemeProvider>\n<ThemeProvider solid>...</ThemeProvider>\n\n// Keep the same tree when a user changes the preference.\n<ThemeProvider glass={glass} solid={!glass}>\n  <Card><Input label=\"Project name\" /></Card>\n</ThemeProvider>"} />),
      },
    ],
  },

  // ── Loading ─────────────────────────────────────────────
  {
    slug: "loading",
    name: "Loading",
    description: "Three loading strategies: skeleton for predictable content, spinner for an indeterminate request, and progressive disclosure to keep existing content usable.",
    sections: [
      {
        title: "Choose by intent",
        description: "Pick the right loading pattern based on what the user is waiting for and how long they'll wait.",
        render: () => (<Grid minTileWidth={200} relaxed><Card><Typography h4>Skeleton</Typography><Typography small muted>Show the shape of predictable content while it loads.</Typography><Skeleton text short /></Card><Card><Typography h4>Spinner</Typography><Spinner>Waiting for a response</Spinner></Card><Card><Typography h4>Progressive</Typography><Typography small muted>Keep available content usable while another part loads.</Typography><Progress value={0.6} showValue>Loaded sections</Progress></Card></Grid>),
      },
      {
        title: "Spinner in button",
        description: "Set loading during an asynchronous action. Button renders its own spinner and prevents duplicate submission while preserving its label.",
        render: () => (<LoadingButtonDemo />),
      },
      {
        title: "Skeleton row",
        description: "Animated placeholder rows that match the shape of the content being loaded.",
        render: () => (<SkeletonDemo />),
      },
      {
        title: "Inline progress bar",
        description: "Determinate progress for file uploads, multi-step processes, or batch operations.",
        render: () => (<ProgressDemo />),
      },
    ],
  },

  // ── Responsive ──────────────────────────────────────────
  {
    slug: "responsive",
    name: "Responsive",
    description: "The desktop-first responsive system: the parent provides the bounds (FILL and HUG components, Container steps, Row spans, Grid tiles), then three mechanisms (intrinsic sizing, container measurement, viewport breakpoints), a phone/tablet/desktop form-factor tier, and the Row-stacks primitive.",
    sections: [
      {
        title: "Breakpoints",
        description: "Canvas is desktop-first. The base value is the desktop case; a breakpoint entry (sm, md, lg, xl, 2xl) applies at that width and below. useResponsive resolves a value map, useBreakpoint returns the active bucket, and useFormFactor collapses it to phone / tablet / desktop (phone at or below sm, tablet at or below lg, desktop above; macOS and desktop web are the desktop form factor). An unknown viewport (SSR, the pre-layout first frame) resolves to base, the desktop variant; SSR apps that know better pass ThemeProvider's ssrBreakpoint.",
        render: () => (<DataTable bordered compact stacks columns={["Bucket", "Applies at", "Typical use"]} rows={[["base", "Default", "Desktop base and unknown width"], ["2xl", "≤ 1536px", "Large monitors"], ["xl", "≤ 1280px", "Desktops"], ["lg", "≤ 1024px", "Tablet or narrow app chrome"], ["md", "≤ 768px", "Tablet containers"], ["sm", "≤ 640px", "Phone containers"]]} />),
      },
      {
        title: "The parent provides the bounds",
        description: "A component never dictates its own width. It is FILL (a field, a card, a table, a chart: width 100% plus flexShrink so it fills a Column and shares a Row) or HUG (a button, a badge, a chip: its content's width), and the nearest layout container provides the bounds from one width scale. Container conforms to its parent by default and caps at a named step (xxxs 192 through page 1280) when asked; a Row child's span is its width in twelfths; Grid fits equal tiles. The fields, Field, Form, Button, and ButtonGroup can also name a step of their own (the measure axis: xs, lg, start), which is that same cap moved onto the component. That is Bootstrap's contract in React Native terms, and the reason no component takes a width or maxWidth in its style.",
        render: () => (<Column relaxed><Container sm start><Input label="FILL within a sm Container" placeholder="Fluid below 384px" /></Container><Row snug wrap><Badge outline>HUG badge</Badge><Badge>HUG badge</Badge></Row><Grid minTileWidth={220} columns={2} relaxed><Card><Typography>One grid cell</Typography></Card><Card><Typography>Another grid cell</Typography></Card></Grid></Column>),
      },
      {
        title: "Choosing a mechanism",
        description: "Three official layers, in order of preference. Rule of thumb: viewport for the shell, container for the components, intrinsic wherever possible.",
        render: () => (<Notes items={[["1. Intrinsic sizing", "Use FILL or HUG with bounds from a Container step, Row span, or Grid cell. This works on the first frame and server."], ["2. Container measurement", "Grid and Row stacks react to their own width; a component may live in a narrow desktop panel."], ["3. Viewport breakpoints", "Reserve viewport hooks for window-level Sidebar or FilterPanel drawer modes and app shells."], ["Pointer capability", "usePointerCoarse and useHoverCapable express input capability separately from viewport size."]]} />),
      },
      {
        title: "Sidebar - drawer ↔ fixed",
        description: "The kit Sidebar's `responsive` prop does this: a fixed accordion rail on the desktop base, and at lg (1024px) and below a start-edge drill-down drawer opened by the hamburger button. Above lg, the fixed panel stays.",
        render: () => (<ResponsiveSidebarDemo />),
      },
      {
        title: "Layout primitives: Grid and Row stacks",
        description: "Equal-width tiles belong to Grid: minTileWidth sets the floor (default 240), columns caps the desktop count, and the measured container decides how many fit, exactly like the auto-fit demo below. Content-sized rows that should stack at narrow widths belong to Row stacks (a toolbar, a label beside its actions); when stacked, the Row is the Column with the same props.",
        render: () => (<ResponsiveLayoutDemo />),
      },
      {
        title: "What's behind the scenes",
        description: "Specific responsive treatments worth noting beyond just stacking grids.",
        render: () => (<Notes items={[["DataTable", "Measures its own container. Narrow tables pan or use the chosen stacked treatment."], ["Navbar", "Its links collapse into the platform menu when its own container narrows."], ["Overlays", "Anchored cards clamp their position and width inside their overlay outlet."], ["Calendar", "Month cells respond to available space without a window breakpoint."], ["Density", "compact and comfortable are independent of viewport size."], ["Narrow modes", "Sidebar and FilterPanel can become drawers; Steps stacks and responsive vertical Tabs use their own narrow treatments."]]} />),
      },
      {
        title: "Try it yourself",
        render: () => (<Card><Typography small>Resize the preview and edit a field. Grid tiles reflow and Row stacks changes arrangement while the same controls remain mounted, preserving values and selection.</Typography></Card>),
      },
    ],
  },
];

export function getPattern(slug: string): PatternDoc | undefined {
  return PATTERNS.find((p) => p.slug === slug);
}

export function getAllPatterns(): PatternDoc[] {
  return PATTERNS;
}
