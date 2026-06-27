"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { ChevronDown, Check } from "lucide-react";

interface Bar { date: Date; open: number; high: number; low: number; close: number; volume: number; }

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
}

function generateDaily(count: number, base: number, seed: number): Bar[] {
  const rng = seededRng(seed);
  const bars: Bar[] = [];
  let price = base;
  let d = new Date(2023, 0, 2);
  for (let i = 0; i < count; i++) {
    while (d.getDay() === 0 || d.getDay() === 6) d = new Date(d.getTime() + 864e5);
    const chg = (rng() - 0.485) * base * 0.028;
    price = Math.max(price + chg, base * 0.4);
    const o = price, h = price + rng() * base * 0.022, l = price - rng() * base * 0.018;
    const c = l + rng() * (h - l);
    bars.push({ date: new Date(d), open: +o.toFixed(2), high: +h.toFixed(2), low: +l.toFixed(2), close: +c.toFixed(2), volume: Math.floor(rng() * 9e6 + 8e5) });
    price = c;
    d = new Date(d.getTime() + 864e5);
  }
  return bars;
}

function toWeekly(bars: Bar[]): Bar[] {
  const r: Bar[] = [];
  for (let i = 0; i < bars.length; i += 5) {
    const c = bars.slice(i, Math.min(i + 5, bars.length));
    r.push({ date: c[0].date, open: c[0].open, close: c[c.length - 1].close, high: Math.max(...c.map(b => b.high)), low: Math.min(...c.map(b => b.low)), volume: c.reduce((s, b) => s + b.volume, 0) });
  }
  return r;
}

function toMonthly(bars: Bar[]): Bar[] {
  const m = new Map<string, Bar[]>();
  bars.forEach(b => { const k = `${b.date.getFullYear()}-${b.date.getMonth()}`; if (!m.has(k)) m.set(k, []); m.get(k)!.push(b); });
  return [...m.values()].map(c => ({ date: c[0].date, open: c[0].open, close: c[c.length - 1].close, high: Math.max(...c.map(b => b.high)), low: Math.min(...c.map(b => b.low)), volume: c.reduce((s, b) => s + b.volume, 0) }));
}

function calcSMA(bars: Bar[], p: number): (number | null)[] {
  return bars.map((_, i) => i < p - 1 ? null : bars.slice(i - p + 1, i + 1).reduce((s, b) => s + b.close, 0) / p);
}

function calcEMA(bars: Bar[], p: number): (number | null)[] {
  const k = 2 / (p + 1); const r: (number | null)[] = []; let e: number | null = null;
  bars.forEach((b, i) => {
    if (i < p - 1) { r.push(null); return; }
    e = e === null ? bars.slice(0, p).reduce((s, x) => s + x.close, 0) / p : b.close * k + e * (1 - k);
    r.push(+e.toFixed(2));
  });
  return r;
}

function calcBB(bars: Bar[], p = 20, mult = 2): { u: number | null; mid: number | null; l: number | null }[] {
  return bars.map((_, i) => {
    if (i < p - 1) return { u: null, mid: null, l: null };
    const sl = bars.slice(i - p + 1, i + 1).map(b => b.close);
    const mn = sl.reduce((a, v) => a + v, 0) / p;
    const sd = Math.sqrt(sl.reduce((a, v) => a + (v - mn) ** 2, 0) / p);
    return { u: mn + mult * sd, mid: mn, l: mn - mult * sd };
  });
}

function calcRSI(bars: Bar[], p = 14): (number | null)[] {
  if (bars.length < p + 1) return bars.map(() => null);
  const chg = bars.slice(1).map((b, i) => b.close - bars[i].close);
  let ag = chg.slice(0, p).filter(c => c > 0).reduce((s, c) => s + c, 0) / p;
  let al = chg.slice(0, p).filter(c => c < 0).reduce((s, c) => s + Math.abs(c), 0) / p;
  const r: (number | null)[] = bars.map(() => null);
  r[p] = +(100 - 100 / (1 + (al === 0 ? 1e9 : ag / al))).toFixed(2);
  for (let i = p + 1; i < bars.length; i++) {
    ag = (ag * (p - 1) + Math.max(chg[i - 1], 0)) / p;
    al = (al * (p - 1) + Math.max(-chg[i - 1], 0)) / p;
    r[i] = +(100 - 100 / (1 + (al === 0 ? 1e9 : ag / al))).toFixed(2);
  }
  return r;
}

