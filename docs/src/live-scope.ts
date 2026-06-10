import {
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  ScrollView,
  ActionPanel,
  Alert,
  AlertDialog,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardSeparator,
  CardTitle,
  Chart,
  Checkbox,
  CodeBlock,
  Combobox,
  Command,
  DataTable,
  DescriptionList,
  Dialog,
  Divider,
  Dropdown,
  EmptyState,
  Feed,
  Field,
  Fieldset,
  FilterPanel,
  Form,
  GridList,
  Icon,
  Input,
  Kbd,
  Listbox,
  MediaObject,
  Navbar,
  Overlay,
  Pagination,
  Popover,
  Radio,
  RowMenu,
  Select,
  Sidebar,
  Skeleton,
  Spinner,
  StackedList,
  Stats,
  Stepper,
  Switch,
  Tabs,
  Textarea,
  Tooltip,
  Typography,
} from "@olympusoss/canvas";

// Platform skins, imported by LITERAL path so Vite loads the real `.ios`/`.android`
// files (a bare/barrel import would only ever resolve the web file). This is how the
// docs preview every platform without the UI kit doing anything for the docs. The
// base `Switch` above (from the barrel) is the web skin.
import { Switch as SwitchIOS } from "../../src/atoms/switch/switch.ios.js";
import { Switch as SwitchAndroid } from "../../src/atoms/switch/switch.android.js";

// Style helpers an example fence can reference when it styles a raw View/Text.
// These model how a real consumer builds RN styles: `tokens` (the active,
// theme-aware color set, injected live by <LiveExample>), `alpha`/`shadow`
// helpers, and the `palette` of fixed Tailwind hues. Imported from src/style so
// they're available regardless of what the package barrel currently re-exports.
import { alpha, shadow, palette } from "../../src/style/index.js";

// The names a component `.md` example fence may reference as a JSX tag, mapped to
// the real Canvas components. This is the eval scope for <LiveExample>: the live
// JSX renderer transpiles each ```tsx fence and evaluates it with these names in
// scope, so a tag like <Avatar/> or a layout <View>/<Text> resolves to the real
// component. Every JSX tag used across the component docs must appear here. The
// values are opaque to the type system (handed to a runtime evaluator), hence
// `unknown`.
export const LIVE_SCOPE: Record<string, unknown> = {
  // Theme/style helpers for example fences that style a raw View/Text. `tokens`
  // is a placeholder here; <LiveExample> swaps in the live, theme-aware value
  // (so token colors follow the docs light/dark + glass toggles).
  tokens: {},
  alpha,
  shadow,
  palette,
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  ScrollView,
  ActionPanel,
  Alert,
  AlertDialog,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardSeparator,
  CardTitle,
  Chart,
  Checkbox,
  CodeBlock,
  Combobox,
  Command,
  DataTable,
  DescriptionList,
  Dialog,
  Divider,
  Dropdown,
  EmptyState,
  Feed,
  Field,
  Fieldset,
  FilterPanel,
  Form,
  GridList,
  Icon,
  Input,
  Kbd,
  Listbox,
  MediaObject,
  Navbar,
  Overlay,
  Pagination,
  Popover,
  Radio,
  RowMenu,
  Select,
  Sidebar,
  Skeleton,
  Spinner,
  StackedList,
  Stats,
  Stepper,
  Switch,
  Tabs,
  Textarea,
  Tooltip,
  Typography,
};

// The same scope keyed by docs preview platform: web is the base, iOS/Android swap in
// the per-platform skins. <LiveExample> evaluates each fence against the active
// platform's values (the keys, i.e. tag names, are identical, so the compiled factory
// is shared). Add a key here whenever an atom gains a platform skin.
export const SCOPE_BY_PLATFORM: Record<"web" | "ios" | "android", Record<string, unknown>> = {
  web: LIVE_SCOPE,
  ios: { ...LIVE_SCOPE, Switch: SwitchIOS },
  android: { ...LIVE_SCOPE, Switch: SwitchAndroid },
};
