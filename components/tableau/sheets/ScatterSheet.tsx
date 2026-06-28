"use client";

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

const T10_4 = ["#4E79A7", "#F28E2B", "#E15759", "#59A14F"];
const SECTORS = ["Analytics", "Commerce", "FinTech", "HealthTech"];

const VARS_SET1 = ["Price ($)", "Volume (M)", "Mkt Cap (B)", "P/E Ratio"];
const rng1 = seededRng(77);
const POINTS_SET1 = Array.from({ length: 40 }, (_, i) => ({
  sector: i % 4,
  vals: [50 + rng1() * 450, 0.5 + rng1() * 9.5, 0.2 + rng1() * 9.8, 8 + rng1() * 47],
}));

const VARS_SET2 = ["Revenue ($K)", "Users (K)", "Conv. %", "Churn %"];
const rng2 = seededRng(33);
const POINTS_SET2 = Array.from({ length: 40 }, (_, i) => ({
  sector: i % 4,
  vals: [20 + rng2() * 200, 1 + rng2() * 50, 1 + rng2() * 18, 0.5 + rng2() * 8],
}));

function minmax(pts: typeof POINTS_SET1, vi: number): [number, number] {
  const vals = pts.map(p => p.vals[vi]);
  return [Math.min(...vals), Math.max(...vals)];
}

const CELL = 110;
const PAD = 10;
const N = 4;

function MiniScatter({ col, row, points, ranges, isDark }: {
  col: number; row: number;
  points: typeof POINTS_SET1;
  ranges: [number, number][];
  isDark?: boolean;
}) {
  if (col === row) return null;
  const [xMin, xMax] = ranges[col];
  const [yMin, yMax] = ranges[row];
  const xR = xMax - xMin || 1;
  const yR = yMax - yMin || 1;

  return (
    <>
      {points.map((pt, i) => {
        const cx = PAD + ((pt.vals[col] - xMin) / xR) * (CELL - 2 * PAD);
        const cy = CELL - PAD - ((pt.vals[row] - yMin) / yR) * (CELL - 2 * PAD);
        return <circle key={i} cx={cx} cy={cy} r={3} fill={T10_4[pt.sector]} fillOpacity={0.7} />;
      })}
    </>
  );
}

export default function ScatterSheet({ filters }: { filters: Record<string, string> }) {
  const varSet = filters["Variables"] ?? "Price/Volume/MCap/PE";
  const VARS  = varSet.includes("Revenue") ? VARS_SET2  : VARS_SET1;
  const PTS   = varSet.includes("Revenue") ? POINTS_SET2 : POINTS_SET1;
  const RANGES = VARS.map((_, vi) => minmax(PTS, vi));

  const TOTAL = N * CELL;

  return (
    <div className="p-4 h-full overflow-y-auto" style={{ background: "var(--t-canvas)" }}>
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--t-text)" }}>Scatter Plot Matrix (SPLOM)</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--t-text-muted)" }}>
            {VARS.join(" · ")} · {PTS.length} data points · Color by {filters["Color By"] ?? "Sector"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {SECTORS.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--t-text-muted)" }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: T10_4[i] }} />{s}
            </div>
          ))}
        </div>
      </div>

      <div className="t-card p-4 overflow-x-auto">
        <svg width={TOTAL + 56} height={TOTAL + 36} className="block">
          {/* Y-axis labels */}
          {VARS.map((v, i) => (
            <text key={`yl${i}`} x={26} y={i * CELL + CELL / 2 + 4}
              textAnchor="middle" fill="var(--t-text-muted)" fontSize={9} fontWeight={600}
              transform={`rotate(-90,26,${i * CELL + CELL / 2 + 4})`}>
              {v}
            </text>
          ))}
          {/* X-axis labels */}
          {VARS.map((v, i) => (
            <text key={`xl${i}`} x={36 + i * CELL + CELL / 2} y={TOTAL + 22}
              textAnchor="middle" fill="var(--t-text-muted)" fontSize={9} fontWeight={600}>
              {v}
            </text>
          ))}

          <g transform="translate(36,0)">
            {VARS.map((_, row) =>
              VARS.map((_, col) => {
                const x = col * CELL;
                const y = row * CELL;
                const isDiag = row === col;
                return (
                  <g key={`${row}-${col}`} transform={`translate(${x},${y})`}>
                    <rect x={1} y={1} width={CELL - 2} height={CELL - 2}
                      fill={isDiag ? "rgba(68,103,196,0.06)" : "white"}
                      stroke="var(--t-border-lt)" strokeWidth={1} rx={2} />
                    {isDiag ? (
                      <>
                        <text x={CELL / 2} y={CELL / 2 - 4} textAnchor="middle"
                          fill="var(--t-blue)" fontSize={10} fontWeight={700}>
                          {VARS[col].split(" ")[0]}
                        </text>
                        <text x={CELL / 2} y={CELL / 2 + 12} textAnchor="middle"
                          fill="var(--t-text-muted)" fontSize={8}>
                          {VARS[col].includes("(") ? VARS[col].match(/\(([^)]+)\)/)?.[1] : ""}
                        </text>
                      </>
                    ) : (
                      <MiniScatter col={col} row={row} points={PTS} ranges={RANGES} />
                    )}
                  </g>
                );
              })
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}
