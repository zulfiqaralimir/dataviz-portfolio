"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { MapPin, Globe } from "lucide-react";

const regions = [
  { name: "North America", value: 42, revenue: "$3.2M", growth: "+18%", color: "#00d4ff", coords: [-100, 45] as [number, number] },
  { name: "Europe", value: 31, revenue: "$2.4M", growth: "+12%", color: "#a855f7", coords: [15, 52] as [number, number] },
  { name: "Asia Pacific", value: 18, revenue: "$1.4M", growth: "+34%", color: "#f472b6", coords: [115, 30] as [number, number] },
  { name: "Latin America", value: 6, revenue: "$460K", growth: "+22%", color: "#22d3ee", coords: [-65, -15] as [number, number] },
  { name: "Middle East", value: 3, revenue: "$230K", growth: "+41%", color: "#fb923c", coords: [45, 25] as [number, number] },
];

const cities = [
  { name: "New York", coords: [-74.006, 40.7128] as [number, number], size: 12 },
  { name: "London", coords: [-0.1276, 51.5074] as [number, number], size: 10 },
  { name: "Tokyo", coords: [139.6917, 35.6895] as [number, number], size: 11 },
  { name: "Singapore", coords: [103.8198, 1.3521] as [number, number], size: 8 },
  { name: "São Paulo", coords: [-46.6333, -23.5505] as [number, number], size: 7 },
  { name: "Dubai", coords: [55.2708, 25.2048] as [number, number], size: 6 },
  { name: "Sydney", coords: [151.2093, -33.8688] as [number, number], size: 7 },
  { name: "Berlin", coords: [13.405, 52.52] as [number, number], size: 7 },
  { name: "Toronto", coords: [-79.3832, 43.6532] as [number, number], size: 8 },
  { name: "Mumbai", coords: [72.8777, 19.076] as [number, number], size: 9 },
];

export default function GeoMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeRegion, setActiveRegion] = useState(0);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string } | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = svgRef.current?.clientWidth ?? 800;
    const height = svgRef.current?.clientHeight ?? 400;

    svg.selectAll("*").remove();

    const projection = d3.geoNaturalEarth1()
      .scale(width / 6.5)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Sphere background
    svg.append("ellipse")
      .attr("cx", width / 2).attr("cy", height / 2)
      .attr("rx", width / 2).attr("ry", height / 2)
      .attr("fill", "url(#bgGrad)");

    const defs = svg.append("defs");
    const bgGrad = defs.append("radialGradient").attr("id", "bgGrad");
    bgGrad.append("stop").attr("offset", "0%").attr("stop-color", "#0f172a").attr("stop-opacity", 1);
    bgGrad.append("stop").attr("offset", "100%").attr("stop-color", "#020817").attr("stop-opacity", 1);

    // Graticule
    const graticule = d3.geoGraticule()();
    svg.append("path").datum(graticule)
      .attr("d", path as any)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.04)")
      .attr("stroke-width", 0.5);

    // Load world topojson via d3-json
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((world: any) => {
      const countries = (window as any).topojson
        ? (window as any).topojson.feature(world, world.objects.countries).features
        : [];

      // Draw countries using sphere path as fallback if topojson not available
      if (countries.length === 0) {
        // Draw sphere outline as placeholder
        svg.append("path").datum({ type: "Sphere" })
          .attr("d", path as any)
          .attr("fill", "#0f172a")
          .attr("stroke", "rgba(0,212,255,0.15)")
          .attr("stroke-width", 0.5);
      } else {
        svg.selectAll(".country")
          .data(countries)
          .enter()
          .append("path")
          .attr("class", "country")
          .attr("d", path as any)
          .attr("fill", "#1e293b")
          .attr("stroke", "rgba(255,255,255,0.06)")
          .attr("stroke-width", 0.5);
      }

      // City dots
      const cityG = svg.append("g");
      cities.forEach((city) => {
        const [cx, cy] = projection(city.coords) ?? [0, 0];

        // Pulse ring
        cityG.append("circle")
          .attr("cx", cx).attr("cy", cy)
          .attr("r", city.size * 0.8)
          .attr("fill", "none")
          .attr("stroke", "#00d4ff")
          .attr("stroke-width", 1)
          .attr("opacity", 0.4);

        cityG.append("circle")
          .attr("cx", cx).attr("cy", cy)
          .attr("r", city.size * 0.35)
          .attr("fill", "#00d4ff")
          .attr("opacity", 0.8);

        // Label
        cityG.append("text")
          .attr("x", cx + city.size * 0.6)
          .attr("y", cy + 3)
          .attr("fill", "rgba(148,163,184,0.7)")
          .attr("font-size", "8px")
          .text(city.name);
      });
    }).catch(() => {
      // If fetch fails, draw a simple sphere outline
      svg.append("path").datum({ type: "Sphere" })
        .attr("d", path as any)
        .attr("fill", "#0f172a")
        .attr("stroke", "rgba(0,212,255,0.2)")
        .attr("stroke-width", 1);

      // Still draw city dots
      cities.forEach((city) => {
        const [cx, cy] = projection(city.coords) ?? [0, 0];
        svg.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 3).attr("fill", "#00d4ff").attr("opacity", 0.8);
      });
    });
  }, []);

  return (
    <section id="geospatial" className="py-24 px-6 gradient-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-xs text-pink-400 tracking-widest uppercase font-medium">Geospatial Analytics</span>
          <h2 className="text-4xl font-bold text-white mt-2 mb-3">
            Global <span className="gradient-text">Market Reach</span>
          </h2>
          <p className="text-slate-400 max-w-xl">
            Geographic distribution of revenue, market penetration, and growth opportunities across regions.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-2 glass-card rounded-2xl border border-white/5 overflow-hidden relative"
          >
            <div className="flex items-center gap-2 p-4 border-b border-white/5">
              <Globe className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-medium text-white">Global Revenue Distribution</span>
              <span className="ml-auto text-xs text-slate-500">2025 — Live Data</span>
            </div>
            <svg ref={svgRef} className="w-full" style={{ height: 380 }} />
          </motion.div>

          {/* Region breakdown */}
          <div className="space-y-3">
            {regions.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setActiveRegion(i)}
                className={`glass-card rounded-xl p-4 border cursor-pointer transition-all ${
                  activeRegion === i ? "border-white/20" : "border-white/5 hover:border-white/10"
                }`}
                style={activeRegion === i ? { borderColor: r.color + "44", boxShadow: `0 0 15px ${r.color}15` } : {}}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" style={{ color: r.color }} />
                    <span className="text-xs font-medium text-white">{r.name}</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">{r.growth}</span>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-lg font-bold text-white">{r.revenue}</span>
                  <span className="text-xs text-slate-500">{r.value}% share</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${r.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.2 }}
                    className="h-full rounded-full"
                    style={{ background: r.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
