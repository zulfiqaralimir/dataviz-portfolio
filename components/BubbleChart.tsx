"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

const SECTOR_COLORS: Record<string, string> = {
  Analytics:  "#00d4ff",
  Commerce:   "#a855f7",
  FinTech:    "#22d3ee",
  HealthTech: "#4ade80",
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
      const sectorBoost = c.sector === "Analytics" ? t * 22 :
                          c.sector === "FinTech"   ? t * 18 + Math.sin(t * Math.PI) * 8 :
                          c.sector === "Commerce"  ? t * 12 : t * 28;
      const covid = year === 2020
        ? (c.sector === "Commerce" ? -12 : c.sector === "HealthTech" ? 18 : 4) : 0;
      const x = Math.max(4, Math.min(92, c.baseX + sectorBoost * 0.55 + nx + covid * 0.4));
      const y = Math.max(4, Math.min(93, c.baseY + sectorBoost + ny + covid));
      const r = c.baseMCap * (1 + t * 1.6 + (rng() - 0.25) * 0.25);
      return { id: c.id, sector: c.sector, x, y, r };
    });
  });
  return out;
}

const ALL_DATA = buildData();
const MAX_R = Math.max(...YEARS.flatMap(y => ALL_DATA[y].map(d => d.r)));

export default function BubbleChart() {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [yearIdx, setYearIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const year = YEARS[yearIdx];

  // Setup axes/static elements once
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const W = wrapRef.current?.clientWidth || 700;
    const H = 420;
    const mg = { t: 20, r: 20, b: 50, l: 60 };
    const IW = W - mg.l - mg.r;
    const IH = H - mg.t - mg.b;

    svg.attr("width", W).attr("height", H);
    svg.selectAll("*").remove();

    const xS = d3.scaleLinear().domain([0, 95]).range([0, IW]);
    const yS = d3.scaleLinear().domain([0, 98]).range([IH, 0]);
    const rS = d3.scaleSqrt().domain([0, MAX_R]).range([6, 48]);

    const root = svg.append("g").attr("transform", `translate(${mg.l},${mg.t})`).attr("class", "chart-root");

    // Background
    root.append("rect").attr("width", IW).attr("height", IH)
      .attr("fill", "rgba(255,255,255,0.02)").attr("rx", 4)
      .attr("stroke", "rgba(255,255,255,0.06)").attr("stroke-width", 1);

    // Grid lines
    xS.ticks(6).forEach(v => {
      root.append("line").attr("x1", xS(v)).attr("x2", xS(v)).attr("y1", 0).attr("y2", IH)
        .attr("stroke", "rgba(255,255,255,0.05)").attr("stroke-width", 1);
    });
    yS.ticks(5).forEach(v => {
      root.append("line").attr("x1", 0).attr("x2", IW).attr("y1", yS(v)).attr("y2", yS(v))
        .attr("stroke", "rgba(255,255,255,0.05)").attr("stroke-width", 1);
    });

    // Axes
    const xAxis = d3.axisBottom(xS).ticks(6).tickFormat(v => `${v}%`);
    const yAxis = d3.axisLeft(yS).ticks(5).tickFormat(v => `${v}%`);
    root.append("g").attr("transform", `translate(0,${IH})`).call(xAxis)
      .call(g => { g.select(".domain").remove(); g.selectAll("line").attr("stroke", "rgba(255,255,255,0.1)"); g.selectAll("text").attr("fill", "#94a3b8").attr("font-size", 11); });
    root.append("g").call(yAxis)
      .call(g => { g.select(".domain").remove(); g.selectAll("line").attr("stroke", "rgba(255,255,255,0.1)"); g.selectAll("text").attr("fill", "#94a3b8").attr("font-size", 11); });

    // Axis labels
    root.append("text").attr("x", IW / 2).attr("y", IH + 42).attr("text-anchor", "middle")
      .attr("fill", "#64748b").attr("font-size", 12).text("Revenue Growth (%)");
    root.append("text").attr("transform", "rotate(-90)").attr("x", -IH / 2).attr("y", -45)
      .attr("text-anchor", "middle").attr("fill", "#64748b").attr("font-size", 12).text("User Growth (%)");

    // Bubble group
    root.append("g").attr("class", "bubbles");

    // Store scales on element for update effect
    (svgRef.current as any).__scales = { xS, yS, rS, IW, IH };
  }, []);

  // Update bubbles on year change
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const scales = (svgRef.current as any)?.__scales;
    if (!scales) return;
    const { xS, yS, rS } = scales;
    const data = ALL_DATA[year];

    const g = svg.select(".bubbles");

    // JOIN
    const circles = g.selectAll<SVGGElement, (typeof data)[0]>("g.bubble").data(data, d => d.id);

    // ENTER
    const enter = circles.enter().append("g").attr("class", "bubble");
    enter.append("circle")
      .attr("cx", d => xS(d.x)).attr("cy", d => yS(d.y)).attr("r", 0)
      .attr("fill", d => SECTOR_COLORS[d.sector] + "33")
      .attr("stroke", d => SECTOR_COLORS[d.sector])
      .attr("stroke-width", 1.5);
    enter.append("text")
      .attr("text-anchor", "middle").attr("dy", "0.35em")
      .attr("font-size", 9).attr("font-weight", "600")
      .attr("fill", d => SECTOR_COLORS[d.sector])
      .attr("pointer-events", "none");

    // UPDATE + ENTER together
    const all = enter.merge(circles);
    all.transition().duration(700).ease(d3.easeCubicInOut)
      .select("circle")
      .attr("cx", d => xS(d.x)).attr("cy", d => yS(d.y)).attr("r", d => rS(d.r));
    all.transition().duration(700).ease(d3.easeCubicInOut)
      .select("text")
      .attr("x", d => xS(d.x)).attr("y", d => yS(d.y))
      .text(d => rS(d.r) > 18 ? d.id.split(" ")[0] : "");
  }, [year]);

  // Play / pause
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setYearIdx(i => {
          if (i >= YEARS.length - 1) { setPlaying(false); return i; }
          return i + 1;
        });
      }, 900);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  return (
    <section className="py-20 px-6" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4 text-xs font-medium"
            style={{ borderColor: "rgba(0,212,255,0.3)", color: "var(--neon-blue)", background: "rgba(0,212,255,0.05)" }}>
            Animated Bubble Chart
          </div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            Market Landscape —{" "}
            <span style={{ background: "linear-gradient(135deg,#00d4ff,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Growth Dynamics
            </span>
          </h2>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Revenue Growth vs User Growth · Bubble size = Market Cap · Colour = Sector · Animate 2018 → 2024
          </p>
        </div>

        <div className="glass-card rounded-xl p-6" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          {/* Controls */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <button
              onClick={() => { if (yearIdx >= YEARS.length - 1) setYearIdx(0); setPlaying(p => !p); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: playing ? "rgba(168,85,247,0.2)" : "rgba(0,212,255,0.15)", color: playing ? "#a855f7" : "#00d4ff", border: `1px solid ${playing ? "rgba(168,85,247,0.4)" : "rgba(0,212,255,0.3)"}` }}
            >
              {playing ? "⏸ Pause" : "▶ Play"}
            </button>
            <button onClick={() => { setPlaying(false); setYearIdx(0); }}
              className="px-3 py-2 rounded-lg text-sm transition-all"
              style={{ background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}>
              ↺ Reset
            </button>
            <div className="flex-1 flex items-center gap-3 min-w-48">
              <input type="range" min={0} max={YEARS.length - 1} value={yearIdx}
                onChange={e => { setPlaying(false); setYearIdx(+e.target.value); }}
                className="flex-1 accent-cyan-400" />
              <span className="text-2xl font-bold tabular-nums min-w-16"
                style={{ color: "#00d4ff" }}>{year}</span>
            </div>
          </div>

          {/* Chart */}
          <div ref={wrapRef}>
            <svg ref={svgRef} className="w-full" />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4">
            {Object.entries(SECTOR_COLORS).map(([s, c]) => (
              <div key={s} className="flex items-center gap-2 text-xs" style={{ color: "#94a3b8" }}>
                <span className="w-3 h-3 rounded-full" style={{ background: c + "55", border: `2px solid ${c}` }} />
                {s}
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs ml-auto" style={{ color: "#64748b" }}>
              <span className="inline-block rounded-full border border-gray-600 w-3 h-3 opacity-40" />
              <span className="inline-block rounded-full border border-gray-600 w-5 h-5 opacity-60" />
              <span className="inline-block rounded-full border border-gray-600 w-7 h-7 opacity-80" />
              <span>Bubble size = Market Cap</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
