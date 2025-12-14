import React, { useEffect, useState } from "react";
import { MCTheme } from "../theme/chartTheme";
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
  explain?: Record<string, any>;
}

export default function CompareQuartersCharts({ history }: { history: HistoryItem[] }) {
  const series = history.map((h) => {
    const invested = Array.isArray(h.policy)
      ? h.policy.reduce((a: number, b: number) => a + (typeof b === "number" ? b : 0), 0)
      : 0;
    return {
      period: h.periodLabel,
      growth: Number(h.explain?.avg_revenue || 0),
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
    const sign = v < 0 ? "-" : "";
    const abs = Math.abs(v);
    const billion = abs / 1_000_000_000;
    if (billion >= 1) return `${sign}${billion.toFixed(1)} Miliar`;
    const thousand = abs / 1_000;
    if (thousand >= 1) return `${sign}${thousand.toFixed(0)} Ribu`;
    return `Rp ${v.toFixed(0)}`;
  }

  const maxVal = Math.max(
    1,
    ...series.map((s) => Math.max(Number(s.growth) || 0, Number(s.budget) || 0))
  );
  const minVal = Math.min(
    0,
    ...series.map((s) => Math.min(Number(s.growth) || 0, Number(s.budget) || 0))
  );
  const yDomain: [number, number] = [minVal * 1.25, maxVal * 1.25];

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
              <span style={{ fontSize: 12, color: "#6b7280" }}>Expected Revenue (Avg)</span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ width: 16, height: 6, background: "#9ca3af", borderRadius: 999 }} />
              <span style={{ fontSize: 12, color: "#6b7280" }}>Total Budget Invested</span>
            </div>
          </div>
        </div>
         <div className="chart-container mc-chart">
           <ResponsiveContainer>
            <LineChart data={series} margin={{ top: 32, right: 32, left: 32, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis domain={yDomain} tickFormatter={currencyTick} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: any) => currencyTick(Number(value))} />
              <Line type="monotone" dataKey="growth" stroke={MCTheme.colors.line} strokeWidth={3} dot={{ r: 4 }} isAnimationActive animationDuration={1200} animationBegin={100} />
              <Line type="monotone" dataKey="budget" stroke={MCTheme.colors.lineAlt} strokeDasharray="6 6" strokeWidth={3} dot={{ r: 3 }} isAnimationActive animationDuration={1200} animationBegin={100} />
            </LineChart>
           </ResponsiveContainer>
         </div>
      </div>
      <div className="card card-wide">
        <div className="card-header">
          <div>Strategy Evolution</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>How the optimal mix changes over time</div>
        </div>
        <div className="chart-container mc-chart" style={{ height: 340 }}>
          <ResponsiveContainer>
            <BarChart data={bars} margin={{ top: 32, right: 32, left: 32, bottom: 24 }} barCategoryGap="18%" barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={(v: number) => `${v.toFixed(0)}%`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} />
              <Legend />
              <Bar name="Marketing %" dataKey="Marketing" stackId="a" fill={MCTheme.colors.marketing} isAnimationActive animationDuration={1200} animationBegin={150} radius={[4, 4, 0, 0]} />
              <Bar name="R&D %" dataKey="R&D" stackId="a" fill={MCTheme.colors.rnd} isAnimationActive animationDuration={1200} animationBegin={200} radius={[4, 4, 0, 0]} />
              <Bar name="Ops %" dataKey="Ops" stackId="a" fill={MCTheme.colors.ops} isAnimationActive animationDuration={1200} animationBegin={250} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="calc-card">
        {(() => {
          const quarters = history.length;
          const start = quarters ? history[0] : null;
          const end = quarters ? history[quarters - 1] : null;
          const cumulativeNet = quarters ? history.reduce((a, h) => a + h.expected_profit, 0) : 0;
          const avgNet = quarters ? cumulativeNet / quarters : 0;
          const totalInvested = quarters ? history.reduce((a, h) => a + (Array.isArray(h.policy) ? h.policy.reduce((x: number, y: number) => x + (typeof y === "number" ? y : 0), 0) : 0), 0) : 0;
          const formatMil = (v: number) => `${(v / 1_000_000_000).toFixed(1)} Miliar`;
          const last = end;
          const lp = Array.isArray(last?.policy) ? last!.policy : [0, 0, 0];
          const lpt = lp.reduce((a: number, b: number) => a + (typeof b === "number" ? b : 0), 0) || 1;
          const mPct = ((lp[0] as number) / lpt) * 100;
          const rPct = ((lp[1] as number) / lpt) * 100;
          const oPct = ((lp[2] as number) / lpt) * 100;
          return (
            <>
              <div className="calc-header">
                <div>
                  <div className="calc-title">🧮 Calculation & Reasoning</div>
                  <div className="calc-sub">Based on Monte Carlo (1000) and DP Best Choice (risk-adjusted)</div>
                </div>
                <div className="calc-metric">{formatMil(cumulativeNet)}</div>
              </div>
              <div className="calc-grid">
                <div className="calc-item">
                  Net profit per quarter = E[Revenue] − Total Spend. Average net per quarter: <span className="report-strong">{formatMil(avgNet)}</span>. Total budget invested across all quarters: <span className="report-strong">{formatMil(totalInvested)}</span>.
                </div>
                <div className="calc-item">
                  Allocation decision uses constraints [20%–50%] and risk-adjusted efficiency: expected − 0.3 × stdev. Latest period mix: <span className="report-strong">Marketing {mPct.toFixed(1)}%</span>, <span className="report-strong">R&D {rPct.toFixed(1)}%</span>, <span className="report-strong">Ops {oPct.toFixed(1)}%</span>.
                </div>
              </div>
              <div className="calc-note">Cumulative value shown is the sum of net profit across quarters formatted in Miliar (IDR billions).</div>
            </>
          );
        })()}
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
          const formatMil = (v: number) => `${(v / 1_000_000_000).toFixed(1)} Miliar`;
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
