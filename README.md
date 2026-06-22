# @olympusoss/canvas

Universal React Native UI kit. Canvas runs natively on iOS and Android, and on
the web through React Native Web, from a single component API. Components are
styled with semantic boolean props and authored desktop-first, so they adapt
cleanly from large desktop down to phone.

## Install

```bash
npm install @olympusoss/canvas
```

Canvas relies on three peer dependencies that you install alongside it:

```bash
npm install react react-native react-native-svg
```

For web rendering, add `react-native-web` to your app and alias `react-native`
to `react-native-web` in your bundler, the same way any React Native Web project
does.

## Quick Start

Wrap your app in the `ThemeProvider`, then compose components imported
from `@olympusoss/canvas`. The provider supplies the active color scheme and
token map; omit `scheme` to follow the OS appearance, or force it with
`scheme="light"` / `scheme="dark"`.

```jsx
import { ThemeProvider, Card, CardHeader, CardTitle, CardContent, Button } from "@olympusoss/canvas";

export default function App() {
  return (
    <ThemeProvider>
      <Card padded>
        <CardHeader>
          <CardTitle>Welcome to Canvas</CardTitle>
        </CardHeader>
        <CardContent>
          <Button primary large onPress={() => console.log("saved")}>
            Save
          </Button>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}
```

The same component tree renders natively on iOS and Android and, through React
Native Web, in the browser. There is no separate web component set to learn.

## Semantic boolean props

Styling is done with flat boolean props. Each style choice is its own prop,
named for the meaning it carries, and passing the prop turns it on. The prop
name is the value, so the call site reads like natural language ("a primary,
large button").

```jsx
<Button primary large>Save</Button>
<Button destructive>Delete</Button>
<Button ghost small>Cancel</Button>
<Card raised>...</Card>
```

Props are grouped into orthogonal axes (intent, size, density, and stacking
state/layout flags). Props on different axes combine freely; props within one
axis are mutually exclusive, so you pass at most one and the component resolves
any conflict by a fixed precedence. Glass is the one exception: it is a
theme-level surface mode, not a per-component prop, set once via
`<ThemeProvider surface="glass">` (it defaults to real Liquid Glass on iOS 26+
and solid elsewhere).

```jsx
// Four props from four axes, all applied together.
<Button primary large loading block>Save</Button>
```

String-valued enum props such as `variant="primary"`, `size="lg"`, or
`tone="destructive"` are not part of the API and are not accepted. The boolean
form is the only styling surface.

## Theming

`ThemeProvider` reads the OS color scheme by default and exposes the resolved
tokens to every Canvas component through `useTheme`. Force a scheme when you
need to:

```jsx
<ThemeProvider scheme="dark">
  <App />
</ThemeProvider>
```

## What's Included

- A comprehensive component kit (60+ components across atoms, molecules, and
  organisms), all exported from `@olympusoss/canvas`:
  - **Forms & inputs**: Button, Button Group, Input, Textarea, Checkbox, Radio,
    Switch, Slider, Number Input, Input OTP, Select, Combobox, Listbox.
  - **Overlays**: Dialog, Alert Dialog, Drawer, Popover, Tooltip, Dropdown,
    Action Sheet, Toast, Command palette.
  - **Navigation**: Tabs, Tab Bar, Navbars, Sidebar, Breadcrumb, Pagination,
    Stepper.
  - **Data & content**: Data Table, Stacked / Grid Lists, Stats, Calendar,
    Charts, Card, Avatar, Badge, Description Lists, Media Objects, QR Code.
  - **Disclosure & feedback**: Accordion, Collapsible, Carousel, Progress,
    Skeleton, Spinner, Alert, Empty State.
- **Universal by construction**: one codebase renders natively on iOS and
  Android and on the web through React Native Web; no web-only escape hatches.
- **Accessibility built in**: every interactive component exposes its role and
  state (selected / checked / expanded, slider and progress values) to assistive
  tech on iOS, Android, and the web, via `aria-*` aliases that survive react-native-web.
  The kit also honors the OS **Reduce Motion** setting (`useReducedMotion`).
- **Liquid Glass**: real iOS 26 Liquid Glass for the functional layer (overlays
  and bars), a genuine cross-platform frost elsewhere, and a solid fallback,
  routed through one `GlassSurface` primitive.
- The style foundation: design tokens, the theme runtime (`ThemeProvider`,
  `useTheme`), the `useResponsive` / `shadow` / `alpha` helpers, and the raw React
  Native `View` / `Text` / `Pressable` / `Image` / `TextInput` / `ScrollView` primitives.
- Light and dark color schemes resolved through theme tokens, with desktop-first
  responsiveness built into every component.

## License

proprietary
