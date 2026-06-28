"use client";
import { useState, useRef, useEffect } from "react";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import * as d3 from "d3";

// ─── Waterfall Data ───────────────────────────────────────────────────
const WF_DATA = [
  { name: "Revenue",      base: 0,   display: 850, fill: "#00d4ff", type: "start"    },
  { name: "COGS",         base: 540, display: 310, fill: "#f472b6", type: "negative" },
  { name: "Gross Profit", base: 0,   display: 540, fill: "rgba(148,163,184,0.45)", type: "subtotal" },
  { name: "OpEx",         base: 360, display: 180, fill: "#f472b6", type: "negative" },
  { name: "EBITDA",       base: 0,   display: 360, fill: "rgba(148,163,184,0.45)", type: "subtotal" },
  { name: "D&A",          base: 315, display: 45,  fill: "#f472b6", type: "negative" },
  { name: "EBIT",         base: 0,   display: 315, fill: "rgba(148,163,184,0.45)", type: "subtotal" },
  { name: "Interest",     base: 290, display: 25,  fill: "#f472b6", type: "negative" },
  { name: "Tax",          base: 248, display: 42,  fill: "#f472b6", type: "negative" },
  { name: "Net Income",   base: 0,   display: 248, fill: "#4ade80", type: "total"    },
];

function WfTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const item = WF_DATA.find(d => d.name === label);
  if (!item) return null;
  const isSub = item.type === "subtotal" || item.type === "total" || item.type === "start";
  const text = isSub ? `$${item.display}M` : `${item.type === "negative" ? "-" : "+"}$${item.display}M`;
  return (
    <div style={{ background: "rgba(2,8,23,0.96)", border: "1px solid rgba(0,212,255,0.3)", padding: "8px 12px", borderRadius: 6, fontSize: 12 }}>
      <p style={{ color: "#00d4ff", fontWeight: 600, marginBottom: 2 }}>{label}</p>
      <p style={{ color: "#e2e8f0" }}>{text}</p>
    </div>
  );
}

