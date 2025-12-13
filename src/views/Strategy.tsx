import React from "react";
import { useAppState } from "../store/AppState";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, LineChart, Line, ComposedChart, ReferenceDot } from "recharts";
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
  const roiTrend = history.map((h) => {
    const b = Number(h.explain?.budget || 1);
    const rev = Number(h.explain?.avg_revenue || 0);
    return { period: h.periodLabel, ROI: (rev / b) * 100 };
  });
  const mkPanel = [
    { name: "Allocation", val: pct[0] || 0, color: MCTheme.colors.marketing },
    { name: "Efficiency", val: efficiencyScale(eff.Marketing), color: "#cfe3ff" },
  ];
  const rdPanel = [
    { name: "Allocation", val: pct[1] || 0, color: MCTheme.colors.rnd },
    { name: "Efficiency", val: efficiencyScale(eff.RnD), color: "#cfe3ff" },
  ];
  const opPanel = [
    { name: "Allocation", val: pct[2] || 0, color: MCTheme.colors.ops },
    { name: "Efficiency", val: efficiencyScale(eff.Ops), color: "#cfe3ff" },
  ];
  const gapData = [
    { dept: "Marketing", ratio: pct[0] || 0, target: efficiencyScale(eff.Marketing), gap: Math.max(0, efficiencyScale(eff.Marketing) - (pct[0] || 0)) },
    { dept: "R&D", ratio: pct[1] || 0, target: efficiencyScale(eff.RnD), gap: Math.max(0, efficiencyScale(eff.RnD) - (pct[1] || 0)) },
    { dept: "Ops", ratio: pct[2] || 0, target: efficiencyScale(eff.Ops), gap: Math.max(0, efficiencyScale(eff.Ops) - (pct[2] || 0)) },
  ];

  return (
    <div className="page">
      <div className="page-inner" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <div className="pill"><span className="dot" />Synced</div>
      </div>
      <div className="mc-hero">
        <div className="mc-hero-header">
          <div className="mc-hero-title">Optimal Strategy ({last?.periodLabel || "—"})</div>
          <div className="mc-hero-sub">Constraint: 20–50% per Dept.</div>
        </div>
        <div className="mc-hero-grid">
          <div className="mc-hero-tile">
            <div className="page-subtitle">Marketing</div>
            <div className="mc-hero-metric">{pct[0].toFixed(0)}%</div>
          </div>
          <div className="mc-hero-tile">
            <div className="page-subtitle">R&D</div>
            <div className="mc-hero-metric">{pct[1].toFixed(0)}%</div>
          </div>
          <div className="mc-hero-tile">
            <div className="page-subtitle">Ops</div>
            <div className="mc-hero-metric">{pct[2].toFixed(0)}%</div>
          </div>
          <div className="mc-hero-tile">
            <div className="page-subtitle">Total Expected Growth</div>
            <div className="mc-hero-metric">{toMil(growth)}</div>
            <div className="mc-hero-sub">Combined Revenue Impact</div>
          </div>
        </div>
      </div>
      <div className="grid-three">
        <div className="card">
          <div className="card-header">
            <div>Marketing Focus</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Allocation vs efficiency target</div>
          </div>
          <div className="chart-container mc-chart" style={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={mkPanel} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                <Legend />
                {mkPanel.map((e, idx) => (
                  <Bar key={idx} dataKey="val" fill={e.color} isAnimationActive>
                    <LabelList dataKey="val" formatter={(v: any) => `${Number(v).toFixed(0)}%`} position="top" />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>R&D Focus</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Allocation vs efficiency target</div>
          </div>
          <div className="chart-container mc-chart" style={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={rdPanel} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                <Legend />
                {rdPanel.map((e, idx) => (
                  <Bar key={idx} dataKey="val" fill={e.color} isAnimationActive>
                    <LabelList dataKey="val" formatter={(v: any) => `${Number(v).toFixed(0)}%`} position="top" />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>Ops Focus</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Allocation vs efficiency target</div>
          </div>
          <div className="chart-container mc-chart" style={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={opPanel} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                <Legend />
                {opPanel.map((e, idx) => (
                  <Bar key={idx} dataKey="val" fill={e.color} isAnimationActive>
                    <LabelList dataKey="val" formatter={(v: any) => `${Number(v).toFixed(0)}%`} position="top" />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="mc-hero-insight">
        <div className="mc-insight-header">
          <div>
            <div className="mc-insight-title">Diagram Explanations</div>
            <div className="mc-insight-sub">How to read the three panels</div>
          </div>
          <div className="mc-insight-value">
            <div className="label">PERIOD</div>
            <div className="num">{last?.periodLabel || "—"}</div>
          </div>
        </div>
        <div className="mc-insight-divider" />
        <div className="mc-insight-grid">
          <div>
            <div className="mc-insight-section-title">Marketing</div>
            <div className="mc-insight-text">
              Blue bar shows actual allocation; light-blue bar shows risk-adjusted efficiency target. If allocation <span className="mc-strong">trails</span> target, consider rebalancing to capture upside within constraints.
            </div>
          </div>
          <div>
            <div className="mc-insight-section-title">R&D</div>
            <div className="mc-insight-text">
              Compare allocation vs target to gauge whether innovation spend aligns with expected efficiency. High volatility suggests staged increases rather than step changes.
            </div>
          </div>
          <div>
            <div className="mc-insight-section-title">Ops</div>
            <div className="mc-insight-text">
              Operational allocation should track efficiency closely. If efficiency rises while allocation lags, modest increases can improve ROI stability.
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>Strategy Gap Diagram</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Blue: Allocation ratio • Grey: Efficiency target • Purple: Gap</div>
        </div>
        <div className="chart-container mc-chart" style={{ height: 380 }}>
          <ResponsiveContainer>
            <ComposedChart data={gapData} layout="vertical" margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
              <XAxis type="number" domain={[0, 120]} tickFormatter={(v) => `${v.toFixed(0)}%`} />
              <YAxis type="category" dataKey="dept" />
              <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="target" fill="#e5edf8" barSize={24} />
              <Bar dataKey="ratio" fill={MCTheme.colors.line} barSize={24}>
                <LabelList dataKey="ratio" formatter={(v: any) => `${Number(v).toFixed(0)}%`} position="insideRight" fill="#ffffff" />
              </Bar>
              {gapData.map((d, i) => (
                <ReferenceDot key={i} x={d.target} y={d.dept} r={9} fill="#a21caf" stroke="none" label={{ value: String(Math.round(d.gap)), position: "right" }} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mc-hero-insight">
        {(() => {
          const maxGap = gapData.reduce((acc, d) => (d.gap > acc.gap ? d : acc), gapData[0]);
          const avgGap = gapData.reduce((a, d) => a + d.gap, 0) / (gapData.length || 1);
          return (
            <>
              <div className="mc-insight-header">
                <div>
                  <div className="mc-insight-title">Strategy Gap Explanation</div>
                  <div className="mc-insight-sub">Why we visualize allocation vs efficiency</div>
                </div>
                <div className="mc-insight-value">
                  <div className="label">AVERAGE GAP</div>
                  <div className="num">{avgGap.toFixed(1)}%</div>
                </div>
              </div>
              <div className="mc-insight-divider" />
              <div className="mc-insight-grid">
                <div>
                  <div className="mc-insight-section-title">Purpose</div>
                  <div className="mc-insight-text">
                    The diagram highlights misalignment between current allocation (<span className="mc-strong">blue</span>) and risk‑adjusted efficiency targets (<span className="mc-strong">grey</span>). Purple markers quantify the <span className="mc-strong">gap</span>, guiding rebalancing decisions within constraints.
                  </div>
                </div>
                <div>
                  <div className="mc-insight-section-title">How to Use</div>
                  <div className="mc-insight-text">
                    If the gap exceeds the average or a chosen threshold, consider increasing allocation toward the target for that department. Largest current gap: <span className="mc-strong">{maxGap.dept}</span> at <span className="mc-strong">{Math.round(maxGap.gap)}%</span>. Where allocation is above target, hold or reduce to maintain ROI stability.
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>
      <div className="card">
        <div className="card-header">
          <div>ROI Trend</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Latest quarters</div>
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
