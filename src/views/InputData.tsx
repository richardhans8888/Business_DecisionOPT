import React, { useEffect, useMemo, useState } from "react";
import { bestChoice } from "../api/optimization";
import type { BestChoiceRequest } from "../types/api";
import { uploadCSV } from "../api/ingestion";
import type { BatchUploadResponse } from "../types/api";
import { useAppState } from "../store/AppState";
import { parseCsvFile, parseCsvText, type CanonicalRow } from "../utils/parseCsv";

export default function InputData({
  onResult,
}: {
  onResult: (r: {
    periodLabel: string;
    expected_profit: number;
    variance: number;
    policy: any[];
    value: number;
    explain?: Record<string, any>;
  }) => void;
}) {
  const { form, setForm, setCsvText, csvText, history, setHistory } = useAppState() as any;
  const { year, quarter, marketingRevenue, marketingSpend, rndRevenue, rndSpend, opsRevenue, opsSpend, budget, riskAversion } = form;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [rows, setRows] = useState<Array<Record<string, string | number>>>([]);
  const headers = useMemo(() => ["year","quarter","marketing_revenue","marketing_spend","rnd_revenue","rnd_spend","ops_revenue","ops_spend","budget"], []);

  function normalizeHeader(h: string) {
    return h
      .toLowerCase()
      .replace(/\(.*?\)/g, "")
      .replace(/&/g, "nd")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }
  function canonicalKey(h: string) {
    const n = normalizeHeader(h);
    const map: Record<string, string> = {
      quarter: "quarter",
      q: "quarter",
      qtr: "quarter",
      year: "year",
      budget: "budget",
      budget_idr: "budget",
      total_budget: "budget",
      marketing_spend: "marketing_spend",
      marketing_cost: "marketing_spend",
      marketing_expense: "marketing_spend",
      rnd_spend: "rnd_spend",
      rnd_cost: "rnd_spend",
      rnd_expense: "rnd_spend",
      rnd_nd_spend: "rnd_spend",
      rnd: "rnd_spend",
      rnd_revenue: "rnd_revenue",
      rnd_rev: "rnd_revenue",
      rnd_income: "rnd_revenue",
      rnd_sales: "rnd_revenue",
      rdn_revenue: "rnd_revenue",
      rnd_nd_revenue: "rnd_revenue",
      marketing_revenue: "marketing_revenue",
      marketing_rev: "marketing_revenue",
      marketing_income: "marketing_revenue",
      marketing_sales: "marketing_revenue",
      ops_spend: "ops_spend",
      operations_spend: "ops_spend",
      ops_revenue: "ops_revenue",
      ops_rev: "ops_revenue",
      operations_revenue: "ops_revenue",
    };
    return map[n] ?? n;
  }
  function parseIDR(v: any) {
    const s = String(v ?? "").trim();
    const cleaned = s.replace(/[^\d.-]/g, "");
    if (!cleaned) return 0;
    const n = parseFloat(cleaned);
    return isFinite(n) ? n : 0;
  }
  function toQuarter(v: any) {
    const s = String(v ?? "").trim().toUpperCase();
    if (/^Q[1-4]$/.test(s)) return s;
    const num = parseInt(s || "1");
    const q = Math.min(4, Math.max(1, isFinite(num) ? num : 1));
    return `Q${q}`;
  }

  useEffect(() => {
    if (!csvText) {
      setRows([]);
      return;
    }
    const parsed = parseCsvText(String(csvText));
    if (parsed.missing.length) {
      setError(`Missing required columns: ${parsed.missing.join(", ")}. Detected headers: ${parsed.headers.join(", ")}`);
      setRows([]);
      return;
    }
    setRows(parsed.rows as any);
  }, [csvText]);

  function serializeRows(rws: Array<Record<string,string|number>>) {
    const lines = [headers.join(",")];
    rws.forEach((r) => {
      lines.push(headers.map((h) => String(r[h] ?? "")).join(","));
    });
    return lines.join("\n");
  }
  function fmtShort(v: any) {
    const n = parseFloat(String(v || "0"));
    if (!isFinite(n) || n === 0) return "-";
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} Billion`;
    if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} Million`;
    if (abs >= 1_000) return `${(n / 1_000).toFixed(1)} Thousand`;
    return `${n.toFixed(0)}`;
  }

  async function handleRun() {
    setLoading(true);
    setError("");
    try {
      const req: BestChoiceRequest = {
        Marketing_Revenue: marketingRevenue,
        RnD_Revenue: rndRevenue,
        Ops_Revenue: opsRevenue,
        Marketing_Spend: marketingSpend,
        RnD_Spend: rndSpend,
        Ops_Spend: opsSpend,
        Budget: budget,
      };
      const opt = await bestChoice(req);
      onResult({
        periodLabel: `${year} ${quarter}`,
        expected_profit: opt.expected_profit,
        variance: opt.variance,
        policy: opt.policy,
        value: opt.value,
        explain: opt.explain,
      });
    } catch (e: any) {
      setError(e?.message || "Failed to run");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-title">Financial Input</div>
      <div className="page-subtitle">Configure parameters in IDR.</div>
      <div className="card">
        <div className="card-header">
          <div>Import Data</div>
          <button className="button-accent" disabled>FAST FILL</button>
        </div>
        <div className="upload-area">
          <input
            type="file"
            accept=".csv"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              setError("");
              try {
                const text = await file.text();
                const parsed = await parseCsvFile(file);
                if (parsed.missing.length) {
                  setError(`Missing required columns: ${parsed.missing.join(", ")}. Detected headers: ${parsed.headers.join(", ")}`);
                  setUploading(false);
                  return;
                }
                const rowsParsed = parsed.rows;
                setRows(rowsParsed as any);
                setCsvText(text);
                if (rowsParsed.length > 0) {
                  const r0: CanonicalRow = rowsParsed[0];
                  setForm({
                    year: r0.year || 2024,
                    quarter: r0.quarter || "Q1",
                    marketingRevenue: r0.marketing_revenue || 0,
                    marketingSpend: r0.marketing_spend || 0,
                    rndRevenue: r0.rnd_revenue || 0,
                    rndSpend: r0.rnd_spend || 0,
                    opsRevenue: r0.ops_revenue || 0,
                    opsSpend: r0.ops_spend || 0,
                    budget: r0.budget || 0,
                  });
                }
                try {
                  const res: BatchUploadResponse = await uploadCSV(file);
                  res.items.forEach((it) =>
                    onResult({
                      periodLabel: it.period_label,
                      expected_profit: it.expected_profit,
                      variance: it.variance,
                      policy: it.policy,
                      value: it.value,
                      explain: it.explain,
                    })
                  );
                } catch {
                  rowsParsed.forEach((r) => {
                    const totalSpend = (r.marketing_spend || 0) + (r.rnd_spend || 0) + (r.ops_spend || 0);
                    const avgRevenue = (r.marketing_revenue || 0) + (r.rnd_revenue || 0) + (r.ops_revenue || 0);
                    const expectedProfit = avgRevenue - totalSpend;
                    const policy = [r.marketing_spend || 0, r.rnd_spend || 0, r.ops_spend || 0];
                    const variance = Math.abs(expectedProfit) * 0.1;
                    onResult({
                      periodLabel: `${r.year} ${r.quarter}`,
                      expected_profit: expectedProfit,
                      variance,
                      policy,
                      value: expectedProfit,
                      explain: {
                        budget: r.budget || totalSpend,
                        total_spend: totalSpend,
                        avg_revenue: avgRevenue,
                        expected: {
                          Marketing_Revenue: r.marketing_revenue || 0,
                          RnD_Revenue: r.rnd_revenue || 0,
                          Ops_Revenue: r.ops_revenue || 0,
                        },
                        risk: {
                          Marketing_Revenue: (r.marketing_revenue || 0) * 0.15,
                          RnD_Revenue: (r.rnd_revenue || 0) * 0.15,
                          Ops_Revenue: (r.ops_revenue || 0) * 0.15,
                        },
                      },
                    });
                  });
                  setError("");
                }
              } catch (err: any) {
                setError(err?.message || "Upload failed");
              } finally {
                setUploading(false);
              }
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <div className="page-subtitle">Ready to process 12 quarters at once?</div>
          <button className="button-accent" disabled={uploading}>{uploading ? "Processing..." : "Run Batch Analysis 🚀"}</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div>Manual Data Entry</div>
        </div>
        <div className="input-grid" style={{ marginBottom: 16 }}>
          <div>
            <div className="page-subtitle">Year</div>
            <input className="input" value={year} onChange={(e) => setForm({ year: parseInt(e.target.value || "0") })} disabled={!!csvText} />
          </div>
          <div>
            <div className="page-subtitle">Quarter</div>
            <select className="input" value={quarter} onChange={(e) => setForm({ quarter: e.target.value })} disabled={!!csvText}>
              <option>Q1</option>
              <option>Q2</option>
              <option>Q3</option>
              <option>Q4</option>
            </select>
          </div>
        </div>
        <div className="input-grid">
          <div>
            <div className="page-subtitle">Marketing Revenue</div>
            <div className="field-with-prefix">
              <span className="prefix">Rp</span>
              <input className="input input-with-prefix" value={marketingRevenue} onChange={(e) => setForm({ marketingRevenue: parseFloat(e.target.value || "0") })} disabled={!!csvText} />
            </div>
          </div>
          <div>
            <div className="page-subtitle">RND Revenue</div>
            <div className="field-with-prefix">
              <span className="prefix">Rp</span>
              <input className="input input-with-prefix" value={rndRevenue} onChange={(e) => setForm({ rndRevenue: parseFloat(e.target.value || "0") })} disabled={!!csvText} />
            </div>
          </div>
          <div>
            <div className="page-subtitle">OPS Revenue</div>
            <div className="field-with-prefix">
              <span className="prefix">Rp</span>
              <input className="input input-with-prefix" value={opsRevenue} onChange={(e) => setForm({ opsRevenue: parseFloat(e.target.value || "0") })} disabled={!!csvText} />
            </div>
          </div>
          <div>
            <div className="page-subtitle">Marketing Spend</div>
            <div className="field-with-prefix">
              <span className="prefix">Rp</span>
              <input className="input input-with-prefix" value={marketingSpend} onChange={(e) => setForm({ marketingSpend: parseFloat(e.target.value || "0") })} disabled={!!csvText} />
            </div>
          </div>
          <div>
            <div className="page-subtitle">RND Spend</div>
            <div className="field-with-prefix">
              <span className="prefix">Rp</span>
              <input className="input input-with-prefix" value={rndSpend} onChange={(e) => setForm({ rndSpend: parseFloat(e.target.value || "0") })} disabled={!!csvText} />
            </div>
          </div>
          <div>
            <div className="page-subtitle">OPS Spend</div>
            <div className="field-with-prefix">
              <span className="prefix">Rp</span>
              <input className="input input-with-prefix" value={opsSpend} onChange={(e) => setForm({ opsSpend: parseFloat(e.target.value || "0") })} disabled={!!csvText} />
            </div>
          </div>
          <div>
            <div className="page-subtitle">Budget</div>
            <div className="field-with-prefix">
              <span className="prefix">Rp</span>
              <input className="input input-with-prefix" value={budget} onChange={(e) => setForm({ budget: parseFloat(e.target.value || "0") })} disabled={!!csvText} />
            </div>
          </div>
          <div>
            <div className="page-subtitle">Risk Aversion</div>
            <input className="input" value={riskAversion} onChange={(e) => setForm({ riskAversion: parseFloat(e.target.value || "0") })} disabled={!!csvText} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button className="button-primary" onClick={handleRun} disabled={loading || !!csvText}>
            {csvText ? "Manual Entry Disabled (CSV Loaded)" : loading ? "Running..." : "Run Simulation & Optimize"}
          </button>
        </div>
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      </div>
      {rows.length > 0 && (
        <div className="card fade-in">
          <div className="card-header">
            <div>Uploaded Data</div>
            <div className="page-subtitle">Editable table. Recompute to update results.</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                {headers.map((h) => <th key={h}>{h.replace(/_/g," ").toUpperCase()}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  <td><input value={String(r.year ?? "")} onChange={(e) => {
                    const next = [...rows]; next[idx] = { ...next[idx], year: e.target.value }; setRows(next);
                  }} /></td>
                  <td>
                    <select value={String(r.quarter ?? "Q1")} onChange={(e) => {
                      const next = [...rows]; next[idx] = { ...next[idx], quarter: e.target.value }; setRows(next);
                    }}>
                      <option>Q1</option><option>Q2</option><option>Q3</option><option>Q4</option>
                    </select>
                  </td>
                  {["marketing_revenue","marketing_spend","rnd_revenue","rnd_spend","ops_revenue","ops_spend","budget"].map((k) => (
                    <td key={k}>
                      <input value={String(r[k] ?? "")} onChange={(e) => {
                      const next = [...rows]; next[idx] = { ...next[idx], [k]: e.target.value }; setRows(next);
                    }} />
                      <div className="value-hint">{fmtShort(r[k])}</div>
                    </td>
                  ))}
                  <td className="row-actions">
                    <button className="button-accent" onClick={async () => {
                      const breq: BestChoiceRequest = {
                        Marketing_Revenue: parseFloat(String(r.marketing_revenue || "0")) || 0,
                        RnD_Revenue: parseFloat(String(r.rnd_revenue || "0")) || 0,
                        Ops_Revenue: parseFloat(String(r.ops_revenue || "0")) || 0,
                        Marketing_Spend: parseFloat(String(r.marketing_spend || "0")) || 0,
                        RnD_Spend: parseFloat(String(r.rnd_spend || "0")) || 0,
                        Ops_Spend: parseFloat(String(r.ops_spend || "0")) || 0,
                        Budget: parseFloat(String(r.budget || "0")) || 0,
                      };
                      const opt = await bestChoice(breq);
                      const label = `${r.year} ${String(r.quarter).toUpperCase()}`;
                      const updated = history.map((h: any) => h.periodLabel === label ? ({
                        periodLabel: label,
                        expected_profit: opt.expected_profit,
                        variance: opt.variance,
                        policy: opt.policy,
                        value: opt.value,
                        explain: opt.explain,
                      }) : h);
                      setHistory(updated);
                      setCsvText(serializeRows(rows));
                    }}>Recompute</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