function calcMACD(bars: Bar[], fast = 12, slow = 26, sig = 9): { m: number | null; s: number | null; h: number | null }[] {
  const fe = calcEMA(bars, fast), se = calcEMA(bars, slow);
  const ml: (number | null)[] = bars.map((_, i) => fe[i] !== null && se[i] !== null ? +(fe[i]! - se[i]!).toFixed(4) : null);
  const sl: (number | null)[] = bars.map(() => null);
  const kk = 2 / (sig + 1); let sigEma: number | null = null, cnt = 0, initSum = 0;
  for (let i = 0; i < ml.length; i++) {
    if (ml[i] === null) continue;
    cnt++; initSum += ml[i]!;
    if (cnt === sig) { sigEma = initSum / sig; sl[i] = +sigEma.toFixed(4); }
    else if (cnt > sig && sigEma !== null) { sigEma = ml[i]! * kk + sigEma * (1 - kk); sl[i] = +sigEma.toFixed(4); }
  }
  return bars.map((_, i) => ({ m: ml[i], s: sl[i], h: ml[i] !== null && sl[i] !== null ? +(ml[i]! - sl[i]!).toFixed(4) : null }));
}

const ASSETS = [
  { label: "TECH Corp", base: 280, seed: 42, color: "#00d4ff" },
  { label: "DATA Inc", base: 145, seed: 77, color: "#a855f7" },
  { label: "AI Systems", base: 520, seed: 13, color: "#f472b6" },
  { label: "FINTECH Ltd", base: 95, seed: 55, color: "#22d3ee" },
  { label: "RETAIL Co", base: 32, seed: 88, color: "#fb923c" },
];
const TF = ["1D", "1W", "1M"] as const;
type TfType = typeof TF[number];

const OVERLAYS = [
  { id: "sma20", label: "SMA 20", color: "#f59e0b" },
  { id: "sma50", label: "SMA 50", color: "#6366f1" },
  { id: "ema20", label: "EMA 20", color: "#84cc16" },
  { id: "ema50", label: "EMA 50", color: "#ec4899" },
  { id: "bb", label: "Bollinger Bands", color: "#00d4ff" },
];
const SUBPANELS = [
  { id: "none", label: "Oscillator: Off" },
  { id: "rsi", label: "RSI (14)" },
  { id: "macd", label: "MACD (12,26,9)" },
];

const DAILY_DATA = ASSETS.map(a => generateDaily(300, a.base, a.seed));

