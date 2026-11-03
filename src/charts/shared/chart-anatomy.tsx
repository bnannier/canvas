import { createContext, useContext, type ReactNode } from "react";
import { AnatomyScope, type AnatomyTarget } from "../../style/anatomy.js";

// The anatomy parts a cartesian chart hands to the shared furniture it renders (the
// CartesianFrame and the ChartLegend). A chart takes its parts' handlers with
// `useAnatomyPart` above its AnatomyScope (src/style/anatomy.tsx), so the shared helpers
// below the scope cannot take them themselves: ChartAnatomyScope renders the chart's tree
// inside the scope and passes the handlers down through this context, and each helper puts
// its role's handlers on the host node that draws it. The parts are named by the chart
// (the hand-off's `an` list for its slug); this context only carries them by role.
//
// The marks, gridlines and baseline are react-native-svg shapes, which have no measurable
// host node on native, so the frame registers them on the plot area: the absolutely
// positioned View that holds the plot's Svg, whose box is the grid and the region the
// marks are drawn in. Internal to the kit (not exported from the package barrel).

export interface ChartAnatomy {
  /** The frame's root: the plot with its axis labels (the hand-off's chart `svg`). */
  frame?: AnatomyTarget;
  /** The parts drawn as SVG marks (a series, the bins, a box and its median), on the plot area. */
  marks?: readonly [AnatomyTarget?, AnatomyTarget?];
  /** The gridlines, on the plot area while the grid is drawn. */
  gridlines?: AnatomyTarget;
  /** The baseline hairline, on the plot area while the axes are drawn. */
  baseline?: AnatomyTarget;
  /** The axis labels, on the first label drawn (the y axis's, or the x axis's with `xLabels`). */
  axisLabels?: AnatomyTarget;
  /** Number the first x-axis label as the axis labels (the hand-off's box plot and waterfall). */
  xLabels?: boolean;
  /** The series legend's root. */
  legend?: AnatomyTarget;
}

const ChartAnatomyContext = createContext<ChartAnatomy | null>(null);

/** The parts the enclosing chart handed to its furniture, null outside an anatomy specimen. */
export function useChartAnatomy(): ChartAnatomy | null {
  return useContext(ChartAnatomyContext);
}

/**
 * Renders a chart's tree inside AnatomyScope, handing the parts it took to the shared
 * frame and legend. Outside an AnatomyProvider every part is undefined and the children
 * render bare.
 */
export function ChartAnatomyScope({ parts, children }: { parts: ChartAnatomy; children?: ReactNode }): ReactNode {
  const open = parts.frame != null || parts.axisLabels != null || parts.legend != null || parts.gridlines != null || parts.baseline != null || parts.marks?.some((m) => m != null) === true;
  return <AnatomyScope>{open ? <ChartAnatomyContext.Provider value={parts}>{children}</ChartAnatomyContext.Provider> : children}</AnatomyScope>;
}
