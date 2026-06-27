"use client";
import {
  ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from "recharts";

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

function generateData(days: number, base: number, seed = 42) {
  const rng = seededRng(seed);
  const data = [];
  let price = base;
  const start = new Date(2025, 0, 1);
  for (let i = 0; i < days; i++) {
    const change = (rng() - 0.48) * base * 0.025;
    price = Math.max(price + change, base * 0.6);
    const close = +(price + (rng() - 0.5) * base * 0.01).toFixed(2);
    const date = new Date(start.getTime() + i * 86400000);
    data.push({
      date: date.toLocaleDateString("en-US", { month:"short", day:"numeric" }),
      close,
      volume: Math.floor(rng() * 5e6 + 1e6),
      ma20: 0,
    });
    price = close;
  }
  for (let i = 19; i < data.length; i++) {
    data[i].ma20 = +(data.slice(i-19,i+1).reduce((s,d)=>s+d.close,0)/20).toFixed(2);
  }
  return data;
}

const ASSETS = [
  { label:"TECH Corp",  base:280, seed:42,  color:"#4E79A7" },
  { label:"DATA Inc",   base:145, seed:77,  color:"#F28E2B" },
  { label:"AI Systems", base:520, seed:13,  color:"#E15759" },
  { label:"FINTECH Ltd",base:95,  seed:55,  color:"#59A14F" },
  { label:"RETAIL Co",  base:32,  seed:88,  color:"#B07AA1" },
];

const TFRAMES: Record<string, number> = { "Daily (1D)":90, "Weekly (1W)":52, "Monthly (1M)":24 };

const TOOLTIP_STYLE = {
  contentStyle:{ background:"white", border:"1px solid #D4D4D4", borderRadius:4, fontSize:11, boxShadow:"0 2px 8px rgba(0,0,0,0.1)" },
};

export default function FinancialSheet({ filters }: { filters: Record<string, string> }) {
  const assetLabel = filters["Asset"] ?? "TECH Corp";
  const tfLabel    = filters["Timeframe"] ?? "Daily (1D)";
  const asset = ASSETS.find(a => a.label === assetLabel) ?? ASSETS[0];
  const days  = TFRAMES[tfLabel] ?? 90;
  const data  = generateData(days, asset.base, asset.seed).slice(-days);
  const last  = data[data.length - 1];
  const first = data[0];
  const pct   = (((last.close - first.close) / first.close) * 100).toFixed(2);
  const isUp  = last.close >= first.close;
  const interval = Math.max(1, Math.floor(days / 8));

  return (
    <div className="p-4 h-full overflow-y-auto" style={{ background:"var(--t-canvas)" }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color:"var(--t-text)" }}>Financial Time-Series Analysis</h2>
          <p className="text-xs mt-0.5" style={{ color:"var(--t-text-muted)" }}>{asset.label} · {tfLabel}</p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold" style={{ color:"var(--t-text)" }}>${last.close.toFixed(2)}</span>
          <span className={`text-sm font-semibold ${isUp ? "text-green-600":"text-red-500"}`}>{isUp?"+":""}{pct}%</span>
        </div>
      </div>

      <div className="t-card p-4 mb-3">
        <p className="text-xs font-semibold mb-3" style={{ color:"var(--t-text)" }}>Price & 20-Day Moving Average</p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="priceArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={asset.color} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={asset.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#EBEBEB" vertical={false}/>
            <XAxis dataKey="date" tick={{ fontSize:10, fill:"#999" }} axisLine={false} tickLine={false} interval={interval}/>
            <YAxis tick={{ fontSize:10, fill:"#999" }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} width={55}/>
            <Tooltip {...TOOLTIP_STYLE} formatter={(v:any,n)=>[`$${v}`,n]}/>
            <Legend wrapperStyle={{ fontSize:11 }}/>
            <ReferenceLine y={first.close} stroke="#CCCCCC" strokeDasharray="4 4"/>
            <Area type="monotone" dataKey="close" stroke="none" fill="url(#priceArea)" name="Price Area"/>
            <Line type="monotone" dataKey="close" stroke={asset.color} strokeWidth={2} dot={false} name="Price"/>
            <Line type="monotone" dataKey="ma20"  stroke="#EDC948" strokeWidth={1.5} dot={false} strokeDasharray="5 3" name="MA 20"/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="t-card p-4">
        <p className="text-xs font-semibold mb-2" style={{ color:"var(--t-text)" }}>Volume</p>
        <ResponsiveContainer width="100%" height={90}>
          <ComposedChart data={data}>
            <CartesianGrid stroke="#EBEBEB" vertical={false}/>
            <XAxis dataKey="date" tick={{ fontSize:9, fill:"#999" }} axisLine={false} tickLine={false} interval={interval}/>
            <YAxis tick={{ fontSize:9, fill:"#999" }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1e6).toFixed(0)}M`} width={40}/>
            <Tooltip {...TOOLTIP_STYLE} formatter={(v:any)=>[`${(+v/1e6).toFixed(2)}M`,"Volume"]}/>
            <Bar dataKey="volume" fill={asset.color} opacity={0.4} radius={[2,2,0,0]}/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
