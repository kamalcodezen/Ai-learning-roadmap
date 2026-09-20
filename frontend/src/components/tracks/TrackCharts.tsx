"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Track } from "@/src/data/tracks";

export default function TrackCharts({ track }: { track: Track }) {
  const { charts } = track;

  const salary = charts.salaryByLevel.map((d) => ({
    ...d,
    salaryK: Math.round(d.salary / 1000),
  }));
  const skills = charts.topSkills.map((d) => ({ ...d, demand: d.demand }));
  const regions = charts.regionalDemand;
  const pieColors = ["#9F54F7", "#8523F5", "#C084FC", "#6B46C1"];

  const RADIAN = Math.PI / 180;

  const renderPieLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    outerRadius = 0,
    percent = 0,
    name,
  }: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    outerRadius?: number;
    percent?: number;
    name?: string;
  }) => {
    const radius = outerRadius + 24;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="rgb(var(--foreground))"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const tooltipStyle = {
    background: "rgb(var(--card))",
    border: "1px solid rgb(var(--border))",
    borderRadius: "0.5rem",
    fontSize: "0.75rem",
    color: "rgb(var(--foreground))",
    boxShadow: "var(--shadow)",
  };

  return (
    <section className="section-pad relative w-full overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[520px] w-[980px] rounded-[100%] bg-primary/10 blur-[150px] pointer-events-none -z-10" />

      <div className="global-pos">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3.5 py-1 font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Market Watch
          </span>
          <h2 className="section-title mt-4">
            How Popular Is the{" "}
            <span className="text-primary">{track.title}</span> Track?
          </h2>
          <p className="section-subtitle mt-1">
            Real demand signals compiled from 2026 job-market research — so you
            know exactly what you&apos;re investing your learning time into.
          </p>
        </div>

        {/* Charts grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* 1. Demand trend */}
          <div className="dashboard-card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins text-sm font-bold text-foreground">
                Demand Growth
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Q1 2024 → Q2 2026
              </span>
            </div>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={charts.demandTrend}
                  margin={{ top: 5, right: 5, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="demand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9F54F7" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#8523F5" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="period"
                    tick={{ fill: "rgb(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "rgb(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgb(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    cursor={{ stroke: "#9F54F7" }}
                    formatter={(value) => [Number(value).toLocaleString(), "Postings"]}
                    contentStyle={tooltipStyle}
                  />
                  <Area
                    type="monotone"
                    dataKey="postings"
                    stroke="#9F54F7"
                    strokeWidth={2.5}
                    fill="url(#demand)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Salary by level */}
          <div className="dashboard-card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins text-sm font-bold text-foreground">
                What It Pays
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Median Base (US)
              </span>
            </div>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salary}
                  margin={{ top: 5, right: 5, left: -14, bottom: 0 }}
                >
                  <XAxis
                    dataKey="level"
                    tick={{ fill: "rgb(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "rgb(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgb(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v}K`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgb(var(--primary) / 0.08)" }}
                    formatter={(value) => [`$${value}K`, "Salary"]}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="salaryK" radius={[6, 6, 0, 0]} maxBarSize={46}>
                    {salary.map((_, i) => (
                      <Cell key={i} fill={i === 2 ? "#8523F5" : "#9F54F7"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Most requested skills */}
          <div className="dashboard-card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins text-sm font-bold text-foreground">
                Most Requested Skills
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                % of postings
              </span>
            </div>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={skills}
                  margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: "rgb(var(--muted-foreground))", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="skill"
                    width={84}
                    tick={{ fill: "rgb(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgb(var(--primary) / 0.08)" }}
                    formatter={(value) => [`${value}%`, "Demand"]}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="demand" radius={[0, 6, 6, 0]} maxBarSize={16}>
                    {skills.map((_, i) => (
                      <Cell key={i} fill="#9F54F7" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Regional demand */}
          <div className="dashboard-card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins text-sm font-bold text-foreground">
                Where the Demand Is
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Global share
              </span>
            </div>
            <div className="mt-4 flex flex-col items-center gap-4 lg:flex-row lg:gap-6">
              <div className="h-72 w-full lg:h-64 lg:flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                    <Pie
                      data={regions}
                      dataKey="share"
                      nameKey="region"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={3}
                      labelLine={{
                        stroke: "rgb(var(--muted-foreground))",
                        strokeWidth: 1,
                      }}
                      label={renderPieLabel}
                    >
                      {regions.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={tooltipStyle}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 lg:w-56 lg:shrink-0 lg:flex-col lg:items-start lg:gap-3">
                {regions.map((d, i) => (
                  <div key={d.region} className="flex items-center gap-2.5">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: pieColors[i % pieColors.length] }}
                    />
                    <span className="font-poppins text-xs font-medium text-foreground/80">
                      {d.region}
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {d.share}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}