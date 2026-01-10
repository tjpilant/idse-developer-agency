"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

export function ProgressDonut({ percent }: { percent: number }) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  const data = [{ name: "progress", value: safePercent, fill: "#0ea5e9" }];

  return (
    <div className="flex items-center justify-center">
      <RadialBarChart
        width={220}
        height={220}
        innerRadius={80}
        outerRadius={100}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar
          background={{ fill: "#e2e8f0" }}
          dataKey="value"
          cornerRadius={14}
          fill="#0ea5e9"
          clockWise
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#0f172a"
          fontSize={22}
          fontWeight={700}
        >
          {safePercent}%
        </text>
      </RadialBarChart>
    </div>
  );
}
