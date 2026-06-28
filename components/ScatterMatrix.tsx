"use client";
import { motion } from "framer-motion";

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

const VARS = ["Price ($)", "Volume (M)", "Mkt Cap (B)", "P/E Ratio"];
const SECTORS = ["Analytics", "Commerce", "FinTech", "HealthTech"];
const COLORS = ["#00d4ff", "#a855f7", "#f472b6", "#22d3ee"];

const rng = seededRng(77);
const POINTS = Array.from({ length: 40 }, (_, i) => ({
  sector: i % 4,
  vals: [
    50 + rng() * 450,
    0.5 + rng() * 9.5,
    0.2 + rng() * 9.8,
    8 + rng() * 47,
  ],
}));

function minmax(arr: number[]): [number, number] {
  return [Math.min(...arr), Math.max(...arr)];
}

const RANGES = VARS.map((_, vi) => minmax(POINTS.map(p => p.vals[vi])));

const CELL = 130;
const PAD = 14;
const N = VARS.length;
const TOTAL = N * CELL;

function MiniScatter({ col, row }: { col: number; row: number }) {
  if (col === row) {
    return (
      <rect x={0} y={0} width={CELL} height={CELL} fill="rgba(255,255,255,0.02)" rx={4} />
    );
  }
  const [xMin, xMax] = RANGES[col];
  const [yMin, yMax] = RANGES[row];
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  return (
    <>
      <rect x={0} y={0} width={CELL} height={CELL} fill="rgba(255,255,255,0.02)" rx={4} />
      {POINTS.map((pt, i) => {
        const cx = PAD + ((pt.vals[col] - xMin) / xRange) * (CELL - 2 * PAD);
        const cy = CELL - PAD - ((pt.vals[row] - yMin) / yRange) * (CELL - 2 * PAD);
        return (
          <circle key={i} cx={cx} cy={cy} r={3.5}
            fill={COLORS[pt.sector]} fillOpacity={0.75} stroke="none" />
        );
      })}
    </>
  );
}

export default function ScatterMatrix() {
  return (
    <section id="scatter" className="py-24 px-6 gradient-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <span className="text-xs text-pink-400 tracking-widest uppercase font-medium">Multi-Variable Analysis</span>
          <h2 className="text-4xl font-bold text-white mt-2 mb-3">
            Scatter Plot <span className="gradient-text">Matrix</span>
          </h2>
          <p className="text-slate-400 max-w-xl">
            SPLOM — pairwise scatter plots across 4 financial variables and 4 sectors. A staple in data science teams at Google, Meta, and quantitative research desks.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-card rounded-2xl p-6 border border-white/5">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Pairwise Variable Comparison — 40 Data Points</h3>
              <p className="text-xs text-slate-500">Each cell shows one variable against another · Diagonal = variable label · Color = sector</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {SECTORS.map((s, i) => (
                <div key={s} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />{s}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <svg width={TOTAL + 60} height={TOTAL + 40} className="block mx-auto">
              {/* Axis variable labels — left */}
              {VARS.map((v, i) => (
                <text key={`yl${i}`}
                  x={30} y={i * CELL + CELL / 2 + 4}
                  textAnchor="middle" fill="#64748b" fontSize={9} fontWeight={600}
                  transform={`rotate(-90, 30, ${i * CELL + CELL / 2 + 4})`}>
                  {v}
                </text>
              ))}
              {/* Axis variable labels — bottom */}
              {VARS.map((v, i) => (
                <text key={`xl${i}`}
                  x={40 + i * CELL + CELL / 2} y={TOTAL + 26}
                  textAnchor="middle" fill="#64748b" fontSize={9} fontWeight={600}>
                  {v}
                </text>
              ))}

              {/* Grid of cells */}
              <g transform="translate(40, 0)">
                {VARS.map((_, row) =>
                  VARS.map((_, col) => (
                    <g key={`${row}-${col}`} transform={`translate(${col * CELL}, ${row * CELL})`}>
                      {/* Cell background */}
                      <rect x={1} y={1} width={CELL - 2} height={CELL - 2}
                        fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth={1} rx={3} />
                      {col === row ? (
                        <>
                          <rect x={1} y={1} width={CELL - 2} height={CELL - 2}
                            fill="rgba(0,212,255,0.06)" stroke="rgba(0,212,255,0.2)" strokeWidth={1} rx={3} />
                          <text x={CELL / 2} y={CELL / 2 - 6} textAnchor="middle" fill="#00d4ff" fontSize={11} fontWeight={700}>
                            {VARS[col].split(" ")[0]}
                          </text>
                          <text x={CELL / 2} y={CELL / 2 + 10} textAnchor="middle" fill="#64748b" fontSize={9}>
                            {VARS[col].includes("(") ? VARS[col].match(/\(([^)]+)\)/)?.[1] : ""}
                          </text>
                        </>
                      ) : (
                        <MiniScatter col={col} row={row} />
                      )}
                    </g>
                  ))
                )}
              </g>
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
