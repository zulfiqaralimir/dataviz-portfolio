"use client";
import { motion } from "framer-motion";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { Mail, Link, GitBranch, Download } from "lucide-react";

const skills = [
  { subject: "D3.js", A: 95 },
  { subject: "Recharts", A: 90 },
  { subject: "Product Analytics", A: 92 },
  { subject: "Financial Viz", A: 85 },
  { subject: "Geospatial", A: 80 },
  { subject: "Real-time Data", A: 88 },
];

const projects = [
  {
    title: "E-commerce Analytics Suite",
    desc: "End-to-end dashboard tracking 2M+ daily transactions with funnel analysis, cohort retention, and revenue attribution.",
    tags: ["Recharts", "React", "BigQuery"],
    color: "#00d4ff",
    metrics: ["2M+ events/day", "98% uptime", "40% faster decisions"],
  },
  {
    title: "Supply Chain Intelligence",
    desc: "Geospatial risk map with real-time disruption alerts, inventory heatmaps, and supplier network graph for a Fortune 500 client.",
    tags: ["D3.js", "Mapbox", "Python"],
    color: "#a855f7",
    metrics: ["500+ nodes", "Global coverage", "Live alerts"],
  },
  {
    title: "Market Signals Platform",
    desc: "Multi-asset financial dashboard with OHLC charts, technical indicators, and portfolio attribution for an investment firm.",
    tags: ["TradingView", "WebSocket", "Next.js"],
    color: "#f472b6",
    metrics: ["15 asset classes", "Sub-second latency", "$2B AUM"],
  },
  {
    title: "Product Health Monitor",
    desc: "Engineering dashboard with error rate heatmaps, deployment impact analysis, and user session funnel breakdowns.",
    tags: ["Grafana", "ClickHouse", "React"],
    color: "#22d3ee",
    metrics: ["99.9% precision", "15min MTTR", "Team adoption 100%"],
  },
];

export default function About() {
  return (
    <section id="about" className="py-24 px-6 gradient-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="text-xs text-emerald-400 tracking-widest uppercase font-medium">About & Projects</span>
          <h2 className="text-4xl font-bold text-white mt-2 mb-4">
            Built to <span className="gradient-text">Drive Decisions</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            I specialize in turning raw data into compelling, interactive visual stories that help product teams
            ship faster and commercial companies grow smarter.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Radar chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8 border border-white/5"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Skill Proficiency</h3>
            <p className="text-xs text-slate-500 mb-6">Self-assessed across core visualization domains</p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={skills}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11 }} />
                <Radar name="Skill" dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.12} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <div className="glass-card rounded-2xl p-6 border border-white/5 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">What I Do</h3>
              <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
                <p>I design and build <span className="text-cyan-400">interactive data visualization systems</span> that connect complex datasets to intuitive, beautiful interfaces.</p>
                <p>For <span className="text-purple-400">product teams</span>: custom dashboards, feature analytics, A/B test reporting, and funnel visualizations that accelerate decisions.</p>
                <p>For <span className="text-pink-400">commercial companies</span>: market intelligence, supply chain visibility, financial analytics, and executive reporting suites.</p>
              </div>
            </div>

            {/* Contact */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4">Get In Touch</h3>
              <div className="flex flex-wrap gap-3">
                <a href="mailto:manager.equity.finance@gmail.com"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs hover:bg-cyan-400/20 transition-all">
                  <Mail className="w-3.5 h-3.5" /> Email Me
                </a>
                <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card border border-white/10 text-slate-300 text-xs hover:border-white/20 transition-all">
                  <Link className="w-3.5 h-3.5" /> LinkedIn
                </a>
                <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card border border-white/10 text-slate-300 text-xs hover:border-white/20 transition-all">
                  <GitBranch className="w-3.5 h-3.5" /> GitHub
                </a>
                <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card border border-white/10 text-slate-300 text-xs hover:border-white/20 transition-all">
                  <Download className="w-3.5 h-3.5" /> Resume
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Project cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-8">Selected Projects</h3>
          <div className="grid md:grid-cols-2 gap-5">
            {projects.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all group"
                style={{ borderColor: p.color + "15" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-white text-sm group-hover:text-opacity-90">{p.title}</h4>
                  <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: p.color }} />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{p.desc}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {p.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-md glass-card border border-white/5 text-slate-400">{tag}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {p.metrics.map((m) => (
                    <span key={m} className="text-xs font-medium" style={{ color: p.color }}>{m}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
