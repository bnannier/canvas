import { useState } from "react";
import { Alert, Badge, Button, Card, Column, Divider, EmptyState, Field, Grid, Input, Progress, Row, Select, Stats, Typography } from "@nannier/canvas";

type Status = "In progress" | "Ready" | "Needs attention";
type Job = { id: string; title: string; owner: string; status: Status; units: number; progress: number };
const jobs: Job[] = [
  { id: "OPS-104", title: "Prepare studio launch", owner: "Maya Chen", status: "In progress", units: 24, progress: 72 },
  { id: "OPS-103", title: "Review November shipments", owner: "Alex Morgan", status: "Needs attention", units: 18, progress: 45 },
  { id: "OPS-102", title: "Publish partner toolkit", owner: "Sam Rivera", status: "Ready", units: 12, progress: 100 },
  { id: "OPS-101", title: "Update stock forecasts", owner: "Maya Chen", status: "In progress", units: 32, progress: 61 },
];
export function useDashboard() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [refreshes, setRefreshes] = useState(0);
  const [updated, setUpdated] = useState("Not refreshed yet");
  const current = jobs.map((job, index) => index === 0 ? { ...job, progress: Math.min(100, job.progress + refreshes * 7), status: (job.progress + refreshes * 7 >= 100 ? "Ready" : job.status) as Status } : job);
  const filtered = current.filter((job) => (status === "All statuses" || job.status === status) && `${job.title} ${job.owner} ${job.id}`.toLowerCase().includes(query.trim().toLowerCase()));
  const refresh = () => { setRefreshes((value) => value + 1); setUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })); };
  const clear = () => { setQuery(""); setStatus("All statuses"); };
  return { query, setQuery, status, setStatus, refreshes, updated, filtered, refresh, clear };
}

export function Dashboard({ model }: { model: ReturnType<typeof useDashboard> }) {
  const totalUnits = model.filtered.reduce((sum, job) => sum + job.units, 0);
  const average = model.filtered.length ? Math.round(model.filtered.reduce((sum, job) => sum + job.progress, 0) / model.filtered.length) : 0;
  return <Column loose>
    <Row stacks between alignCenter loose>
      <Column snug fill><Badge primary>02 / Operations</Badge><Typography h1>A clearer workday.</Typography><Typography lead muted>Track the work moving through your studio.</Typography></Column>
      <Button primary onPress={model.refresh}>Refresh sample data</Button>
    </Row>
    <Alert info title="Local operations demo" description={`Refresh advances the studio launch by seven points. No server is connected. ${model.refreshes ? `Refreshed ${model.refreshes} ${model.refreshes === 1 ? "time" : "times"}; last update ${model.updated}.` : model.updated + "."}`} />
    <Card><Column relaxed>
      <Row stacks relaxed alignEnd>
        <Field label="Search work" helper="Search by title, owner, or reference."><Input testID="dashboard-search" value={model.query} onChangeText={model.setQuery} placeholder="Try Maya or OPS-103" /></Field>
        <Field label="Status"><Select value={model.status} onSelect={model.setStatus} options={["All statuses", "In progress", "Ready", "Needs attention"]} /></Field>
        <Button outline onPress={model.clear}>Clear filters</Button>
      </Row>
      <Typography small muted>Metrics and work items reflect the current filters.</Typography>
    </Column></Card>
    <Grid columns={4} minTileWidth={220} relaxed>{[
      { label: "Work items", value: String(model.filtered.length), description: "in this view" },
      { label: "Units planned", value: String(totalUnits), description: "across matching work" },
      { label: "Ready to ship", value: String(model.filtered.filter((job) => job.status === "Ready").length), description: "completed work items" },
      { label: "Average progress", value: `${average}%`, description: "of matching work" },
    ].map((metric) => <Stats key={metric.label} large items={[metric]} />)}</Grid>
    <Row between wrap snug alignCenter><Typography h2>Work in motion</Typography><Badge secondary>{model.filtered.length} matching items</Badge></Row>
    {model.filtered.length ? <Grid columns={2} minTileWidth={320} relaxed>
      {model.filtered.map((job) => <Card key={job.id}><Column relaxed>
        <Row between wrap snug alignCenter><Typography tiny mono muted>{job.id}</Typography><Badge success={job.status === "Ready"} warning={job.status === "Needs attention"} primary={job.status === "In progress"}>{job.status}</Badge></Row>
        <Typography h3>{job.title}</Typography>
        <Typography small muted>Owned by {job.owner} · {job.units} units planned</Typography>
        <Progress value={job.progress / 100} accessibilityLabel={`${job.title} progress`} showValue>Completion</Progress>
      </Column></Card>)}
    </Grid> : <EmptyState title="No matching work" description="Try another title, owner, or status." actionLabel="Reset filters" onAction={model.clear} />}
    <Card><Column relaxed>
      <Typography h2>Activity log</Typography>
      {model.refreshes > 0 ? <><Typography>Studio launch progress updated to {Math.min(100, 72 + model.refreshes * 7)}%.</Typography><Typography small muted>Latest local refresh · {model.updated}</Typography><Divider /></> : null}
      <Typography>Sam marked the partner toolkit ready to ship.</Typography><Typography small muted>Sample activity · 10:40 AM</Typography>
      <Divider />
      <Typography>Alex flagged the November shipment review for attention.</Typography><Typography small muted>Sample activity · 9:15 AM</Typography>
    </Column></Card>
  </Column>;
}
