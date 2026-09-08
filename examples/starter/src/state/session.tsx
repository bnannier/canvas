import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export const CITIES = ["Toronto", "Montréal", "Vancouver", "New York", "London", "Paris", "Tokyo", "Sydney"];
export const WORKSTREAMS = [
  { label: "Design", detail: "Interfaces, prototypes, and visual systems" },
  { label: "Engineering", detail: "Applications, infrastructure, and delivery" },
  { label: "Research", detail: "Interviews, experiments, and insights" },
];
export const APPEARANCES = [
  { label: "System", detail: "Follow this device's appearance" },
  { label: "Light", detail: "Use the light color scheme" },
  { label: "Dark", detail: "Use the dark color scheme" },
];
export type Appearance = "system" | "light" | "dark";
export const APPEARANCE_VALUES: Appearance[] = ["system", "light", "dark"];
export interface Workspace { name: string; city: string; workstreams: number[] }
export interface Preferences { appearance: Appearance; showSummary: boolean }

function initialSession() {
  const workspace: Workspace = { name: "My workspace", city: "Toronto", workstreams: [0, 1] };
  const preferences: Preferences = { appearance: "system", showSummary: true };
  return {
    workspace, workspaceDraft: workspace, preferences, preferencesDraft: preferences,
    cityQuery: "", submitted: false, workspaceNotice: "", preferencesNotice: "",
  };
}

function validate(workspace: Workspace) {
  return {
    name: workspace.name.trim().length < 2 ? "Enter a workspace name with at least two characters." : undefined,
    city: !CITIES.includes(workspace.city) ? "Choose a city from the suggestions." : undefined,
    workstreams: workspace.workstreams.length === 0 ? "Choose at least one workstream." : undefined,
  };
}

function useSessionState() {
  const [state, setState] = useState(initialSession);
  return useMemo(() => ({
    ...state,
    errors: state.submitted ? validate(state.workspaceDraft) : { name: undefined, city: undefined, workstreams: undefined },
    updateWorkspace(patch: Partial<Workspace>) {
      setState((current) => ({ ...current, workspaceDraft: { ...current.workspaceDraft, ...patch }, workspaceNotice: "" }));
    },
    updateCityQuery(cityQuery: string) {
      setState((current) => ({
        ...current, cityQuery, workspaceNotice: "",
        workspaceDraft: cityQuery ? { ...current.workspaceDraft, city: "" } : current.workspaceDraft,
      }));
    },
    saveWorkspace() {
      const errors = validate(state.workspaceDraft);
      if (Object.values(errors).some(Boolean)) {
        setState((current) => ({ ...current, submitted: true, workspaceNotice: "" }));
        return false;
      }
      const workspace = { ...state.workspaceDraft, name: state.workspaceDraft.name.trim(), workstreams: [...state.workspaceDraft.workstreams] };
      setState((current) => ({ ...current, workspace, workspaceDraft: workspace, cityQuery: "", submitted: false, workspaceNotice: "Workspace saved for this session." }));
      return true;
    },
    cancelWorkspace() {
      setState((current) => ({ ...current, workspaceDraft: current.workspace, cityQuery: "", submitted: false, workspaceNotice: "Unsaved workspace changes discarded." }));
    },
    updatePreferences(patch: Partial<Preferences>) {
      setState((current) => ({ ...current, preferencesDraft: { ...current.preferencesDraft, ...patch }, preferencesNotice: "" }));
    },
    savePreferences() {
      setState((current) => ({ ...current, preferences: current.preferencesDraft, preferencesNotice: "Preferences saved for this session." }));
    },
    cancelPreferences() {
      setState((current) => ({ ...current, preferencesDraft: current.preferences, preferencesNotice: "Unsaved preference changes discarded." }));
    },
    resetSession() { setState(initialSession()); },
  }), [state]);
}

type Session = ReturnType<typeof useSessionState>;
const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const session = useSessionState();
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession requires SessionProvider");
  return session;
}
