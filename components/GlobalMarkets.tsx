"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { TrendingUp, TrendingDown, Globe, RefreshCw } from "lucide-react";

// ── Seeded RNG ────────────────────────────────────────────────────────────────
function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
function hashNum(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) >>> 0;
  return h;
}

// ── Major Markets ─────────────────────────────────────────────────────────────
const MAJOR: Record<string, { perf: number; label: string }> = {
  "840": { perf: +2.31, label: "S&P 500" },
  "124": { perf: +1.18, label: "TSX" },
  "484": { perf: -0.74, label: "IPC" },
  "76":  { perf: -1.82, label: "BOVESPA" },
  "826": { perf: +0.83, label: "FTSE 100" },
  "276": { perf: -1.22, label: "DAX" },
  "250": { perf: -0.51, label: "CAC 40" },
  "380": { perf: -0.88, label: "FTSE MIB" },
  "724": { perf: -0.63, label: "IBEX 35" },
  "528": { perf: +0.44, label: "AEX" },
  "756": { perf: +0.27, label: "SMI" },
  "643": { perf: -3.41, label: "MOEX" },
  "792": { perf: -2.18, label: "BIST 100" },
  "682": { perf: +1.55, label: "TASI" },
  "784": { perf: +1.33, label: "ADX" },
  "356": { perf: +3.12, label: "SENSEX" },
  "156": { perf: -2.78, label: "SSE" },
  "392": { perf: +1.44, label: "Nikkei 225" },
  "410": { perf: +0.91, label: "KOSPI" },
  "702": { perf: +1.67, label: "STI" },
  "458": { perf: +0.58, label: "KLCI" },
  "360": { perf: -0.33, label: "IDX" },
  "764": { perf: +0.72, label: "SET" },
  "036": { perf: +0.94, label: "ASX 200" },
  "710": { perf: +0.31, label: "JSE" },
  "818": { perf: -0.48, label: "EGX" },
  "404": { perf: +2.14, label: "NSE" },
  "566": { perf: -1.03, label: "NGX" },
};

// Deterministic perf for every other country
function countryPerf(id: string): number {
  if (MAJOR[id] !== undefined) return MAJOR[id].perf;
  const rng = seededRng(hashNum(id));
  return +(( rng() - 0.5) * 8).toFixed(2); // -4 to +4 range
}

// Color scale
function perfColor(perf: number): string {
  if (perf >= 3)   return "#15803d";
  if (perf >= 1.5) return "#22c55e";
  if (perf >= 0.5) return "#4ade80";
  if (perf >= 0)   return "#86efac";
  if (perf >= -0.5) return "#fca5a5";
  if (perf >= -1.5) return "#f87171";
  if (perf >= -3)   return "#ef4444";
  return "#b91c1c";
}

// ── Global Indices Panel Data ─────────────────────────────────────────────────
function seededSparkline(seed: number, base: number, len = 30): number[] {
  const rng = seededRng(seed);
  const vals = [base];
  for (let i = 1; i < len; i++) {
    const chg = (rng() - 0.49) * base * 0.012;
    vals.push(Math.max(vals[i - 1] + chg, base * 0.8));
  }
  return vals;
}

const INDICES = [
  { name: "S&P 500",       region: "Americas", flag: "🇺🇸", base: 5842,  change: +2.31, seed: 1 },
  { name: "NASDAQ",        region: "Americas", flag: "🇺🇸", base: 18420, change: +1.85, seed: 2 },
  { name: "FTSE 100",      region: "Europe",   flag: "🇬🇧", base: 8210,  change: +0.83, seed: 3 },
  { name: "DAX",           region: "Europe",   flag: "🇩🇪", base: 18650, change: -1.22, seed: 4 },
  { name: "Nikkei 225",    region: "Asia",     flag: "🇯🇵", base: 38420, change: +1.44, seed: 5 },
  { name: "SSE Composite", region: "Asia",     flag: "🇨🇳", base: 3180,  change: -2.78, seed: 6 },
  { name: "BSE SENSEX",    region: "Asia",     flag: "🇮🇳", base: 82450, change: +3.12, seed: 7 },
  { name: "CAC 40",        region: "Europe",   flag: "🇫🇷", base: 7820,  change: -0.51, seed: 8 },
  { name: "ASX 200",       region: "Asia",     flag: "🇦🇺", base: 7940,  change: +0.94, seed: 9 },
  { name: "TSX",           region: "Americas", flag: "🇨🇦", base: 22180, change: +1.18, seed: 10 },
  { name: "BOVESPA",       region: "Americas", flag: "🇧🇷", base: 128500,change: -1.82, seed: 11 },
  { name: "TASI",          region: "MENA",     flag: "🇸🇦", base: 11280, change: +1.55, seed: 12 },
];

