import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";

type Job = { uses?: string; with?: Record<string, unknown> };
type Workflow = {
  on?: string | string[] | Record<string, unknown>;
  jobs?: Record<string, Job>;
};

const directory = new URL("../../.github/workflows/", import.meta.url);
const workflows = new Map(readdirSync(directory)
  .filter((name) => /\.ya?ml$/.test(name))
  .map((name) => [name, Bun.YAML.parse(readFileSync(new URL(name, directory), "utf8")) as Workflow]));
const events = (workflow: Workflow) => typeof workflow.on === "string"
  ? [workflow.on]
  : Array.isArray(workflow.on) ? workflow.on : Object.keys(workflow.on ?? {});
const calls = (workflow: Workflow, target: string) => Object.values(workflow.jobs ?? {})
  .filter((job) => job.uses === `./.github/workflows/${target}`);

test("GitHub workflows run only by explicit dispatch or a reusable release call", () => {
  expect(workflows.size).toBeGreaterThan(0);
  for (const [name, workflow] of workflows) {
    const triggers = events(workflow);
    expect(triggers.length, `${name} must declare how it is invoked`).toBeGreaterThan(0);
    expect(triggers.filter((event) => !["workflow_dispatch", "workflow_call"].includes(event)),
      `${name} must not spend GitHub minutes on checkins, pull requests or timers`).toEqual([]);
  }
});

test("Deploy is the single explicitly dispatched entry point for release validation", () => {
  const deploy = workflows.get("deploy.yml");
  expect(deploy).toBeDefined();
  expect(events(deploy!)).toEqual(["workflow_dispatch"]);
  expect([...workflows.keys()].filter((name) => /^ci\.ya?ml$/.test(name))).toEqual([]);
  expect([...workflows].filter(([, workflow]) => calls(workflow, "validate.yml").length > 0)
    .map(([name]) => name)).toEqual(["deploy.yml"]);
  const validation = calls(deploy!, "validate.yml");
  expect(validation).toHaveLength(1);
  expect(validation[0]!.with?.candidate).toBe(true);
});

test("Release validation retains the callable native candidate smoke workflow", () => {
  const validate = workflows.get("validate.yml");
  const nativeSmoke = workflows.get("native-smoke.yml");
  expect(validate).toBeDefined();
  expect(nativeSmoke).toBeDefined();
  expect(events(validate!)).toEqual(["workflow_call"]);
  expect(events(nativeSmoke!)).toEqual(["workflow_call"]);
  expect(calls(validate!, "native-smoke.yml")).toHaveLength(1);
});