function WaterfallChart() {
  return (
    <div>
      <p className="text-xs mb-4" style={{ color: "#64748b" }}>P&L Bridge — values in $M · Grey = subtotals, Green = net income, Pink = costs</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={WF_DATA} barCategoryGap="18%">
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
          <Tooltip content={<WfTooltip />} />
          <Bar dataKey="base" stackId="wf" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="display" stackId="wf" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {WF_DATA.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-5 mt-2 text-xs justify-center" style={{ color: "#64748b" }}>
        {[["#00d4ff","Revenue"], ["#4ade80","Net Income"], ["#f472b6","Costs"], ["rgba(148,163,184,0.6)","Subtotals"]].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: c }} />{l}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mekko Data ───────────────────────────────────────────────────────
const MEKKO_MARKETS = [
  { name: "N. America", size: 45, cols: [{ name: "Leader", share: 42, color: "#00d4ff" }, { name: "Challenger", share: 31, color: "#a855f7" }, { name: "Others", share: 27, color: "rgba(255,255,255,0.1)" }] },
  { name: "Europe",     size: 28, cols: [{ name: "Leader", share: 35, color: "#00d4ff" }, { name: "Challenger", share: 28, color: "#a855f7" }, { name: "Others", share: 37, color: "rgba(255,255,255,0.1)" }] },
  { name: "Asia",       size: 18, cols: [{ name: "Leader", share: 28, color: "#00d4ff" }, { name: "Challenger", share: 25, color: "#a855f7" }, { name: "Others", share: 47, color: "rgba(255,255,255,0.1)" }] },
  { name: "Emerging",   size:  9, cols: [{ name: "Leader", share: 20, color: "#00d4ff" }, { name: "Challenger", share: 22, color: "#a855f7" }, { name: "Others", share: 58, color: "rgba(255,255,255,0.1)" }] },
];

function MekkoChart() {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !wrapRef.current) return;
    const W = wrapRef.current.clientWidth || 700;
    const H = 320;
    const mg = { t: 10, r: 10, b: 55, l: 50 };
    const IW = W - mg.l - mg.r, IH = H - mg.t - mg.b;

    const svg = d3.select(svgRef.current).attr("width", W).attr("height", H);
    svg.selectAll("*").remove();

    const xS = d3.scaleLinear().domain([0, 100]).range([0, IW]);
    const yS = d3.scaleLinear().domain([0, 100]).range([IH, 0]);
    const root = svg.append("g").attr("transform", `translate(${mg.l},${mg.t})`);

    root.append("rect").attr("width", IW).attr("height", IH)
      .attr("fill", "rgba(255,255,255,0.02)").attr("stroke", "rgba(255,255,255,0.06)");

    yS.ticks(5).forEach(v => {
      root.append("line").attr("x1", 0).attr("x2", IW).attr("y1", yS(v)).attr("y2", yS(v))
        .attr("stroke", "rgba(255,255,255,0.05)");
    });
    root.append("g").call(d3.axisLeft(yS).ticks(5).tickFormat(v => `${v}%`))
      .call(g => { g.select(".domain").remove(); g.selectAll("line").remove(); g.selectAll("text").attr("fill", "#94a3b8").attr("font-size", 10); });

    let cumX = 0;
    MEKKO_MARKETS.forEach(m => {
      const colX = xS(cumX), colW = xS(cumX + m.size) - xS(cumX);
      let cumShare = 0;
      m.cols.forEach(seg => {
        const y = yS(cumShare + seg.share), h = yS(cumShare) - yS(cumShare + seg.share);
        root.append("rect").attr("x", colX + 1).attr("y", y).attr("width", colW - 2).attr("height", h).attr("fill", seg.color);
        if (h > 16 && colW > 30) {
          root.append("text").attr("x", colX + colW / 2).attr("y", y + h / 2)
            .attr("text-anchor", "middle").attr("dy", "0.35em").attr("font-size", 9)
            .attr("fill", seg.name === "Others" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.9)").attr("font-weight", "600")
            .text(`${seg.share}%`);
        }
        cumShare += seg.share;
      });
      root.append("rect").attr("x", colX).attr("y", 0).attr("width", colW).attr("height", IH)
        .attr("fill", "none").attr("stroke", "rgba(255,255,255,0.08)").attr("stroke-width", 1);
      root.append("text").attr("x", colX + colW / 2).attr("y", IH + 18).attr("text-anchor", "middle").attr("font-size", 11).attr("fill", "#94a3b8").text(m.name);
      root.append("text").attr("x", colX + colW / 2).attr("y", IH + 32).attr("text-anchor", "middle").attr("font-size", 10).attr("fill", "#64748b").text(`$${m.size}B`);
      cumX += m.size;
    });
  }, []);

  return (
    <div>
      <p className="text-xs mb-3" style={{ color: "#64748b" }}>Column width = market size · Height = share % · TAM: $100B</p>
      <div ref={wrapRef}><svg ref={svgRef} className="w-full" /></div>
      <div className="flex gap-6 mt-3 text-xs justify-center" style={{ color: "#64748b" }}>
        {[["#00d4ff","Leader"], ["#a855f7","Challenger"], ["rgba(255,255,255,0.2)","Others"]].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: c, border: "1px solid rgba(255,255,255,0.15)" }} />{l}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Dot Plot Data ────────────────────────────────────────────────────
const DOT_DATA = [
  { metric: "NPS Score",       v2020: 42,  v2024: 71,  unit: "pts", higherGood: true  },
  { metric: "Revenue Growth",  v2020: 18,  v2024: 34,  unit: "%",   higherGood: true  },
  { metric: "Market Share",    v2020: 12,  v2024: 19,  unit: "%",   higherGood: true  },
  { metric: "Satisfaction",    v2020: 3.2, v2024: 4.1, unit: "/5",  higherGood: true  },
  { metric: "Churn Rate",      v2020: 8.2, v2024: 5.1, unit: "%",   higherGood: false },
  { metric: "Resolution Time", v2020: 48,  v2024: 12,  unit: "hrs", higherGood: false },
  { metric: "CAC",             v2020: 285, v2024: 210, unit: "$",   higherGood: false },
  { metric: "Defect Rate",     v2020: 4.1, v2024: 1.8, unit: "%",   higherGood: false },
].sort((a, b) => Math.abs((b.v2024 - b.v2020) / b.v2020) - Math.abs((a.v2024 - a.v2020) / a.v2020));

