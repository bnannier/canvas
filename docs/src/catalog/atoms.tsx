import { useState } from "react";
import {
  Autocomplete, Avatar, AvatarGroup, Badge, BadgeGroup, Breadcrumb, Button, ButtonGroup,
  Checkbox, Chip, Column, Divider, Dropdown, Icon, Image, Input, Pagination, Pressable, Radio,
  RadioGroup, Row, ScrollView, Select, Skeleton, Switch, Text, Textarea,
  Tooltip, Typography, Video, View, useToast,
} from "@nannier/canvas";
import type { CatTile } from "./tile";

function ViewPreview() { return <View><Typography>A View holds this content.</Typography></View>; }
function TextPreview() { return <Typography><Text>The quick brown fox jumps over the lazy dog.</Text></Typography>; }
function PressablePreview() {
  const [count, setCount] = useState(0);
  return <Pressable accessibilityRole="button" accessibilityLabel={`Press me, ${count} presses`} onPress={() => setCount(count + 1)}><Typography underline>Press me · {count}</Typography></Pressable>;
}
function ImagePreview() { return <Image source={require("../../public/kira-tanaka.jpg")} width={120} height={120} accessibilityLabel="Kira Tanaka" />; }
function VideoPreview() { return <Video source={require("../../public/video-sample.mp4")} poster={require("../../public/video-sample.jpg")} controls accessibilityLabel="Sample clip" />; }
// A filter bar wider than its tile. ScrollView is React Native's own primitive, with no
// keyboard stop of its own, so what it scrolls has to be reachable: every chip is a real
// toggle, Tab walks onto the ones scrolled out of view, and the browser scrolls each one
// in as it takes focus. Static labels here would leave the overflow out of keyboard reach.
const SCROLL_FILTERS = ["Projects", "People", "Activity", "Settings", "Reports", "Billing", "Security"];
function ScrollViewPreview() {
  return <ScrollView horizontal><Row cozy>{SCROLL_FILTERS.map((label, i) => <Chip key={label} selectable defaultSelected={i === 0}>{label}</Chip>)}</Row></ScrollView>;
}
function AvatarsPreview() { return <AvatarGroup max={3}><Avatar name="Ada Lovelace" /><Avatar name="Grace Hopper" /><Avatar name="Rachel Chen" /><Avatar name="Liang Bao" /></AvatarGroup>; }
function BadgesPreview() { return <BadgeGroup><Badge default>Admin</Badge><Badge secondary>Tag</Badge><Badge status success>Active</Badge><Badge status warning>Pending</Badge></BadgeGroup>; }
function BreadcrumbsPreview() {
  const { toast } = useToast();
  return <Breadcrumb items={["Projects", "Identity", "Profile"]} onItemPress={(label) => toast({ message: `${label} selected` })} />;
}
function ButtonGroupsPreview() { return <ButtonGroup items={["Day", "Week", "Month"]} />; }
function ButtonsPreview() {
  const { toast } = useToast();
  return <Row snug wrap><Button primary onPress={() => toast({ success: true, message: "Changes saved" })}>Save</Button><Button outline onPress={() => toast({ message: "Changes discarded" })}>Cancel</Button></Row>;
}
function CheckboxesPreview() { return <Column snug><Checkbox defaultChecked description="Get updates about your projects.">Email notifications</Checkbox><Checkbox>Weekly digest</Checkbox></Column>; }
function AutocompletePreview() { return <Autocomplete label="Assigned to" placeholder="Search a person…" options={["Ada Lovelace", "Grace Hopper", "Kira Tanaka", "Liang Bao"]} />; }
function DividersPreview() { return <Column snug><Typography small>Profile</Typography><Divider /><Typography small>Account</Typography></Column>; }
function DropdownsPreview() {
  const { toast } = useToast();
  return <Dropdown trigger="Actions" items={[{ label: "Edit profile" }, { label: "Duplicate" }, { label: "Settings" }]} onSelect={(item) => toast({ message: item.label })} />;
}
function IconsPreview() { return <Row relaxed><Icon home /><Icon users /><Icon settings /><Icon search /></Row>; }
function InputsFormsPreview() { return <Input label="Email" placeholder="you@example.com" />; }
function PaginationPreview() { return <Pagination defaultPage={2} total={5} />; }
function RadiosPreview() { return <RadioGroup defaultValue="pro"><Radio value="hobby">Hobby</Radio><Radio value="pro" description="For growing teams.">Pro</Radio></RadioGroup>; }
function SelectsPreview() { return <Select label="Country" defaultValue="Canada" options={["United States", "Canada", "Mexico"]} />; }
function SkeletonsPreview() { return <Skeleton list animate accessibilityLabel="Loading people" />; }
function TextareasPreview() { return <Textarea label="Description" placeholder="Tell us about your project…" rows={3} />; }
function SwitchPreview() { return <Switch defaultChecked description="Show your availability to teammates.">Available to chat</Switch>; }
function TooltipsPreview() { return <Tooltip label="Open workspace settings" trigger="Settings" />; }

export const ATOMS_TILES: CatTile[] = [
  { title: "View", href: "/components/view", Preview: ViewPreview },
  { title: "Text", href: "/components/text", Preview: TextPreview },
  { title: "Pressable", href: "/components/pressable", Preview: PressablePreview },
  { title: "Image", href: "/components/image", Preview: ImagePreview },
  { title: "ScrollView", href: "/components/scroll-view", Preview: ScrollViewPreview },
  { title: "Autocomplete", href: "/components/autocomplete", Preview: AutocompletePreview },
  { title: "Avatar", href: "/components/avatar", Preview: AvatarsPreview },
  { title: "Badge", href: "/components/badge", Preview: BadgesPreview },
  { title: "Breadcrumb", href: "/components/breadcrumb", Preview: BreadcrumbsPreview },
  { title: "ButtonGroup", href: "/components/button-group", Preview: ButtonGroupsPreview },
  { title: "Button", href: "/components/button", Preview: ButtonsPreview },
  { title: "Checkbox", href: "/components/checkbox", Preview: CheckboxesPreview },
  { title: "Divider", href: "/components/divider", Preview: DividersPreview },
  { title: "Dropdown", href: "/components/dropdown", Preview: DropdownsPreview },
  { title: "Icon", href: "/components/icon", Preview: IconsPreview },
  { title: "Input", href: "/components/input", Preview: InputsFormsPreview },
  { title: "Pagination", href: "/components/pagination", Preview: PaginationPreview },
  { title: "Radio", href: "/components/radio", Preview: RadiosPreview },
  { title: "Select", href: "/components/select", Preview: SelectsPreview },
  { title: "Skeleton", href: "/components/skeleton", Preview: SkeletonsPreview },
  { title: "Textarea", href: "/components/textarea", Preview: TextareasPreview },
  { title: "Switch", href: "/components/switch", Preview: SwitchPreview },
  { title: "Tooltip", href: "/components/tooltip", Preview: TooltipsPreview },
  { title: "Video", href: "/components/video", Preview: VideoPreview },
];
