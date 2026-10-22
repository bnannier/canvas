import { Component, type ReactNode } from "react";
import { useLocalSearchParams } from "expo-router";
import { Alert, Column, Divider, Typography } from "@nannier/canvas";
import { Screen } from "../../app-frame/screen";
import { findComponent } from "../../catalog/components";
import { useExampleScope } from "../../catalog/scope";
import { componentDocs } from "../../catalog/docs";

// One documented example. A throwing example reports itself in place, so one failure
// does not hide the rest of the page and a journey can find it by its test ID.
class ExampleBoundary extends Component<{ id: string; children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <Alert destructive testID={`${this.props.id}-error`} title="Example failed">{this.state.error.message}</Alert>;
    }
    return this.props.children;
  }
}

function Examples({ dir, slug }: { dir: string; slug: string }) {
  const docs = componentDocs(dir);
  const scope = useExampleScope();
  if (!docs) return <Alert testID="component-missing" title="No examples">This component has no documented examples.</Alert>;
  return (
    <Column loose>
      {docs.examples.map((example, index) => (
        <Column key={example.label} relaxed testID={`example-${slug}-${index}`}>
          <Divider />
          <Typography h3>{example.label}</Typography>
          <ExampleBoundary id={`example-${slug}-${index}`}>{example.render(scope)}</ExampleBoundary>
        </Column>
      ))}
    </Column>
  );
}

export default function ComponentScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const component = findComponent(String(slug));
  return (
    <Screen>
      {component ? (
        <Column loose>
          <Typography h1 testID="component-title">{component.name}</Typography>
          <Examples dir={component.dir} slug={component.slug} />
        </Column>
      ) : (
        <Alert title="Unknown component">No Canvas component is named {String(slug)}.</Alert>
      )}
    </Screen>
  );
}
