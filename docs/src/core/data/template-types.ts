// The Templates page's types. They live apart from the catalog types in ./types because a
// template screen is typed against the kit (its glyphs and the per-platform example scope),
// and the audit and skin tools that read the catalog typecheck without the kit's import graph.
import { type ComponentType } from "react";
import type { IconName } from "@nannier/canvas";
import type { ExampleScope } from "../scope";

/** The device a template's screen is framed in: a browser window, an iPhone or a Pixel. */
export type TemplatePlatform = "web" | "ios" | "android";

/** The hand-off's template groups (`Canvas v4.0.0 Templates.dc.html` TPLS), in order. */
export type TemplateGroup = "Auth" | "App" | "Account" | "States";

/** What a template's screen is rendered with inside its device frame. */
export interface TemplateScreenProps {
  /**
   * The kit as the frame's platform draws it: every Canvas export with that platform's
   * skins in place (docs/src/core/build-scopes), so one tree renders the web, iOS and
   * Android looks. A screen takes every component it renders from here.
   */
  K: ExampleScope;
  /** The frame is a phone: its app bar names the screen, so a screen drops its own heading. */
  phone: boolean;
  /** Opens another template in the frame (a link between screens: Create an account, View all). */
  go: (slug: string) => void;
}

/**
 * One template of the hand-off's Templates page: a whole product screen composed from
 * live Canvas components, shown in a browser window, an iPhone or a Pixel.
 */
export interface TemplateDoc {
  slug: string;
  name: string;
  group: TemplateGroup;
  /** The kit glyph the template list shows beside the name. */
  icon: IconName;
  /** The hand-off's one-line description, shown under the template's name. */
  description: string;
  /** The path the browser frame's address bar shows after `app.riskora.com/`. */
  path: string;
  /** The screen sits in the Riskora app's chrome: the sidebar and top bar on the web, the app bar and tab bar on a phone. */
  app: boolean;
  Screen: ComponentType<TemplateScreenProps>;
}
