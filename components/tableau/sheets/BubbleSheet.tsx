"use client";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

const T10: Record<string, string> = {
  Analytics:  "#4E79A7",
  Commerce:   "#F28E2B",
  FinTech:    "#E15759",
  HealthTech: "#59A14F",
};

const COMPANIES = [
  { id: "TECH Corp",    sector: "Analytics",  baseX: 35, baseY: 45, baseMCap: 120 },
  { id: "DATA Inc",     sector: "Analytics",  baseX: 28, baseY: 38, baseMCap: 85  },
  { id: "AI Systems",   sector: "Analytics",  baseX: 52, baseY: 65, baseMCap: 200 },
  { id: "FINTECH Ltd",  sector: "FinTech",    baseX: 42, baseY: 35, baseMCap: 95  },
  { id: "CRYPTO Co",    sector: "FinTech",    baseX: 60, baseY: 75, baseMCap: 60  },
  { id: "PAY Corp",     sector: "FinTech",    baseX: 50, baseY: 48, baseMCap: 180 },
  { id: "COMMERCE Hub", sector: "Commerce",   baseX: 38, baseY: 52, baseMCap: 300 },
  { id: "RETAIL Co",    sector: "Commerce",   baseX: 22, baseY: 28, baseMCap: 150 },
  { id: "HEALTH AI",    sector: "HealthTech", baseX: 45, baseY: 60, baseMCap: 110 },
  { id: "MED Tech",     sector: "HealthTech", baseX: 30, baseY: 42, baseMCap: 75  },
];

function buildData() {
  const out: Record<number, { id: string; sector: string; x: number; y: number; r: number }[]> = {};
  YEARS.forEach((year, yi) => {
    const t = yi / (YEARS.length - 1);
    out[year] = COMPANIES.map((c, ci) => {
      const rng = seededRng(ci * 1000 + yi * 77);
      const nx = (rng() - 0.5) * 10;
      const ny = (rng() - 0.5) * 12;
      const sb = c.sector === "Analytics" ? t * 22 :
                 c.sector === "FinTech"   ? t * 18 + Math.sin(t * Math.PI) * 8 :
                 c.sector === "Commerce"  ? t * 12 : t * 28;
      const covid = year === 2020
        ? (c.sector === "Commerce" ? -12 : c.sector === "HealthTech" ? 18 : 4) : 0;
      return {
        id: c.id, sector: c.sector,
        x: Math.max(4, Math.min(92, c.baseX + sb * 0.55 + nx + covid * 0.4)),
        y: Math.max(4, Math.min(93, c.baseY + sb + ny + covid)),
        r: c.baseMCap * (1 + t * 1.6 + (rng() - 0.25) * 0.25),
      };
    });
  });
  return out;
}

const ALL_DATA = buildData();
const MAX_R = Math.max(...YEARS.flatMap(y => ALL_DATA[y].map(d => d.r)));

const SPEED_MS: Record<string, number> = { Slow: 1400, Normal: 900, Fast: 400 };

