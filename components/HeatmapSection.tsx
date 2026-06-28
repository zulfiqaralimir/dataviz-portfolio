"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

// ── Calendar data (past 365 days from 2026-06-28) ───────────────────
const CAL_DATA: { date: Date; value: number }[] = (() => {
  const rng = seededRng(99);
  const result: { date: Date; value: number }[] = [];
  const end = new Date(2026, 5, 28);
  for (let i = 364; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 86400000);
    result.push({ date: new Date(d), value: Math.floor(rng() * 9800) + 200 });
  }
  return result;
})();

// ── Correlation data ─────────────────────────────────────────────────
const CORR_VARS = ["Revenue", "Users", "Conversion", "Mkt Cap", "Volume", "Daily Chg"];
const CORR_MATRIX = [
  [ 1.00,  0.87,  0.91,  0.74,  0.31, -0.12],
  [ 0.87,  1.00,  0.83,  0.68,  0.28, -0.09],
  [ 0.91,  0.83,  1.00,  0.71,  0.25, -0.15],
  [ 0.74,  0.68,  0.71,  1.00,  0.44,  0.18],
  [ 0.31,  0.28,  0.25,  0.44,  1.00,  0.52],
  [-0.12, -0.09, -0.15,  0.18,  0.52,  1.00],
];

// ── Risk data ────────────────────────────────────────────────────────
const PROB_LABELS  = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];
const IMPACT_LABELS = ["Negligible", "Minor", "Moderate", "Major", "Catastrophic"];
const RISKS = [
  { label: "Data Breach",      impact: 5, prob: 3 },
  { label: "Market Crash",     impact: 5, prob: 2 },
  { label: "Regulatory",       impact: 4, prob: 4 },
  { label: "System Outage",    impact: 3, prob: 3 },
  { label: "Competitor Entry", impact: 3, prob: 4 },
  { label: "FX Risk",          impact: 2, prob: 3 },
  { label: "Talent Gap",       impact: 2, prob: 4 },
  { label: "Supply Chain",     impact: 4, prob: 2 },
];

function riskScore(prob: number, impact: number) { return prob * impact; }
function riskBgColor(prob: number, impact: number): string {
  const s = riskScore(prob, impact);
  if (s >= 15) return "rgba(239,68,68,0.18)";
  if (s >= 9)  return "rgba(249,115,22,0.15)";
  if (s >= 4)  return "rgba(234,179,8,0.13)";
  return "rgba(34,197,94,0.12)";
}
function riskBadgeColor(prob: number, impact: number): string {
  const s = riskScore(prob, impact);
  if (s >= 15) return "#ef4444";
  if (s >= 9)  return "#f97316";
  if (s >= 4)  return "#eab308";
  return "#22c55e";
}

