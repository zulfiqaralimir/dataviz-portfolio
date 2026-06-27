"use client";
import { BarChart2 } from "lucide-react";

const menus = ["File", "Data", "Worksheet", "Dashboard", "Analysis", "Map", "Format", "Help"];

export default function TopBar() {
  return (
    <div className="flex items-center h-9 shrink-0" style={{ background: "var(--t-navy)" }}>
      <div className="flex items-center gap-2 px-4 border-r border-white/10 h-full">
        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "var(--t-orange)" }}>
          <BarChart2 className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-white text-xs font-bold tracking-wider">BLACK IRON DataViz</span>
      </div>
      <nav className="flex h-full">
        {menus.map((m) => (
          <button
            key={m}
            className="h-full px-3 text-xs text-white/75 hover:text-white hover:bg-white/10 transition-colors flex items-center"
          >
            {m}
          </button>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-3 px-4">
        <span className="text-xs text-white/50">Black Iron Quantum AI</span>
        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">Z</div>
      </div>
    </div>
  );
}
