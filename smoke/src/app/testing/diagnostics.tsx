import { Screen } from "../../app-frame/screen";
import { SmokeDiagnostics } from "../../testing/diagnostics";

export default function DiagnosticsRoute() {
  return <Screen journey="/testing/diagnostics"><SmokeDiagnostics /></Screen>;
}
