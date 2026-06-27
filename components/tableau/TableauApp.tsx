"use client";
import { useState } from "react";
import TopBar    from "./TopBar";
import Toolbar   from "./Toolbar";
import DataPane  from "./DataPane";
import SheetTabs from "./SheetTabs";
import Overview       from "./sheets/Overview";
import FinancialSheet from "./sheets/FinancialSheet";
import CandleSheet    from "./sheets/CandleSheet";
import GlobalSheet    from "./sheets/GlobalSheet";
import GeoSheet       from "./sheets/GeoSheet";
import NetworkSheet   from "./sheets/NetworkSheet";

function SheetCanvas({ activeSheet, filters }: { activeSheet: string; filters: Record<string,string> }) {
  switch (activeSheet) {
    case "Financial":      return <FinancialSheet filters={filters} />;
    case "Candlestick":    return <CandleSheet    filters={filters} />;
    case "Global Markets": return <GlobalSheet    filters={filters} />;
    case "Geographic":     return <GeoSheet       filters={filters} />;
    case "Network":        return <NetworkSheet   filters={filters} />;
    default:               return <Overview       filters={filters} />;
  }
}

export default function TableauApp() {
  const [activeSheet, setActiveSheet] = useState("Overview");
  const [filters, setFilters] = useState<Record<string,string>>({});

  function handleFilterChange(key: string, val: string) {
    setFilters(prev => ({ ...prev, [key]: val }));
  }

  return (
    <div className="flex flex-col w-screen overflow-hidden" style={{ height: "calc(100vh - 48px)", background: "var(--t-canvas)" }}>
      <TopBar />
      <Toolbar />
      <div className="flex flex-1 overflow-hidden min-h-0">
        <DataPane
          activeSheet={activeSheet}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-auto min-h-0">
            <SheetCanvas activeSheet={activeSheet} filters={filters} />
          </div>
          <SheetTabs active={activeSheet} onSelect={(id) => { setActiveSheet(id); setFilters({}); }} />
        </div>
      </div>
    </div>
  );
}
