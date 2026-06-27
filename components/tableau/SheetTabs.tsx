"use client";
import { Plus, BarChart2, TrendingUp, Globe, MapPin, Network } from "lucide-react";

export const SHEETS = [
  { id: "Overview",       label: "Overview",        icon: BarChart2 },
  { id: "Financial",      label: "Financial",       icon: TrendingUp },
  { id: "Candlestick",    label: "Candlestick",     icon: TrendingUp },
  { id: "Global Markets", label: "Global Markets",  icon: Globe },
  { id: "Geographic",     label: "Geographic",      icon: MapPin },
  { id: "Network",        label: "Network",         icon: Network },
];

interface Props {
  active: string;
  onSelect: (id: string) => void;
}

export default function SheetTabs({ active, onSelect }: Props) {
  return (
    <div
      className="flex items-end h-9 shrink-0 border-t overflow-x-auto"
      style={{ background: "var(--t-canvas)", borderColor: "var(--t-border)" }}
    >
      {SHEETS.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`flex items-center gap-1.5 px-4 h-8 text-xs whitespace-nowrap border-t border-l border-r transition-all shrink-0 ${
              isActive
                ? "sheet-tab-active"
                : "bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            }`}
            style={isActive ? { borderTopColor: "var(--t-blue)", background: "white", borderLeftColor: "var(--t-border)", borderRightColor: "var(--t-border)" } : {}}
          >
            <s.icon className="w-3 h-3" />
            {s.label}
          </button>
        );
      })}
      <button className="flex items-center gap-1 px-3 h-8 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors shrink-0">
        <Plus className="w-3 h-3" /> New Sheet
      </button>
    </div>
  );
}
