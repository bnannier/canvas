import { Column, Row, Typography, Badge, DataTable } from "@nannier/canvas";
import type { PropGroup } from "../core/scope";

// The generated prop tables for a component page. Data comes from
// each component's generated docs module (extracted from its `*Props` interface by
// tools/docgen/extract-props.ts). Rendered with the kit's own DataTable, so the
// docs dogfood the component they document.
//
// Layout: two columns rather than four. The prop name and its type stack in the
// first cell (name in monospace, the required ones flagged; type on the line
// below), and the description fills the second. That reads far better on a phone
// than four thin columns of wrapped text, and keeps long union types from
// squeezing the description to nothing. On a phone-width page the table
// `stacks`: each prop's name and type lead its row and the description runs
// under them at the table's full width, instead of beside them in half of it
// (and instead of iOS's first-column-only table, which would drop it).

function PropRowName({ name, type, required }: { name: string; type: string; required: boolean }) {
  return (
    <Column tight>
      <Row snug alignCenter wrap>
        <Typography mono semibold>{name}</Typography>
        {required ? <Badge outline mono>required</Badge> : null}
      </Row>
      <Typography mono subtle>{type}</Typography>
    </Column>
  );
}

function GroupTable({ group }: { group: PropGroup }) {
  return (
      <DataTable
        bordered
        striped
        compact
        stacks
        testID="prop-table"
        columns={["Prop", "Description"]}
        rows={group.props.map((p) => [
          <PropRowName name={p.name} type={p.type} required={p.required} />,
          p.description ? (
            <Typography small>{p.description}</Typography>
          ) : (
            <Typography small muted>—</Typography>
          ),
        ])}
      />
  );
}

export function PropTables({ groups }: { groups: PropGroup[] }) {
  const multi = groups.length > 1;
  return (
    <Column relaxed>
      <Typography h2>Props</Typography>
      {groups.map((g) => (
        <Column key={g.name} snug>
          {/* Only label each table when a component has more than one prop group
              (e.g. Avatar + AvatarGroup); a single group needs no sub-heading. */}
          {multi ? (
            <Typography h3>{g.name.replace(/Props$/, "")}</Typography>
          ) : null}
          <GroupTable group={g} />
        </Column>
      ))}
    </Column>
  );
}
