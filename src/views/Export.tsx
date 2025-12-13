import React from "react";
import { useAppState } from "../store/AppState";

export default function Export() {
  const { history, csvText } = useAppState() as any;

  function exportHistoryCSV() {
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
    history.forEach((h: any) => {
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

  function exportOriginalCSV() {
    if (!csvText) return;
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `original_upload_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page">
      <div className="mc-hero-insight">
        <div className="mc-insight-header">
          <div>
            <div className="mc-insight-title">Export</div>
            <div className="mc-insight-sub">Download processed results or the original upload</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="button-accent" onClick={exportHistoryCSV}>Export Results CSV</button>
          <button className="button-accent" onClick={exportOriginalCSV} disabled={!csvText}>Export Original CSV</button>
        </div>
      </div>
    </div>
  );
}

