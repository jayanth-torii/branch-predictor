"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export function AdminBarChart({
  data,
  height = 240,
  color = "var(--color-orange)",
  colors,
  suffix = "",
}: {
  data: { name: string; count: number }[];
  height?: number;
  color?: string;
  colors?: string[];
  suffix?: string;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 34, bottom: 4, left: 8 }}
          barCategoryGap={10}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-slate-ink)", fontSize: 11, fontWeight: 600 }}
          />
          <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={14} isAnimationActive>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors?.[index % colors.length] ?? color} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              formatter={(value: unknown) => `${value}${suffix}`}
              style={{ fill: "var(--color-midnight)", fontSize: 11, fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