const REGIONS = ["All", "Americas", "Europe", "Asia", "MENA"];

// ── Ticker items ──────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { sym: "SPX",  val: "5,842.31",  chg: "+2.31%" },
  { sym: "NDX",  val: "18,420.50", chg: "+1.85%" },
  { sym: "FTSE", val: "8,210.44",  chg: "+0.83%" },
  { sym: "DAX",  val: "18,650.12", chg: "-1.22%" },
  { sym: "N225", val: "38,420.11", chg: "+1.44%" },
  { sym: "SSE",  val: "3,180.77",  chg: "-2.78%" },
  { sym: "NSEI", val: "23,840.55", chg: "+3.12%" },
  { sym: "CAC",  val: "7,820.33",  chg: "-0.51%" },
  { sym: "ASX",  val: "7,940.88",  chg: "+0.94%" },
  { sym: "TSX",  val: "22,180.64", chg: "+1.18%" },
  { sym: "IBOV", val: "128,500.2", chg: "-1.82%" },
  { sym: "TASI", val: "11,280.90", chg: "+1.55%" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function GlobalMarkets() {
  const mapRef   = useRef<SVGSVGElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const [region, setRegion]     = useState("All");
  const [hovered, setHovered]   = useState<{ name: string; id: string; perf: number; x: number; y: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [tickerX, setTickerX]   = useState(0);

  // Filtered indices
  const filtered = useMemo(() =>
    region === "All" ? INDICES : INDICES.filter(i => i.region === region),
    [region]
  );

  // Bullish / bearish stats
  const bull = useMemo(() => INDICES.filter(i => i.change > 0).length, []);
  const bear = useMemo(() => INDICES.filter(i => i.change < 0).length, []);
  const avgChg = useMemo(() => (INDICES.reduce((s, i) => s + i.change, 0) / INDICES.length).toFixed(2), []);

  // Ticker animation
  useEffect(() => {
    let frame: number;
    let x = 0;
    const speed = 0.5;
    const totalW = TICKER_ITEMS.length * 160;
    const animate = () => {
      x -= speed;
      if (x < -totalW) x = 0;
      setTickerX(x);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Map rendering
  useEffect(() => {
    const svg = d3.select(mapRef.current);
    const wrap = wrapRef.current;
    if (!svg || !wrap) return;

    const W = wrap.clientWidth || 700;
    const H = Math.round(W * 0.48);
    svg.attr("width", W).attr("height", H);
    svg.selectAll("*").remove();

    const projection = d3.geoNaturalEarth1()
      .scale(W / 6.1)
      .translate([W / 2, H / 2]);

    const path = d3.geoPath().projection(projection);

    // Background
    svg.append("rect").attr("width", W).attr("height", H).attr("fill", "#010b18");

    // Graticule
    const graticule = d3.geoGraticule()();
    svg.append("path").datum(graticule)
      .attr("d", path as any)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.03)")
      .attr("stroke-width", 0.5);

    // Load world atlas
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((world: any) => {
        const countries = topojson.feature(world, world.objects.countries) as any;
        const mesh = topojson.mesh(world, world.objects.countries, (a: any, b: any) => a !== b) as any;

        // Countries fill
        svg.append("g")
          .selectAll("path")
          .data(countries.features)
          .enter()
          .append("path")
          .attr("d", path as any)
          .attr("fill", (d: any) => {
            const p = countryPerf(String(d.id));
            return perfColor(p);
          })
          .attr("opacity", 0.85)
          .attr("stroke", "none")
          .style("cursor", "pointer")
          .on("mousemove", function (event: MouseEvent, d: any) {
            const id = String(d.id);
            const perf = countryPerf(id);
            const name = (d.properties?.name) || id;
            const [mx, my] = d3.pointer(event, wrap);
            setHovered({ name, id, perf, x: mx, y: my });
          })
          .on("mouseleave", () => setHovered(null));

        // Country borders
        svg.append("path")
          .datum(mesh)
          .attr("d", path as any)
          .attr("fill", "none")
          .attr("stroke", "rgba(0,0,0,0.35)")
          .attr("stroke-width", 0.4);

        // Major market pulsing dots
        const majorDots = [
          { name: "New York",    coords: [-74.0, 40.7]  as [number,number] },
          { name: "London",      coords: [-0.12, 51.5]  as [number,number] },
          { name: "Frankfurt",   coords: [8.68,  50.1]  as [number,number] },
          { name: "Tokyo",       coords: [139.7, 35.7]  as [number,number] },
          { name: "Shanghai",    coords: [121.5, 31.2]  as [number,number] },
          { name: "Mumbai",      coords: [72.88, 19.1]  as [number,number] },
          { name: "Sydney",      coords: [151.2,-33.9]  as [number,number] },
          { name: "Dubai",       coords: [55.27, 25.2]  as [number,number] },
          { name: "Toronto",     coords: [-79.4, 43.7]  as [number,number] },
          { name: "São Paulo",   coords: [-46.6,-23.6]  as [number,number] },
          { name: "Johannesburg",coords: [28.0, -26.2]  as [number,number] },
          { name: "Singapore",   coords: [103.8,  1.35] as [number,number] },
        ];

        majorDots.forEach(dot => {
          const pt = projection(dot.coords);
          if (!pt) return;
          const [px, py] = pt;
          svg.append("circle").attr("cx", px).attr("cy", py).attr("r", 5)
            .attr("fill", "rgba(255,255,255,0.08)").attr("stroke", "rgba(255,255,255,0.3)").attr("stroke-width", 0.8);
          svg.append("circle").attr("cx", px).attr("cy", py).attr("r", 2.5)
            .attr("fill", "white").attr("opacity", 0.9);
        });

        setMapReady(true);
      })
      .catch(() => {
        // Fallback sphere
        svg.append("path").datum({ type: "Sphere" } as any)
          .attr("d", path as any).attr("fill", "#0f172a")
          .attr("stroke", "rgba(0,212,255,0.2)").attr("stroke-width", 1);
        setMapReady(true);
      });
  }, []);

  return (
    <section id="global" className="py-24 px-6 gradient-bg">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <span className="text-xs text-emerald-400 tracking-widest uppercase font-medium">Global Markets</span>
          <h2 className="text-4xl font-bold text-white mt-2 mb-3">
            Bull &amp; Bear <span className="gradient-text">Market Heatmap</span>
          </h2>
          <p className="text-slate-400 max-w-xl">
            Real-time global equity sentiment — countries shaded by market performance. Green = bullish momentum, red = bearish pressure.
          </p>
        </motion.div>

        {/* Sentiment stats */}
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Bullish Markets",  value: `${bull}`,       sub: `of ${INDICES.length} indices`, color: "text-emerald-400", icon: TrendingUp },
            { label: "Bearish Markets",  value: `${bear}`,       sub: `of ${INDICES.length} indices`, color: "text-red-400",     icon: TrendingDown },
            { label: "Avg Daily Change", value: `${avgChg}%`,    sub: "across all indices",            color: +avgChg >= 0 ? "text-emerald-400" : "text-red-400", icon: Globe },
            { label: "Markets Tracked",  value: `${INDICES.length}+`, sub: "global exchanges",        color: "text-cyan-400",    icon: RefreshCw },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-600 mt-1">{s.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Ticker */}
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden mb-6 py-2.5">
          <div className="relative flex overflow-hidden">
            <div className="flex whitespace-nowrap" style={{ transform: `translateX(${tickerX}px)` }}>
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => {
                const up = !t.chg.startsWith("-");
                return (
                  <span key={i} className="inline-flex items-center gap-1.5 mr-10 text-xs">
                    <span className="text-slate-400 font-mono font-semibold">{t.sym}</span>
                    <span className="text-white font-mono">{t.val}</span>
                    <span className={`font-mono ${up ? "text-emerald-400" : "text-red-400"}`}>{t.chg}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map + Indices */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* World map */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="lg:col-span-2 glass-card rounded-2xl border border-white/5 overflow-hidden relative">

            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-white">Global Equity Sentiment</span>
              <span className="ml-auto text-xs text-slate-500">Hover for details</span>
            </div>

            <div ref={wrapRef} className="relative p-3">
              <svg ref={mapRef} className="w-full rounded-lg" />

              {/* Map tooltip */}
              <AnimatePresence>
                {hovered && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="absolute pointer-events-none z-10 glass-card rounded-xl border border-white/10 p-3 text-xs shadow-xl"
                    style={{ left: Math.min(hovered.x + 12, (wrapRef.current?.clientWidth ?? 600) - 160), top: Math.max(8, hovered.y - 60) }}>
                    <p className="font-semibold text-white mb-1">{hovered.name}</p>
                    <p className={`font-bold text-base ${hovered.perf >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {hovered.perf >= 0 ? "+" : ""}{hovered.perf.toFixed(2)}%
                    </p>
                    <p className="text-slate-500 mt-1">{hovered.perf >= 0 ? "📈 Bullish" : "📉 Bearish"}</p>
                    {MAJOR[hovered.id] && <p className="text-cyan-400 mt-1 text-[10px]">{MAJOR[hovered.id].label}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Color legend */}
            <div className="flex items-center gap-1 px-5 pb-4">
              <span className="text-xs text-slate-500 mr-2">Bearish</span>
              {["#b91c1c","#ef4444","#f87171","#fca5a5","#86efac","#4ade80","#22c55e","#15803d"].map(c => (
                <div key={c} className="flex-1 h-3 rounded-sm" style={{ background: c }} />
              ))}
              <span className="text-xs text-slate-500 ml-2">Bullish</span>
            </div>
          </motion.div>

          {/* Indices panel */}
          <div className="flex flex-col gap-3">
            {/* Region filter */}
            <div className="flex flex-wrap gap-1.5">
              {REGIONS.map(r => (
                <button key={r} onClick={() => setRegion(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${region === r ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "glass-card border border-white/5 text-slate-400 hover:text-slate-300"}`}>
                  {r}
                </button>
              ))}
            </div>

            {/* Index list */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
              <AnimatePresence mode="popLayout">
                {filtered.map((idx, i) => {
                  const up = idx.change >= 0;
                  const spark = seededSparkline(idx.seed, idx.base);
                  const sparkMin = Math.min(...spark), sparkMax = Math.max(...spark);
                  const sparkH = 28, sparkW = 70;
                  const sparkPath = spark.map((v, j) => {
                    const sx = (j / (spark.length - 1)) * sparkW;
                    const sy = sparkH - ((v - sparkMin) / (sparkMax - sparkMin || 1)) * sparkH;
                    return `${j === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
                  }).join(" ");
                  return (
                    <motion.div key={idx.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.04 }}
                      className="glass-card rounded-xl p-3 border border-white/5 hover:border-white/10 transition-all flex items-center gap-3">
                      <span className="text-base">{idx.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-xs font-semibold text-white truncate">{idx.name}</span>
                          <span className={`text-xs font-bold tabular-nums ${up ? "text-emerald-400" : "text-red-400"}`}>
                            {up ? "+" : ""}{idx.change.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-500">{idx.base.toLocaleString()}</span>
                          <div className="flex items-center gap-1">
                            {up ? <TrendingUp className="w-2.5 h-2.5 text-emerald-400" /> : <TrendingDown className="w-2.5 h-2.5 text-red-400" />}
                            <svg width={sparkW} height={sparkH} className="overflow-visible">
                              <path d={sparkPath} fill="none" stroke={up ? "#22c55e" : "#ef4444"} strokeWidth={1.5} opacity={0.8} />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Top movers */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid sm:grid-cols-2 gap-6 mt-6">
          {[
            { title: "Top Gainers 📈", color: "text-emerald-400", border: "border-emerald-500/15", items: [...INDICES].sort((a, b) => b.change - a.change).slice(0, 5) },
            { title: "Top Losers 📉",  color: "text-red-400",     border: "border-red-500/15",     items: [...INDICES].sort((a, b) => a.change - b.change).slice(0, 5) },
          ].map(panel => (
            <div key={panel.title} className={`glass-card rounded-2xl border ${panel.border} p-5`}>
              <h3 className={`text-sm font-semibold ${panel.color} mb-4`}>{panel.title}</h3>
              <div className="space-y-3">
                {panel.items.map((idx, rank) => (
                  <div key={idx.name} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-4 tabular-nums">{rank + 1}</span>
                    <span className="text-sm">{idx.flag}</span>
                    <span className="text-xs text-slate-300 flex-1">{idx.name}</span>
                    <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min(Math.abs(idx.change) / 4 * 100, 100)}%`,
                        background: idx.change >= 0 ? "#22c55e" : "#ef4444",
                      }} />
                    </div>
                    <span className={`text-xs font-bold tabular-nums w-14 text-right ${idx.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {idx.change >= 0 ? "+" : ""}{idx.change.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
