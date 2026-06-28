"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

const SHARE_MARKETS = [
  { name: "N. America", size: 45, cols: [{ name: "Leader", share: 42, color: "#4E79A7" }, { name: "Challenger", share: 31, color: "#F28E2B" }, { name: "Others", share: 27, color: "#BAB0AC" }] },
  { name: "Europe",     size: 28, cols: [{ name: "Leader", share: 35, color: "#4E79A7" }, { name: "Challenger", share: 28, color: "#F28E2B" }, { name: "Others", share: 37, color: "#BAB0AC" }] },
  { name: "Asia",       size: 18, cols: [{ name: "Leader", share: 28, color: "#4E79A7" }, { name: "Challenger", share: 25, color: "#F28E2B" }, { name: "Others", share: 47, color: "#BAB0AC" }] },
  { name: "Emerging",   size:  9, cols: [{ name: "Leader", share: 20, color: "#4E79A7" }, { name: "Challenger", share: 22, color: "#F28E2B" }, { name: "Others", share: 58, color: "#BAB0AC" }] },
];

const REV_MARKETS = [
  { name: "N. America", size: 45, cols: [{ name: "Analytics", share: 38, color: "#4E79A7" }, { name: "Commerce", share: 35, color: "#F28E2B" }, { name: "FinTech", share: 27, color: "#E15759" }] },
  { name: "Europe",     size: 28, cols: [{ name: "Analytics", share: 42, color: "#4E79A7" }, { name: "Commerce", share: 30, color: "#F28E2B" }, { name: "FinTech", share: 28, color: "#E15759" }] },
  { name: "Asia",       size: 18, cols: [{ name: "Analytics", share: 30, color: "#4E79A7" }, { name: "Commerce", share: 25, color: "#F28E2B" }, { name: "FinTech", share: 45, color: "#E15759" }] },
  { name: "Emerging",   size:  9, cols: [{ name: "Analytics", share: 20, color: "#4E79A7" }, { name: "Commerce", share: 40, color: "#F28E2B" }, { name: "FinTech", share: 40, color: "#E15759" }] },
];

const GROWTH_MARKETS = [
  { name: "N. America", size: 45, cols: [{ name: ">20% Growth", share: 32, color: "#59A14F" }, { name: "10-20%", share: 45, color: "#EDC948" }, { name: "<10%", share: 23, color: "#E15759" }] },
  { name: "Europe",     size: 28, cols: [{ name: ">20% Growth", share: 22, color: "#59A14F" }, { name: "10-20%", share: 41, color: "#EDC948" }, { name: "<10%", share: 37, color: "#E15759" }] },
  { name: "Asia",       size: 18, cols: [{ name: ">20% Growth", share: 55, color: "#59A14F" }, { name: "10-20%", share: 32, color: "#EDC948" }, { name: "<10%", share: 13, color: "#E15759" }] },
  { name: "Emerging",   size:  9, cols: [{ name: ">20% Growth", share: 70, color: "#59A14F" }, { name: "10-20%", share: 22, color: "#EDC948" }, { name: "<10%", share:  8, color: "#E15759" }] },
];

const DATASETS: Record<string, typeof SHARE_MARKETS> = {
  "Market Share":  SHARE_MARKETS,
  "Revenue Mix":   REV_MARKETS,
  "Growth Rate":   GROWTH_MARKETS,
};

export default function MekkoSheet({ filters }: { filters: Record<string, string> }) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const metric  = filters["Metric"] ?? "Market Share";
  const markets = DATASETS[metric] ?? SHARE_MARKETS;

  useEffect(() => {
    if (!svgRef.current || !wrapRef.current) return;
    const W = wrapRef.current.clientWidth || 700;
    const H = 360;
    const mg = { t: 10, r: 10, b: 58, l: 52 };
    const IW = W - mg.l - mg.r, IH = H - mg.t - mg.b;

    const svg = d3.select(svgRef.current).attr("width", W).attr("height", H);
    svg.selectAll("*").remove();

    const xS = d3.scaleLinear().domain([0, 100]).range([0, IW]);
    const yS = d3.scaleLinear().domain([0, 100]).range([IH, 0]);
    const root = svg.append("g").attr("transform", `translate(${mg.l},${mg.t})`);

    root.append("rect").attr("width", IW).attr("height", IH).attr("fill", "white").attr("stroke", "#E5E5E5");

    yS.ticks(5).forEach(v => {
      root.append("line").attr("x1", 0).attr("x2", IW).attr("y1", yS(v)).attr("y2", yS(v)).attr("stroke", "#EBEBEB").attr("stroke-dasharray", "3,3");
    });

    root.append("g").call(d3.axisLeft(yS).ticks(5).tickFormat(v => `${v}%`))
      .call(g => { g.select(".domain").remove(); g.selectAll("line").remove(); g.selectAll("text").attr("fill", "#888").attr("font-size", 10); });

    let cumX = 0;
    markets.forEach(m => {
      const colX = xS(cumX), colW = xS(cumX + m.size) - xS(cumX);
      let cumShare = 0;
      m.cols.forEach(seg => {
        const y = yS(cumShare + seg.share), h = yS(cumShare) - yS(cumShare + seg.share);
        root.append("rect").attr("x", colX + 1).attr("y", y).attr("width", colW - 2).attr("height", h)
          .attr("fill", seg.color).attr("opacity", 0.88);
        if (h > 14 && colW > 28) {
          root.append("text").attr("x", colX + colW / 2).attr("y", y + h / 2)
            .attr("text-anchor", "middle").attr("dy", "0.35em").attr("font-size", 9).attr("fill", "white").attr("font-weight", "600")
            .text(`${seg.share}%`);
        }
        cumShare += seg.share;
      });
      root.append("rect").attr("x", colX).attr("y", 0).attr("width", colW).attr("height", IH)
        .attr("fill", "none").attr("stroke", "white").attr("stroke-width", 1.5);
      root.append("text").attr("x", colX + colW / 2).attr("y", IH + 18).attr("text-anchor", "middle").attr("font-size", 11).attr("fill", "#555").text(m.name);
      root.append("text").attr("x", colX + colW / 2).attr("y", IH + 32).attr("text-anchor", "middle").attr("font-size", 10).attr("fill", "#999").text(`$${m.size}B`);
      cumX += m.size;
    });
  }, [markets]);

  const legendItems = markets[0]?.cols ?? [];

  return (
    <div className="p-4 h-full overflow-y-auto" style={{ background: "var(--t-canvas)" }}>
      <div className="mb-4">
        <h2 className="text-base font-semibold" style={{ color: "var(--t-text)" }}>Mekko / Marimekko Chart — {metric}</h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--t-text-muted)" }}>Column width = market size · Height = share % · TAM: $100B</p>
      </div>
      <div ref={wrapRef} className="t-card overflow-hidden">
        <svg ref={svgRef} className="w-full" />
      </div>
      <div className="flex gap-5 mt-3 text-xs" style={{ color: "var(--t-text-muted)" }}>
        {legendItems.map(s => (
          <div key={s.name} className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 rounded-sm" style={{ background: s.color }} />{s.name}
          </div>
        ))}
      </div>
    </div>
  );
}
