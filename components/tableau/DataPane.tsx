"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown, Search, Hash, Calendar, MapPin, Type, TrendingUp } from "lucide-react";

interface DataPaneProps {
  activeSheet: string;
  filters: Record<string, string>;
  onFilterChange: (key: string, val: string) => void;
}

const DIMENSIONS: { label: string; icon: any }[] = [
  { label: "Date",        icon: Calendar },
  { label: "Region",      icon: MapPin },
  { label: "Sector",      icon: Type },
  { label: "Country",     icon: MapPin },
  { label: "Asset",       icon: Type },
  { label: "Timeframe",   icon: Calendar },
];

const MEASURES: { label: string; icon: any }[] = [
  { label: "Revenue ($)",   icon: Hash },
  { label: "Users",         icon: Hash },
  { label: "Conversion %",  icon: Hash },
  { label: "Market Cap",    icon: Hash },
  { label: "Daily Change %",icon: TrendingUp },
  { label: "Volume",        icon: Hash },
];

const FILTER_OPTIONS: Record<string, { label: string; options: string[] }[]> = {
  Overview: [
    { label: "Period",  options: ["Last 3 Months","Last 6 Months","Last 12 Months","All Time"] },
    { label: "Sector",  options: ["All","Analytics","Commerce","FinTech","HealthTech"] },
  ],
  Financial: [
    { label: "Asset",      options: ["TECH Corp","DATA Inc","AI Systems","FINTECH Ltd","RETAIL Co"] },
    { label: "Timeframe",  options: ["Daily (1D)","Weekly (1W)","Monthly (1M)"] },
    { label: "Indicator",  options: ["None","SMA 20","SMA 50","EMA 20","Bollinger Bands"] },
  ],
  Candlestick: [
    { label: "Asset",      options: ["TECH Corp","DATA Inc","AI Systems","FINTECH Ltd","RETAIL Co"] },
    { label: "Timeframe",  options: ["Daily (1D)","Weekly (1W)","Monthly (1M)"] },
    { label: "Overlay",    options: ["None","SMA 20","EMA 20","Bollinger Bands"] },
    { label: "Oscillator", options: ["Off","RSI (14)","MACD (12,26,9)"] },
  ],
  "Global Markets": [
    { label: "Region",     options: ["All","Americas","Europe","Asia","MENA"] },
    { label: "Sentiment",  options: ["All","Bullish Only","Bearish Only"] },
  ],
  Geographic: [
    { label: "Metric",     options: ["Revenue","Users","Growth"] },
  ],
  Network: [
    { label: "Group",      options: ["All","Core Product","Infrastructure","Commerce","Reporting"] },
  ],
  Heatmaps: [
    { label: "Heatmap Type", options: ["Calendar","Correlation Matrix","Risk Matrix"] },
    { label: "Year",         options: ["2024","2023","2022"] },
  ],
  Stream: [
    { label: "Period",  options: ["12 Months","24 Months","36 Months"] },
    { label: "Streams", options: ["All","Top 3","Top 2"] },
  ],
  Scatter: [
    { label: "Variables", options: ["Price/Volume/MCap/PE","Revenue/Users/Conversion/Churn"] },
    { label: "Color By",  options: ["Sector","Region"] },
  ],
};

export default function DataPane({ activeSheet, filters, onFilterChange }: DataPaneProps) {
  const [openSections, setOpenSections] = useState({ dimensions: true, measures: true, filters: true });
  const [search, setSearch] = useState("");
  const toggle = (s: keyof typeof openSections) => setOpenSections(p => ({ ...p, [s]: !p[s] }));

  const sheetFilters = FILTER_OPTIONS[activeSheet] ?? [];

  return (
    <div
      className="flex flex-col h-full overflow-hidden border-r"
      style={{ width: 220, background: "var(--t-sidebar)", borderColor: "var(--t-border)", flexShrink: 0 }}
    >
      <div className="p-2 border-b" style={{ borderColor: "var(--t-border-lt)" }}>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded border text-xs" style={{ background: "white", borderColor: "var(--t-border)" }}>
          <Search className="w-3 h-3" style={{ color: "var(--t-text-muted)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search fields…"
            className="flex-1 outline-none bg-transparent text-xs"
            style={{ color: "var(--t-text)" }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div>
          <button onClick={() => toggle("dimensions")} className="pane-header w-full flex items-center justify-between hover:bg-gray-100 transition-colors">
            <span>Dimensions</span>
            {openSections.dimensions ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          {openSections.dimensions && (
            <div className="py-1">
              {DIMENSIONS.filter(d => d.label.toLowerCase().includes(search.toLowerCase())).map(d => (
                <div key={d.label} className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-blue-50 transition-colors">
                  <d.icon className="w-3 h-3 shrink-0" style={{ color: "var(--t-text-dim)" }} />
                  <span className="text-xs" style={{ color: "var(--t-text-dim)" }}>{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t" style={{ borderColor: "var(--t-border-lt)" }} />

        <div>
          <button onClick={() => toggle("measures")} className="pane-header w-full flex items-center justify-between hover:bg-gray-100 transition-colors">
            <span>Measures</span>
            {openSections.measures ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          {openSections.measures && (
            <div className="py-1">
              {MEASURES.filter(m => m.label.toLowerCase().includes(search.toLowerCase())).map(m => (
                <div key={m.label} className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-green-50 transition-colors">
                  <m.icon className="w-3 h-3 shrink-0" style={{ color: "var(--t-text-mea)" }} />
                  <span className="text-xs" style={{ color: "var(--t-text-mea)" }}>{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t" style={{ borderColor: "var(--t-border-lt)" }} />

        <div>
          <button onClick={() => toggle("filters")} className="pane-header w-full flex items-center justify-between hover:bg-gray-100 transition-colors">
            <span>Filters</span>
            {openSections.filters ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          {openSections.filters && (
            <div className="p-2 space-y-3">
              {sheetFilters.map(f => (
                <div key={f.label}>
                  <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--t-text-muted)" }}>{f.label}</p>
                  <select
                    value={filters[f.label] ?? f.options[0]}
                    onChange={e => onFilterChange(f.label, e.target.value)}
                    className="w-full text-xs rounded border px-2 py-1 outline-none"
                    style={{ background: "white", borderColor: "var(--t-border)", color: "var(--t-text)" }}
                  >
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              {sheetFilters.length === 0 && (
                <p className="text-[11px] text-center py-2" style={{ color: "var(--t-text-muted)" }}>No filters for this sheet</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-3 py-2 border-t text-[10px]" style={{ borderColor: "var(--t-border-lt)", color: "var(--t-text-muted)" }}>
        {DIMENSIONS.length + MEASURES.length} fields · {sheetFilters.length} active filters
      </div>
    </div>
  );
}
