"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

const STREAM_KEYS = ["Analytics", "Commerce", "FinTech", "HealthTech", "Enterprise"] as const;
const STREAM_COLORS = ["#00d4ff", "#a855f7", "#f472b6", "#22d3ee", "#fb923c"];

const ALL_DATA = (() => {
  const rng = seededRng(55);
  return Array.from({ length: 36 }, (_, i) => {
    const d = new Date(2024, i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    return {
      month: label,
      Analytics:  Math.round(22000 + rng() * 14000 + i * 900),
      Commerce:   Math.round(16000 + rng() * 11000 + i * 650),
      FinTech:    Math.round(11000 + rng() * 9000  + i * 500),
      HealthTech: Math.round(7000  + rng() * 7000  + i * 420),
      Enterprise: Math.round(5000  + rng() * 5500  + i * 310),
    };
  });
})();

const PERIOD_OPTIONS = ["12 Months", "24 Months", "36 Months"] as const;
type Period = typeof PERIOD_OPTIONS[number];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0);
  return (
    <div className="glass-card rounded-xl p-3 border border-white/10 text-xs min-w-[160px]">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-3 mb-0.5">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold text-white">${(p.value / 1000).toFixed(0)}K</span>
        </div>
      ))}
      <div className="border-t border-white/10 mt-2 pt-2 flex justify-between">
        <span className="text-slate-500">Total</span>
        <span className="font-bold text-cyan-400">${(total / 1000).toFixed(0)}K</span>
      </div>
    </div>
  );
};

export default function StreamGraph() {
  const [period, setPeriod] = useState<Period>("24 Months");

  const months = period === "12 Months" ? 12 : period === "24 Months" ? 24 : 36;
  const data = ALL_DATA.slice(0, months);

  return (
    <section id="stream" className="py-24 px-6 gradient-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <span className="text-xs text-purple-400 tracking-widest uppercase font-medium">Trend Analysis</span>
          <h2 className="text-4xl font-bold text-white mt-2 mb-3">
            Stream <span className="gradient-text">Graph</span>
          </h2>
          <p className="text-slate-400 max-w-xl">
            Stacked area streams showing revenue composition across business lines over time — widely used at NYT, The Guardian, and financial analytics platforms.
          </p>
        </motion.div>

        <div className="flex gap-2 mb-6">
          {PERIOD_OPTIONS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                period === p
                  ? "border-purple-400/50 text-purple-400 bg-purple-400/10"
                  : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
              }`}>
              {p}
            </button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card rounded-2xl p-6 border border-white/5">
          <h3 className="text-sm font-semibold text-white mb-1">Revenue Streams by Business Line</h3>
          <p className="text-xs text-slate-500 mb-6">Monthly revenue contribution · {months} month view</p>
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <defs>
                {STREAM_KEYS.map((k, i) => (
                  <linearGradient key={k} id={`sg-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={STREAM_COLORS[i]} stopOpacity={0.5} />
                    <stop offset="95%" stopColor={STREAM_COLORS[i]} stopOpacity={0.15} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}
                interval={Math.max(0, Math.floor(months / 8) - 1)} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8", paddingTop: 8 }} />
              {STREAM_KEYS.map((k, i) => (
                <Area key={k} type="monotone" dataKey={k} stackId="stream"
                  stroke={STREAM_COLORS[i]} strokeWidth={1.5}
                  fill={`url(#sg-${k})`} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </section>
  );
}
