"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { Network } from "lucide-react";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  size: number;
  label: string;
}

interface Link {
  source: string;
  target: string;
  strength: number;
}

const nodes: Node[] = [
  { id: "product", group: 1, size: 28, label: "Product Core" },
  { id: "analytics", group: 1, size: 22, label: "Analytics" },
  { id: "ml", group: 1, size: 20, label: "ML Engine" },
  { id: "api", group: 2, size: 18, label: "API Layer" },
  { id: "db", group: 2, size: 16, label: "Database" },
  { id: "cache", group: 2, size: 14, label: "Cache" },
  { id: "users", group: 3, size: 20, label: "Users" },
  { id: "mobile", group: 3, size: 16, label: "Mobile App" },
  { id: "web", group: 3, size: 18, label: "Web App" },
  { id: "commerce", group: 4, size: 22, label: "Commerce" },
  { id: "payments", group: 4, size: 17, label: "Payments" },
  { id: "inventory", group: 4, size: 15, label: "Inventory" },
  { id: "reports", group: 5, size: 18, label: "Reports" },
  { id: "alerts", group: 5, size: 14, label: "Alerts" },
  { id: "exports", group: 5, size: 13, label: "Exports" },
];

const links: Link[] = [
  { source: "product", target: "analytics", strength: 0.8 },
  { source: "product", target: "api", strength: 0.9 },
  { source: "product", target: "commerce", strength: 0.7 },
  { source: "analytics", target: "ml", strength: 0.8 },
  { source: "analytics", target: "reports", strength: 0.7 },
  { source: "api", target: "db", strength: 0.9 },
  { source: "api", target: "cache", strength: 0.7 },
  { source: "api", target: "users", strength: 0.8 },
  { source: "users", target: "mobile", strength: 0.9 },
  { source: "users", target: "web", strength: 0.9 },
  { source: "commerce", target: "payments", strength: 0.8 },
  { source: "commerce", target: "inventory", strength: 0.7 },
  { source: "ml", target: "alerts", strength: 0.6 },
  { source: "reports", target: "exports", strength: 0.7 },
  { source: "analytics", target: "alerts", strength: 0.5 },
  { source: "db", target: "commerce", strength: 0.6 },
  { source: "mobile", target: "commerce", strength: 0.6 },
  { source: "web", target: "analytics", strength: 0.5 },
];

const groupColors: Record<number, string> = {
  1: "#00d4ff",
  2: "#a855f7",
  3: "#22d3ee",
  4: "#f472b6",
  5: "#fb923c",
};

const groupLabels: Record<number, string> = {
  1: "Core Product",
  2: "Infrastructure",
  3: "Client Interfaces",
  4: "Commerce",
  5: "Reporting",
};

export default function NetworkGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const width = svgEl.clientWidth || 700;
    const height = svgEl.clientHeight || 500;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");

    // Arrow marker
    defs.append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "rgba(255,255,255,0.2)");

    // Glow filter
    const glow = defs.append("filter").attr("id", "glow");
    glow.append("feGaussianBlur").attr("stdDeviation", 3).attr("result", "coloredBlur");
    const feMerge = glow.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const linkData: any[] = links.map((l) => ({ ...l }));
    const nodeData: Node[] = nodes.map((n) => ({ ...n }));

    const simulation = d3.forceSimulation<Node>(nodeData)
      .force("link", d3.forceLink<Node, any>(linkData).id((d) => d.id).distance(80).strength((d) => d.strength))
      .force("charge", d3.forceManyBody().strength(-220))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<Node>().radius((d) => d.size + 10));

    const linkG = svg.append("g");
    const linkEl = linkG.selectAll("line")
      .data(linkData)
      .enter()
      .append("line")
      .attr("stroke", "rgba(255,255,255,0.08)")
      .attr("stroke-width", (d) => d.strength * 2)
      .attr("marker-end", "url(#arrow)");

    const nodeG = svg.append("g");
    const nodeEl = nodeG.selectAll("g")
      .data(nodeData)
      .enter()
      .append("g")
      .style("cursor", "pointer")
      .call(
        d3.drag<SVGGElement, Node>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null; d.fy = null;
          }) as any
      );

    // Node outer ring
    nodeEl.append("circle")
      .attr("r", (d) => d.size + 4)
      .attr("fill", "none")
      .attr("stroke", (d) => groupColors[d.group] + "33")
      .attr("stroke-width", 1);

    // Node circle
    nodeEl.append("circle")
      .attr("r", (d) => d.size)
      .attr("fill", (d) => groupColors[d.group] + "22")
      .attr("stroke", (d) => groupColors[d.group])
      .attr("stroke-width", 1.5)
      .attr("filter", "url(#glow)")
      .on("mouseover", function (_, d) { setHoveredNode(d.id); })
      .on("mouseout", function () { setHoveredNode(null); });

    // Node label
    nodeEl.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "9px")
      .attr("fill", (d) => groupColors[d.group])
      .attr("font-weight", "600")
      .text((d) => d.label.split(" ")[0]);

    simulation.on("tick", () => {
      linkEl
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeEl.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => { simulation.stop(); };
  }, []);

  return (
    <section id="network" className="py-24 px-6 bg-[#010b18]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-xs text-orange-400 tracking-widest uppercase font-medium">System Architecture</span>
          <h2 className="text-4xl font-bold text-white mt-2 mb-3">
            Network <span className="gradient-text">Graph</span>
          </h2>
          <p className="text-slate-400 max-w-xl">
            Interactive force-directed graph showing product system topology — drag nodes, explore relationships, understand dependencies.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Graph */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-3 glass-card rounded-2xl border border-white/5 overflow-hidden"
          >
            <div className="flex items-center gap-2 p-4 border-b border-white/5">
              <Network className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-white">Product Architecture Graph</span>
              <span className="ml-auto text-xs text-slate-500">Drag nodes to explore</span>
            </div>
            <svg ref={svgRef} className="w-full" style={{ height: 460 }} />
          </motion.div>

          {/* Legend + stats */}
          <div className="space-y-4">
            {/* Legend */}
            <div className="glass-card rounded-xl p-4 border border-white/5">
              <p className="text-xs text-slate-400 font-medium mb-3 uppercase tracking-wider">Node Groups</p>
              {Object.entries(groupColors).map(([group, color]) => (
                <div key={group} className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full border" style={{ background: color + "33", borderColor: color }} />
                  <span className="text-xs text-slate-400">{groupLabels[+group]}</span>
                </div>
              ))}
            </div>

            {/* Graph stats */}
            <div className="glass-card rounded-xl p-4 border border-white/5">
              <p className="text-xs text-slate-400 font-medium mb-3 uppercase tracking-wider">Graph Stats</p>
              {[
                { label: "Nodes", value: nodes.length },
                { label: "Connections", value: links.length },
                { label: "Groups", value: 5 },
                { label: "Avg Degree", value: ((links.length * 2) / nodes.length).toFixed(1) },
              ].map((stat) => (
                <div key={stat.label} className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500">{stat.label}</span>
                  <span className="text-sm font-bold text-cyan-400">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Interaction hint */}
            <div className="glass-card rounded-xl p-4 border border-cyan-400/10 bg-cyan-400/5">
              <p className="text-xs text-cyan-400 font-medium mb-1">Interactive</p>
              <p className="text-xs text-slate-400">Click and drag any node to reorganize the graph layout. Physics simulation keeps connections intact.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
