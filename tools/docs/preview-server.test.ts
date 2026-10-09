import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { get } from "node:http";
import type { AddressInfo } from "node:net";
import { appearanceQuery, deepLink, openCommand, sanitizeRoute, shellCommand, shellQuote } from "../../docs/scripts/preview-links.mjs";
import { createPreviewServer } from "../../docs/scripts/preview-server.mjs";
import { themeFromURL } from "../../docs/src/theme/theme-links";

// The preview opener (docs/scripts/preview-server.mjs) behind every completed piece of
// work's Preview links. Its shell quoting is checked against real shells, not against
// a string: `adb shell` joins its argv with spaces and the device's sh parses the line
// again, so an unquoted `&` once backgrounded `am start` and the app opened with the
// link's first axis only (a mint link painted blush), and the hand-run command the 502
// page prints is pasted into zsh, where an unquoted `?` is a glob that matches nothing
// and aborts the line.

const LINK = "canvas:///components/button?scheme=light&surface=solid&palette=mint";

// Every POSIX shell the quoting meets: sh stands in for Android's mksh (the device side
// of `adb shell`), zsh is the macOS login shell a hand-run command is pasted into.
const SHELLS = ["/bin/sh", "/bin/zsh"].filter((shell) => existsSync(shell));

// The words `shell` splits `line` into, read back by defining `program` (the word the
// line starts with) as a function that prints its arguments NUL-separated.
function wordsOf(shell: string, program: string, line: string): string[] {
  const result = spawnSync(shell, ["-c", `${program}() { printf '%s\\0' "$@"; }; ${line}`], { encoding: "utf8" });
  expect(result.stderr).toBe("");
  expect(result.status).toBe(0);
  return result.stdout.split("\0").slice(0, -1);
}

type Run = (cmd: string, args: string[], options: object, callback: (error: Error | null, stdout: string, stderr: string) => void) => void;

async function withServer(run: Run, body: (base: string) => Promise<void>): Promise<void> {
  const server = createPreviewServer({ webPort: 8081, run });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await body(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

interface Reply {
  status: number | undefined;
  location: string | undefined;
  body: string;
}

// node:http, not fetch: the test preload installs happy-dom, whose fetch applies a
// browser's same-origin policy, and a redirect must be read, not followed.
function request(url: string): Promise<Reply> {
  return new Promise((resolve, reject) => {
    get(url, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ status: response.statusCode, location: response.headers.location, body }));
    }).on("error", reject);
  });
}

