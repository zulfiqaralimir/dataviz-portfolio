"use client";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PL_DATA = [
  { name: "Revenue",      base: 0,   display: 850, fill: "#4E79A7", type: "start",    delta: 850  },
  { name: "COGS",         base: 540, display: 310, fill: "#E15759", type: "negative", delta: -310 },
  { name: "Gross Profit", base: 0,   display: 540, fill: "#BAB0AC", type: "subtotal", delta: 540  },
  { name: "OpEx",         base: 360, display: 180, fill: "#E15759", type: "negative", delta: -180 },
  { name: "EBITDA",       base: 0,   display: 360, fill: "#BAB0AC", type: "subtotal", delta: 360  },
  { name: "D&A",          base: 315, display: 45,  fill: "#E15759", type: "negative", delta: -45  },
  { name: "EBIT",         base: 0,   display: 315, fill: "#BAB0AC", type: "subtotal", delta: 315  },
  { name: "Interest",     base: 290, display: 25,  fill: "#E15759", type: "negative", delta: -25  },
  { name: "Tax",          base: 248, display: 42,  fill: "#E15759", type: "negative", delta: -42  },
  { name: "Net Income",   base: 0,   display: 248, fill: "#59A14F", type: "total",    delta: 248  },
];

const REV_DATA = [
  { name: "FY2023",        base: 0,   display: 720, fill: "#4E79A7", type: "start",    delta: 720  },
  { name: "Pricing",       base: 720, display: 55,  fill: "#59A14F", type: "positive", delta: 55   },
  { name: "Volume",        base: 775, display: 68,  fill: "#59A14F", type: "positive", delta: 68   },
  { name: "New Products",  base: 843, display: 42,  fill: "#59A14F", type: "positive", delta: 42   },
  { name: "FX Impact",     base: 818, display: 25,  fill: "#E15759", type: "negative", delta: -25  },
  { name: "Churn",         base: 793, display: 43,  fill: "#E15759", type: "negative", delta: -43  },
  { name: "FY2024",        base: 0,   display: 850, fill: "#4E79A7", type: "total",    delta: 850  },
];

const COST_DATA = [
  { name: "COGS Base",     base: 0,   display: 280, fill: "#4E79A7", type: "start",    delta: 280  },
  { name: "Materials",     base: 280, display: 35,  fill: "#E15759", type: "negative", delta: 35   },
  { name: "Labour",        base: 315, display: 28,  fill: "#E15759", type: "negative", delta: 28   },
  { name: "Efficiency",    base: 285, display: 30,  fill: "#59A14F", type: "positive", delta: -30  },
  { name: "Logistics",     base: 313, display: 18,  fill: "#E15759", type: "negative", delta: 18   },
  { name: "Overhead",      base: 305, display: 12,  fill: "#E15759", type: "negative", delta: 12   },
  { name: "Total Costs",   base: 0,   display: 310, fill: "#BAB0AC", type: "total",    delta: 310  },
];

const DATASETS: Record<string, typeof PL_DATA> = {
  "P&L Bridge":      PL_DATA,
  "Revenue Bridge":  REV_DATA,
  "Cost Bridge":     COST_DATA,
};

function WfTooltip({ active, payload, label, data }: any) {
  if (!active || !payload?.length) return null;
  const item = data?.find((d: any) => d.name === label);
  if (!item) return null;
  const isSub = item.type === "subtotal" || item.type === "total" || item.type === "start";
  const val = isSub ? `$${item.display}M` : `${item.delta > 0 ? "+" : ""}$${Math.abs(item.delta)}M`;
  return (
    <div style={{ background: "white", border: "1px solid #D4D4D4", padding: "8px 12px", borderRadius: 4, fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <p style={{ color: "var(--t-text)", fontWeight: 600, marginBottom: 2 }}>{label}</p>
      <p style={{ color: item.type === "negative" ? "#E15759" : item.type === "total" ? "#59A14F" : "var(--t-text)" }}>{val}</p>
    </div>
  );
}

export default function WaterfallSheet({ filters }: { filters: Record<string, string> }) {
  const view = filters["View"] ?? "P&L Bridge";
  const data = DATASETS[view] ?? PL_DATA;

  return (
    <div className="p-4 h-full overflow-y-auto" style={{ background: "var(--t-canvas)" }}>
      <div className="mb-4">
        <h2 className="text-base font-semibold" style={{ color: "var(--t-text)" }}>Waterfall Chart — {view}</h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--t-text-muted)" }}>Values in $M · Floating bars show incremental contribution</p>
      </div>

      <div className="t-card p-4">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid stroke="#EBEBEB" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
            <Tooltip content={<WfTooltip data={data} />} />
            <Bar dataKey="base" stackId="wf" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="display" stackId="wf" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-5 mt-3 text-xs" style={{ color: "var(--t-text-muted)" }}>
        {[["#4E79A7","Start/End"], ["#59A14F","Positive"], ["#E15759","Negative"], ["#BAB0AC","Subtotal"]].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded-sm" style={{ background: c }} />{l}</div>
        ))}
      </div>
    </div>
  );
}
