import React from "react";
import { useAppState } from "../store/AppState";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { MCTheme } from "../theme/chartTheme";

function idrTick(v: number) {
  const b = v / 1_000_000_000;
  if (b >= 1) return `${b.toFixed(1)} Miliar`;
  const k = v / 1_000;
  if (k >= 1) return `${k.toFixed(0)} Ribu`;
  return `Rp ${v.toFixed(0)}`;
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

  return (
    <div className="page">
      <div className="page-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="page-title">Visuals</div>
        <div className="pill"><span className="dot" />Synced</div>
      </div>
      <div className="grid-two">
        <div className="card">
          <div className="card-header">
            <div>Projected Revenue vs. Risk</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Green: Expected | Red: Risk</div>
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
    </div>
  );
}