function DotPlot() {
  const ROW_H = 50, PAD_T = 34, LABEL_W = 138, DOT_X1 = LABEL_W + 55, DOT_X2 = LABEL_W + 310, VW = LABEL_W + 420;
  const VH = DOT_DATA.length * ROW_H + PAD_T + 16;
  return (
    <div>
      <p className="text-xs mb-3" style={{ color: "#64748b" }}>Sorted by magnitude of change · Cyan = improvement, Pink = decline</p>
      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ maxHeight: 460 }}>
        <text x={DOT_X1} y={20} textAnchor="middle" fill="#94a3b8" fontSize={11} fontWeight={600}>2020</text>
        <text x={DOT_X2} y={20} textAnchor="middle" fill="#00d4ff" fontSize={11} fontWeight={600}>2024</text>
        <line x1={DOT_X1} y1={PAD_T} x2={DOT_X1} y2={VH - 8} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        <line x1={DOT_X2} y1={PAD_T} x2={DOT_X2} y2={VH - 8} stroke="rgba(0,212,255,0.15)" strokeWidth={1} />
        {DOT_DATA.map((d, i) => {
          const cy = PAD_T + i * ROW_H + ROW_H / 2;
          const pct = (d.v2024 - d.v2020) / d.v2020 * 100;
          const isGood = d.higherGood ? pct > 0 : pct < 0;
          const color = isGood ? "#22d3ee" : "#f472b6";
          const absPct = Math.abs(pct).toFixed(0);
          return (
            <g key={d.metric}>
              <text x={LABEL_W - 6} y={cy + 4} textAnchor="end" fill="#94a3b8" fontSize={11}>{d.metric}</text>
              <line x1={DOT_X1} y1={cy} x2={DOT_X2} y2={cy} stroke={color} strokeWidth={1.5} opacity={0.35} />
              <circle cx={DOT_X1} cy={cy} r={5} fill="rgba(148,163,184,0.12)" stroke="#94a3b8" strokeWidth={2} />
              <text x={DOT_X1} y={cy - 10} textAnchor="middle" fill="#64748b" fontSize={9}>{d.v2020}{d.unit}</text>
              <circle cx={DOT_X2} cy={cy} r={6} fill={color + "22"} stroke={color} strokeWidth={2.5} />
              <text x={DOT_X2} y={cy - 10} textAnchor="middle" fill={color} fontSize={9} fontWeight="bold">{d.v2024}{d.unit}</text>
              <rect x={DOT_X2 + 16} y={cy - 9} width={50} height={18} rx={4} fill={color + "1A"} />
              <text x={DOT_X2 + 41} y={cy + 4} textAnchor="middle" fill={color} fontSize={10} fontWeight="bold">{pct > 0 ? "+" : ""}{absPct}%</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Population Pyramid Data ─────────────────────────────────────────
const PYRAMID_DATA = [
  { age: "80+",   male: -30,  female: 38  },
  { age: "70–79", male: -85,  female: 90  },
  { age: "60–69", male: -185, female: 172 },
  { age: "50–59", male: -290, female: 275 },
  { age: "40–49", male: -380, female: 360 },
  { age: "30–39", male: -420, female: 395 },
  { age: "20–29", male: -280, female: 310 },
  { age: "10–19", male: -45,  female: 52  },
  { age: "0–9",   male: -5,   female: 4   },
].reverse();

function PopulationPyramid() {
  const TT: any = {
    contentStyle: { background: "rgba(2,8,23,0.96)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 6, fontSize: 12 },
    itemStyle: { color: "#e2e8f0" },
    labelStyle: { color: "#00d4ff", fontWeight: 600 },
    formatter: (v: any, name: any) => [`${Math.abs(Number(v))}K`, name === "male" ? "Male" : "Female"],
  };
  return (
    <div>
      <p className="text-xs mb-3" style={{ color: "#64748b" }}>Customer age distribution · Values in thousands</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={PYRAMID_DATA} layout="vertical" margin={{ top: 4, right: 50, bottom: 4, left: 36 }} barSize={14} barGap={1}>
          <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis type="number" domain={[-460, 460]} tickFormatter={v => String(Math.abs(v))} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="age" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={38} />
          <Tooltip {...TT} />
          <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <Bar dataKey="male"   fill="#00d4ff" fillOpacity={0.65} name="male" />
          <Bar dataKey="female" fill="#a855f7" fillOpacity={0.65} name="female" />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-6 mt-1 text-xs justify-center" style={{ color: "#64748b" }}>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "#00d4ff" }} />Male</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "#a855f7" }} />Female</div>
      </div>
    </div>
  );
}

// ─── Stacked 100% Bar Data ────────────────────────────────────────────
const S100_DATA = [
  { year: "2019", Analytics: 35, Commerce: 28, FinTech: 18, HealthTech: 10, Enterprise: 9  },
  { year: "2020", Analytics: 32, Commerce: 22, FinTech: 20, HealthTech: 16, Enterprise: 10 },
  { year: "2021", Analytics: 30, Commerce: 25, FinTech: 22, HealthTech: 14, Enterprise: 9  },
  { year: "2022", Analytics: 28, Commerce: 27, FinTech: 23, HealthTech: 13, Enterprise: 9  },
  { year: "2023", Analytics: 26, Commerce: 28, FinTech: 24, HealthTech: 13, Enterprise: 9  },
  { year: "2024", Analytics: 25, Commerce: 29, FinTech: 25, HealthTech: 12, Enterprise: 9  },
];
const S100_COLORS: Record<string, string> = { Analytics: "#00d4ff", Commerce: "#a855f7", FinTech: "#22d3ee", HealthTech: "#4ade80", Enterprise: "#f472b6" };

function StackedBar100() {
  const TT = {
    contentStyle: { background: "rgba(2,8,23,0.96)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 6, fontSize: 12 },
    itemStyle: { color: "#e2e8f0" },
    labelStyle: { color: "#00d4ff", fontWeight: 600 },
    formatter: (v: any) => [`${v}%`],
  };
  return (
    <div>
      <p className="text-xs mb-3" style={{ color: "#64748b" }}>Revenue composition 2019–2024 · Each bar = 100%</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={S100_DATA}>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip {...TT} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
          {Object.entries(S100_COLORS).map(([k, c]) => (
            <Bar key={k} dataKey={k} stackId="a" fill={c} fillOpacity={0.8} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────
const TABS = ["Waterfall", "Mekko", "Dot Plot", "Pyramid", "100% Bar"] as const;
type Tab = typeof TABS[number];

export default function McKinseyCharts() {
  const [active, setActive] = useState<Tab>("Waterfall");

  return (
    <section className="py-20 px-6" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4 text-xs font-medium"
            style={{ borderColor: "rgba(168,85,247,0.3)", color: "var(--neon-purple)", background: "rgba(168,85,247,0.05)" }}>
            McKinsey-Style Charts
          </div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            Strategic Analytics —{" "}
            <span style={{ background: "linear-gradient(135deg,#a855f7,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Consulting Visualizations
            </span>
          </h2>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Waterfall · Mekko · Cleveland Dot Plot · Population Pyramid · 100% Stacked Bar
          </p>
        </div>

        <div className="glass-card rounded-xl p-6" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          {/* Tab switcher */}
          <div className="flex flex-wrap gap-2 mb-6">
            {TABS.map(t => (
              <button key={t} onClick={() => setActive(t)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={active === t
                  ? { background: "rgba(168,85,247,0.2)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.4)" }
                  : { background: "rgba(255,255,255,0.03)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }
                }>
                {t}
              </button>
            ))}
          </div>

          {active === "Waterfall" && <WaterfallChart />}
          {active === "Mekko"     && <MekkoChart />}
          {active === "Dot Plot"  && <DotPlot />}
          {active === "Pyramid"   && <PopulationPyramid />}
          {active === "100% Bar"  && <StackedBar100 />}
        </div>
      </div>
    </section>
  );
}
