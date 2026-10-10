// A model of the accessible names React Native's Android accessibility delegate makes up
// for views nobody named, read off a tree rendered under react-native-web.
//
// The rule (react-native 0.86, ReactAndroid/.../uimanager/ReactAccessibilityDelegate.kt):
// onInitializeAccessibilityNodeInfo gives a view that has no text and no content
// description a synthesized one whenever the view carries an accessibility role, state,
// actions or labelledBy ("hasContentToAnnounce"), and getTalkbackDescription builds it as
// the comma-joined descriptions of the view's speaking children that cannot take
// accessibility focus themselves: a child's own label, a Text's text, or, for a plain
// container, the same description of its own children. uiautomator reports that as the
// node's content-desc, and TalkBack speaks it.
//
// The two facts the model leans on, from react-native's own source:
//   - Pressable ALWAYS passes its View an accessibilityState
//     (Libraries/Components/Pressable/Pressable.js, `_accessibilityState`), with every
//     field undefined when nothing is set; JSI drops the undefined fields, so the native
//     view still receives an (empty) state map and BaseViewManager.setViewState tags it.
//     A Pressable is therefore always "content to announce" on Android, accessible or not.
//   - A View receives an accessibilityState only when it is given one, directly or through
//     an aria-busy/checked/disabled/expanded/selected prop (Libraries/Components/View/View.js).
//
// The tree is read from React's fibers (as test/qrcode.test.tsx reads QRCode's renderer),
// at the level of React Native's own components: every kit primitive renders RN's View,
// Text, TextInput or Pressable, and those are the native views on a device. A Pressable
// and the View it renders are one native view.

import { Pressable, Text, TextInput, View } from "react-native";

type Fiber = {
  elementType: unknown;
  tag: number;
  stateNode: unknown;
  memoizedProps: Record<string, unknown> | null;
  child: Fiber | null;
  sibling: Fiber | null;
};

type Kind = "view" | "pressable" | "text" | "input";

/** One native view of the model. */
export interface AxNode {
  kind: Kind;
  props: Record<string, unknown>;
  children: AxNode[];
  /** A Text's text. */
  text?: string;
}

// The ARIA roles Android maps to an AccessibilityRole (ReactAccessibilityDelegate.kt,
// AccessibilityRole.fromRole); any other `role` (dialog, navigation, group, listbox...)
// maps to none, and a `role` wins over `accessibilityRole` (fromViewTag).
const MAPPED_ROLES = new Set([
  "alert", "button", "checkbox", "combobox", "grid", "heading", "img", "link", "list", "menu", "menubar",
  "menuitem", "none", "progressbar", "radio", "radiogroup", "scrollbar", "searchbox", "slider", "spinbutton",
  "summary", "switch", "tab", "tablist", "timer", "toolbar",
]);
const ARIA_STATE = ["aria-busy", "aria-checked", "aria-disabled", "aria-expanded", "aria-selected"];

function kindOf(fiber: Fiber): Kind | null {
  if (fiber.elementType === Pressable) return "pressable";
  if (fiber.elementType === View) return "view";
  if (fiber.elementType === Text) return "text";
  if (fiber.elementType === TextInput) return "input";
  return null;
}

/** The first DOM node a fiber renders. */
function hostNode(fiber: Fiber | null): Element | null {
  for (let f = fiber; f; f = f.child) if (f.tag === 5) return f.stateNode as Element;
  return null;
}

function build(fiber: Fiber | null, parent: AxNode, absorbView: boolean): void {
  for (let f = fiber; f; f = f.sibling) {
    const kind = kindOf(f);
    if (kind === "view" && absorbView) {
      // The View a Pressable renders is the Pressable's own native view.
      build(f.child, parent, false);
    } else if (kind) {
      const node: AxNode = { kind, props: f.memoizedProps ?? {}, children: [] };
      parent.children.push(node);
      if (kind === "text") node.text = hostNode(f)?.textContent ?? "";
      else build(f.child, node, kind === "pressable");
    } else {
      build(f.child, parent, absorbView);
    }
  }
}

/** The model's tree under a rendered container (portaled content, such as a Modal's, included). */
export function axTree(container: Element): AxNode {
  const key = Object.keys(container).find((k) => k.startsWith("__reactContainer$"));
  if (!key) throw new Error("no React root on the container");
  const root: AxNode = { kind: "view", props: {}, children: [] };
  build((container as unknown as Record<string, Fiber>)[key].child, root, false);
  return root;
}

const labelOf = (node: AxNode) => (node.props.accessibilityLabel ?? node.props["aria-label"]) as string | undefined;

/** Whether the view can take accessibility focus itself (it is focusable or clickable on Android). */
export function focusable(node: AxNode): boolean {
  const p = node.props;
  if (node.kind === "input") return true;
  if (node.kind === "pressable") return p.accessible !== false || (p.focusable !== false && p.tabIndex !== -1);
  if (node.kind === "text") return p.accessible === true || p.onPress != null;
  return p.accessible === true || p.focusable === true;
}

function hidden(node: AxNode): boolean {
  const p = node.props;
  return p.importantForAccessibility === "no-hide-descendants" || p["aria-hidden"] === true || (p.importantForAccessibility === "no" && node.children.length === 0);
}

/** Whether Android's delegate makes up a name for this view when it has none. */
function announces(node: AxNode): boolean {
  const p = node.props;
  if (node.kind === "pressable") return true;
  if (p.accessibilityState != null || ARIA_STATE.some((k) => p[k] != null)) return true;
  if (p.accessibilityActions != null) return true;
  if (p.accessibilityLabelledBy != null || p["aria-labelledby"] != null) return true;
  if (p.role != null) return MAPPED_ROLES.has(p.role as string);
  return p.accessibilityRole != null;
}

/** getTalkbackDescription: what the view says, from its own label or text or its children's. */
export function describe(node: AxNode): string {
  const label = labelOf(node);
  if (label) return label;
  if (node.kind === "text") return node.text ?? "";
  return node.children
    .filter((child) => !hidden(child) && !focusable(child))
    .map(describe)
    .filter(Boolean)
    .join(", ");
}

/** A view Android names from its descendants, and the name it gets. */
export interface SynthesizedName {
  node: AxNode;
  name: string;
}

/** Every view in the tree that Android gives a made-up, non-empty name. */
export function synthesizedNames(root: AxNode): SynthesizedName[] {
  const out: SynthesizedName[] = [];
  const visit = (node: AxNode) => {
    if (node.kind !== "text" && !labelOf(node) && announces(node)) {
      const name = describe(node);
      if (name) out.push({ node, name });
    }
    node.children.forEach(visit);
  };
  visit(root);
  return out;
}

/**
 * The made-up names on views that cannot take focus: containers, scrims and press areas
 * that end up announcing other nodes' text. A focusable control named after its own
 * label text (a button's title) is the delegate working as meant and is left out.
 */
export function containerNames(container: Element): { kind: Kind; role?: string; name: string }[] {
  return synthesizedNames(axTree(container))
    .filter(({ node }) => !focusable(node))
    .map(({ node, name }) => ({ kind: node.kind, role: (node.props.role ?? node.props.accessibilityRole) as string | undefined, name }));
}
