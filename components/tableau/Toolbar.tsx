"use client";
import {
  Save, Undo2, Redo2, RefreshCw, ZoomIn, ZoomOut,
  SlidersHorizontal, Download, Share2, LayoutDashboard, Maximize2
} from "lucide-react";

const LEFT_TOOLS = [
  { icon: Save,            tip: "Save" },
  { icon: Undo2,           tip: "Undo" },
  { icon: Redo2,           tip: "Redo" },
  null,
  { icon: RefreshCw,       tip: "Refresh Data" },
  null,
  { icon: ZoomIn,          tip: "Zoom In" },
  { icon: ZoomOut,         tip: "Zoom Out" },
  null,
  { icon: SlidersHorizontal, tip: "Show/Hide Filters" },
  { icon: LayoutDashboard, tip: "Dashboard" },
];

const RIGHT_TOOLS = [
  { icon: Download, tip: "Export" },
  { icon: Share2,   tip: "Share" },
  { icon: Maximize2,tip: "Full Screen" },
];

export default function Toolbar() {
  return (
    <div
      className="flex items-center gap-0.5 h-9 px-2 shrink-0 border-b"
      style={{ background: "#FFFFFF", borderColor: "var(--t-border)" }}
    >
      {LEFT_TOOLS.map((tool, i) =>
        tool === null ? (
          <div key={i} className="w-px h-5 mx-1" style={{ background: "var(--t-border)" }} />
        ) : (
          <button key={i} className="tb-btn" title={tool.tip}>
            <tool.icon className="w-3.5 h-3.5" />
          </button>
        )
      )}
      <div className="flex-1" />
      {RIGHT_TOOLS.map((tool) => (
        <button key={tool.tip} className="tb-btn" title={tool.tip}>
          <tool.icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}
