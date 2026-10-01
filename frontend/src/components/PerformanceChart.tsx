import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RESULTS } from "../data/results";

const SERIES = [
  { key: "accuracy", label: "Accuracy", color: "#2a78d6" },
  { key: "f1", label: "F1-score", color: "#1baf7a" },
] as const;

const data = RESULTS.map((r) => ({ name: r.name, accuracy: r.accuracy * 100, f1: r.f1 * 100 }));

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 font-semibold text-ink">{label}</div>
      {SERIES.map((s) => {
        const v = payload.find((p) => p.dataKey === s.key)?.value;
        return (
          <div key={s.key} className="flex items-center gap-2 text-ink-2">
            <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
            <span className="w-16">{s.label}</span>
            <span className="font-mono font-medium text-ink">{v?.toFixed(2)}%</span>
          </div>
        );
      })}
    </div>
  );
}

export default function PerformanceChart() {
  return (
    <div>
      <div className="mb-3 flex items-center gap-5 text-xs text-ink-2">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 22, right: 8, left: -6, bottom: 0 }} barGap={3} barCategoryGap="26%">
            <CartesianGrid vertical={false} stroke="#e8edf3" />
            <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: "#cbd5e1" }} tick={{ fill: "#46546b", fontSize: 12, fontWeight: 500 }} interval={0} />
            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} tick={{ fill: "#7a8699", fontSize: 11 }} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(42,120,214,0.06)" }} />
            {SERIES.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive={false}>
                <LabelList dataKey={s.key} position="top" formatter={(v: number) => (v === 100 ? "100" : v.toFixed(1))} style={{ fill: "#46546b", fontSize: 10.5, fontWeight: 500 }} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11px] text-ink-3">Held-out test split (20%), percent. Y-axis starts at zero; exact values in the table.</p>
    </div>
  );
}
