import React, { useEffect, useState } from "react";
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

  const barsTarget = history.map((h) => {
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
  const [bars, setBars] = useState(
    barsTarget.map((b) => ({ ...b, Marketing: 0, "R&D": 0, Ops: 0 }))
  );
  useEffect(() => {
    const t = setTimeout(() => setBars(barsTarget), 150);
    return () => clearTimeout(t);
  }, [history.length]); // re-run when dataset changes

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
            <LineChart data={series} margin={{ top: 32, right: 32, left: 32, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis domain={yDomain} tickFormatter={currencyTick} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: any) => currencyTick(Number(value))} />
              <Line type="monotone" dataKey="growth" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} isAnimationActive animationDuration={1200} animationBegin={100} />
              <Line type="monotone" dataKey="budget" stroke="#9ca3af" strokeDasharray="6 6" strokeWidth={3} dot={{ r: 3 }} isAnimationActive animationDuration={1200} animationBegin={100} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card card-wide">
        <div className="card-header">
          <div>Strategy Evolution</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>How the optimal mix changes over time</div>
        </div>
        <div className="chart-container" style={{ height: 340 }}>
          <ResponsiveContainer>
            <BarChart data={bars} margin={{ top: 32, right: 32, left: 32, bottom: 24 }} barCategoryGap="18%" barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={(v: number) => `${v.toFixed(0)}%`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} />
              <Legend />
              <Bar name="Marketing %" dataKey="Marketing" stackId="a" fill="#3b82f6" isAnimationActive animationDuration={1200} animationBegin={150} radius={[4, 4, 0, 0]} />
              <Bar name="R&D %" dataKey="R&D" stackId="a" fill="#a78bfa" isAnimationActive animationDuration={1200} animationBegin={200} radius={[4, 4, 0, 0]} />
              <Bar name="Ops %" dataKey="Ops" stackId="a" fill="#fb923c" isAnimationActive animationDuration={1200} animationBegin={250} radius={[6, 6, 0, 0]} />
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
      <div className="report-card">
        {(() => {
          const quarters = history.length;
          const start = quarters ? history[0] : null;
          const end = quarters ? history[quarters - 1] : null;
          const avgRevenue = quarters ? history.reduce((a, h) => a + h.expected_profit, 0) / quarters : 0;
          const cumValue = quarters ? history.reduce((a, h) => a + h.expected_profit, 0) : 0;
          const shift = start && end && start.expected_profit !== 0
            ? ((end.expected_profit - start.expected_profit) / Math.abs(start.expected_profit)) * 100
            : 0;
          const formatMil = (v: number) => `${(v / 1_000_000).toFixed(1)} Miliar`;
          const rangeLabel = quarters && start && end ? `${start.periodLabel} - ${end.periodLabel}` : "—";
          return (
            <>
              <div className="report-header">
                <div>
                  <div className="report-title">📈 Long-term Performance Report</div>
                  <div className="report-sub">Analysis of {quarters} Quarters ({rangeLabel})</div>
                </div>
                <div className="report-value">
                  <div className="label">CUMULATIVE VALUE</div>
                  <div className="num">{formatMil(cumValue)}</div>
                </div>
              </div>
              <div className="report-divider" />
              <div className="report-columns">
                <div>
                  <div className="report-col-title">TREND ANALYSIS</div>
                  <div className="report-text">
                    The simulation indicates a <span className="report-strong">positive trajectory</span> in budget efficiency,
                    with expected growth shifting by <span className="report-strong">{Math.abs(shift).toFixed(1)}%</span> from the start period to the latest quarter.
                    The average quarterly revenue generated over this entire period is <span className="report-strong">{formatMil(avgRevenue)}</span>.
                  </div>
                </div>
                <div>
                  <div className="report-col-title">STRATEGIC RECOMMENDATION</div>
                  <div className="report-text">
                    Review the <span className="report-strong">Strategy Evolution</span> chart above. If allocation bars fluctuate widely,
                    it suggests volatile market conditions requiring adaptive strategies. Consistent allocation bars suggest a stable market where a fixed strategy is effective.
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
