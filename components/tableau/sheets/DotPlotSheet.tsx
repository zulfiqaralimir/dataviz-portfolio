"use client";

interface DotItem { metric: string; v1: number; v2: number; unit: string; higherGood: boolean; }

const DATA_2020_2024: DotItem[] = [
  { metric: "NPS Score",       v1: 42,  v2: 71,  unit: "pts", higherGood: true  },
  { metric: "Revenue Growth",  v1: 18,  v2: 34,  unit: "%",   higherGood: true  },
  { metric: "Market Share",    v1: 12,  v2: 19,  unit: "%",   higherGood: true  },
  { metric: "Satisfaction",    v1: 3.2, v2: 4.1, unit: "/5",  higherGood: true  },
  { metric: "Churn Rate",      v1: 8.2, v2: 5.1, unit: "%",   higherGood: false },
  { metric: "Resolution Time", v1: 48,  v2: 12,  unit: "hrs", higherGood: false },
  { metric: "CAC",             v1: 285, v2: 210, unit: "$",   higherGood: false },
  { metric: "Defect Rate",     v1: 4.1, v2: 1.8, unit: "%",   higherGood: false },
].sort((a, b) => Math.abs((b.v2 - b.v1) / b.v1) - Math.abs((a.v2 - a.v1) / a.v1));

const DATA_2022_2024: DotItem[] = [
  { metric: "NPS Score",       v1: 58,  v2: 71,  unit: "pts", higherGood: true  },
  { metric: "Revenue Growth",  v1: 26,  v2: 34,  unit: "%",   higherGood: true  },
  { metric: "Market Share",    v1: 15,  v2: 19,  unit: "%",   higherGood: true  },
  { metric: "Satisfaction",    v1: 3.7, v2: 4.1, unit: "/5",  higherGood: true  },
  { metric: "Churn Rate",      v1: 6.5, v2: 5.1, unit: "%",   higherGood: false },
  { metric: "Resolution Time", v1: 28,  v2: 12,  unit: "hrs", higherGood: false },
  { metric: "CAC",             v1: 240, v2: 210, unit: "$",   higherGood: false },
  { metric: "Defect Rate",     v1: 2.8, v2: 1.8, unit: "%",   higherGood: false },
].sort((a, b) => Math.abs((b.v2 - b.v1) / b.v1) - Math.abs((a.v2 - a.v1) / a.v1));

const DATA_2019_2024: DotItem[] = [
  { metric: "NPS Score",       v1: 31,  v2: 71,  unit: "pts", higherGood: true  },
  { metric: "Revenue Growth",  v1: 11,  v2: 34,  unit: "%",   higherGood: true  },
  { metric: "Market Share",    v1: 8,   v2: 19,  unit: "%",   higherGood: true  },
  { metric: "Satisfaction",    v1: 2.8, v2: 4.1, unit: "/5",  higherGood: true  },
  { metric: "Churn Rate",      v1: 11,  v2: 5.1, unit: "%",   higherGood: false },
  { metric: "Resolution Time", v1: 72,  v2: 12,  unit: "hrs", higherGood: false },
  { metric: "CAC",             v1: 340, v2: 210, unit: "$",   higherGood: false },
  { metric: "Defect Rate",     v1: 6.2, v2: 1.8, unit: "%",   higherGood: false },
].sort((a, b) => Math.abs((b.v2 - b.v1) / b.v1) - Math.abs((a.v2 - a.v1) / a.v1));

const PERIOD_DATA: Record<string, DotItem[]> = {
  "2020 vs 2024": DATA_2020_2024,
  "2022 vs 2024": DATA_2022_2024,
  "2019 vs 2024": DATA_2019_2024,
};

function getPeriodLabels(period: string): [string, string] {
  const [a, , b] = period.split(" ");
  return [a, b];
}

export default function DotPlotSheet({ filters }: { filters: Record<string, string> }) {
  const period = filters["Period"] ?? "2020 vs 2024";
  const data = PERIOD_DATA[period] ?? DATA_2020_2024;
  const [labelA, labelB] = getPeriodLabels(period);

  const ROW_H = 52, PAD_T = 36, LABEL_W = 150, DOT_X1 = LABEL_W + 60, DOT_X2 = LABEL_W + 340, VW = LABEL_W + 460;
  const VH = data.length * ROW_H + PAD_T + 16;

  return (
    <div className="p-4 h-full overflow-y-auto" style={{ background: "var(--t-canvas)" }}>
      <div className="mb-4">
        <h2 className="text-base font-semibold" style={{ color: "var(--t-text)" }}>Cleveland Dot Plot — {period}</h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--t-text-muted)" }}>Sorted by magnitude of change · Green = improvement, Red = decline</p>
      </div>
      <div className="t-card p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ maxHeight: 500 }}>
          {/* Headers */}
          <text x={DOT_X1} y={20} textAnchor="middle" fill="#999" fontSize={11} fontWeight={600}>{labelA}</text>
          <text x={DOT_X2} y={20} textAnchor="middle" fill="var(--t-blue)" fontSize={11} fontWeight={600}>{labelB}</text>
          {/* Guide lines */}
          <line x1={DOT_X1} y1={PAD_T} x2={DOT_X1} y2={VH - 8} stroke="#EBEBEB" strokeWidth={1} />
          <line x1={DOT_X2} y1={PAD_T} x2={DOT_X2} y2={VH - 8} stroke="#DDEEFF" strokeWidth={1} />

          {data.map((d, i) => {
            const cy = PAD_T + i * ROW_H + ROW_H / 2;
            const pct = (d.v2 - d.v1) / d.v1 * 100;
            const isGood = d.higherGood ? pct > 0 : pct < 0;
            const color = isGood ? "#59A14F" : "#E15759";
            const absPct = Math.abs(pct).toFixed(0);
            return (
              <g key={d.metric}>
                <text x={LABEL_W - 8} y={cy + 4} textAnchor="end" fill="var(--t-text)" fontSize={11}>{d.metric}</text>
                <line x1={DOT_X1} y1={cy} x2={DOT_X2} y2={cy} stroke={color} strokeWidth={1.5} opacity={0.35} />
                <circle cx={DOT_X1} cy={cy} r={5} fill="rgba(100,116,139,0.12)" stroke="#999" strokeWidth={2} />
                <text x={DOT_X1} y={cy - 10} textAnchor="middle" fill="#888" fontSize={9}>{d.v1}{d.unit}</text>
                <circle cx={DOT_X2} cy={cy} r={6} fill={color + "22"} stroke={color} strokeWidth={2.5} />
                <text x={DOT_X2} y={cy - 10} textAnchor="middle" fill={color} fontSize={9} fontWeight="bold">{d.v2}{d.unit}</text>
                <rect x={DOT_X2 + 16} y={cy - 9} width={52} height={18} rx={4} fill={color + "18"} />
                <text x={DOT_X2 + 42} y={cy + 4} textAnchor="middle" fill={color} fontSize={10} fontWeight="bold">
                  {pct > 0 ? "+" : ""}{absPct}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