export default function BubbleSheet({ filters }: { filters: Record<string, string> }) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [yearIdx, setYearIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const year = YEARS[yearIdx];
  const speed = SPEED_MS[filters["Speed"] ?? "Normal"] ?? 900;

  // Setup once
  useEffect(() => {
    const W = wrapRef.current?.clientWidth || 700;
    const H = 380;
    const mg = { t: 16, r: 16, b: 46, l: 56 };
    const IW = W - mg.l - mg.r, IH = H - mg.t - mg.b;

    const svg = d3.select(svgRef.current).attr("width", W).attr("height", H);
    svg.selectAll("*").remove();

    const xS = d3.scaleLinear().domain([0, 95]).range([0, IW]);
    const yS = d3.scaleLinear().domain([0, 98]).range([IH, 0]);
    const rS = d3.scaleSqrt().domain([0, MAX_R]).range([5, 44]);

    const root = svg.append("g").attr("transform", `translate(${mg.l},${mg.t})`).attr("class", "root");

    root.append("rect").attr("width", IW).attr("height", IH).attr("fill", "white").attr("stroke", "#E5E5E5");

    xS.ticks(6).forEach(v => root.append("line").attr("x1", xS(v)).attr("x2", xS(v)).attr("y1", 0).attr("y2", IH).attr("stroke", "#EBEBEB"));
    yS.ticks(5).forEach(v => root.append("line").attr("x1", 0).attr("x2", IW).attr("y1", yS(v)).attr("y2", yS(v)).attr("stroke", "#EBEBEB"));

    root.append("g").attr("transform", `translate(0,${IH})`).call(d3.axisBottom(xS).ticks(6).tickFormat(v => `${v}%`))
      .call(g => { g.select(".domain").remove(); g.selectAll("text").attr("fill", "#999").attr("font-size", 10); g.selectAll("line").remove(); });
    root.append("g").call(d3.axisLeft(yS).ticks(5).tickFormat(v => `${v}%`))
      .call(g => { g.select(".domain").remove(); g.selectAll("text").attr("fill", "#999").attr("font-size", 10); g.selectAll("line").remove(); });

    root.append("text").attr("x", IW / 2).attr("y", IH + 38).attr("text-anchor", "middle").attr("fill", "#888").attr("font-size", 11).text("Revenue Growth (%)");
    root.append("text").attr("transform", "rotate(-90)").attr("x", -IH / 2).attr("y", -42).attr("text-anchor", "middle").attr("fill", "#888").attr("font-size", 11).text("User Growth (%)");

    root.append("g").attr("class", "bubbles");
    (svgRef.current as any).__scales = { xS, yS, rS };
  }, []);

  // Update bubbles
  useEffect(() => {
    const scales = (svgRef.current as any)?.__scales;
    if (!scales) return;
    const { xS, yS, rS } = scales;
    const data = ALL_DATA[year];
    const g = d3.select(svgRef.current).select(".bubbles");

    const sel = g.selectAll<SVGGElement, (typeof data)[0]>("g.bubble").data(data, d => d.id);

    const enter = sel.enter().append("g").attr("class", "bubble").style("cursor", "pointer");
    enter.append("circle")
      .attr("cx", d => xS(d.x)).attr("cy", d => yS(d.y)).attr("r", 0)
      .attr("fill", d => T10[d.sector] + "30")
      .attr("stroke", d => T10[d.sector]).attr("stroke-width", 1.5);
    enter.append("text").attr("text-anchor", "middle").attr("dy", "0.35em").attr("font-size", 9).attr("font-weight", "600").attr("pointer-events", "none");

    const all = enter.merge(sel);
    all.transition().duration(650).ease(d3.easeCubicInOut)
      .select("circle")
      .attr("cx", d => xS(d.x)).attr("cy", d => yS(d.y)).attr("r", d => rS(d.r))
      .attr("fill", d => T10[d.sector] + "30").attr("stroke", d => T10[d.sector]);
    all.transition().duration(650).ease(d3.easeCubicInOut)
      .select("text")
      .attr("x", d => xS(d.x)).attr("y", d => yS(d.y))
      .attr("fill", d => T10[d.sector])
      .text(d => rS(d.r) > 16 ? d.id.split(" ")[0] : "");
  }, [year]);

  // Play/pause
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setYearIdx(i => {
          if (i >= YEARS.length - 1) { setPlaying(false); return i; }
          return i + 1;
        });
      }, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed]);

  return (
    <div className="p-4 h-full overflow-y-auto" style={{ background: "var(--t-canvas)" }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--t-text)" }}>Animated Bubble Chart — Market Growth Dynamics</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--t-text-muted)" }}>
            Revenue Growth vs User Growth · Bubble size = Market Cap · 2018–2024
          </p>
        </div>
        <span className="text-3xl font-bold tabular-nums" style={{ color: "var(--t-blue)" }}>{year}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <button
          onClick={() => { if (yearIdx >= YEARS.length - 1) setYearIdx(0); setPlaying(p => !p); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all"
          style={{ background: playing ? "#EEF1FB" : "var(--t-navy)", color: playing ? "var(--t-blue)" : "white", border: "1px solid var(--t-border)" }}
        >
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <button onClick={() => { setPlaying(false); setYearIdx(0); }}
          className="px-3 py-1.5 rounded text-xs transition-all"
          style={{ background: "white", color: "var(--t-text-muted)", border: "1px solid var(--t-border)" }}>
          ↺ Reset
        </button>
        <input type="range" min={0} max={YEARS.length - 1} value={yearIdx}
          onChange={e => { setPlaying(false); setYearIdx(+e.target.value); }}
          className="flex-1 min-w-32 accent-blue-600" />
        <div className="flex gap-1">
          {YEARS.map((y, i) => (
            <button key={y} onClick={() => { setPlaying(false); setYearIdx(i); }}
              className="text-[10px] px-1.5 py-0.5 rounded transition-all"
              style={{ background: i === yearIdx ? "var(--t-blue)" : "white", color: i === yearIdx ? "white" : "var(--t-text-muted)", border: "1px solid var(--t-border)" }}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div ref={wrapRef} className="t-card overflow-hidden">
        <svg ref={svgRef} className="w-full" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3">
        {Object.entries(T10).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--t-text-muted)" }}>
            <span className="w-3 h-3 rounded-full" style={{ background: c + "44", border: `2px solid ${c}` }} />
            {s}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[11px] ml-auto" style={{ color: "var(--t-text-muted)" }}>
          <span className="inline-block rounded-full border border-gray-400 w-2 h-2" />
          <span className="inline-block rounded-full border border-gray-400 w-4 h-4" />
          <span className="inline-block rounded-full border border-gray-400 w-6 h-6" />
          Bubble size = Market Cap
        </div>
      </div>
    </div>
  );
}