// ── CalendarHeatmap component ────────────────────────────────────────
function CalendarHeatmap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number; date: string; val: number } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const cell = 11, gap = 2, step = cell + gap;
    const ml = 30, mt = 22;
    const weeks = Math.ceil(CAL_DATA.length / 7);
    const W = ml + weeks * step + 20;
    const H = mt + 7 * step + 24;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("width", "100%");
    svg.selectAll("*").remove();

    const maxVal = d3.max(CAL_DATA, (d) => d.value) ?? 10000;
    const colorScale = d3.scaleSequential(d3.interpolateGreens).domain([0, maxVal]);

    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    let lastMonth = -1;
    CAL_DATA.forEach((calDay, i) => {
      const wk = Math.floor(i / 7);
      const mo = calDay.date.getMonth();
      if (mo !== lastMonth) {
        svg.append("text").attr("x", ml + wk * step).attr("y", 12)
          .attr("fill", "#64748b").attr("font-size", 9).text(MONTHS[mo]);
        lastMonth = mo;
      }
    });

    ["Mon", "", "Wed", "", "Fri", "", ""].forEach((lbl, i) => {
      if (lbl) {
        svg.append("text").attr("x", ml - 4).attr("y", mt + i * step + cell)
          .attr("fill", "#64748b").attr("font-size", 9).attr("text-anchor", "end").text(lbl);
      }
    });

    CAL_DATA.forEach((calDay, i) => {
      const wk = Math.floor(i / 7);
      const dow = i % 7;
      const x = ml + wk * step;
      const y = mt + dow * step;
      const dateStr = calDay.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

      svg.append("rect")
        .attr("x", x).attr("y", y).attr("width", cell).attr("height", cell).attr("rx", 2)
        .attr("fill", colorScale(calDay.value)).attr("opacity", 0.85)
        .style("cursor", "pointer")
        .on("mousemove", function (event: any) {
          d3.select(this).attr("opacity", 1).attr("stroke", "#00d4ff").attr("stroke-width", 1);
          const rect = wrapRef.current?.getBoundingClientRect();
          if (!rect) return;
          setTip({ x: event.clientX - rect.left + 10, y: event.clientY - rect.top - 55, date: dateStr, val: calDay.value });
        })
        .on("mouseleave", function () {
          d3.select(this).attr("opacity", 0.85).attr("stroke", "none");
          setTip(null);
        });
    });

    const lgW = 80, lgH = 6, lgX = W - lgW - 4, lgY = H - 12;
    const defs = svg.append("defs");
    const grad = defs.append("linearGradient").attr("id", "cal-dark-lg");
    [0, 0.5, 1].forEach(t => grad.append("stop").attr("offset", `${t * 100}%`).attr("stop-color", colorScale(t * maxVal)));
    svg.append("rect").attr("x", lgX).attr("y", lgY).attr("width", lgW).attr("height", lgH).attr("rx", 2).attr("fill", "url(#cal-dark-lg)");
    svg.append("text").attr("x", lgX - 2).attr("y", lgY + 5).attr("fill", "#64748b").attr("font-size", 8).attr("text-anchor", "end").text("Less");
    svg.append("text").attr("x", lgX + lgW + 2).attr("y", lgY + 5).attr("fill", "#64748b").attr("font-size", 8).text("More");
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <svg ref={svgRef} className="w-full" />
      {tip && (
        <div className="absolute pointer-events-none z-10 rounded-lg px-2.5 py-1.5 text-xs border border-white/15"
          style={{ left: tip.x, top: Math.max(0, tip.y), background: "rgba(2,8,23,0.95)", boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
          <p className="text-slate-400 text-[10px]">{tip.date}</p>
          <p className="text-cyan-400 font-bold">{tip.val.toLocaleString()} vol</p>
        </div>
      )}
    </div>
  );
}

