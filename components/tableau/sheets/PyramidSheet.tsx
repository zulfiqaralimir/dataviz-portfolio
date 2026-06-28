"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const AGE_DATA = [
  { age: "0–9",   male: -5,   female: 4   },
  { age: "10–19", male: -45,  female: 52  },
  { age: "20–29", male: -280, female: 310 },
  { age: "30–39", male: -420, female: 395 },
  { age: "40–49", male: -380, female: 360 },
  { age: "50–59", male: -290, female: 275 },
  { age: "60–69", male: -185, female: 172 },
  { age: "70–79", male: -85,  female: 90  },
  { age: "80+",   male: -30,  female: 38  },
].reverse();

const INCOME_DATA = [
  { age: "Under $25K",   male: -85,  female: 92  },
  { age: "$25K–$50K",    male: -210, female: 225 },
  { age: "$50K–$75K",    male: -320, female: 298 },
  { age: "$75K–$100K",   male: -385, female: 360 },
  { age: "$100K–$150K",  male: -420, female: 395 },
  { age: "$150K–$200K",  male: -280, female: 255 },
  { age: "$200K+",       male: -145, female: 132 },
].reverse();

const TIER_DATA = [
  { age: "Free",       male: -380, female: 420 },
  { age: "Starter",    male: -290, female: 310 },
  { age: "Pro",        male: -420, female: 395 },
  { age: "Business",   male: -285, female: 260 },
  { age: "Enterprise", male: -125, female: 110 },
].reverse();

const DATASETS: Record<string, typeof AGE_DATA> = {
  "Age Group":     AGE_DATA,
  "Income Band":   INCOME_DATA,
  "Product Tier":  TIER_DATA,
};

const LABELS: Record<string, [string, string]> = {
  "Age Group":    ["Male", "Female"],
  "Income Band":  ["Male", "Female"],
  "Product Tier": ["Male", "Female"],
};

function PyramidTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #D4D4D4", padding: "8px 12px", borderRadius: 4, fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <p style={{ color: "var(--t-text)", fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.dataKey === "male" ? "#4E79A7" : "#B07AA1" }}>
          {p.dataKey === "male" ? "Male" : "Female"}: {Math.abs(p.value)}K
        </p>
      ))}
    </div>
  );
}

export default function PyramidSheet({ filters }: { filters: Record<string, string> }) {
  const segment = filters["Segment"] ?? "Age Group";
  const data = DATASETS[segment] ?? AGE_DATA;
  const maxVal = Math.max(...data.flatMap(d => [Math.abs(d.male), d.female]));
  const domain = Math.ceil(maxVal / 50) * 50 + 30;

  return (
    <div className="p-4 h-full overflow-y-auto" style={{ background: "var(--t-canvas)" }}>
      <div className="mb-4">
        <h2 className="text-base font-semibold" style={{ color: "var(--t-text)" }}>Population Pyramid — {segment}</h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--t-text-muted)" }}>Customer distribution · Values in thousands · Left = Male, Right = Female</p>
      </div>

      <div className="t-card p-4">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 50, bottom: 4, left: 80 }} barSize={16} barGap={1}>
            <CartesianGrid horizontal={false} stroke="#EBEBEB" />
            <XAxis type="number" domain={[-domain, domain]} tickFormatter={v => String(Math.abs(v))} tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="age" tick={{ fontSize: 10, fill: "var(--t-text)" }} axisLine={false} tickLine={false} width={75} />
            <Tooltip content={<PyramidTooltip />} />
            <ReferenceLine x={0} stroke="#D4D4D4" strokeWidth={1.5} />
            <Bar dataKey="male"   fill="#4E79A7" fillOpacity={0.85} name="male" />
            <Bar dataKey="female" fill="#B07AA1" fillOpacity={0.85} name="female" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-5 mt-3 text-xs" style={{ color: "var(--t-text-muted)" }}>
        <div className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded-sm" style={{ background: "#4E79A7" }} />Male</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded-sm" style={{ background: "#B07AA1" }} />Female</div>
        <span className="ml-2">Total customers: {data.reduce((s, d) => s + Math.abs(d.male) + d.female, 0).toLocaleString()}K</span>
      </div>
    </div>
  );
}
