/**
 * Theme-aware color tokens for Chart.js components.
 * Use with useTheme() from next-themes.
 */

export interface ChartTheme {
  tickColor: string;
  gridColor: string;
  legendColor: string;
  titleColor: string;
  borderColor: string;
  bgPanel: string;
}

export function getChartTheme(isDark: boolean): ChartTheme {
  return isDark
    ? {
        tickColor: "#64748b",
        gridColor: "rgba(51,65,85,0.35)",
        legendColor: "#94a3b8",
        titleColor: "#e2e8f0",
        borderColor: "#334155",
        bgPanel: "bg-slate-800/30 border-slate-700",
      }
    : {
        tickColor: "#64748b",
        gridColor: "rgba(203,213,225,0.5)",
        legendColor: "#475569",
        titleColor: "#1e293b",
        borderColor: "#e2e8f0",
        bgPanel: "bg-slate-100/60 border-slate-200",
      };
}
