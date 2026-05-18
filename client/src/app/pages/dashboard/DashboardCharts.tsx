import React, { useMemo, useEffect, useState, useRef } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Responsive hook: tracks the chart's OWN container width via ResizeObserver
// This is more reliable than window.innerWidth because the chart may sit inside
// a sidebar, drawer, or card that is narrower than the viewport.

function useContainerWidth(): [React.RefObject<HTMLDivElement>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);

  useEffect(() => {
    if (!ref.current) return;
    // Seed with the real initial width instead of 320
    setWidth(ref.current.getBoundingClientRect().width || 320);

    const ro = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, width];
}

// ─── All layout decisions come from container px, not viewport breakpoints ────

function getChartConfig(cw: number, heightProp?: number) {
  const xs = cw < 320;
  const sm = cw < 420;
  const md = cw < 600;

  return {
    // Aspect-ratio driven height so the chart is never awkwardly tall on mobile
    height:
      heightProp ?? Math.round(cw * (xs ? 0.7 : sm ? 0.65 : md ? 0.58 : 0.48)),

    fontSize: xs ? 8 : sm ? 9 : md ? 10 : 11,
    tickMargin: sm ? 4 : 8,

    // Abbreviate Y values on narrow containers so the axis doesn't steal space
    yAxisWidth: xs ? 24 : sm ? 28 : md ? 34 : 42,
    yTickFormatter: (v: number) =>
      sm && v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(v),
    yTickCount: sm ? 4 : 5,

    // Skip every other (or every 2nd) X label to prevent overlap
    xInterval: xs ? 3 : sm ? 2 : md ? 1 : 0,

    maxBarPrimary: xs ? 12 : sm ? 16 : md ? 24 : 34,
    maxBarSecondary: xs ? 8 : sm ? 11 : md ? 17 : 24,
    barGap: sm ? 4 : 8,

    margin: xs
      ? { top: 4, right: 2, left: 0, bottom: 0 }
      : sm
        ? { top: 6, right: 4, left: -4, bottom: 0 }
        : md
          ? { top: 8, right: 8, left: -8, bottom: 0 }
          : { top: 12, right: 12, left: -12, bottom: 0 },

    radius: (xs
      ? [3, 3, 1, 1]
      : sm
        ? [5, 5, 2, 2]
        : md
          ? [7, 7, 3, 3]
          : [10, 10, 4, 4]) as [number, number, number, number],

    // Hide the legend when there's no room; the tooltip still shows values
    showLegend: cw >= 380,
    legendPaddingTop: md ? 8 : 14,
  };
}

// ─── Tooltip style ────────────────────────────────────────────────────────────

const tooltipBox: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid var(--border-default)",
  fontSize: 12,
  background: "var(--bg-primary)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
  padding: "8px 12px",
};

// ─── Demo data helpers ────────────────────────────────────────────────────────

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

function smoothPoint(i: number, n: number, seed: number): number {
  const t = i / Math.max(1, n - 1);
  const wave = Math.sin(t * Math.PI * 1.4 + seed * 0.01) * 0.22 + 0.78;
  const ramp = 0.65 + t * 0.55;
  const noise = ((seed >> (i % 12)) & 15) / 200;
  return Math.max(12, Math.round(180 * wave * ramp * (1 + noise)));
}

export type WorkspaceRange = "7d" | "30d" | "90d";

export function useWorkspaceActivitySeries(range: WorkspaceRange) {
  return useMemo(() => {
    const seed = hashSeed(`ws-${range}`);
    if (range === "7d") {
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
        (label, i) => ({
          label,
          messages: smoothPoint(i, 7, seed + i * 3),
          users: Math.max(
            4,
            Math.round(smoothPoint(i, 7, seed + i * 7) * 0.18),
          ),
        }),
      );
    }
    if (range === "30d") {
      return Array.from({ length: 10 }, (_, i) => ({
        label: `W${i + 1}`,
        messages: smoothPoint(i, 10, seed + i * 5),
        users: Math.max(6, Math.round(smoothPoint(i, 10, seed + i * 11) * 0.2)),
      }));
    }
    return Array.from({ length: 12 }, (_, i) => ({
      label: `${i + 1}w`,
      messages: smoothPoint(i, 12, seed + i * 4),
      users: Math.max(8, Math.round(smoothPoint(i, 12, seed + i * 9) * 0.21)),
    }));
  }, [range]);
}

export type BotTrendRange = "daily" | "weekly" | "monthly";

