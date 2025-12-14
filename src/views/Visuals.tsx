import React from "react";
import { useAppState } from "../store/AppState";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LabelList, LineChart, Line, AreaChart, Area, ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Treemap, ScatterChart, Scatter } from "recharts";
import { MCTheme } from "../theme/chartTheme";

function idrTick(v: number) {
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  const b = abs / 1_000_000_000;
  if (b >= 1) return `${sign}${b.toFixed(1)} Miliar`;
  const k = abs / 1_000;
  if (k >= 1) return `${sign}${k.toFixed(0)} Ribu`;
  return `Rp ${v.toFixed(0)}`;
}
function idrBil(v: number) {
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  if (abs < 1_000_000) return `0.0 Miliar`;
  return `${sign}${(abs / 1_000_000_000).toFixed(1)} Miliar`;
}

export default function Visuals() {
  const { history } = useAppState();
  const last = history[history.length - 1];
  const exp = last?.explain?.expected || {};
  const risk = last?.explain?.risk || {};
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
  const compData = history.map((h) => ({
    period: h.periodLabel,
    Marketing: Number(h.explain?.expected?.Marketing_Revenue || 0),
    Ops: Number(h.explain?.expected?.Ops_Revenue || 0),
    RnD: Number(h.explain?.expected?.RnD_Revenue || 0),
    total: Number(h.explain?.expected?.Marketing_Revenue || 0) + Number(h.explain?.expected?.Ops_Revenue || 0) + Number(h.explain?.expected?.RnD_Revenue || 0),
  }));
  const bandData = history.map((h) => {
    const m = Number(h.explain?.expected?.Marketing_Revenue || 0);
    const o = Number(h.explain?.expected?.Ops_Revenue || 0);
    const r = Number(h.explain?.expected?.RnD_Revenue || 0);
    const rm = Number(h.explain?.risk?.Marketing_Revenue || 0);
    const ro = Number(h.explain?.risk?.Ops_Revenue || 0);
    const rr = Number(h.explain?.risk?.RnD_Revenue || 0);
    const expT = m + o + r;
    const riskT = rm + ro + rr;
    return { period: h.periodLabel, Expected: expT, Upper: expT + riskT, Lower: Math.max(0, expT - riskT) };
  });
  const allocTrend = history.map((h) => {
    const p = Array.isArray(h.policy) ? h.policy : [0, 0, 0];
    const t = p.reduce((a: number, b: number) => a + (typeof b === "number" ? b : 0), 0) || 1;
    return {
      period: h.periodLabel,
      Marketing: ((p[0] as number) / t) * 100,
      RnD: ((p[1] as number) / t) * 100,
      Ops: ((p[2] as number) / t) * 100,
    };
  });
  const roiTrend = history.map((h) => {
    const b = Number(h.explain?.budget || 1);
    const rev = Number(h.explain?.avg_revenue || 0);
    return { period: h.periodLabel, ROI: (rev / b) * 100 };
  });
  const netProfit = history.map((h) => ({ period: h.periodLabel, Net: Number(h.expected_profit || 0) }));
  const cumRev = (() => {
    let run = 0;
    return history.map((h) => {
      run += Number(h.explain?.avg_revenue || 0);
      return { period: h.periodLabel, Cumulative: run };
    });
  })();
  const effBars = [
    { dept: "Marketing", Efficiency: Number(exp.Marketing_Revenue || 0) - 0.3 * Number(risk.Marketing_Revenue || 0) },
    { dept: "R&D", Efficiency: Number(exp.RnD_Revenue || 0) - 0.3 * Number(risk.RnD_Revenue || 0) },
    { dept: "Ops", Efficiency: Number(exp.Ops_Revenue || 0) - 0.3 * Number(risk.Ops_Revenue || 0) },
  ];
  const riskTrend = history.map((h) => ({
    period: h.periodLabel,
    Marketing: Number(h.explain?.risk?.Marketing_Revenue || 0),
    Ops: Number(h.explain?.risk?.Ops_Revenue || 0),
    RnD: Number(h.explain?.risk?.RnD_Revenue || 0),
  }));
  const scatterRoiRisk = history.map((h) => {
    const b = Number(h.explain?.budget || 1);
    const rev = Number(h.explain?.avg_revenue || 0);
    const rm = Number(h.explain?.risk?.Marketing_Revenue || 0);
    const ro = Number(h.explain?.risk?.Ops_Revenue || 0);
    const rr = Number(h.explain?.risk?.RnD_Revenue || 0);
    return { period: h.periodLabel, Risk: rm + ro + rr, ROI: (rev / b) * 100 };
  });
  const latestDeptNet = (() => {
    const mNet = Number(exp.Marketing_Revenue || 0) - Number(last?.explain?.total_spend ? last!.explain!.total_spend * (Number(policy[0]||0)/ (Number(policy[0]||0)+Number(policy[1]||0)+Number(policy[2]||0)||1)) : Number(last?.explain?.budget||0)*(pct[0]/100));
    const rNet = Number(exp.RnD_Revenue || 0) - Number(last?.explain?.total_spend ? last!.explain!.total_spend * (Number(policy[1]||0)/ (Number(policy[0]||0)+Number(policy[1]||0)+Number(policy[2]||0)||1)) : Number(last?.explain?.budget||0)*(pct[1]/100));
    const oNet = Number(exp.Ops_Revenue || 0) - Number(last?.explain?.total_spend ? last!.explain!.total_spend * (Number(policy[2]||0)/ (Number(policy[0]||0)+Number(policy[1]||0)+Number(policy[2]||0)||1)) : Number(last?.explain?.budget||0)*(pct[2]/100));
    return [
      { dept: "Marketing", Net: mNet },
      { dept: "R&D", Net: rNet },
      { dept: "Ops", Net: oNet },
    ];
  })();
  const deptSpark = {
    Marketing: history.map((h) => Number(h.explain?.expected?.Marketing_Revenue || 0)),
    RnD: history.map((h) => Number(h.explain?.expected?.RnD_Revenue || 0)),
    Ops: history.map((h) => Number(h.explain?.expected?.Ops_Revenue || 0)),
    periods: history.map((h) => h.periodLabel),
  };
  const histBins = (() => {
    const values = netProfit.map((d) => d.Net);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const bins = 10;
    const step = (max - min) / bins || 1;
    const counts = Array.from({ length: bins }, (_, i) => {
      const edge = min + i * step;
      const next = min + (i + 1) * step;
      return {
        bin: edge,
        count: values.filter((v) => v >= edge && v < next).length,
      };
    });
    return counts;
  })();

  return (
    <div className="page">
      <div className="grid-two">
        <div className="card">
          <div className="card-header">
            <div>Efficiency Radar</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Normalized efficiency and risk</div>
          </div>
          <div className="chart-container mc-chart">
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { metric: "Marketing", Eff: Math.max(0, (Number(exp.Marketing_Revenue || 0) - 0.3 * Number(risk.Marketing_Revenue || 0)) / (Number(exp.Marketing_Revenue || 1)) * 100), Risk: Math.min(100, (Number(risk.Marketing_Revenue || 0) / (Number(exp.Marketing_Revenue || 1))) * 100) },
                { metric: "R&D", Eff: Math.max(0, (Number(exp.RnD_Revenue || 0) - 0.3 * Number(risk.RnD_Revenue || 0)) / (Number(exp.RnD_Revenue || 1)) * 100), Risk: Math.min(100, (Number(risk.RnD_Revenue || 0) / (Number(exp.RnD_Revenue || 1))) * 100) },
                { metric: "Ops", Eff: Math.max(0, (Number(exp.Ops_Revenue || 0) - 0.3 * Number(risk.Ops_Revenue || 0)) / (Number(exp.Ops_Revenue || 1)) * 100), Risk: Math.min(100, (Number(risk.Ops_Revenue || 0) / (Number(exp.Ops_Revenue || 1))) * 100) },
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Efficiency" dataKey="Eff" stroke={MCTheme.colors.line} fill={MCTheme.colors.line} fillOpacity={0.4} />
                <Radar name="Risk" dataKey="Risk" stroke={MCTheme.colors.ops} fill={MCTheme.colors.ops} fillOpacity={0.25} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>Budget Treemap</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Proportional budget areas</div>
          </div>
          <div className="chart-container mc-chart">
            <ResponsiveContainer>
              <Treemap data={[
                { name: "Marketing", size: Number(policy[0] || 0) },
                { name: "R&D", size: Number(policy[1] || 0) },
                { name: "Ops", size: Number(policy[2] || 0) },
              ]} dataKey="size" aspectRatio={4 / 3} stroke="#ffffff" fill={MCTheme.colors.line} />
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>Expected vs Risk Band</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Expected totals with upper/lower bounds</div>
        </div>
        <div className="chart-container mc-chart" style={{ height: 420 }}>
          <ResponsiveContainer>
            <ComposedChart data={bandData} margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={idrBil} />
              <Tooltip formatter={(v: any) => idrBil(Number(v))} />
              <Legend />
              <Line type="monotone" dataKey="Expected" stroke={MCTheme.colors.line} strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="Upper" stroke={MCTheme.colors.lineAlt} strokeDasharray="6 6" dot={false} />
              <Line type="monotone" dataKey="Lower" stroke={MCTheme.colors.ops} strokeDasharray="6 6" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>ROI vs Risk Scatter</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Each point is a quarter</div>
        </div>
        <div className="chart-container mc-chart">
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
              <XAxis dataKey="Risk" tickFormatter={idrBil} name="Risk" />
              <YAxis dataKey="ROI" tickFormatter={(v) => `${Number(v).toFixed(0)}%`} name="ROI (%)" />
              <Tooltip formatter={(v: any, n: any) => n === "ROI" ? `${Number(v).toFixed(1)}%` : idrBil(Number(v))} />
              <Legend />
              <Scatter name="Quarters" data={scatterRoiRisk} fill={MCTheme.colors.line} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid-two">
        <div className="card">
          <div className="card-header">
            <div>Net Profit per Quarter</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Bars in Miliar</div>
          </div>
          <div className="chart-container mc-chart">
            <ResponsiveContainer>
              <BarChart data={netProfit} margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={idrBil} />
                <Tooltip formatter={(v: any) => idrBil(Number(v))} />
                <Legend />
                <Bar dataKey="Net" fill={MCTheme.colors.line}>
                  <LabelList dataKey="Net" formatter={(v: any) => (Number(v)/1_000_000_000).toFixed(1)} position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>Cumulative Revenue</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Running total</div>
          </div>
          <div className="chart-container mc-chart">
            <ResponsiveContainer>
              <AreaChart data={cumRev} margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={idrBil} />
                <Tooltip formatter={(v: any) => idrBil(Number(v))} />
                <Legend />
                <Area dataKey="Cumulative" stroke={MCTheme.colors.lineAlt} fill="#cfe3ff" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid-three">
        <div className="card">
          <div className="card-header">
            <div>Department ROI (Bullet)</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>ROI from expected / budget</div>
          </div>
          <div className="chart-container mc-chart">
            <ResponsiveContainer>
              <ComposedChart data={[
                { name: "Marketing", ROI: Number(exp.Marketing_Revenue || 0) / Math.max(1, Number(policy[0] || 1)) * 100, Target: 100 },
              ]} layout="vertical" margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
                <XAxis type="number" domain={[0, 200]} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="ROI" barSize={18} fill={MCTheme.colors.marketing} />
                <Line dataKey="Target" stroke="#cfe3ff" strokeDasharray="6 6" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>Department ROI (Bullet)</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>R&D</div>
          </div>
          <div className="chart-container mc-chart">
            <ResponsiveContainer>
              <ComposedChart data={[
                { name: "R&D", ROI: Number(exp.RnD_Revenue || 0) / Math.max(1, Number(policy[1] || 1)) * 100, Target: 100 },
              ]} layout="vertical" margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
                <XAxis type="number" domain={[0, 200]} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="ROI" barSize={18} fill={MCTheme.colors.rnd} />
                <Line dataKey="Target" stroke="#cfe3ff" strokeDasharray="6 6" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>Department ROI (Bullet)</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Ops</div>
          </div>
          <div className="chart-container mc-chart">
            <ResponsiveContainer>
              <ComposedChart data={[
                { name: "Ops", ROI: Number(exp.Ops_Revenue || 0) / Math.max(1, Number(policy[2] || 1)) * 100, Target: 100 },
              ]} layout="vertical" margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
                <XAxis type="number" domain={[0, 200]} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="ROI" barSize={18} fill={MCTheme.colors.ops} />
                <Line dataKey="Target" stroke="#cfe3ff" strokeDasharray="6 6" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid-two">
        <div className="card">
          <div className="card-header">
            <div>Latest Dept Contributions</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Waterfall-style bars</div>
          </div>
          <div className="chart-container mc-chart">
            <ResponsiveContainer>
              <BarChart data={latestDeptNet} margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
                <XAxis dataKey="dept" />
                <YAxis tickFormatter={idrBil} />
                <Tooltip formatter={(v: any) => idrBil(Number(v))} />
                <Legend />
                <Bar dataKey="Net" fill={MCTheme.colors.line} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>Net Profit Distribution</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Histogram across quarters</div>
          </div>
          <div className="chart-container mc-chart">
            <ResponsiveContainer>
              <BarChart data={histBins} margin={{ top: 24, right: 24, left: 24, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={MCTheme.colors.grid} />
                <XAxis dataKey="bin" tickFormatter={(v: number) => idrBil(Number(v))} />
                <YAxis />
                <Tooltip
                  formatter={(v: any, n: any) => (n === "count" ? Number(v) : idrBil(Number(v)))}
                  labelFormatter={(label: any) => idrBil(Number(label))}
                />
                <Legend />
                <Bar dataKey="count" fill={MCTheme.colors.line} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>Department Sparklines</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Expected revenue trend mini charts</div>
        </div>
        <div className="mc-chart" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {["Marketing","R&D","Ops"].map((dname, idx) => {
            const series = dname === "Marketing" ? deptSpark.Marketing : dname === "R&D" ? deptSpark.RnD : deptSpark.Ops;
            const color = idx === 0 ? MCTheme.colors.marketing : idx === 1 ? MCTheme.colors.rnd : MCTheme.colors.ops;
            const sparkData = deptSpark.periods.map((p, i) => ({ period: p, val: series[i] || 0 }));
            return (
              <div key={dname} className="card" style={{ padding: 12 }}>
                <div className="page-subtitle">{dname}</div>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer>
                    <LineChart data={sparkData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <XAxis dataKey="period" hide />
                      <YAxis hide />
                      <Line type="monotone" dataKey="val" stroke={color} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mc-hero-insight">
        <div className="mc-insight-header">
          <div>
            <div className="mc-insight-title">Visual Insights</div>
            <div className="mc-insight-sub">Professional overview of strategy, risk, and returns</div>
          </div>
          <div className="mc-insight-value">
            <div className="label">PANELS</div>
            <div className="num">10</div>
          </div>
        </div>
        <div className="mc-insight-divider" />
        <div className="mc-insight-grid">
          <div>
            <div className="mc-insight-section-title">Allocation & Returns</div>
            <div className="mc-insight-text">
              Use Allocation Trend, Budget Split, and ROI Trend together to validate whether current mix translates into consistent returns over time.
            </div>
          </div>
          <div>
            <div className="mc-insight-section-title">Risk & Efficiency</div>
            <div className="mc-insight-text">
              Revenue vs Risk, Volatility Trend, and Efficiency bars reveal where upside is risk‑efficient, guiding targeted rebalancing decisions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
