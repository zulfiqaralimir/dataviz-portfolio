"use client";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

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

const CORR_VARS = ["Revenue", "Users", "Conversion", "Mkt Cap", "Volume", "Daily Chg"];
const CORR_MATRIX = [
  [ 1.00,  0.87,  0.91,  0.74,  0.31, -0.12],
  [ 0.87,  1.00,  0.83,  0.68,  0.28, -0.09],
  [ 0.91,  0.83,  1.00,  0.71,  0.25, -0.15],
  [ 0.74,  0.68,  0.71,  1.00,  0.44,  0.18],
  [ 0.31,  0.28,  0.25,  0.44,  1.00,  0.52],
  [-0.12, -0.09, -0.15,  0.18,  0.52,  1.00],
];

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

function riskBgColor(prob: number, impact: number): string {
  const s = prob * impact;
  if (s >= 15) return "rgba(239,68,68,0.12)";
  if (s >= 9)  return "rgba(249,115,22,0.10)";
  if (s >= 4)  return "rgba(234,179,8,0.10)";
  return "rgba(34,197,94,0.10)";
}
function riskBadgeColor(prob: number, impact: number): string {
  const s = prob * impact;
  if (s >= 15) return "#ef4444";
  if (s >= 9)  return "#f97316";
  if (s >= 4)  return "#ca8a04";
  return "#16a34a";
}

