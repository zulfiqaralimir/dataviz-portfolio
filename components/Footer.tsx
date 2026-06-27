"use client";
import { BarChart3 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6 bg-[#010b18]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold gradient-text tracking-wider">DATAVIZ PORTFOLIO</span>
        </div>

        <p className="text-xs text-slate-600">
          Data Visualization · Product Analytics · Commercial Intelligence
        </p>

        <div className="flex gap-4 text-xs text-slate-600">
          <a href="#dashboard" className="hover:text-slate-400 transition-colors">Dashboard</a>
          <a href="#financial" className="hover:text-slate-400 transition-colors">Financial</a>
          <a href="#geospatial" className="hover:text-slate-400 transition-colors">Geospatial</a>
          <a href="#network" className="hover:text-slate-400 transition-colors">Network</a>
        </div>
      </div>
    </footer>
  );
}