function unescapeHtml(text: string): string {
  return text.replace(/&(amp|lt|gt|quot|#39);/g, (_, name: string) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" })[name] ?? "");
}

describe("preview opener appearance queries", () => {
  it("keeps only valid routes, without their outer slashes", () => {
    expect(sanitizeRoute("components/button")).toBe("components/button");
    expect(sanitizeRoute("/components/button/")).toBe("components/button");
    for (const raw of [null, "", "../etc", "components/button?scheme=light", "a b", "components//button", "x;rm"]) {
      expect(sanitizeRoute(raw)).toBeNull();
    }
  });

  it("appends each present axis in its own set, in a fixed order, and nothing for none", () => {
    expect(appearanceQuery(new URLSearchParams(""))).toEqual({ suffix: "" });
    expect(appearanceQuery(new URLSearchParams("palette=mint"))).toEqual({ suffix: "?palette=mint" });
    expect(appearanceQuery(new URLSearchParams("palette=mint&surface=solid&scheme=light&route=x"))).toEqual({
      suffix: "?scheme=light&surface=solid&palette=mint",
    });
  });

  it("refuses a value outside an axis's set, naming the axis and its values", () => {
    expect(appearanceQuery(new URLSearchParams("palette=teal"))).toEqual({ invalid: { axis: "palette", values: ["blush", "mint"] } });
    expect(appearanceQuery(new URLSearchParams("palette=Mint"))).toEqual({ invalid: { axis: "palette", values: ["blush", "mint"] } });
    expect(appearanceQuery(new URLSearchParams("scheme=system&palette=mint"))).toEqual({ invalid: { axis: "scheme", values: ["light", "dark"] } });
    expect(appearanceQuery(new URLSearchParams("surface="))).toEqual({ invalid: { axis: "surface", values: ["solid", "glass"] } });
  });

  it("reads the first value of a repeated axis, as the app does", () => {
    expect(appearanceQuery(new URLSearchParams("palette=mint&palette=teal"))).toEqual({ suffix: "?palette=mint" });
    expect(appearanceQuery(new URLSearchParams("palette=teal&palette=mint"))).toEqual({ invalid: { axis: "palette", values: ["blush", "mint"] } });
  });

  it("builds a deep link the app reads every axis back from", () => {
    const { suffix } = appearanceQuery(new URLSearchParams("scheme=light&surface=solid&palette=mint")) as { suffix: string };
    expect(deepLink("components/button", suffix)).toBe(LINK);
    expect(themeFromURL(LINK)).toEqual({ scheme: "light", surface: "solid", palette: "mint" });
  });
});

describe("preview opener shell quoting", () => {
  it("leaves a plain word bare and quotes anything a shell would act on", () => {
    expect(shellQuote("android.intent.action.VIEW")).toBe("android.intent.action.VIEW");
    expect(shellQuote("-d")).toBe("-d");
    expect(shellQuote(LINK)).toBe(`'${LINK}'`);
    expect(shellQuote("")).toBe("''");
    expect(shellQuote("it's")).toBe(`"it's"`);
    expect(shellQuote("it's $HOME")).toBe(`'it'\\''s $HOME'`);
  });

  for (const shell of SHELLS) {
    it(`hands every word back unchanged through ${shell}`, () => {
      const words = [LINK, "", "a b", "it's", "it's $HOME and `date`", 'say "hi"!', "=ls", "~", "*", "x;y|z&w", "back\\slash"];
      expect(wordsOf(shell, "say", `say ${shellCommand(words)}`)).toEqual(words);
    });
  }

  it("passes the iOS link to simctl as one argv element, with no shell in between", () => {
    const { cmd, args } = openCommand("ios", LINK);
    expect(cmd).toBe("xcrun");
    expect(args).toEqual(["simctl", "openurl", "booted", LINK]);
  });

  it("quotes the Android remote command so the device's shell keeps the whole link", () => {
    const { cmd, args } = openCommand("android", LINK);
    expect(cmd).toBe("adb");
    expect(args).toEqual(["shell", `am start -a android.intent.action.VIEW -d '${LINK}'`]);
    // What the device runs: adb joins its words with spaces, as ssh(1) does.
    const remote = args.slice(1).join(" ");
    for (const shell of SHELLS) {
      const words = wordsOf(shell, "am", remote);
      expect(words).toEqual(["start", "-a", "android.intent.action.VIEW", "-d", LINK]);
      expect(themeFromURL(words[4])).toEqual({ scheme: "light", surface: "solid", palette: "mint" });
    }
  });

  it("prints a hand-run command each shell splits back into the exact argv", () => {
    for (const platform of ["ios", "android"] as const) {
      const { cmd, args, manual } = openCommand(platform, LINK);
      for (const shell of SHELLS) expect(wordsOf(shell, cmd, manual)).toEqual(args);
    }
    expect(openCommand("android", LINK).manual).toBe(`adb shell "am start -a android.intent.action.VIEW -d '${LINK}'"`);
    expect(openCommand("ios", LINK).manual).toBe(`xcrun simctl openurl booted '${LINK}'`);
  });
});

describe("preview opener server", () => {
  const succeed: Run = (_cmd, _args, _options, callback) => callback(null, "", "");

  it("redirects /web with the appearance suffix and refuses an out-of-set axis by name", async () => {
    await withServer(succeed, async (base) => {
      const redirect = await request(`${base}/web?route=components/button&palette=mint&scheme=light&surface=solid`);
      expect(redirect.status).toBe(302);
      expect(redirect.location).toBe("http://localhost:8081/components/button?scheme=light&surface=solid&palette=mint");

      expect((await request(`${base}/web?route=components/button`)).location).toBe("http://localhost:8081/components/button");
      expect((await request(`${base}/web?route=components/button&palette=mint&palette=teal`)).location).toBe(
        "http://localhost:8081/components/button?palette=mint",
      );

      for (const platform of ["web", "ios", "android"]) {
        const refused = await request(`${base}/${platform}?route=components/button&scheme=light&palette=teal`);
        expect(refused.status).toBe(400);
        expect(refused.body).toContain("Invalid <code>palette</code>");
        expect(refused.body).toContain("<code>blush</code>, <code>mint</code>");
      }

      const route = await request(`${base}/ios?route=../secret`);
      expect(route.status).toBe(400);
      expect(route.body).toContain("Invalid or missing <code>route</code>");
    });
  });

  it("launches each platform's deep link with the quoted argv", async () => {
    const calls: { cmd: string; args: string[] }[] = [];
    const record: Run = (cmd, args, options, callback) => {
      calls.push({ cmd, args });
      succeed(cmd, args, options, callback);
    };
    await withServer(record, async (base) => {
      for (const platform of ["ios", "android"]) {
        expect((await request(`${base}/${platform}?route=components/button&scheme=light&surface=solid&palette=mint`)).status).toBe(200);
      }
    });
    expect(calls).toEqual([
      { cmd: "xcrun", args: ["simctl", "openurl", "booted", LINK] },
      { cmd: "adb", args: ["shell", `am start -a android.intent.action.VIEW -d '${LINK}'`] },
    ]);
  });

  it("prints a pasteable hand-run command when the launch fails", async () => {
    const fail: Run = (_cmd, _args, _options, callback) => callback(new Error("spawn adb ENOENT"), "", "");
    await withServer(fail, async (base) => {
      for (const platform of ["ios", "android"] as const) {
        const failed = await request(`${base}/${platform}?route=components/button&scheme=light&surface=solid&palette=mint`);
        expect(failed.status).toBe(502);
        const printed = /<pre><code>([^<]*)<\/code><\/pre>/.exec(failed.body)?.[1];
        const { cmd, args, manual } = openCommand(platform, LINK);
        expect(printed && unescapeHtml(printed)).toBe(manual);
        for (const shell of SHELLS) expect(wordsOf(shell, cmd, manual)).toEqual(args);
        expect(failed.body).toContain("spawn adb ENOENT");
      }
    });
  });
});
