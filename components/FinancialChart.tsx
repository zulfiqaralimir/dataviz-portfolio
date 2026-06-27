"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Area
} from "recharts";

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const generateData = (days: number, base: number, seed = 42) => {
  const rng = seededRng(seed);
  const data = [];
  let price = base;
  let date = new Date(2025, 0, 1);
  for (let i = 0; i < days; i++) {
    const change = (rng() - 0.48) * base * 0.025;
    price = Math.max(price + change, base * 0.6);
    const open = price;
    const high = price + rng() * base * 0.015;
    const low = price - rng() * base * 0.012;
    const close = low + rng() * (high - low);
    const volume = Math.floor(rng() * 5000000 + 1000000);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
      ma20: 0,
    });
    date.setDate(date.getDate() + 1);
    price = close;
  }
  // Moving average
  for (let i = 19; i < data.length; i++) {
    data[i].ma20 = +(data.slice(i - 19, i + 1).reduce((s, d) => s + d.close, 0) / 20).toFixed(2);
  }
  return data;
};

const allData = generateData(180, 280, 42);
const ranges: { label: string; days: number }[] = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
];

const assets = [
  { label: "TECH Corp", color: "#00d4ff", base: 280 },
  { label: "DATA Inc", color: "#a855f7", base: 145 },
  { label: "AI Systems", color: "#f472b6", base: 520 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="glass-card rounded-xl p-3 border border-white/10 text-xs min-w-[140px]">
      <p className="text-slate-300 font-medium mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-3"><span className="text-slate-500">Open</span><span className="text-white">${d?.open}</span></div>
        <div className="flex justify-between gap-3"><span className="text-slate-500">High</span><span className="text-emerald-400">${d?.high}</span></div>
        <div className="flex justify-between gap-3"><span className="text-slate-500">Low</span><span className="text-pink-400">${d?.low}</span></div>
        <div className="flex justify-between gap-3"><span className="text-slate-500">Close</span><span className="text-cyan-400 font-bold">${d?.close}</span></div>
        <div className="flex justify-between gap-3"><span className="text-slate-500">Vol</span><span className="text-slate-300">{(d?.volume / 1e6).toFixed(1)}M</span></div>
      </div>
    </div>
  );
};

export default function FinancialChart() {
  const [range, setRange] = useState(90);
  const [activeAsset, setActiveAsset] = useState(0);

  const data = allData.slice(allData.length - range);
  const first = data[0]?.close ?? 0;
  const last = data[data.length - 1]?.close ?? 0;
  const pct = (((last - first) / first) * 100).toFixed(2);
  const isUp = last >= first;

  return (
    <section id="financial" className="py-24 px-6 bg-[#010b18]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-xs text-purple-400 tracking-widest uppercase font-medium">Financial Analytics</span>
          <h2 className="text-4xl font-bold text-white mt-2 mb-3">
            Market <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="text-slate-400 max-w-xl">
            OHLC candlestick-style analysis, volume overlays, and 20-day moving average for commercial financial tracking.
          </p>
        </motion.div>

        {/* Main chart card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl border border-white/5 overflow-hidden"
        >
          {/* Chart toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-white/5">
            {/* Asset selector */}
            <div className="flex gap-2">
              {assets.map((a, i) => (
                <button
                  key={a.label}
                  onClick={() => setActiveAsset(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeAsset === i
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-300 glass-card"
                  }`}
                  style={activeAsset === i ? { background: a.color + "22", border: `1px solid ${a.color}44`, color: a.color } : {}}
                >
                  {a.label}
                </button>
              ))}
            </div>

            {/* Price display */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-white">${last.toFixed(2)}</span>
              <span className={`text-sm font-medium ${isUp ? "text-emerald-400" : "text-pink-400"}`}>
                {isUp ? "+" : ""}{pct}%
              </span>
            </div>

            {/* Range selector */}
            <div className="flex gap-1 glass-card rounded-lg p-1">
              {ranges.map((r) => (
                <button
                  key={r.label}
                  onClick={() => setRange(r.days)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    range === r.days
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price chart */}
          <div className="p-6 pb-2">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={assets[activeAsset].color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={assets[activeAsset].color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false}
                  interval={Math.floor(data.length / 6)} />
                <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false}
                  domain={["auto", "auto"]} tickFormatter={(v) => `$${v}`} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={first} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="close" stroke="none" fill="url(#priceGrad)" />
                <Line type="monotone" dataKey="close" stroke={assets[activeAsset].color} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ma20" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Volume chart */}
          <div className="px-6 pb-6">
            <p className="text-xs text-slate-600 mb-2">Volume</p>
            <ResponsiveContainer width="100%" height={80}>
              <ComposedChart data={data}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Bar dataKey="volume" fill={assets[activeAsset].color} opacity={0.25} radius={[2, 2, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Mini sparklines */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {assets.map((a, i) => {
            const mini = generateData(30, a.base, 100 + i * 37);
            const f = mini[0].close; const l = mini[mini.length - 1].close;
            const up = l >= f;
            return (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-4 border border-white/5 cursor-pointer hover:border-white/10 transition-all"
                onClick={() => setActiveAsset(i)}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs text-slate-400 font-medium">{a.label}</span>
                  <span className={`text-xs font-medium ${up ? "text-emerald-400" : "text-pink-400"}`}>
                    {up ? "+" : ""}{(((l - f) / f) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-lg font-bold text-white mb-3">${l.toFixed(2)}</div>
                <ResponsiveContainer width="100%" height={50}>
                  <ComposedChart data={mini}>
                    <Line type="monotone" dataKey="close" stroke={a.color} strokeWidth={1.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
