import { createElement, type ComponentType, type ReactNode } from "react";
import { isElLike, type ElChild } from "@/jsx-code";
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
import { registryProps, type DemoApi } from "./registry-props";
export type { DemoApi };

// Maps a component slug to the real Canvas component and how to derive its props
// from the playground state. The playground renders `<Component {...mapProps()}>`
// and serializes that SAME props object into the code panel (see jsx-code.ts), so
// the shown code always matches the render. `name` is the JSX tag used in the
// serialized code. Unregistered slugs fall back to the legacy HTML-string render.
// A small controller the playground passes to mapProps/treeFn so a preview can
// wire demo-only handlers (toggle state, open overlays, flash feedback). These
// are function-valued props, which jsx-code.ts strips from the code panel, so
// demo wiring never changes the shown code.

export interface RegistryEntry {
  name: string;
  Component: ComponentType<Record<string, unknown>>;
  mapProps: (state: Record<string, unknown>, demo?: DemoApi) => Record<string, unknown>;
}

type AnyComponent = ComponentType<Record<string, unknown>>;

// Components a composite `tree` may reference by name. Layout containers are
// View/Text from the engine; the rest are real Canvas components. serializeTree
// (jsx-code.ts) emits these same names, so preview and code stay identical.
const COMPONENT_MAP: Record<string, AnyComponent> = {
  View: View as AnyComponent,
  Text: Text as AnyComponent,
  Pressable: Pressable as AnyComponent,
  Image: Image as AnyComponent,
  TextInput: TextInput as AnyComponent,
  ScrollView: ScrollView as AnyComponent,
  ActionPanel: ActionPanel as AnyComponent,
  Alert: Alert as AnyComponent,
  AlertDialog: AlertDialog as AnyComponent,
  Avatar: Avatar as AnyComponent,
  Badge: Badge as AnyComponent,
  Breadcrumb: Breadcrumb as AnyComponent,
  Button: Button as AnyComponent,
  ButtonGroup: ButtonGroup as AnyComponent,
  Calendar: Calendar as AnyComponent,
  Card: Card as AnyComponent,
  CardContent: CardContent as AnyComponent,
  CardDescription: CardDescription as AnyComponent,
  CardFooter: CardFooter as AnyComponent,
  CardHeader: CardHeader as AnyComponent,
  CardSeparator: CardSeparator as AnyComponent,
  CardTitle: CardTitle as AnyComponent,
  Chart: Chart as AnyComponent,
  Checkbox: Checkbox as AnyComponent,
  CodeBlock: CodeBlock as AnyComponent,
  Combobox: Combobox as AnyComponent,
  Command: Command as AnyComponent,
  DataTable: DataTable as AnyComponent,
  DescriptionList: DescriptionList as AnyComponent,
  Dialog: Dialog as AnyComponent,
  Divider: Divider as AnyComponent,
  Dropdown: Dropdown as AnyComponent,
  EmptyState: EmptyState as AnyComponent,
  Feed: Feed as AnyComponent,
  Field: Field as AnyComponent,
  Fieldset: Fieldset as AnyComponent,
  FilterPanel: FilterPanel as AnyComponent,
  Form: Form as AnyComponent,
  GridList: GridList as AnyComponent,
  Icon: Icon as AnyComponent,
  Input: Input as AnyComponent,
  Kbd: Kbd as AnyComponent,
  Listbox: Listbox as AnyComponent,
  MediaObject: MediaObject as AnyComponent,
  Navbar: Navbar as AnyComponent,
  Overlay: Overlay as AnyComponent,
  Pagination: Pagination as AnyComponent,
  Popover: Popover as AnyComponent,
  Radio: Radio as AnyComponent,
  RowMenu: RowMenu as AnyComponent,
  Select: Select as AnyComponent,
  Sidebar: Sidebar as AnyComponent,
  Skeleton: Skeleton as AnyComponent,
  Spinner: Spinner as AnyComponent,
  StackedList: StackedList as AnyComponent,
  Stats: Stats as AnyComponent,
  Stepper: Stepper as AnyComponent,
  Switch: Switch as AnyComponent,
  Tabs: Tabs as AnyComponent,
  Textarea: Textarea as AnyComponent,
  Tooltip: Tooltip as AnyComponent,
  Typography: Typography as AnyComponent,
};

/** Render a composite element tree (a registry entry's `tree`) into React
 *  elements via COMPONENT_MAP. Strings/numbers pass through as text nodes. */
export function renderTree(node: ElChild, key?: number): ReactNode {
  if (typeof node === "string" || typeof node === "number") return node;
  const Comp = COMPONENT_MAP[node.type];
  if (!Comp) {
    if (typeof console !== "undefined") console.warn(`renderTree: unknown component "${node.type}"`);
    return null;
  }
  const kids =
    node.children == null
      ? undefined
      : Array.isArray(node.children)
        ? node.children.map((c, i) => renderTree(c, i))
        : renderTree(node.children, 0);
  // Element-valued props are slots (e.g. action={<Button/>}); render them too.
  const props: Record<string, unknown> = { key };
  if (node.props) {
    for (const [k, v] of Object.entries(node.props)) props[k] = isElLike(v) ? renderTree(v) : v;
  }
  return createElement(Comp, props, kids);
}


/** The live registry: each pure prop-mapper paired with its real Component,
 *  looked up by name from COMPONENT_MAP. */
export const registry: Record<string, RegistryEntry> = Object.fromEntries(
  Object.entries(registryProps).map(([slug, { name, mapProps }]) => [
    slug,
    { name, Component: COMPONENT_MAP[name], mapProps },
  ]),
);