// ── CorrelationMatrix component ──────────────────────────────────────
function CorrelationMatrix() {
  const n = CORR_VARS.length;
  const cell = 68, labelW = 76;
  const W = labelW + n * cell;
  const H = labelW + n * cell;

  function cellFill(v: number): string {
    if (v >= 0) {
      const a = 0.12 + 0.72 * v;
      const g = Math.round(100 + 155 * v);
      return `rgba(0,${g},212,${a})`;
    } else {
      const t = -v;
      const a = 0.12 + 0.68 * t;
      return `rgba(168,85,247,${a})`;
    }
  }

  return (
    <div className="overflow-x-auto">
      <svg width={W} height={H} className="mx-auto block">
        {CORR_VARS.map((v, i) => (
          <text key={`rl${i}`} x={labelW - 6} y={labelW + i * cell + cell / 2 + 4}
            textAnchor="end" fill="#94a3b8" fontSize={10}>{v}</text>
        ))}
        {CORR_VARS.map((v, i) => (
          <text key={`cl${i}`} x={labelW + i * cell + cell / 2} y={labelW - 6}
            textAnchor="middle" fill="#94a3b8" fontSize={10}
            transform={`rotate(-35,${labelW + i * cell + cell / 2},${labelW - 6})`}>{v}</text>
        ))}
        {CORR_MATRIX.map((row, ri) =>
          row.map((val, ci) => {
            const x = labelW + ci * cell;
            const y = labelW + ri * cell;
            const isDiag = ri === ci;
            return (
              <g key={`${ri}-${ci}`}>
                <rect x={x + 1} y={y + 1} width={cell - 2} height={cell - 2} rx={3}
                  fill={cellFill(val)} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                <text x={x + cell / 2} y={y + cell / 2 + 4} textAnchor="middle"
                  fontSize={isDiag ? 13 : 11} fontWeight={isDiag ? 700 : 500}
                  fill={isDiag ? "#00d4ff" : Math.abs(val) > 0.6 ? "white" : "#94a3b8"}>
                  {val.toFixed(2)}
                </text>
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}

// ── RiskMatrix component ─────────────────────────────────────────────
function RiskMatrix() {
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-max">
        <div className="flex mb-1 ml-20">
          {IMPACT_LABELS.map(l => (
            <div key={l} className="w-24 text-center text-[10px] text-slate-500 font-medium">{l}</div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {[5,4,3,2,1].map(prob => (
            <div key={prob} className="flex gap-1 items-center">
              <div className="w-20 text-right text-[10px] text-slate-500 pr-2 leading-tight">{PROB_LABELS[prob - 1]}</div>
              {[1,2,3,4,5].map(impact => {
                const here = RISKS.filter(r => r.prob === prob && r.impact === impact);
                return (
                  <div key={impact} className="w-24 h-16 rounded flex flex-col items-center justify-center gap-1 border border-white/5"
                    style={{ background: riskBgColor(prob, impact) }}>
                    {here.map(r => (
                      <div key={r.label} className="text-[9px] text-center px-1 py-0.5 rounded font-semibold leading-tight text-white"
                        style={{ background: riskBadgeColor(r.prob, r.impact) }}>
                        {r.label}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 ml-20 text-[11px] text-slate-500">
          <span className="font-medium">Risk Level:</span>
          {[["Low","#22c55e"],["Medium","#eab308"],["High","#f97316"],["Critical","#ef4444"]].map(([l, c]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} />{l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Section ─────────────────────────────────────────────────────
const TABS = ["Calendar Heatmap", "Correlation Matrix", "Risk Matrix"];

export default function HeatmapSection() {
  const [activeTab, setActiveTab] = useState("Calendar Heatmap");

  return (
    <section id="heatmaps" className="py-24 px-6 gradient-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <span className="text-xs text-cyan-400 tracking-widest uppercase font-medium">Advanced Analytics</span>
          <h2 className="text-4xl font-bold text-white mt-2 mb-3">
            Heatmap <span className="gradient-text">Visualizations</span>
          </h2>
          <p className="text-slate-400 max-w-xl">
            Calendar activity grids, financial correlation matrices, and enterprise risk assessments — used daily at Google, Bloomberg, McKinsey, and Goldman Sachs.
          </p>
        </motion.div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                activeTab === tab
                  ? "border-cyan-400/50 text-cyan-400 bg-cyan-400/10"
                  : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className="glass-card rounded-2xl p-6 border border-white/5">
          {activeTab === "Calendar Heatmap" && (
            <>
              <h3 className="text-sm font-semibold text-white mb-1">Trading Volume — Past 12 Months</h3>
              <p className="text-xs text-slate-500 mb-4">GitHub-style daily activity grid · Hover for details</p>
              <CalendarHeatmap />
            </>
          )}
          {activeTab === "Correlation Matrix" && (
            <>
              <h3 className="text-sm font-semibold text-white mb-1">Financial Variable Correlations</h3>
              <p className="text-xs text-slate-500 mb-4">
                <span className="text-cyan-400">■</span> Blue = positive &nbsp;·&nbsp;
                <span className="text-purple-400">■</span> Purple = negative &nbsp;·&nbsp; Diagonal = 1.00
              </p>
              <CorrelationMatrix />
            </>
          )}
          {activeTab === "Risk Matrix" && (
            <>
              <h3 className="text-sm font-semibold text-white mb-1">Enterprise Risk Assessment Matrix</h3>
              <p className="text-xs text-slate-500 mb-4">Probability × Impact · 8 identified risk items</p>
              <RiskMatrix />
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