function CalHeatmap() {
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

    const svg = d3.select(svgRef.current).attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%");
    svg.selectAll("*").remove();

    const maxVal = d3.max(CAL_DATA, (d) => d.value) ?? 10000;
    const colorScale = d3.scaleSequential(d3.interpolateGreens).domain([0, maxVal]);

    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    let lastMonth = -1;
    CAL_DATA.forEach((calDay, i) => {
      const wk = Math.floor(i / 7);
      const mo = calDay.date.getMonth();
      if (mo !== lastMonth) {
        svg.append("text").attr("x", ml + wk * step).attr("y", 12).attr("fill", "#888").attr("font-size", 9).text(MONTHS[mo]);
        lastMonth = mo;
      }
    });

    ["Mon","","Wed","","Fri","",""].forEach((lbl, i) => {
      if (lbl) svg.append("text").attr("x", ml - 4).attr("y", mt + i * step + cell).attr("fill", "#888").attr("font-size", 9).attr("text-anchor", "end").text(lbl);
    });

    CAL_DATA.forEach((calDay, i) => {
      const wk = Math.floor(i / 7);
      const dow = i % 7;
      const x = ml + wk * step;
      const y = mt + dow * step;
      const dateStr = calDay.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

      svg.append("rect")
        .attr("x", x).attr("y", y).attr("width", cell).attr("height", cell).attr("rx", 2)
        .attr("fill", colorScale(calDay.value)).attr("opacity", 0.85).style("cursor", "pointer")
        .on("mousemove", function (event: any) {
          d3.select(this).attr("opacity", 1).attr("stroke", "var(--t-blue)").attr("stroke-width", 1);
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
    const grad = defs.append("linearGradient").attr("id", "cal-t-lg");
    [0, 0.5, 1].forEach(t => grad.append("stop").attr("offset", `${t * 100}%`).attr("stop-color", colorScale(t * maxVal)));
    svg.append("rect").attr("x", lgX).attr("y", lgY).attr("width", lgW).attr("height", lgH).attr("rx", 2).attr("fill", "url(#cal-t-lg)");
    svg.append("text").attr("x", lgX - 2).attr("y", lgY + 5).attr("fill", "#888").attr("font-size", 8).attr("text-anchor", "end").text("Less");
    svg.append("text").attr("x", lgX + lgW + 2).attr("y", lgY + 5).attr("fill", "#888").attr("font-size", 8).text("More");
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <svg ref={svgRef} className="w-full" />
      {tip && (
        <div className="absolute pointer-events-none z-10 rounded px-2 py-1.5 text-xs border shadow-lg"
          style={{ left: tip.x, top: Math.max(0, tip.y), background: "white", borderColor: "var(--t-border)" }}>
          <p style={{ color: "var(--t-text-muted)" }} className="text-[10px]">{tip.date}</p>
          <p style={{ color: "var(--t-blue)" }} className="font-bold">{tip.val.toLocaleString()} vol</p>
        </div>
      )}
    </div>
  );
}

function CorrMatrix() {
  const n = CORR_VARS.length;
  const cell = 64, labelW = 72;
  const W = labelW + n * cell;
  const H = labelW + n * cell;

  function cellFill(v: number): string {
    if (v >= 0) return `rgba(68,103,196,${0.08 + 0.7 * v})`;
    return `rgba(225,87,89,${0.08 + 0.65 * -v})`;
  }

  return (
    <div className="overflow-x-auto">
      <svg width={W} height={H} className="mx-auto block">
        {CORR_VARS.map((v, i) => (
          <text key={`rl${i}`} x={labelW - 6} y={labelW + i * cell + cell / 2 + 4}
            textAnchor="end" fill="var(--t-text-muted)" fontSize={10}>{v}</text>
        ))}
        {CORR_VARS.map((v, i) => (
          <text key={`cl${i}`} x={labelW + i * cell + cell / 2} y={labelW - 6}
            textAnchor="middle" fill="var(--t-text-muted)" fontSize={10}
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
                  fill={cellFill(val)} stroke="var(--t-border-lt)" strokeWidth={1} />
                <text x={x + cell / 2} y={y + cell / 2 + 4} textAnchor="middle"
                  fontSize={isDiag ? 12 : 10} fontWeight={isDiag ? 700 : 500}
                  fill={isDiag ? "var(--t-blue)" : Math.abs(val) > 0.55 ? "white" : "var(--t-text)"}>
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

function RiskMx() {
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-max">
        <div className="flex mb-1 ml-24">
          {IMPACT_LABELS.map(l => (
            <div key={l} className="w-24 text-center text-[10px] font-medium" style={{ color: "var(--t-text-muted)" }}>{l}</div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {[5,4,3,2,1].map(prob => (
            <div key={prob} className="flex gap-1 items-center">
              <div className="w-24 text-right text-[10px] pr-2 leading-tight" style={{ color: "var(--t-text-muted)" }}>{PROB_LABELS[prob - 1]}</div>
              {[1,2,3,4,5].map(impact => {
                const here = RISKS.filter(r => r.prob === prob && r.impact === impact);
                return (
                  <div key={impact} className="w-24 h-14 rounded flex flex-col items-center justify-center gap-1 border"
                    style={{ background: riskBgColor(prob, impact), borderColor: "var(--t-border-lt)" }}>
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
        <div className="flex items-center gap-4 mt-3 ml-24 text-[11px]" style={{ color: "var(--t-text-muted)" }}>
          <span className="font-medium">Risk Level:</span>
          {[["Low","#16a34a"],["Medium","#ca8a04"],["High","#f97316"],["Critical","#ef4444"]].map(([l, c]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} />{l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HeatmapSheet({ filters }: { filters: Record<string, string> }) {
  const type = filters["Heatmap Type"] ?? "Calendar";

  return (
    <div className="p-4 h-full overflow-y-auto" style={{ background: "var(--t-canvas)" }}>
      <div className="mb-4">
        <h2 className="text-base font-semibold" style={{ color: "var(--t-text)" }}>Heatmap Visualizations</h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--t-text-muted)" }}>
          Showing: {type} · Year: {filters["Year"] ?? "2024"}
        </p>
      </div>
      <div className="t-card p-4">
        {type === "Calendar" && (
          <>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--t-text)" }}>Trading Volume — Past 12 Months (GitHub-style)</p>
            <CalHeatmap />
          </>
        )}
        {type === "Correlation Matrix" && (
          <>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--t-text)" }}>
              Financial Variable Correlations &nbsp;·&nbsp;
              <span style={{ color: "var(--t-blue)" }}>■ Blue = positive</span> &nbsp;
              <span style={{ color: "#E15759" }}>■ Red = negative</span>
            </p>
            <CorrMatrix />
          </>
        )}
        {type === "Risk Matrix" && (
          <>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--t-text)" }}>Enterprise Risk Assessment — Probability × Impact</p>
            <RiskMx />
          </>
        )}
      </div>
    </div>
  );
}
