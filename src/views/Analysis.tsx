import React, { useState } from "react";
import { useAppState } from "../store/AppState";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList, LineChart, Line } from "recharts";
import { MCTheme } from "../theme/chartTheme";

function toMil(v: number) {
  return `${(v / 1_000_000_000).toFixed(1)} Miliar`;
}
function idrTick(v: number) {
  const b = v / 1_000_000_000;
  if (b >= 1) return `${b.toFixed(1)} Miliar`;
  const k = v / 1_000;
  if (k >= 1) return `${k.toFixed(0)} Ribu`;
  return `Rp ${v.toFixed(0)}`;
}

export default function Analysis() {
  const { history } = useAppState();
  const last = history[history.length - 1];
  const exp = last?.explain?.expected || {};
  const risk = last?.explain?.risk || {};
  const budget = typeof last?.explain?.budget === "number" ? last!.explain!.budget : 0;
  const policy = Array.isArray(last?.policy) ? last!.policy : [0, 0, 0];
  const totalAlloc = policy.reduce((a: number, b: number) => a + (typeof b === "number" ? b : 0), 0) || 1;
  const pct = policy.map((p: number) => (p / totalAlloc) * 100);

  const barData = [
    { dept: "Marketing", Expected: Number(exp.Marketing_Revenue || 0), Risk: Number(risk.Marketing_Revenue || 0) },
    { dept: "Ops", Expected: Number(exp.Ops_Revenue || 0), Risk: Number(risk.Ops_Revenue || 0) },
    { dept: "R&D", Expected: Number(exp.RnD_Revenue || 0), Risk: Number(risk.RnD_Revenue || 0) },
  ];
  const pieData = [
    { name: "Marketing", value: pct[0] || 0, color: "#3b82f6" },
    { name: "R&D", value: pct[1] || 0, color: "#a78bfa" },
    { name: "Operations", value: pct[2] || 0, color: "#fb923c" },
  ];
  const roi = budget ? (Number(last?.expected_profit || 0) + (last?.explain?.total_spend || 0)) / budget : 0;
  const compData = history.map((h) => ({
    period: h.periodLabel,
    Marketing: Number(h.explain?.expected?.Marketing_Revenue || 0),
    Ops: Number(h.explain?.expected?.Ops_Revenue || 0),
    RnD: Number(h.explain?.expected?.RnD_Revenue || 0),
    total: Number(h.explain?.expected?.Marketing_Revenue || 0) + Number(h.explain?.expected?.Ops_Revenue || 0) + Number(h.explain?.expected?.RnD_Revenue || 0),
  }));
  const riskVals = history.map((h) => ({
    m: Number(h.explain?.risk?.Marketing_Revenue || 0),
    o: Number(h.explain?.risk?.Ops_Revenue || 0),
    r: Number(h.explain?.risk?.RnD_Revenue || 0),
  }));
  const rm = riskVals.map((x) => x.m);
  const ro = riskVals.map((x) => x.o);
  const rr = riskVals.map((x) => x.r);
  const thr = (arr: number[]) => {
    const mean = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const std = arr.length ? Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length) : 0;
    return { low: mean - 0.5 * std, high: mean + 0.5 * std };
  };
  const tm = thr(rm), to = thr(ro), tr = thr(rr);
  const bucketize = (val: number, t: { low: number; high: number }) => (val <= t.low ? "Low" : val >= t.high ? "High" : "Medium");
  const buckets = ["Low", "Medium", "High"] as const;
  const bucketData = [
    { dept: "Marketing", Low: 0, Medium: 0, High: 0 },
    { dept: "Ops", Low: 0, Medium: 0, High: 0 },
    { dept: "R&D", Low: 0, Medium: 0, High: 0 },
  ];
  history.forEach((h) => {
    const bm = bucketize(Number(h.explain?.risk?.Marketing_Revenue || 0), tm);
    const bo = bucketize(Number(h.explain?.risk?.Ops_Revenue || 0), to);
    const br = bucketize(Number(h.explain?.risk?.RnD_Revenue || 0), tr);
    (bucketData[0] as any)[bm] += 1;
    (bucketData[1] as any)[bo] += 1;
    (bucketData[2] as any)[br] += 1;
  });
  const bucketPct = bucketData.map((d) => {
    const total = buckets.reduce((a, k) => a + (d as any)[k], 0) || 1;
    return { dept: d.dept, Low: ((d as any).Low / total) * 100, Medium: ((d as any).Medium / total) * 100, High: ((d as any).High / total) * 100 };
  });
  const [showAllPanels, setShowAllPanels] = useState(false);

  return (
    <div className="page">
      <div className="page-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="page-title">Risk Analysis</div>
        <div className="pill"><span className="dot" />Synced</div>
      </div>
      <div className="grid-two" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <div>Projected Revenue vs. Risk</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Green: Expected | Red: Risk (stdev)</div>
          </div>
          <div className="chart-container mc-chart">
            <ResponsiveContainer>
              <BarChart data={barData} margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
                <XAxis dataKey="dept" />
                <YAxis tickFormatter={idrTick} />
                <Tooltip formatter={(value: any) => idrTick(Number(value))} />
                <Legend />
                <Bar dataKey="Expected" fill={MCTheme.colors.line} />
                <Bar dataKey="Risk" fill={MCTheme.colors.axis} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>Recommended Budget Split</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Optimized for maximum growth</div>
          </div>
          <div className="chart-container mc-chart">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>
                  {pieData.map((e, i) => <Cell key={i} fill={[MCTheme.colors.marketing, MCTheme.colors.rnd, MCTheme.colors.ops][i]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>Revenue Composition by Quarter</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Stacked segments with total trend</div>
        </div>
        <div className="chart-container mc-chart" style={{ height: 440 }}>
          <ResponsiveContainer>
            <BarChart data={compData} margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={idrTick} />
              <Tooltip formatter={(v: any) => idrTick(Number(v))} />
              <Legend />
              <Bar dataKey="Marketing" stackId="s" fill={MCTheme.colors.marketing} isAnimationActive>
                <LabelList dataKey="Marketing" formatter={(v: any) => (v/1_000_000_000).toFixed(1)} position="insideTop" fill="#ffffff" />
              </Bar>
              <Bar dataKey="RnD" stackId="s" fill={MCTheme.colors.rnd} isAnimationActive>
                <LabelList dataKey="RnD" formatter={(v: any) => (v/1_000_000_000).toFixed(1)} position="insideTop" fill="#ffffff" />
              </Bar>
              <Bar dataKey="Ops" stackId="s" fill={MCTheme.colors.ops} isAnimationActive>
                <LabelList dataKey="Ops" formatter={(v: any) => (v/1_000_000_000).toFixed(1)} position="insideTop" fill="#ffffff" />
              </Bar>
              <Line type="monotone" dataKey="total" stroke={MCTheme.colors.lineAlt} strokeDasharray="6 6" dot={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mc-insight-card">
        {(() => {
          const q = history.length;
          const budgets = history.map((h) => Number(h.explain?.budget || 0));
          const revenues = history.map((h) => Number(h.explain?.avg_revenue || 0));
          const netProfits = history.map((h) => Number(h.expected_profit || 0));
          const totalBudget = budgets.reduce((a, b) => a + b, 0);
          const cumulativeNet = netProfits.reduce((a, b) => a + b, 0);
          const avgNet = q ? cumulativeNet / q : 0;
          const rois = history.map((h) => {
            const rev = Number(h.explain?.avg_revenue || 0);
            const b = Number(h.explain?.budget || 0) || 1;
            return (rev / b) * 100;
          });
          const avgRoi = rois.length ? rois.reduce((a, b) => a + b, 0) / rois.length : 0;
          const latestRoi = rois.length ? rois[rois.length - 1] : 0;
          const riskMeans = {
            Marketing: rm.length ? rm.reduce((a, b) => a + b, 0) / rm.length : 0,
            Ops: ro.length ? ro.reduce((a, b) => a + b, 0) / ro.length : 0,
            RnD: rr.length ? rr.reduce((a, b) => a + b, 0) / rr.length : 0,
          };
          const highestRiskDept = Object.entries(riskMeans).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
          return (
            <>
              <div className="mc-insight-header">
                <div>
                  <div className="mc-insight-title">Analysis Insights</div>
                  <div className="mc-insight-sub">Efficiency and risk overview</div>
                </div>
                <div className="mc-insight-value">
                  <div className="label">AVG ROI</div>
                  <div className="num">{avgRoi.toFixed(1)}%</div>
                </div>
              </div>
              <div className="mc-insight-divider" />
              <div className="mc-insight-grid">
                <div>
                  <div className="mc-insight-section-title">Key Takeaways</div>
                  <div className="mc-insight-text">
                    Total budget processed is <span className="mc-strong">{toMil(totalBudget)}</span>. Cumulative net profit across quarters is <span className="mc-strong">{toMil(cumulativeNet)}</span>, averaging <span className="mc-strong">{toMil(avgNet)}</span> per quarter. Latest ROI stands at <span className="mc-strong">{latestRoi.toFixed(1)}%</span>.
                  </div>
                </div>
                <div>
                  <div className="mc-insight-section-title">Latest Mix</div>
                  <div className="mc-insight-text">
                    Volatility overview shows <span className="mc-strong">{highestRiskDept}</span> with the highest average risk. Monitor allocation shifts alongside ROI to balance upside with exposure.
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>
      <div className="card">
        <div className="card-header">
          <div>Risk Buckets by Department</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Low • Medium • High distribution (%)</div>
        </div>
        <div className="chart-container mc-chart" style={{ height: 380 }}>
          <ResponsiveContainer>
            <BarChart data={bucketPct} margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
              <XAxis dataKey="dept" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v.toFixed(0)}%`} />
              <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="Low" stackId="b" fill={MCTheme.colors.ops} isAnimationActive>
                <LabelList dataKey="Low" formatter={(v: any) => `${Number(v).toFixed(0)}%`} position="center" fill="#0b1020" />
              </Bar>
              <Bar dataKey="Medium" stackId="b" fill={MCTheme.colors.line} isAnimationActive>
                <LabelList dataKey="Medium" formatter={(v: any) => `${Number(v).toFixed(0)}%`} position="center" fill="#ffffff" />
              </Bar>
              <Bar dataKey="High" stackId="b" fill={MCTheme.colors.axis} isAnimationActive>
                <LabelList dataKey="High" formatter={(v: any) => `${Number(v).toFixed(0)}%`} position="center" fill="#ffffff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>Quarter Panels</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Mini charts per quarter</div>
        </div>
        <div className="grid-two">
          { (showAllPanels ? history : history.slice(0,4)).map((h, i) => {
            const d = [
              { name: "Marketing", val: Number(h.explain?.expected?.Marketing_Revenue || 0), color: "#3b82f6" },
              { name: "Ops", val: Number(h.explain?.expected?.Ops_Revenue || 0), color: "#fb923c" },
              { name: "R&D", val: Number(h.explain?.expected?.RnD_Revenue || 0), color: "#a78bfa" },
            ];
            return (
              <div key={i} className="card" style={{ padding: 12 }}>
                <div className="page-subtitle">{h.periodLabel}</div>
                <div style={{ height: 220 }} className="mc-chart">
                  <ResponsiveContainer>
                    <BarChart data={d} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={idrTick} />
                      <Tooltip formatter={(v: any) => idrTick(Number(v))} />
                      {d.map((e, idx) => (
                        <Bar key={idx} dataKey="val" fill={[MCTheme.colors.marketing, MCTheme.colors.ops, MCTheme.colors.rnd][idx]} isAnimationActive>
                          <LabelList dataKey="val" formatter={(v: any) => (v/1_000_000_000).toFixed(1)} position="top" />
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
        {history.length > 4 && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            {!showAllPanels ? (
              <button className="button-accent" onClick={() => setShowAllPanels(true)}>Show More</button>
            ) : (
              <button className="button-accent" onClick={() => setShowAllPanels(false)}>Show Less</button>
            )}
          </div>
        )}
      </div>
      <div className="card">
        <div className="card-header">
          <div>Executive Summary: {last?.periodLabel || "—"}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 12 }}>
          <div>
            <div className="page-subtitle">Total Budget</div>
            <div className="calc-metric">{toMil(budget)}</div>
          </div>
          <div>
            <div className="page-subtitle">Exp. Revenue</div>
            <div className="calc-metric">{toMil(Number(last?.explain?.avg_revenue || 0))}</div>
          </div>
          <div>
            <div className="page-subtitle">ROI Projection</div>
            <div className="calc-metric">{(roi * 100).toFixed(1)}% Return</div>
          </div>
        </div>
        <div className="page-subtitle">
          Deploying a budget of {toMil(budget)} is projected to generate {toMil(Number(last?.explain?.avg_revenue || 0))}.
          Based on 1,000 Monte Carlo simulations with risk-adjusted allocation, the split favors departments with higher efficient returns.
        </div>
      </div>
    </div>
  );
}
