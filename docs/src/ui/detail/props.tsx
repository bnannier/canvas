import { useState, type ReactNode, type Ref } from "react";
import { View, Typography, Badge, Button, DataTable, Alert, Collapsible, Icon, widths, type DataTableColumn, type DataTableGroup } from "@nannier/canvas";
import type { PropDoc, PropGroup } from "../../core/scope";
import { INHERITED_PROPS } from "../../core/examples/inherited-props";
import { InlineMarkdown } from "../prose";
import { DetailSection } from "./frame";

// The detail page's Props (Component.dc.html `#cv-props`): one table of the component's
// own props interface, banded by the `//` axis headers its source declares (a pick-one
// axis marked), cut after 28 rows behind a "Show all" toggle; the shared interfaces it
// inherits as callouts under it; and a sub-component's props in a collapsible of its own.

/** The hand-off's column weights: `minmax(150px,1fr) minmax(150px,1.2fr) 100px minmax(220px,2.2fr)`. */
const COLUMNS: DataTableColumn[] = [
  { label: "Prop", grow: 1, minWidth: 150 },
  { label: "Type", grow: 1.2, minWidth: 150 },
  { label: "Default", width: 100 },
  { label: "Description", grow: 2.2, minWidth: 220 },
];

/** The rows the table shows before "Show all". */
const ROW_LIMIT = 28;

/** A default worth printing: a short literal, not an expression (the hand-off's `realDef`). */
function defaultOf(p: PropDoc): string {
  const d = p.default;
  if (d != null && !/^[{[<(]/.test(d) && !/props\.|=>|\|\||&&/.test(d) && d.length < 28) return d;
  return p.type === "boolean" ? "false" : "–";
}

/**
 * A prop's own description: the extractor gives a member of an axis the axis's `//` header
 * when it has no doc comment of its own, which the band already says, so it reads as none.
 */
function descriptionOf(p: PropDoc, group: PropGroup): string {
  const axis = p.group == null ? undefined : group.groups[p.group];
  if (axis && (p.description.startsWith(`${axis.title} (`) || p.description === axis.title || p.description === axis.note)) return "";
  return p.description;
}

function row(p: PropDoc, group: PropGroup): ReactNode[] {
  const description = descriptionOf(p, group);
  return [
    <Typography small mono medium primary>
      {p.name}
      {p.required ? <Typography small mono destructive> *</Typography> : null}
    </Typography>,
    <Typography caption mono subtle>{p.type.length > 140 ? `${p.type.slice(0, 140)}…` : p.type}</Typography>,
    <Typography caption mono muted>{defaultOf(p)}</Typography>,
    description ? <Typography small subtle><InlineMarkdown text={description} small subtle /></Typography> : null,
  ];
}

/** A group's props banded by axis, ungrouped props first under "Props", up to `limit` rows. */
function bands(group: PropGroup, limit: number): { bands: DataTableGroup[]; total: number } {
  const byAxis = new Map<number, PropDoc[]>();
  for (const p of group.props) {
    if (/^testOnly/.test(p.name)) continue;
    const axis = p.group ?? -1;
    byAxis.set(axis, [...(byAxis.get(axis) ?? []), p]);
  }
  let left = limit;
  let total = 0;
  const out: DataTableGroup[] = [];
  for (const axis of [...byAxis.keys()].sort((a, b) => a - b)) {
    const all = byAxis.get(axis)!;
    total += all.length;
    const take = all.slice(0, Math.max(0, left));
    left -= take.length;
    if (take.length === 0) continue;
    const meta = axis < 0 ? undefined : group.groups[axis];
    out.push({
      label: meta ? meta.title : "Props",
      adornment: meta?.pickOne ? <Badge mono small>pick one</Badge> : undefined,
      count: `${all.length} ${all.length === 1 ? "prop" : "props"}`,
      rows: take.map((p) => row(p, group)),
    });
  }
  return { bands: out, total };
}

/**
 * The hand-off's props table (Component.dc.html lines 233-241): the page's eyebrow header
 * (`eyebrowHeader`), every cell at the top of its row (`alignTop`) and, when the table is
 * cut, the show-all row inside the frame (`footer`).
 */
function PropTable({ group, limit = Infinity, footer }: { group: PropGroup; limit?: number; footer?: ReactNode }) {
  const { bands: groups } = bands(group, limit);
  return <DataTable testID="prop-table" bordered compact eyebrowHeader alignTop columns={COLUMNS} rows={[]} groups={groups} stacks stackBreakpoint="md" footer={footer} />;
}

/** What an inherited interface adds, by its members (the measure steps, the series props). */
function inheritedNote(name: string): string {
  const inherited = INHERITED_PROPS[name];
  if (!inherited) return "Shared props defined elsewhere in the kit.";
  // A measure step names its width on the kit's scale (MeasureProps).
  const scale = widths as Readonly<Record<string, number>>;
  return inherited.props.map((p) => (scale[p.name] ? `${p.name} ${scale[p.name]}` : p.name)).join(" · ");
}

/**
 * The Props section. `propsInterface` names the component's own interface (the detail
 * spec's), whose table leads; the docs module may list a sub-component's group before it
 * (Avatar's AvatarMenuProps), and every other group is a sub-component's collapsible.
 */
export function PropsSection({ groups, propsInterface, sectionRef }: { groups: readonly PropGroup[]; propsInterface: string; sectionRef?: Ref<View> }) {
  const [all, setAll] = useState(false);
  const main = groups.find((group) => group.name === propsInterface) ?? groups[0];
  if (!main) return null;
  const total = main.props.filter((p) => !/^testOnly/.test(p.name)).length;
  const subs = groups.filter((group) => group !== main);
  return (
    <DetailSection
      id="props"
      title="Props"
      note={`${total} props on ${main.name}, grouped as they are declared in source. Required props are marked *.`}
      sectionRef={sectionRef}
    >
      <PropTable
        group={main}
        limit={all ? Infinity : ROW_LIMIT}
        // The hand-off's `morePropsLabel` (Component.dc.html line 415):
        // `s.allProps?'Show fewer':'Show all '+total+' props'`.
        footer={total > ROW_LIMIT ? <Button link small onPress={() => setAll(!all)}>{all ? "Show fewer" : `Show all ${total} props`}</Button> : undefined}
      />
      {main.inherits.map((heritage) => {
        const name = heritage.match(/\w+Props/)?.[0] ?? heritage;
        return <Alert key={heritage} icon={<Icon layers primary size={16} decorative />} title={heritage} description={inheritedNote(name)} />;
      })}
      {subs.map((sub) => (
        <Collapsible key={sub.name} card title={sub.name} description={`${sub.props.length} props`}>
          <PropTable group={sub} />
        </Collapsible>
      ))}
    </DetailSection>
  );
}
