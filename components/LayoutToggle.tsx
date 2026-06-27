"use client";
import { useState, useEffect } from "react";
import { LayoutDashboard, BarChart2 } from "lucide-react";
import TableauApp from "./tableau/TableauApp";

interface Props {
  children: React.ReactNode;
}

export default function LayoutToggle({ children }: Props) {
  const [mode, setMode] = useState<"standard" | "tableau">("standard");

  useEffect(() => {
    if (mode === "tableau") {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [mode]);

  return (
    <>
      {/* Floating toggle button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-2 shadow-lg border cursor-pointer select-none"
        style={{
          background: mode === "tableau" ? "var(--t-navy, #1B2A3B)" : "#020817",
          borderColor: mode === "tableau" ? "var(--t-blue, #4467C4)" : "rgba(0,212,255,0.4)",
          color: "white",
        }}
        onClick={() => setMode(m => m === "standard" ? "tableau" : "standard")}
      >
        {mode === "standard" ? (
          <>
            <BarChart2 className="w-4 h-4" style={{ color: "#4467C4" }} />
            <span className="text-xs font-semibold tracking-wide">Tableau View</span>
          </>
        ) : (
          <>
            <LayoutDashboard className="w-4 h-4" style={{ color: "#00d4ff" }} />
            <span className="text-xs font-semibold tracking-wide">Portfolio View</span>
          </>
        )}
      </div>

      {mode === "standard" ? (
        <>{children}</>
      ) : (
        <TableauApp />
      )}
    </>
  );
}
