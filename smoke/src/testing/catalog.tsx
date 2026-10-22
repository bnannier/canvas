import { Component, useEffect, useState, type ReactNode } from "react";
import { Button, Column, Typography } from "@nannier/canvas";
import { CATALOG } from "../catalog/components";
import { componentDocs } from "../catalog/docs";
import { useExampleScope } from "../catalog/scope";

// Mounts every documented component's examples on the device, one component at a time,
// and reports how many rendered and which threw. The journey reads the summary, so
// every component is exercised against the installed package without visiting 106 screens.
const COMPONENTS = CATALOG.flatMap((group) => group.components);

class Guard extends Component<{ onError: (error: Error) => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Current({ index, onError }: { index: number; onError: (error: Error) => void }) {
  const scope = useExampleScope();
  const component = COMPONENTS[index]!;
  const docs = componentDocs(component.dir)!;
  return (
    <Column relaxed testID="catalog-current">
      <Typography h3>{component.name}</Typography>
      {docs.examples.map((example) => (
        <Guard key={example.label} onError={onError}>{example.render(scope)}</Guard>
      ))}
    </Column>
  );
}

export function CatalogBody() {
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const [failures, setFailures] = useState<string[]>([]);
  const done = running && index >= COMPONENTS.length;
  useEffect(() => {
    if (!running || done) return;
    // One frame per component: its examples mount, lay out and commit before the next.
    const frame = requestAnimationFrame(() => setIndex((value) => value + 1));
    return () => cancelAnimationFrame(frame);
  }, [running, done, index]);
  const record = (error: Error) => {
    const name = COMPONENTS[index]?.name ?? "unknown";
    setFailures((list) => [...list, `${name}: ${error.message}`]);
  };
  return (
    <Column relaxed>
      <Typography>{`${COMPONENTS.length} documented components`}</Typography>
      <Button primary disabled={running && !done} onPress={() => { setFailures([]); setIndex(0); setRunning(true); }}>Render every component</Button>
      <Typography testID="catalog-progress">{running ? `Rendered: ${Math.min(index, COMPONENTS.length)} of ${COMPONENTS.length}` : "Not started"}</Typography>
      <Typography testID="catalog-failures">{`Failures: ${failures.length}`}</Typography>
      {failures.map((failure) => <Typography key={failure} small>{failure}</Typography>)}
      {running && !done ? <Current key={index} index={index} onError={record} /> : null}
    </Column>
  );
}