export function useBotMessagesSeries(range: BotTrendRange, botId: string) {
  return useMemo(() => {
    const seed = hashSeed(`${botId}-${range}`);
    if (range === "daily") {
      return Array.from({ length: 14 }, (_, i) => ({
        label: `D${i + 1}`,
        messages: smoothPoint(i, 14, seed + i * 2),
      }));
    }
    if (range === "weekly") {
      return Array.from({ length: 8 }, (_, i) => ({
        label: `Wk ${i + 1}`,
        messages: smoothPoint(i, 8, seed + i * 4),
      }));
    }
    return Array.from({ length: 6 }, (_, i) => ({
      label: `M${i + 1}`,
      messages: smoothPoint(i, 6, seed + i * 6),
    }));
  }, [range, botId]);
}

// ─── WorkspaceActivityChart ───────────────────────────────────────────────────

type WorkspaceChartProps = { range: WorkspaceRange; height?: number };

export function WorkspaceActivityChart({ range, height }: WorkspaceChartProps) {
  const data = useWorkspaceActivitySeries(range);
  const [ref, cw] = useContainerWidth();
  const cfg = getChartConfig(cw, height);

  return (
    <div ref={ref} style={{ width: "100%", minWidth: 0 }}>
      <ResponsiveContainer width="100%" height={cfg.height}>
        <BarChart data={data} margin={cfg.margin} barGap={cfg.barGap}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-default)"
            vertical={false}
            strokeOpacity={0.55}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: cfg.fontSize, fill: "var(--text-tertiary)" }}
            axisLine={false}
            tickLine={false}
            tickMargin={cfg.tickMargin}
            interval={cfg.xInterval}
          />
          <YAxis
            tick={{ fontSize: cfg.fontSize, fill: "var(--text-tertiary)" }}
            axisLine={false}
            tickLine={false}
            width={cfg.yAxisWidth}
            tickFormatter={cfg.yTickFormatter}
            tickCount={cfg.yTickCount}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.03)", radius: 8 }}
            contentStyle={tooltipBox}
            labelStyle={{
              color: "var(--text-primary)",
              fontWeight: 600,
              marginBottom: 4,
            }}
          />
          {cfg.showLegend && (
            <Legend
              wrapperStyle={{
                fontSize: cfg.fontSize,
                paddingTop: cfg.legendPaddingTop,
              }}
              formatter={(value) => (
                <span style={{ color: "var(--text-secondary)" }}>
                  {String(value)}
                </span>
              )}
            />
          )}
          <Bar
            dataKey="messages"
            name="Messages"
            fill="var(--text-primary)"
            radius={cfg.radius}
            maxBarSize={cfg.maxBarPrimary}
          />
          <Bar
            dataKey="users"
            name="Unique users"
            fill="var(--text-secondary)"
            opacity={0.65}
            radius={cfg.radius}
            maxBarSize={cfg.maxBarSecondary}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── BotMessagesTrendChart ────────────────────────────────────────────────────

type BotChartProps = { range: BotTrendRange; botId: string; height?: number };

export function BotMessagesTrendChart({ range, botId, height }: BotChartProps) {
  const data = useBotMessagesSeries(range, botId);
  const [ref, cw] = useContainerWidth();
  const cfg = getChartConfig(cw, height);

  return (
    <div ref={ref} style={{ width: "100%", minWidth: 0 }}>
      <ResponsiveContainer width="100%" height={cfg.height}>
        <BarChart data={data} margin={cfg.margin} barGap={cfg.barGap}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-default)"
            vertical={false}
            strokeOpacity={0.55}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: cfg.fontSize, fill: "var(--text-tertiary)" }}
            axisLine={false}
            tickLine={false}
            tickMargin={cfg.tickMargin}
            interval={cfg.xInterval}
          />
          <YAxis
            tick={{ fontSize: cfg.fontSize, fill: "var(--text-tertiary)" }}
            axisLine={false}
            tickLine={false}
            width={cfg.yAxisWidth}
            tickFormatter={cfg.yTickFormatter}
            tickCount={cfg.yTickCount}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.03)", radius: 8 }}
            contentStyle={tooltipBox}
            labelStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
          />
          <Bar
            dataKey="messages"
            name="Messages"
            fill="var(--text-primary)"
            radius={[
              cfg.radius[0] + 2,
              cfg.radius[1] + 2,
              cfg.radius[2],
              cfg.radius[3],
            ]}
            maxBarSize={cfg.maxBarPrimary + 8}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
