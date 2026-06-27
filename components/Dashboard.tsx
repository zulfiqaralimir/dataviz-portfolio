"use client";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, Activity } from "lucide-react";

const areaData = [
  { month: "Jan", revenue: 42000, users: 3200, conversions: 1800 },
  { month: "Feb", revenue: 58000, users: 4100, conversions: 2200 },
  { month: "Mar", revenue: 51000, users: 3800, conversions: 1950 },
  { month: "Apr", revenue: 74000, users: 5200, conversions: 3100 },
  { month: "May", revenue: 69000, users: 4900, conversions: 2800 },
  { month: "Jun", revenue: 88000, users: 6100, conversions: 3600 },
  { month: "Jul", revenue: 95000, users: 6800, conversions: 4100 },
  { month: "Aug", revenue: 82000, users: 5900, conversions: 3500 },
  { month: "Sep", revenue: 110000, users: 7500, conversions: 4800 },
  { month: "Oct", revenue: 124000, users: 8200, conversions: 5300 },
  { month: "Nov", revenue: 138000, users: 9100, conversions: 6200 },
  { month: "Dec", revenue: 156000, users: 10500, conversions: 7100 },
];

const categoryData = [
  { name: "Analytics", value: 38, color: "#00d4ff" },
  { name: "Commerce", value: 27, color: "#a855f7" },
  { name: "FinTech", value: 21, color: "#f472b6" },
  { name: "HealthTech", value: 14, color: "#22d3ee" },
];

const barData = [
  { week: "W1", product: 65, marketing: 45, ops: 30 },
  { week: "W2", product: 72, marketing: 58, ops: 38 },
  { week: "W3", product: 61, marketing: 50, ops: 42 },
  { week: "W4", product: 85, marketing: 67, ops: 55 },
  { week: "W5", product: 90, marketing: 72, ops: 48 },
  { week: "W6", product: 78, marketing: 63, ops: 60 },
];

const kpis = [
  { label: "Total Revenue", value: "$1.09M", change: "+18.4%", up: true, icon: DollarSign, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { label: "Active Users", value: "75.3K", change: "+12.1%", up: true, icon: Users, color: "text-purple-400", bg: "bg-purple-400/10" },
  { label: "Conversions", value: "44.7K", change: "+21.3%", up: true, icon: ShoppingCart, color: "text-pink-400", bg: "bg-pink-400/10" },
  { label: "Churn Rate", value: "2.4%", change: "-0.8%", up: false, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-400/10" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl p-3 border border-white/10 text-xs">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
          <span className="capitalize">{p.name}</span>
          <span className="font-bold">{typeof p.value === 'number' && p.value > 1000 ? `$${(p.value/1000).toFixed(0)}K` : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  return (
    <section id="dashboard" className="py-24 px-6 gradient-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-xs text-cyan-400 tracking-widest uppercase font-medium">Product Analytics</span>
          <h2 className="text-4xl font-bold text-white mt-2 mb-3">
            Interactive <span className="gradient-text">Dashboard</span>
          </h2>
          <p className="text-slate-400 max-w-xl">
            Real-time KPI monitoring with multi-metric area charts, category breakdowns, and team performance tracking.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
                <span className={`text-xs font-medium flex items-center gap-1 ${kpi.up ? "text-emerald-400" : "text-pink-400"}`}>
                  {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              <div className="text-xs text-slate-500 mt-1">{kpi.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Area Chart — spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5"
          >
            <h3 className="text-sm font-semibold text-white mb-1">Revenue & User Growth</h3>
            <p className="text-xs text-slate-500 mb-6">12-month trend across key metrics</p>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                <Area type="monotone" dataKey="revenue" stroke="#00d4ff" strokeWidth={2} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="users" stroke="#a855f7" strokeWidth={2} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="conversions" stroke="#f472b6" strokeWidth={2} fill="url(#colorConv)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 border border-white/5"
          >
            <h3 className="text-sm font-semibold text-white mb-1">Industry Breakdown</h3>
            <p className="text-xs text-slate-500 mb-4">Revenue by sector</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "rgba(2,8,23,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: any) => [`${value}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    <span className="text-slate-400">{c.name}</span>
                  </div>
                  <span style={{ color: c.color }} className="font-semibold">{c.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-6 border border-white/5"
        >
          <h3 className="text-sm font-semibold text-white mb-1">Team Performance Score</h3>
          <p className="text-xs text-slate-500 mb-6">Weekly scores by department (Product / Marketing / Ops)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
              <Bar dataKey="product" fill="#00d4ff" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Bar dataKey="marketing" fill="#a855f7" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Bar dataKey="ops" fill="#f472b6" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </section>
  );
}
