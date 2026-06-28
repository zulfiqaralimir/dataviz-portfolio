"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const T10 = { Analytics: "#4E79A7", Commerce: "#F28E2B", FinTech: "#E15759", HealthTech: "#59A14F", Enterprise: "#B07AA1" };

const REV_DATA = [
  { year: "2019", Analytics: 35, Commerce: 28, FinTech: 18, HealthTech: 10, Enterprise: 9  },
  { year: "2020", Analytics: 32, Commerce: 22, FinTech: 20, HealthTech: 16, Enterprise: 10 },
  { year: "2021", Analytics: 30, Commerce: 25, FinTech: 22, HealthTech: 14, Enterprise: 9  },
  { year: "2022", Analytics: 28, Commerce: 27, FinTech: 23, HealthTech: 13, Enterprise: 9  },
  { year: "2023", Analytics: 26, Commerce: 28, FinTech: 24, HealthTech: 13, Enterprise: 9  },
  { year: "2024", Analytics: 25, Commerce: 29, FinTech: 25, HealthTech: 12, Enterprise: 9  },
];

const USER_DATA = [
  { year: "2019", Analytics: 40, Commerce: 22, FinTech: 15, HealthTech: 12, Enterprise: 11 },
  { year: "2020", Analytics: 38, Commerce: 20, FinTech: 18, HealthTech: 14, Enterprise: 10 },
  { year: "2021", Analytics: 35, Commerce: 24, FinTech: 20, HealthTech: 13, Enterprise: 8  },
  { year: "2022", Analytics: 32, Commerce: 26, FinTech: 22, HealthTech: 12, Enterprise: 8  },
  { year: "2023", Analytics: 29, Commerce: 28, FinTech: 24, HealthTech: 12, Enterprise: 7  },
  { year: "2024", Analytics: 27, Commerce: 30, FinTech: 25, HealthTech: 11, Enterprise: 7  },
];

const PROFIT_DATA = [
  { year: "2019", Analytics: 42, Commerce: 20, FinTech: 16, HealthTech: 11, Enterprise: 11 },
  { year: "2020", Analytics: 40, Commerce: 18, FinTech: 18, HealthTech: 14, Enterprise: 10 },
  { year: "2021", Analytics: 38, Commerce: 22, FinTech: 19, HealthTech: 12, Enterprise: 9  },
  { year: "2022", Analytics: 35, Commerce: 24, FinTech: 21, HealthTech: 11, Enterprise: 9  },
  { year: "2023", Analytics: 33, Commerce: 26, FinTech: 22, HealthTech: 11, Enterprise: 8  },
  { year: "2024", Analytics: 31, Commerce: 27, FinTech: 24, HealthTech: 10, Enterprise: 8  },
];

const PERIOD_SLICE: Record<string, number> = {
  "2019-2024": 0, "2020-2024": 1, "2021-2024": 2,
};

const VIEW_DATA: Record<string, typeof REV_DATA> = {
  "Revenue Mix": REV_DATA,
  "User Mix":    USER_DATA,
  "Profit Mix":  PROFIT_DATA,
};

export default function StackedBarSheet({ filters }: { filters: Record<string, string> }) {
  const period = filters["Period"] ?? "2019-2024";
  const view   = filters["View"]   ?? "Revenue Mix";
  const slice  = PERIOD_SLICE[period] ?? 0;
  const raw    = VIEW_DATA[view] ?? REV_DATA;
  const data   = raw.slice(slice);

  const TT = {
    contentStyle: { background: "white", border: "1px solid #D4D4D4", borderRadius: 4, fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
    formatter: (v: any) => [`${v}%`],
  };

  return (
    <div className="p-4 h-full overflow-y-auto" style={{ background: "var(--t-canvas)" }}>
      <div className="mb-4">
        <h2 className="text-base font-semibold" style={{ color: "var(--t-text)" }}>Stacked 100% Bar — {view}</h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--t-text-muted)" }}>
          {period} · Each bar = 100% · Shows composition change over time
        </p>
      </div>

      <div className="t-card p-4">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="#EBEBEB" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
            <Tooltip {...TT} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {(Object.entries(T10) as [keyof typeof T10, string][]).map(([k, c]) => (
              <Bar key={k} dataKey={k} stackId="a" fill={c} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-5 gap-2 mt-3">
        {(Object.entries(T10) as [string, string][]).map(([name, color]) => {
          const start = data[0]?.[name as keyof typeof data[0]] as number ?? 0;
          const end   = data[data.length - 1]?.[name as keyof typeof data[0]] as number ?? 0;
          const delta = end - start;
          return (
            <div key={name} className="t-card p-2 text-center">
              <div className="w-3 h-3 rounded-sm mx-auto mb-1" style={{ background: color }} />
              <p className="text-[10px] font-medium" style={{ color: "var(--t-text)" }}>{name}</p>
              <p className="text-xs font-bold" style={{ color: "var(--t-text)" }}>{end}%</p>
              <p className={`text-[10px] ${delta > 0 ? "text-green-600" : "text-red-500"}`}>{delta > 0 ? "+" : ""}{delta}pp</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
