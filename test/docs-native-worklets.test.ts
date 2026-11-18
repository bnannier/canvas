import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import traverse from "@babel/traverse";
import { COLLAGE, panelTransform, rotateStack } from "../docs/src/brand/library-hero-look.ts";

const docs = resolve(import.meta.dir, "../docs");
const docsRequire = createRequire(resolve(docs, "package.json"));
const { transform } = docsRequire("@expo/metro-config/build/babel-transformer");

function loadWorklets(file: string, platform: "ios" | "android") {
  const filename = resolve(docs, file);
  const { ast } = transform({
    filename,
    src: readFileSync(filename, "utf8"),
    options: {
      projectRoot: docs,
      platform,
      dev: false,
      minify: true,
      type: "module",
      customTransformOptions: { engine: "hermes", routerRoot: "src/app" },
    },
  });
  const payloads: string[] = [];
  traverse(ast, {
    ObjectProperty({ node: { key, value } }) {
      if (key.type === "Identifier" && key.name === "code" && value.type === "StringLiteral") {
        payloads.push(value.value);
      }
    },
  });

  return <Args extends unknown[], Result>(name: string, closure: Record<string, unknown> = {}) => {
    const code = payloads.find((payload) => payload.startsWith(`function ${name}_`));
    if (!code) throw new Error(`Missing serialized worklet ${name} in ${file}`);
    // Native Worklets evaluates the serialized function and binds its captured values.
    const worklet = runInNewContext(`(${code})`) as (this: object, ...args: Args) => Result;
    return worklet.bind({ __closure: closure });
  };
}

for (const platform of ["ios", "android"] as const) {
  test(`${platform} production worklets resolve omitted easing and rotation`, () => {
    const vignette = loadWorklets("src/ui/showcase/section-vignette.tsx", platform);
    const bezier = vignette("bezier");
    const timeline = vignette<[number, number, number[], number[], number[]?, number?], number>("timeline", {
      EASE: [0.25, 0.1, 0.25, 1],
      bezier,
    });
    expect(timeline(500, 1000, [0, 1], [0, 1])).toBeCloseTo(0.8024, 4);
    expect(timeline(500, 1000, [0, 1], [0, 1], [0, 0, 1, 1])).toBeCloseTo(0.5, 4);
    expect(timeline(200, 1000, [0, 1], [7, 9], undefined, 300)).toBe(7);

    const hero = loadWorklets("src/brand/library-hero-look.ts", platform);
    const rotate = hero<Parameters<typeof rotateStack>, ReturnType<typeof rotateStack>>("rotateStack", {
      COLLAGE,
      RAD: Math.PI / 180,
    });
    const transformPanel = hero<Parameters<typeof panelTransform>, ReturnType<typeof panelTransform>>("panelTransform", {
      COLLAGE,
      rotateStack: rotate,
    });
    const vector: [number, number, number] = [1, 2, 3];
    const panel = COLLAGE.panels[1];
    expect(rotate(vector)).toEqual(rotateStack(vector, COLLAGE.rotate));
    expect(rotate(vector, [0, 0, 0])).toEqual(vector);
    expect(transformPanel(panel, 460)).toEqual(panelTransform(panel, 460, COLLAGE.rotate));
    expect(transformPanel(panel, 460, [0, 0, 0])).toEqual(panelTransform(panel, 460, [0, 0, 0]));
  });
}
