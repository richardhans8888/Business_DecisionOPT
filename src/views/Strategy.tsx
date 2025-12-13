import React from "react";
import { useAppState } from "../store/AppState";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, LineChart, Line } from "recharts";
import { MCTheme } from "../theme/chartTheme";

function toMil(v: number) {
  return `${(v / 1_000_000_000).toFixed(1)} Miliar`;
}

export default function Strategy() {
  const { history } = useAppState();
  const last = history[history.length - 1];
  const budget = Number(last?.explain?.budget || 0);
  const policy = Array.isArray(last?.policy) ? last!.policy : [0, 0, 0];
  const total = policy.reduce((a: number, b: number) => a + (typeof b === "number" ? b : 0), 0) || 1;
  const pct = policy.map((x: number) => (x / total) * 100);
  const growth = Number(last?.explain?.avg_revenue || 0);
  const exp = last?.explain?.expected || {};
  const risk = last?.explain?.risk || {};
  const eff = {
    Marketing: Number(exp.Marketing_Revenue || 0) - 0.3 * Number(risk.Marketing_Revenue || 0),
    RnD: Number(exp.RnD_Revenue || 0) - 0.3 * Number(risk.RnD_Revenue || 0),
    Ops: Number(exp.Ops_Revenue || 0) - 0.3 * Number(risk.Ops_Revenue || 0),
  };
  const effMean = (eff.Marketing + eff.RnD + eff.Ops) / 3 || 1;
  const efficiencyScale = (v: number) => Math.max(0, Math.min(100, (v / effMean) * 60 + 20)); // center near 60
  const horizData = [
    { dept: "Marketing", Allocation: pct[0], Target: efficiencyScale(eff.Marketing) },
    { dept: "R&D", Allocation: pct[1], Target: efficiencyScale(eff.RnD) },
    { dept: "Ops", Allocation: pct[2], Target: efficiencyScale(eff.Ops) },
  ];
  const roiTrend = history.map((h) => {
    const b = Number(h.explain?.budget || 1);
    const rev = Number(h.explain?.avg_revenue || 0);
    return { period: h.periodLabel, ROI: (rev / b) * 100 };
  });

  return (
    <div className="page">
      <div className="page-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="page-title">Strategy</div>
        <div className="pill"><span className="dot" />Synced</div>
      </div>
      <div className="report-card">
        <div className="card-header">
          <div>Optimal Strategy ({last?.periodLabel || "—"})</div>
          <div style={{ fontSize: 12, color: "#93c5fd" }}>Constraint: 20–50% per Dept.</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
          <div style={{ background: "#0d1638", borderRadius: 12, padding: 16 }}>
            <div className="page-subtitle">Marketing</div>
            <div className="calc-metric">{pct[0].toFixed(0)}%</div>
          </div>
          <div style={{ background: "#0d1638", borderRadius: 12, padding: 16 }}>
            <div className="page-subtitle">R&D</div>
            <div className="calc-metric">{pct[1].toFixed(0)}%</div>
          </div>
          <div style={{ background: "#0d1638", borderRadius: 12, padding: 16 }}>
            <div className="page-subtitle">Ops</div>
            <div className="calc-metric">{pct[2].toFixed(0)}%</div>
          </div>
          <div style={{ background: "#0d1638", borderRadius: 12, padding: 16 }}>
            <div className="page-subtitle">Total Expected Growth</div>
            <div className="calc-metric">{toMil(growth)}</div>
            <div className="report-sub">Combined Revenue Impact</div>
          </div>
        </div>
      </div>
      <div className="grid-two" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <div>Allocation vs Efficiency Target</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Horizontal bars with McKinsey palette</div>
          </div>
          <div className="chart-container mc-chart" style={{ height: 360 }}>
            <ResponsiveContainer>
              <BarChart data={horizData} layout="vertical" margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <YAxis type="category" dataKey="dept" />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="Allocation" fill={MCTheme.colors.marketing}>
                  <LabelList dataKey="Allocation" formatter={(v: any) => `${Number(v).toFixed(0)}%`} position="right" fill="#0f1f49" />
                </Bar>
                <Bar dataKey="Target" fill="#cfe3ff">
                  <LabelList dataKey="Target" formatter={(v: any) => `${Number(v).toFixed(0)}%`} position="right" fill="#0f1f49" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>ROI Trend</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Latest quarters with dashed average</div>
          </div>
          <div className="chart-container mc-chart">
            <ResponsiveContainer>
              <LineChart data={roiTrend} margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                <Legend />
                <Line type="monotone" dataKey="ROI" stroke={MCTheme.colors.line} strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>Allocation Blocks</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Complex diagram: block grid by department</div>
        </div>
        <div className="mc-chart" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {["Marketing","R&D","Ops"].map((name, idx) => {
            const p = pct[idx] || 0;
            const blocks = Math.round((p / 100) * 30); // 30 blocks max
            const fadeBlocks = 30 - blocks;
            const cls = idx === 0 ? "block-marketing" : idx === 1 ? "block-rnd" : "block-ops";
            return (
              <div key={name}>
                <div className="page-subtitle">{name} — {p.toFixed(0)}%</div>
                <div className="block-grid">
                  {Array.from({ length: blocks }).map((_, i) => <div key={i} className={`block ${cls}`} />)}
                  {Array.from({ length: fadeBlocks }).map((_, i) => <div key={`f${i}`} className={`block ${cls} block-fade`} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mc-insight-card">
        <div className="mc-insight-header">
          <div>
            <div className="mc-insight-title">Strategy Insights</div>
            <div className="mc-insight-sub">Alignment of allocation with efficiency and ROI</div>
          </div>
          <div className="mc-insight-value">
            <div className="label">BUDGET</div>
            <div className="num">{toMil(budget)}</div>
          </div>
        </div>
        <div className="mc-insight-divider" />
        <div className="mc-insight-grid">
          <div>
            <div className="mc-insight-section-title">Key Takeaways</div>
            <div className="mc-insight-text">
              Allocation favors departments with higher risk-adjusted efficiency. Where <span className="mc-strong">Allocation</span> trails <span className="mc-strong">Target</span>, consider incremental rebalancing within constraints to capture upside.
            </div>
          </div>
          <div>
            <div className="mc-insight-section-title">Recommendation</div>
            <div className="mc-insight-text">
              Track quarterly <span className="mc-strong">ROI trend</span> to validate mix changes. If risk volatility rises while ROI decouples, tighten allocation bands or increase diversification across departments.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
