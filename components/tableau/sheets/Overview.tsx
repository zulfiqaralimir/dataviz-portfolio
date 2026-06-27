"use client";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const T10 = ["#4E79A7","#F28E2B","#E15759","#76B7B2","#59A14F","#EDC948","#B07AA1","#FF9DA7","#9C755F","#BAB0AC"];

const areaData = [
  { month:"Jan", Revenue:42000, Users:3200, Conversions:1800 },
  { month:"Feb", Revenue:58000, Users:4100, Conversions:2200 },
  { month:"Mar", Revenue:51000, Users:3800, Conversions:1950 },
  { month:"Apr", Revenue:74000, Users:5200, Conversions:3100 },
  { month:"May", Revenue:69000, Users:4900, Conversions:2800 },
  { month:"Jun", Revenue:88000, Users:6100, Conversions:3600 },
  { month:"Jul", Revenue:95000, Users:6800, Conversions:4100 },
  { month:"Aug", Revenue:82000, Users:5900, Conversions:3500 },
  { month:"Sep", Revenue:110000, Users:7500, Conversions:4800 },
  { month:"Oct", Revenue:124000, Users:8200, Conversions:5300 },
  { month:"Nov", Revenue:138000, Users:9100, Conversions:6200 },
  { month:"Dec", Revenue:156000, Users:10500, Conversions:7100 },
];

const sectorData = [
  { name:"Analytics", value:38 },
  { name:"Commerce",  value:27 },
  { name:"FinTech",   value:21 },
  { name:"HealthTech",value:14 },
];

const barData = [
  { week:"W1", Product:65, Marketing:45, Operations:30 },
  { week:"W2", Product:72, Marketing:58, Operations:38 },
  { week:"W3", Product:61, Marketing:50, Operations:42 },
  { week:"W4", Product:85, Marketing:67, Operations:55 },
  { week:"W5", Product:90, Marketing:72, Operations:48 },
  { week:"W6", Product:78, Marketing:63, Operations:60 },
];

const kpis = [
  { label:"Total Revenue",  value:"$1.09M", delta:"+18.4%", up:true },
  { label:"Active Users",   value:"75.3K",  delta:"+12.1%", up:true },
  { label:"Conversions",    value:"44.7K",  delta:"+21.3%", up:true },
  { label:"Churn Rate",     value:"2.4%",   delta:"-0.8%",  up:false },
];

const TOOLTIP_STYLE = {
  contentStyle: { background:"white", border:"1px solid #D4D4D4", borderRadius:4, fontSize:12, boxShadow:"0 2px 8px rgba(0,0,0,0.1)" },
  itemStyle: { color:"#333" },
  labelStyle: { color:"#666", fontWeight:600 },
};

export default function OverviewSheet({ filters }: { filters: Record<string, string> }) {
  return (
    <div className="p-4 h-full overflow-y-auto" style={{ background:"var(--t-canvas)" }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color:"var(--t-text)" }}>Sales & Product Overview</h2>
          <p className="text-xs mt-0.5" style={{ color:"var(--t-text-muted)" }}>
            Period: {filters["Period"] ?? "Last 12 Months"} · Sector: {filters["Sector"] ?? "All"}
          </p>
        </div>
        <div className="flex gap-1">
          {["Industry","Product","Exec"].map(v=>(
            <button key={v} className="text-xs px-3 py-1 rounded border transition-colors hover:bg-gray-100"
              style={{ borderColor:"var(--t-border)", color:"var(--t-text-muted)", background:"white" }}>{v}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {kpis.map((k) => (
          <div key={k.label} className="t-card p-4">
            <p className="text-[11px] mb-1" style={{ color:"var(--t-text-muted)" }}>{k.label}</p>
            <p className="text-2xl font-bold" style={{ color:"var(--t-text)" }}>{k.value}</p>
            <p className={`text-xs mt-1 font-medium ${k.up ? "text-green-600" : "text-red-500"}`}>{k.delta} vs prev period</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="col-span-2 t-card p-4">
          <p className="text-xs font-semibold mb-3" style={{ color:"var(--t-text)" }}>Revenue, Users & Conversions Over Time</p>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={areaData}>
              <defs>
                {[["rev","#4E79A7"],["usr","#F28E2B"],["conv","#59A14F"]].map(([id,col])=>(
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={col} stopOpacity={0.18}/>
                    <stop offset="95%" stopColor={col} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="#EBEBEB" />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:"#888" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:"#888" }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
              <Tooltip {...TOOLTIP_STYLE} formatter={(v:any)=>v>1000?`$${(v/1000).toFixed(0)}K`:v}/>
              <Legend wrapperStyle={{ fontSize:11 }}/>
              <Area type="monotone" dataKey="Revenue"    stroke="#4E79A7" fill="url(#rev)"  strokeWidth={2}/>
              <Area type="monotone" dataKey="Users"      stroke="#F28E2B" fill="url(#usr)"  strokeWidth={2}/>
              <Area type="monotone" dataKey="Conversions"stroke="#59A14F" fill="url(#conv)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="t-card p-4">
          <p className="text-xs font-semibold mb-3" style={{ color:"var(--t-text)" }}>Revenue by Sector</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={sectorData} cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={3} dataKey="value">
                {sectorData.map((_, i) => <Cell key={i} fill={T10[i]}/>)}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} formatter={(v:any)=>`${v}%`}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {sectorData.map((s,i)=>(
              <div key={s.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background:T10[i] }}/>
                  <span style={{ color:"var(--t-text-muted)" }}>{s.name}</span>
                </div>
                <span className="font-semibold" style={{ color:"var(--t-text)" }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="t-card p-4">
        <p className="text-xs font-semibold mb-3" style={{ color:"var(--t-text)" }}>Team Performance Score by Department</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} barGap={3}>
            <CartesianGrid stroke="#EBEBEB" vertical={false}/>
            <XAxis dataKey="week" tick={{ fontSize:11, fill:"#888" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:11, fill:"#888" }} axisLine={false} tickLine={false}/>
            <Tooltip {...TOOLTIP_STYLE}/>
            <Legend wrapperStyle={{ fontSize:11 }}/>
            <Bar dataKey="Product"    fill="#4E79A7" radius={[2,2,0,0]}/>
            <Bar dataKey="Marketing"  fill="#F28E2B" radius={[2,2,0,0]}/>
            <Bar dataKey="Operations" fill="#59A14F" radius={[2,2,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
