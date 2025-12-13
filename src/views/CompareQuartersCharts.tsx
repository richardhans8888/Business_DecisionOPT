import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export interface HistoryItem {
  periodLabel: string;
  expected_profit: number;
  variance: number;
  value: number;
  policy: any[];
}

export default function CompareQuartersCharts({ history }: { history: HistoryItem[] }) {
  const series = history.map((h) => {
    const invested = Array.isArray(h.policy)
      ? h.policy.reduce((a: number, b: number) => a + (typeof b === "number" ? b : 0), 0)
      : 0;
    return {
      period: h.periodLabel,
      growth: h.expected_profit,
      budget: invested,
    };
  });

  const bars = history.map((h) => {
    const total = Array.isArray(h.policy)
      ? h.policy.reduce((a: number, b: number) => a + (typeof b === "number" ? b : 0), 0)
      : 0;
    const [m, r, o] = Array.isArray(h.policy) ? h.policy : [0, 0, 0];
    return {
      period: h.periodLabel,
      Marketing: total ? (m / total) * 100 : 0,
      "R&D": total ? (r / total) * 100 : 0,
      Ops: total ? (o / total) * 100 : 0,
    };
  });

  function currencyTick(v: number) {
    const mil = v / 1_000_000;
    if (mil >= 1) return `${mil.toFixed(1)} Miliar`;
    const k = v / 1_000;
    if (k >= 1) return `${k.toFixed(0)} Ribu`;
    return `Rp ${v.toFixed(0)}`;
  }

  const maxVal = Math.max(
    1,
    ...series.map((s) => Math.max(Number(s.growth) || 0, Number(s.budget) || 0))
  );
  const yDomain: [number, number] = [0, maxVal * 1.25];

  return (
    <div className="page">
      <div className="page-inner">
        <div className="page-title">Quarterly Comparison</div>
        <div className="page-subtitle">Comparing simulation trends.</div>
      </div>
      <div className="card card-wide">
        <div className="card-header">
          <div>Efficiency Trend: Budget vs Growth</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ width: 16, height: 6, background: "#22c55e", borderRadius: 999 }} />
              <span style={{ fontSize: 12, color: "#6b7280" }}>Expected Growth (Revenue)</span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ width: 16, height: 6, background: "#9ca3af", borderRadius: 999 }} />
              <span style={{ fontSize: 12, color: "#6b7280" }}>Total Budget Invested</span>
            </div>
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer>
            <LineChart data={series} margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis domain={yDomain} tickFormatter={currencyTick} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: any) => currencyTick(Number(value))} />
              <Line type="monotone" dataKey="growth" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} isAnimationActive />
              <Line type="monotone" dataKey="budget" stroke="#9ca3af" strokeDasharray="6 6" strokeWidth={3} dot={{ r: 3 }} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card card-wide">
        <div className="card-header">
          <div>Strategy Evolution</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>How the optimal mix changes over time</div>
        </div>
        <div className="chart-container" style={{ height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={bars} margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v: number) => `${v.toFixed(0)}%`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="Marketing" stackId="a" fill="#3b82f6" isAnimationActive />
              <Bar dataKey="R&D" stackId="a" fill="#fb923c" isAnimationActive />
              <Bar dataKey="Ops" stackId="a" fill="#a78bfa" isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="page-inner">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: 8 }}>Period</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #e5e7eb", padding: 8 }}>Expected Profit</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #e5e7eb", padding: 8 }}>Variance</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #e5e7eb", padding: 8 }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.periodLabel}>
                <td style={{ padding: 8 }}>{h.periodLabel}</td>
                <td style={{ padding: 8, textAlign: "right" }}>{h.expected_profit.toFixed(2)}</td>
                <td style={{ padding: 8, textAlign: "right" }}>{h.variance.toFixed(2)}</td>
                <td style={{ padding: 8, textAlign: "right" }}>{h.value.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

