import { Component, type ReactNode, useState } from "react";
import { ScrollView, View, Text, Pressable, useTheme } from "@olympusoss/canvas";
import { buildScopes } from "docs-core/build-scopes";
import type { DocExample, ExampleScope } from "docs-core/scope";
import { CodeBlock } from "./code-block";

// A render-phase throw in an example (valid JSX, bad props) can only be caught by an
// error boundary. Keyed by the call site so a switch/edit remounts and clears it.
export class ExampleErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  render() {
    if (this.state.error) {
      return <ErrorNote message={this.state.error} />;
    }
    return this.props.children;
  }
}

function ErrorNote({ message }: { message: string }) {
  const { tokens } = useTheme();
  return (
    <View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.destructive, padding: 10, gap: 4 }}>
      <Text style={{ fontSize: 12, fontWeight: "600", color: tokens.destructive }}>Example failed to render</Text>
      <Text style={{ fontSize: 11, color: tokens["muted-foreground"] }}>{message}</Text>
    </View>
  );
}

// One example preview surface (content layer, stays solid per the glass rules).
function PreviewSurface({ label, scope, render, resetKey }: {
  label?: string;
  scope: ExampleScope;
  render: (s: ExampleScope) => ReactNode;
  resetKey: string;
}) {
  const { tokens } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <Text style={{ fontSize: 11, fontWeight: "600", color: tokens["muted-foreground"] }}>{label}</Text>
      ) : null}
      <View
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: tokens.border,
          backgroundColor: tokens.card,
          padding: 20,
          alignItems: "flex-start",
        }}
      >
        <ExampleErrorBoundary key={resetKey}>{render(scope)}</ExampleErrorBoundary>
      </View>
    </View>
  );
}

// The component playground: a variant rail (when there's more than one example) over the
// live preview and its source. On a device this shows ONE real preview (the OS skin Metro
// resolved); on the web build buildScopes returns the three-up iOS / Android / Web columns.
export function Playground({ examples }: { examples: DocExample[] }) {
  const { tokens } = useTheme();
  const [selected, setSelected] = useState(0);
  const ex = examples[selected] ?? examples[0];
  if (!ex) return null;

  const previews = buildScopes(tokens);

  return (
    <View style={{ gap: 12 }}>
      {examples.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {examples.map((e, i) => {
            const active = i === selected;
            return (
              <Pressable
                key={e.label}
                onPress={() => setSelected(i)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: active ? tokens.primary : tokens.border,
                  backgroundColor: active ? tokens.primary : "transparent",
                }}
              >
                <Text style={{ fontSize: 12, color: active ? tokens["primary-foreground"] : tokens["muted-foreground"] }}>
                  {e.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      <View style={{ gap: 16 }}>
        {previews.map((p) => (
          <PreviewSurface
            key={p.platform}
            label={previews.length > 1 ? p.label : undefined}
            scope={p.scope}
            render={ex.render}
            resetKey={`${p.platform}:${selected}`}
          />
        ))}
      </View>

      <CodeBlock code={ex.code} />
    </View>
  );
}
