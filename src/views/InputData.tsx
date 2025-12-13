import React, { useState } from "react";
import { runSimulation } from "../api/simulation";
import { runOptimization } from "../api/optimization";
import type { OptimizationRequest, SimulationRequest } from "../types/api";
import { uploadCSV } from "../api/ingestion";
import type { BatchUploadResponse } from "../types/api";
import { useAppState } from "../store/AppState";

export default function InputData({
  onResult,
}: {
  onResult: (r: {
    periodLabel: string;
    expected_profit: number;
    variance: number;
    policy: any[];
    value: number;
  }) => void;
}) {
  const { form, setForm, setCsvText } = useAppState();
  const { year, quarter, marketingRevenue, marketingSpend, rndRevenue, rndSpend, opsRevenue, opsSpend, budget, riskAversion } = form;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  async function handleRun() {
    setLoading(true);
    setError("");
    try {
      const periods = 1;
      const budgets = [budget];
      const simReq: SimulationRequest = {
        periods,
        budgets,
        num_simulations: 500,
        mean_profit: marketingRevenue + rndRevenue + opsRevenue - (marketingSpend + rndSpend + opsSpend),
        profit_std: 0.1 * Math.max(1, marketingRevenue + rndRevenue + opsRevenue),
        var_confidence: 0.95,
      };
      const sim = await runSimulation(simReq);

      const optReq: OptimizationRequest = {
        periods,
        budgets,
        projects: [
          { id: "marketing", expected_return: marketingRevenue, cost: marketingSpend, risk: 0.2 },
          { id: "rnd", expected_return: rndRevenue, cost: rndSpend, risk: 0.3 },
          { id: "ops", expected_return: opsRevenue, cost: opsSpend, risk: 0.25 },
        ],
        risk_aversion: riskAversion,
      };
      const opt = await runOptimization(optReq);

      onResult({
        periodLabel: `${year} ${quarter}`,
        expected_profit: sim.expected_profit,
        variance: sim.variance,
        policy: opt.policy,
        value: opt.value,
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
                const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
                if (lines.length > 1) {
                  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
                  const first = lines[1].split(",");
                  const asRecord: Record<string, string> = {};
                  headers.forEach((h, i) => (asRecord[h] = (first[i] ?? "").trim()));
                  const num = (k: string) => parseFloat(asRecord[k] ?? "0") || 0;
                  const yearStr = asRecord["year"] ?? "2024";
                  setForm({
                    year: parseInt(yearStr || "2024"),
                    quarter: (asRecord["quarter"] ?? asRecord["qtr"] ?? "Q1").toUpperCase(),
                    marketingRevenue: num("marketing_revenue"),
                    marketingSpend: num("marketing_spend"),
                    rndRevenue: num("rnd_revenue"),
                    rndSpend: num("rnd_spend"),
                    opsRevenue: num("ops_revenue"),
                    opsSpend: num("ops_spend"),
                    budget: num("budget"),
                  });
                  setCsvText(text);
                }
                const res: BatchUploadResponse = await uploadCSV(file);
                res.items.forEach((it) =>
                  onResult({
                    periodLabel: it.period_label,
                    expected_profit: it.expected_profit,
                    variance: it.variance,
                    policy: it.policy,
                    value: it.value,
                  })
                );
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
            <input className="input" value={year} onChange={(e) => setForm({ year: parseInt(e.target.value || "0") })} />
          </div>
          <div>
            <div className="page-subtitle">Quarter</div>
            <select className="input" value={quarter} onChange={(e) => setForm({ quarter: e.target.value })}>
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
              <input className="input input-with-prefix" value={marketingRevenue} onChange={(e) => setForm({ marketingRevenue: parseFloat(e.target.value || "0") })} />
            </div>
          </div>
          <div>
            <div className="page-subtitle">RND Revenue</div>
            <div className="field-with-prefix">
              <span className="prefix">Rp</span>
              <input className="input input-with-prefix" value={rndRevenue} onChange={(e) => setForm({ rndRevenue: parseFloat(e.target.value || "0") })} />
            </div>
          </div>
          <div>
            <div className="page-subtitle">OPS Revenue</div>
            <div className="field-with-prefix">
              <span className="prefix">Rp</span>
              <input className="input input-with-prefix" value={opsRevenue} onChange={(e) => setForm({ opsRevenue: parseFloat(e.target.value || "0") })} />
            </div>
          </div>
          <div>
            <div className="page-subtitle">Marketing Spend</div>
            <div className="field-with-prefix">
              <span className="prefix">Rp</span>
              <input className="input input-with-prefix" value={marketingSpend} onChange={(e) => setForm({ marketingSpend: parseFloat(e.target.value || "0") })} />
            </div>
          </div>
          <div>
            <div className="page-subtitle">RND Spend</div>
            <div className="field-with-prefix">
              <span className="prefix">Rp</span>
              <input className="input input-with-prefix" value={rndSpend} onChange={(e) => setForm({ rndSpend: parseFloat(e.target.value || "0") })} />
            </div>
          </div>
          <div>
            <div className="page-subtitle">OPS Spend</div>
            <div className="field-with-prefix">
              <span className="prefix">Rp</span>
              <input className="input input-with-prefix" value={opsSpend} onChange={(e) => setForm({ opsSpend: parseFloat(e.target.value || "0") })} />
            </div>
          </div>
          <div>
            <div className="page-subtitle">Budget</div>
            <div className="field-with-prefix">
              <span className="prefix">Rp</span>
              <input className="input input-with-prefix" value={budget} onChange={(e) => setForm({ budget: parseFloat(e.target.value || "0") })} />
            </div>
          </div>
          <div>
            <div className="page-subtitle">Risk Aversion</div>
            <input className="input" value={riskAversion} onChange={(e) => setForm({ riskAversion: parseFloat(e.target.value || "0") })} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button className="button-primary" onClick={handleRun} disabled={loading}>
            {loading ? "Running..." : "Run Simulation & Optimize"}
          </button>
        </div>
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
}
