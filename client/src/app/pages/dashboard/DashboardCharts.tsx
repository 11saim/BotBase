import React, { useId, useMemo } from "react";
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

/** Demo series shaped like real traffic */
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
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      return days.map((label, i) => ({
        label,
        messages: smoothPoint(i, 7, seed + i * 3),
        users: Math.max(4, Math.round(smoothPoint(i, 7, seed + i * 7) * 0.18)),
      }));
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

const tooltipBox: React.CSSProperties = {
  borderRadius: "14px",
  border: "1px solid var(--border-default)",
  fontSize: "12px",
  background: "var(--bg-primary)",
  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
};

type WorkspaceChartProps = {
  range: WorkspaceRange;
  height?: number;
};

export function WorkspaceActivityChart({
  range,
  height = 300,
}: WorkspaceChartProps) {
  const data = useWorkspaceActivitySeries(range);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 12, right: 12, left: -12, bottom: 0 }}
        barGap={8}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border-default)"
          vertical={false}
          strokeOpacity={0.55}
        />

        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
          axisLine={false}
          tickLine={false}
          tickMargin={10}
        />

        <YAxis
          tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
          axisLine={false}
          tickLine={false}
          width={42}
        />

        <Tooltip
          cursor={{
            fill: "rgba(0,0,0,0.03)",
            radius: 10,
          }}
          contentStyle={tooltipBox}
          labelStyle={{
            color: "var(--text-primary)",
            fontWeight: 600,
            marginBottom: 4,
          }}
        />

        <Legend
          wrapperStyle={{
            fontSize: "12px",
            paddingTop: "14px",
          }}
          formatter={(value) => (
            <span style={{ color: "var(--text-secondary)" }}>
              {String(value)}
            </span>
          )}
        />

        <Bar
          dataKey="messages"
          name="Messages"
          fill="var(--text-primary)"
          radius={[10, 10, 4, 4]}
          maxBarSize={34}
        />

        <Bar
          dataKey="users"
          name="Unique users"
          fill="var(--text-secondary)"
          opacity={0.65}
          radius={[10, 10, 4, 4]}
          maxBarSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

type BotChartProps = {
  range: BotTrendRange;
  botId: string;
  height?: number;
};

export function BotMessagesTrendChart({
  range,
  botId,
  height = 300,
}: BotChartProps) {
  const data = useBotMessagesSeries(range, botId);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 12, right: 12, left: -12, bottom: 0 }}
        barGap={10}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border-default)"
          vertical={false}
          strokeOpacity={0.55}
        />

        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
          axisLine={false}
          tickLine={false}
          tickMargin={10}
        />

        <YAxis
          tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
          axisLine={false}
          tickLine={false}
          width={44}
        />

        <Tooltip
          cursor={{
            fill: "rgba(0,0,0,0.03)",
            radius: 10,
          }}
          contentStyle={tooltipBox}
          labelStyle={{
            color: "var(--text-primary)",
            fontWeight: 600,
          }}
        />

        <Bar
          dataKey="messages"
          name="Messages"
          fill="var(--text-primary)"
          radius={[12, 12, 4, 4]}
          maxBarSize={42}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