export default function CandleChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [assetIdx, setAssetIdx] = useState(0);
  const [tf, setTf] = useState<TfType>("1D");
  const [overlays, setOverlays] = useState<string[]>(["sma20"]);
  const [subPanel, setSubPanel] = useState<"none" | "rsi" | "macd">("none");
  const [openMenu, setOpenMenu] = useState<"asset" | "overlay" | "sub" | null>(null);
  const [tooltip, setTooltip] = useState<{ bar: Bar; px: number; py: number } | null>(null);

  const toggleOverlay = (id: string) =>
    setOverlays(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const bars = useMemo(() => {
    const d = DAILY_DATA[assetIdx];
    if (tf === "1W") return toWeekly(d);
    if (tf === "1M") return toMonthly(d);
    return d.slice(-90);
  }, [assetIdx, tf]);

  useEffect(() => {
    if (!svgRef.current || !wrapRef.current || !bars.length) return;
    const W = wrapRef.current.clientWidth || 800;
    const mg = { t: 15, r: 72, b: 28, l: 8 };
    const mainH = subPanel !== "none" ? 255 : 340;
    const volH = 55, panelH = 110, gap = 8;
    const hasPanel = subPanel !== "none";
    const H = mg.t + mainH + gap + volH + (hasPanel ? gap + panelH : 0) + mg.b;
    const IW = W - mg.l - mg.r;
    const n = bars.length;

    const svg = d3.select(svgRef.current).attr("width", W).attr("height", H);
    svg.selectAll("*").remove();

    const xScale = d3.scaleBand().domain(bars.map((_, i) => String(i))).range([0, IW]).padding(0.2);
    const bw = xScale.bandwidth();
    const cx = (i: number) => xScale(String(i))! + bw / 2;

    const yP = d3.scaleLinear().domain([d3.min(bars, b => b.low)! * 0.997, d3.max(bars, b => b.high)! * 1.003]).range([mainH, 0]).nice();
    const yV = d3.scaleLinear().domain([0, d3.max(bars, b => b.volume)! * 1.15]).range([volH, 0]);

    const root = svg.append("g").attr("transform", `translate(${mg.l},${mg.t})`);
    const mainG = root.append("g");

    // grid
    yP.ticks(6).forEach(tick => {
      mainG.append("line").attr("x1", 0).attr("x2", IW).attr("y1", yP(tick)).attr("y2", yP(tick)).attr("stroke", "rgba(255,255,255,0.04)").attr("stroke-width", 1);
      mainG.append("text").attr("x", IW + 5).attr("y", yP(tick) + 4).attr("fill", "#475569").attr("font-size", 10).text(`$${tick >= 100 ? tick.toFixed(0) : tick.toFixed(2)}`);
    });

    // x-axis labels
    const li = Math.max(1, Math.floor(n / 7));
    const dateFmt = tf === "1M" ? d3.timeFormat("%b %Y") : d3.timeFormat("%b %d");
    bars.forEach((b, i) => {
      if (i % li === 0)
        mainG.append("text").attr("x", cx(i)).attr("y", mainH + gap + volH + mg.b - 6).attr("text-anchor", "middle").attr("fill", "#334155").attr("font-size", 9).text(dateFmt(b.date));
    });

    // Bollinger bands
    if (overlays.includes("bb")) {
      const bb = calcBB(bars);
      const mkLine = (fn: (i: number) => number | null) =>
        d3.line<Bar>().defined((_, i) => fn(i) !== null).x((_, i) => cx(i)).y((_, i) => yP(fn(i)!));
      const area = d3.area<Bar>().defined((_, i) => bb[i].u !== null).x((_, i) => cx(i)).y0((_, i) => yP(bb[i].u!)).y1((_, i) => yP(bb[i].l!));
      mainG.append("path").datum(bars).attr("d", area as any).attr("fill", "rgba(0,212,255,0.05)");
      mainG.append("path").datum(bars).attr("d", mkLine(i => bb[i].u)(bars) as any).attr("fill", "none").attr("stroke", "rgba(0,212,255,0.45)").attr("stroke-width", 1);
      mainG.append("path").datum(bars).attr("d", mkLine(i => bb[i].l)(bars) as any).attr("fill", "none").attr("stroke", "rgba(0,212,255,0.45)").attr("stroke-width", 1);
      mainG.append("path").datum(bars).attr("d", mkLine(i => bb[i].mid)(bars) as any).attr("fill", "none").attr("stroke", "rgba(0,212,255,0.25)").attr("stroke-width", 1).attr("stroke-dasharray", "3,3");
    }

    // SMA / EMA overlays
    [
      { id: "sma20", vals: calcSMA(bars, 20), color: "#f59e0b" },
      { id: "sma50", vals: calcSMA(bars, 50), color: "#6366f1" },
      { id: "ema20", vals: calcEMA(bars, 20), color: "#84cc16" },
      { id: "ema50", vals: calcEMA(bars, 50), color: "#ec4899" },
    ].filter(o => overlays.includes(o.id)).forEach(o => {
      const line = d3.line<Bar>().defined((_, i) => o.vals[i] !== null).x((_, i) => cx(i)).y((_, i) => yP(o.vals[i]!));
      mainG.append("path").datum(bars).attr("d", line as any).attr("fill", "none").attr("stroke", o.color).attr("stroke-width", 1.5).attr("opacity", 0.85);
    });

    // Candlesticks
    bars.forEach((b, i) => {
      const bull = b.close >= b.open;
      const col = bull ? "#22c55e" : "#ef4444";
      mainG.append("line").attr("x1", cx(i)).attr("x2", cx(i)).attr("y1", yP(b.high)).attr("y2", yP(b.low)).attr("stroke", col).attr("stroke-width", 1).attr("opacity", 0.75);
      mainG.append("rect").attr("x", xScale(String(i))!).attr("y", yP(Math.max(b.open, b.close))).attr("width", bw).attr("height", Math.max(1, Math.abs(yP(b.open) - yP(b.close)))).attr("fill", col).attr("opacity", 0.85);
    });

    // Volume
    const volG = root.append("g").attr("transform", `translate(0,${mainH + gap})`);
    volG.append("text").attr("x", 0).attr("y", -3).attr("fill", "#334155").attr("font-size", 9).text("VOLUME");
    bars.forEach((b, i) => {
      const bull = b.close >= b.open;
      volG.append("rect").attr("x", xScale(String(i))!).attr("y", yV(b.volume)).attr("width", bw).attr("height", volH - yV(b.volume)).attr("fill", bull ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)");
    });

    // RSI panel
    if (hasPanel && subPanel === "rsi") {
      const py = mainH + gap + volH + gap;
      const pG = root.append("g").attr("transform", `translate(0,${py})`);
      pG.append("text").attr("x", 0).attr("y", -3).attr("fill", "#334155").attr("font-size", 9).text("RSI (14)");
      const yR = d3.scaleLinear().domain([0, 100]).range([panelH, 0]);
      [30, 50, 70].forEach(v => {
        pG.append("line").attr("x1", 0).attr("x2", IW).attr("y1", yR(v)).attr("y2", yR(v))
          .attr("stroke", v === 50 ? "rgba(255,255,255,0.04)" : v === 70 ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)")
          .attr("stroke-dasharray", "4,3").attr("stroke-width", 1);
        pG.append("text").attr("x", IW + 4).attr("y", yR(v) + 4).attr("fill", "#334155").attr("font-size", 9).text(v);
      });
      const rv = calcRSI(bars);
      const rLine = d3.line<Bar>().defined((_, i) => rv[i] !== null).x((_, i) => cx(i)).y((_, i) => yR(rv[i]!));
      pG.append("path").datum(bars).attr("d", rLine as any).attr("fill", "none").attr("stroke", "#a855f7").attr("stroke-width", 1.5);

      // RSI area fill
      const rArea = d3.area<Bar>().defined((_, i) => rv[i] !== null).x((_, i) => cx(i)).y0(panelH).y1((_, i) => yR(rv[i]!));
      pG.append("path").datum(bars).attr("d", rArea as any).attr("fill", "rgba(168,85,247,0.08)");
    }

    // MACD panel
    if (hasPanel && subPanel === "macd") {
      const py = mainH + gap + volH + gap;
      const pG = root.append("g").attr("transform", `translate(0,${py})`);
      pG.append("text").attr("x", 0).attr("y", -3).attr("fill", "#334155").attr("font-size", 9).text("MACD (12,26,9)");
      const mv = calcMACD(bars);
      const allV = mv.flatMap(v => [v.m, v.s, v.h]).filter(v => v !== null) as number[];
      const ext = d3.extent(allV) as [number, number];
      const pad = Math.abs(ext[1] - ext[0]) * 0.15;
      const yM = d3.scaleLinear().domain([ext[0] - pad, ext[1] + pad]).range([panelH, 0]);
      pG.append("line").attr("x1", 0).attr("x2", IW).attr("y1", yM(0)).attr("y2", yM(0)).attr("stroke", "rgba(255,255,255,0.07)").attr("stroke-width", 1);
      yM.ticks(3).forEach(tick => {
        pG.append("text").attr("x", IW + 4).attr("y", yM(tick) + 4).attr("fill", "#334155").attr("font-size", 9).text(tick.toFixed(1));
      });
      mv.forEach((v, i) => {
        if (v.h === null) return;
        const y0 = yM(0), y1 = yM(v.h);
        pG.append("rect").attr("x", xScale(String(i))!).attr("y", Math.min(y0, y1)).attr("width", bw).attr("height", Math.abs(y1 - y0))
          .attr("fill", v.h >= 0 ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)");
      });
      const macdLine = d3.line<Bar>().defined((_, i) => mv[i].m !== null).x((_, i) => cx(i)).y((_, i) => yM(mv[i].m!));
      const sigLine = d3.line<Bar>().defined((_, i) => mv[i].s !== null).x((_, i) => cx(i)).y((_, i) => yM(mv[i].s!));
      pG.append("path").datum(bars).attr("d", macdLine as any).attr("fill", "none").attr("stroke", "#00d4ff").attr("stroke-width", 1.5);
      pG.append("path").datum(bars).attr("d", sigLine as any).attr("fill", "none").attr("stroke", "#f472b6").attr("stroke-width", 1.5).attr("stroke-dasharray", "3,2");
    }

    // Crosshair
    const crossV = root.append("line").attr("y1", 0).attr("y2", H - mg.t - mg.b).attr("stroke", "rgba(255,255,255,0.12)").attr("stroke-width", 1).attr("stroke-dasharray", "3,3").style("display", "none").attr("pointer-events", "none");
    const crossH = mainG.append("line").attr("x1", 0).attr("x2", IW).attr("stroke", "rgba(255,255,255,0.12)").attr("stroke-width", 1).attr("stroke-dasharray", "3,3").style("display", "none").attr("pointer-events", "none");

    // Price label on y-axis that follows crosshair
    const priceLabel = mainG.append("g").style("display", "none").attr("pointer-events", "none");
    priceLabel.append("rect").attr("x", IW + 1).attr("width", mg.r - 2).attr("height", 16).attr("fill", "#1e293b").attr("rx", 3);
    const priceLabelText = priceLabel.append("text").attr("x", IW + 4).attr("y", 11).attr("fill", "#e2e8f0").attr("font-size", 10);

    svg.append("rect").attr("width", W).attr("height", H).attr("fill", "none").attr("pointer-events", "all").style("cursor", "crosshair")
      .on("mousemove", function (event) {
        const [mx, my] = d3.pointer(event);
        const relX = mx - mg.l;
        const relY = my - mg.t;
        if (relX < 0 || relX > IW) { crossV.style("display", "none"); crossH.style("display", "none"); priceLabel.style("display", "none"); setTooltip(null); return; }
        const idx = Math.max(0, Math.min(n - 1, Math.round(relX / IW * n - 0.5)));
        crossV.attr("x1", cx(idx)).attr("x2", cx(idx)).style("display", "block");
        if (relY >= 0 && relY <= mainH) {
          crossH.attr("y1", relY).attr("y2", relY).style("display", "block");
          const price = yP.invert(relY);
          priceLabel.attr("transform", `translate(0,${relY - 8})`).style("display", "block");
          priceLabelText.text(`$${price.toFixed(2)}`);
        } else {
          crossH.style("display", "none");
          priceLabel.style("display", "none");
        }
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({ bar: bars[idx], px: event.clientX - rect.left, py: event.clientY - rect.top });
      })
      .on("mouseleave", () => {
        crossV.style("display", "none"); crossH.style("display", "none"); priceLabel.style("display", "none"); setTooltip(null);
      });

  }, [bars, overlays, subPanel, tf]);

  const asset = ASSETS[assetIdx];
  const last = bars[bars.length - 1];
  const first = bars[0];
  const pct = last && first ? (((last.close - first.close) / first.close) * 100).toFixed(2) : "0.00";
  const isUp = last && first ? last.close >= first.close : true;

  return (
    <section id="candles" className="py-24 px-6 bg-[#010b18]">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <span className="text-xs text-amber-400 tracking-widest uppercase font-medium">Candlestick Analysis</span>
          <h2 className="text-4xl font-bold text-white mt-2 mb-3">
            OHLC <span className="gradient-text">Candlestick Chart</span>
          </h2>
          <p className="text-slate-400 max-w-xl">
            Interactive candlestick chart with technical overlays (SMA, EMA, Bollinger Bands) and oscillator sub-panels (RSI, MACD) across daily, weekly and monthly timeframes.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-2xl border border-white/5 overflow-visible">

          {/* ── Toolbar ────────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/5 relative z-20">

            {/* Asset */}
            <div className="relative">
              <button onClick={() => setOpenMenu(o => o === "asset" ? null : "asset")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card border text-sm text-white transition-all"
                style={{ borderColor: asset.color + "44" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: asset.color }} />
                {asset.label}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {openMenu === "asset" && (
                <div className="absolute top-full mt-1 z-30 glass-card rounded-xl border border-white/10 shadow-xl min-w-[155px] overflow-hidden">
                  {ASSETS.map((a, i) => (
                    <button key={a.label} onClick={() => { setAssetIdx(i); setOpenMenu(null); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors ${assetIdx === i ? "text-white" : "text-slate-400"}`}>
                      <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />{a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Timeframe */}
            <div className="flex glass-card rounded-lg p-1 gap-0.5">
              {TF.map(t => (
                <button key={t} onClick={() => setTf(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${tf === t ? "bg-amber-400/20 text-amber-400 border border-amber-400/30" : "text-slate-500 hover:text-slate-300"}`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Overlays */}
            <div className="relative">
              <button onClick={() => setOpenMenu(o => o === "overlay" ? null : "overlay")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg glass-card border text-sm transition-all ${overlays.length > 0 ? "border-cyan-400/30 text-cyan-400" : "border-white/10 text-slate-400 hover:border-white/20"}`}>
                Overlays{overlays.length > 0 ? ` (${overlays.length})` : ""}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openMenu === "overlay" && (
                <div className="absolute top-full mt-1 z-30 glass-card rounded-xl border border-white/10 shadow-xl min-w-[185px] overflow-hidden">
                  {OVERLAYS.map(o => (
                    <button key={o.id} onClick={() => toggleOverlay(o.id)}
                      className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-4 h-0.5 rounded" style={{ background: o.color }} />
                        <span className={overlays.includes(o.id) ? "text-white" : "text-slate-400"}>{o.label}</span>
                      </div>
                      {overlays.includes(o.id) && <Check className="w-3.5 h-3.5" style={{ color: o.color }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sub-panel */}
            <div className="relative">
              <button onClick={() => setOpenMenu(o => o === "sub" ? null : "sub")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg glass-card border text-sm transition-all ${subPanel !== "none" ? "border-purple-400/30 text-purple-400" : "border-white/10 text-slate-400 hover:border-white/20"}`}>
                {SUBPANELS.find(s => s.id === subPanel)?.label}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openMenu === "sub" && (
                <div className="absolute top-full mt-1 z-30 glass-card rounded-xl border border-white/10 shadow-xl min-w-[175px] overflow-hidden">
                  {SUBPANELS.map(s => (
                    <button key={s.id} onClick={() => { setSubPanel(s.id as any); setOpenMenu(null); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${subPanel === s.id ? "text-purple-400" : "text-slate-400"}`}>
                      {s.label}
                      {subPanel === s.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="ml-auto flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">${last?.close.toFixed(2)}</span>
              <span className={`text-sm font-medium ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                {isUp ? "+" : ""}{pct}%
              </span>
              <span className="text-xs text-slate-500 ml-1">{tf === "1D" ? "90D" : tf === "1W" ? "~1Y" : "~2Y"}</span>
            </div>
          </div>

          {/* ── Chart ──────────────────────────────────────────────────────── */}
          <div ref={wrapRef} className="relative px-2 py-3" onClick={() => setOpenMenu(null)}>
            <svg ref={svgRef} className="w-full" />

            {/* Floating tooltip */}
            {tooltip && (
              <div className="absolute pointer-events-none z-30 glass-card rounded-xl border border-white/10 p-3 text-xs shadow-2xl"
                style={{ left: Math.min(tooltip.px + 16, (wrapRef.current?.clientWidth ?? 800) - 175), top: Math.max(8, tooltip.py - 110), minWidth: 160 }}>
                <p className="text-slate-300 font-semibold mb-2">
                  {tooltip.bar.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                {([["O", tooltip.bar.open, "text-slate-300"], ["H", tooltip.bar.high, "text-emerald-400"], ["L", tooltip.bar.low, "text-red-400"], ["C", tooltip.bar.close, "text-cyan-400"]] as [string, number, string][]).map(([k, v, cls]) => (
                  <div key={k} className="flex justify-between gap-4 mb-1">
                    <span className="text-slate-500">{k}</span>
                    <span className={`font-medium ${cls}`}>${v.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-4 pt-1 mt-1 border-t border-white/5">
                  <span className="text-slate-500">Vol</span>
                  <span className="text-slate-300">{(tooltip.bar.volume / 1e6).toFixed(2)}M</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Legend ─────────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 border-t border-white/5">
            {[{ color: "#22c55e", label: "Bullish" }, { color: "#ef4444", label: "Bearish" }].map(x => (
              <div key={x.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-3 rounded-sm opacity-70" style={{ background: x.color }} />{x.label}
              </div>
            ))}
            {overlays.map(id => { const o = OVERLAYS.find(x => x.id === id); return o ? (
              <div key={id} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="inline-block w-5 h-0.5 rounded" style={{ background: o.color }} />{o.label}
              </div>
            ) : null; })}
            {subPanel === "rsi" && <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="inline-block w-5 h-0.5 rounded" style={{ background: "#a855f7" }} />RSI</div>}
            {subPanel === "macd" && <>
              <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="inline-block w-5 h-0.5 rounded" style={{ background: "#00d4ff" }} />MACD</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500"><span className="inline-block w-5 h-0.5 rounded" style={{ background: "#f472b6" }} />Signal</div>
            </>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
