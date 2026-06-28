"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

const T10 = ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F"];
const ALL_KEYS = ["Analytics", "Commerce", "FinTech", "HealthTech", "Enterprise"] as const;

const ALL_DATA = (() => {
  const rng = seededRng(55);
  return Array.from({ length: 36 }, (_, i) => {
    const d = new Date(2024, i, 1);
    return {
      month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      Analytics:  Math.round(22000 + rng() * 14000 + i * 900),
      Commerce:   Math.round(16000 + rng() * 11000 + i * 650),
      FinTech:    Math.round(11000 + rng() * 9000  + i * 500),
      HealthTech: Math.round(7000  + rng() * 7000  + i * 420),
      Enterprise: Math.round(5000  + rng() * 5500  + i * 310),
    };
  });
})();

const TOOLTIP_STYLE = {
  contentStyle: { background: "white", border: "1px solid #D4D4D4", borderRadius: 4, fontSize: 11, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
};

export default function StreamSheet({ filters }: { filters: Record<string, string> }) {
  const periodLabel = filters["Period"] ?? "24 Months";
  const streamsFilter = filters["Streams"] ?? "All";
  const months = periodLabel === "12 Months" ? 12 : periodLabel === "36 Months" ? 36 : 24;
  const data = ALL_DATA.slice(0, months);
  const keys = streamsFilter === "Top 2" ? ALL_KEYS.slice(0, 2) : streamsFilter === "Top 3" ? ALL_KEYS.slice(0, 3) : ALL_KEYS;
  const interval = Math.max(0, Math.floor(months / 8) - 1);

  return (
    <div className="p-4 h-full overflow-y-auto" style={{ background: "var(--t-canvas)" }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--t-text)" }}>Revenue Stream Graph</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--t-text-muted)" }}>
            {periodLabel} · {keys.length} streams · Stacked area
          </p>
        </div>
      </div>

      <div className="t-card p-4">
        <p className="text-xs font-semibold mb-3" style={{ color: "var(--t-text)" }}>Revenue by Business Line — Monthly Contribution</p>
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <defs>
              {keys.map((k, i) => (
                <linearGradient key={k} id={`ss-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T10[i]} stopOpacity={0.55} />
                  <stop offset="95%" stopColor={T10[i]} stopOpacity={0.18} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="#EBEBEB" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} interval={interval} />
            <YAxis tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v: any) => [`$${(+v / 1000).toFixed(1)}K`, ""]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {keys.map((k, i) => (
              <Area key={k} type="monotone" dataKey={k} stackId="s"
                stroke={T10[i]} strokeWidth={1.5} fill={`url(#ss-${k})`} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-5 gap-2 mt-3">
        {keys.map((k, i) => {
          const last = data[data.length - 1];
          const val = (last as any)[k] as number;
          return (
            <div key={k} className="t-card p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: T10[i] }} />
                <span className="text-[11px] font-medium" style={{ color: "var(--t-text-muted)" }}>{k}</span>
              </div>
              <p className="text-sm font-bold" style={{ color: "var(--t-text)" }}>${(val / 1000).toFixed(0)}K</p>
              <p className="text-[10px]" style={{ color: "var(--t-text-muted)" }}>Latest month</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
