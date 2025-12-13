import React from "react";
import { useAppState } from "../store/AppState";

function toMil(v: number) {
  return `${(v / 1_000_000_000).toFixed(1)} Miliar`;
}
function pct(v: number) {
  return `${(v * 100).toFixed(0)}%`;
}

export default function History() {
  const { history } = useAppState();
  const total = history.length;

  function exportCSV() {
    const headers = [
      "period",
      "expected_profit",
      "variance",
      "value",
      "policy_mkt",
      "policy_rnd",
      "policy_ops",
      "budget",
      "avg_revenue",
      "total_spend",
      "net_profit",
    ];
    const lines = [headers.join(",")];
    history.forEach((h) => {
      const p = Array.isArray(h.policy) ? h.policy : [0, 0, 0];
      const ex = h.explain || {};
      const row = [
        h.periodLabel,
        String(h.expected_profit ?? ""),
        String(h.variance ?? ""),
        String(h.value ?? ""),
        String(p[0] ?? ""),
        String(p[1] ?? ""),
        String(p[2] ?? ""),
        String(ex.budget ?? ""),
        String(ex.avg_revenue ?? ""),
        String(ex.total_spend ?? ""),
        String(ex.net_profit ?? h.expected_profit ?? ""),
      ];
      lines.push(row.join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `history_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page">
      <div className="mc-hero-insight">
        <div className="mc-insight-header">
          <div>
            <div className="mc-insight-title">History</div>
            <div className="mc-insight-sub">Processed quarters and results</div>
          </div>
          <div className="mc-insight-value">
            <div className="label">ENTRIES</div>
            <div className="num">{total}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="button-accent" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>
      <div className="card fade-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Expected Profit</th>
              <th>Variance</th>
              <th>Budget</th>
              <th>Avg Revenue</th>
              <th>ROI</th>
              <th>Marketing</th>
              <th>R&D</th>
              <th>Ops</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => {
              const ex = h.explain || {};
              const b = Number(ex.budget || 0) || 1;
              const roi = ((Number(ex.avg_revenue || 0) / b) * 100).toFixed(1);
              const p = Array.isArray(h.policy) ? h.policy : [0, 0, 0];
              const sum = (p[0]||0) + (p[1]||0) + (p[2]||0) || 1;
              return (
                <tr key={i}>
                  <td>{h.periodLabel}</td>
                  <td>{toMil(Number(h.expected_profit || 0))}</td>
                  <td>{toMil(Number(h.variance || 0))}</td>
                  <td>{toMil(Number(ex.budget || 0))}</td>
                  <td>{toMil(Number(ex.avg_revenue || 0))}</td>
                  <td>{roi}%</td>
                  <td>{pct((p[0]||0)/sum)}</td>
                  <td>{pct((p[1]||0)/sum)}</td>
                  <td>{pct((p[2]||0)/sum)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

