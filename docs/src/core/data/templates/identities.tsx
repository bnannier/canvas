import { useState } from "react";
import type { TemplateDoc, TemplateScreenProps } from "../template-types";

// The hand-off's Identities (`Canvas v4.0.0 Templates.dc.html`, `t.identities`): the
// heading with Add identity, the search and filter toolbar whose count gives way to the
// bulk actions once rows are selected, and the selectable identity table with its pager.
// Every part is a kit component from the frame's scope.

type Status = "Active" | "Invited" | "Locked";

interface Identity {
  name: string;
  email: string;
  photo?: string;
  role: string;
  status: Status;
  seen: string;
}

const IDENTITIES: Identity[] = [
  { name: "Ada Lovelace", email: "ada@ionize.io", photo: "/ada-lovelace.jpg", role: "Owner", status: "Active", seen: "2m ago" },
  { name: "Grace Hopper", email: "grace@ionize.io", photo: "/grace-hopper.jpg", role: "Admin", status: "Active", seen: "1h ago" },
  { name: "Kira Tanaka", email: "kira@ionize.io", photo: "/kira-tanaka.jpg", role: "Editor", status: "Invited", seen: "-" },
  { name: "Noor Park", email: "noor@ionize.io", photo: "/noor-park.jpg", role: "Editor", status: "Active", seen: "3h ago" },
  { name: "Marcus Allen", email: "marcus@ionize.io", photo: "/marcus-allen.jpg", role: "Viewer", status: "Locked", seen: "6d ago" },
  { name: "Liang Bao", email: "liang@ionize.io", photo: "/liang-bao.jpg", role: "Admin", status: "Active", seen: "yesterday" },
];

const STATUS_TONE: Record<Status, "success" | "info" | "error"> = { Active: "success", Invited: "info", Locked: "error" };
const STATUS_FILTERS = ["Status: All", "Active", "Invited", "Locked"];
const ROLE_FILTERS = ["Role: All", "Owner", "Admin", "Editor", "Viewer"];

function IdentitiesScreen({ K, phone }: TemplateScreenProps) {
  const { Row, Column, Card, Typography, Button, Icon, Input, Select, Avatar, Badge, DataTable, Divider, View, useMeasuredWidth, useToast } = K;
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(STATUS_FILTERS[0]!);
  const [roleFilter, setRoleFilter] = useState(ROLE_FILTERS[0]!);
  const [added, setAdded] = useState(0);
  const [selected, setSelected] = useState<Array<string | number>>([]);

  const all: Identity[] = [
    ...IDENTITIES,
    ...Array.from({ length: added }, (_, i): Identity => ({ name: `New identity ${i + 1}`, email: `new${i + 1}@ionize.io`, role: "Viewer", status: "Invited", seen: "-" })),
  ];
  const q = query.trim().toLowerCase();
  const rows = all.filter((r) =>
    (!q || `${r.name}${r.email}${r.role}`.toLowerCase().includes(q))
    && (status === STATUS_FILTERS[0] || r.status === status)
    && (roleFilter === ROLE_FILTERS[0] || r.role === roleFilter));
  const count = selected.length;
  const { width, onLayout } = useMeasuredWidth();
  // Below 600 each row is the identity with its status at the trailing edge, as the
  // hand-off's phone draws it. It is one column, so it reads the same where the iOS
  // table collapses to its primary column.
  const wide = width === 0 || width >= 600;
  const identity = (r: Identity) => (
    <Row snug alignCenter>
      <Avatar small src={r.photo} name={r.name} />
      <Column fill>
        <Typography small medium numberOfLines={1}>{r.name}</Typography>
        <Typography caption subtle numberOfLines={1}>{r.email}</Typography>
      </Column>
      {wide ? null : statusBadge(r)}
    </Row>
  );
  const statusBadge = (r: Identity) => <Badge soft {...{ [STATUS_TONE[r.status]]: true }}>{r.status}</Badge>;

  return (
    <Column airy>
      <Row between alignEnd wrap cozy>
        {phone ? null : (
          <Column tight>
            <Typography h3 level={2}>Identities</Typography>
            <Typography small subtle>People and service accounts that can sign in.</Typography>
          </Column>
        )}
        <Button primary raised iconLeft={<Icon userPlus decorative />} onPress={() => { setAdded((n) => n + 1); toast({ message: "Identity added" }); }}>Add identity</Button>
      </Row>
      <Row stacks snug alignCenter>
        <Column fill>
          <Input leadingIcon icon="search" placeholder="Search name, email or role" accessibilityLabel="Search identities" value={query} onChangeText={setQuery} />
        </Column>
        <Row snug alignCenter>
          <Column>
            <Select accessibilityLabel="Status" options={STATUS_FILTERS} value={status} onSelect={setStatus} />
          </Column>
          <Column>
            <Select accessibilityLabel="Role" options={ROLE_FILTERS} value={roleFilter} onSelect={setRoleFilter} />
          </Column>
          {count === 0 ? (
            <Typography caption mono subtle>{`${rows.length} identities`}</Typography>
          ) : (
            <Row tight alignCenter>
              <Typography caption mono primary>{`${count} selected`}</Typography>
              <Button destructive outline small onPress={() => { setSelected([]); toast({ message: `${count} identities locked` }); }}>Lock</Button>
              <Button ghost small onPress={() => setSelected([])}>Clear</Button>
            </Row>
          )}
        </Row>
      </Row>
      <View onLayout={onLayout}>
        <Card flush clip>
          <DataTable
            attached
            selectable
            selectedKeys={selected}
            onSelectionChange={setSelected}
            rowKey={(_, index) => rows[index]?.email ?? index}
            emptyMessage={`No identities match “${query}”.`}
            columns={wide ? [
              { label: "Identity", grow: 2 },
              "Role",
              { label: "Status", width: 100 },
              { label: "Last seen", width: 110 },
            ] : [{ label: "Identity", grow: 1 }]}
            rows={rows.map((r) => wide
              ? [identity(r), r.role, statusBadge(r), <Typography key="seen" caption mono subtle>{r.seen}</Typography>]
              : [identity(r)])}
          />
          <Divider />
          <Column pad>
            <Row between alignCenter>
              <Typography small subtle>Page 1 of 4</Typography>
              <Row tight>
                <Button outline mediumIcon disabled accessibilityLabel="Previous page" iconLeft={<Icon chevronLeft decorative />} />
                <Button outline mediumIcon accessibilityLabel="Next page" iconLeft={<Icon chevronRight decorative />} onPress={() => toast({ message: "Page 2 of 4" })} />
              </Row>
            </Row>
          </Column>
        </Card>
      </View>
    </Column>
  );
}

export const IDENTITIES_TEMPLATE: TemplateDoc = {
  slug: "identities",
  name: "Identities",
  group: "App",
  icon: "users",
  description: "Searchable identity table. Selecting rows swaps the toolbar count for bulk actions.",
  path: "identities",
  app: true,
  Screen: IdentitiesScreen,
};
