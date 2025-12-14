import Papa from "papaparse";

export type CanonicalRow = {
  year: number;
  quarter: string;
  budget: number;
  marketing_spend: number;
  rnd_spend: number;
  ops_spend: number;
  marketing_revenue: number;
  rnd_revenue: number;
  ops_revenue: number;
};

const REQUIRED_FIELDS = [
  "year",
  "quarter",
  "budget",
  "marketing_spend",
  "rnd_spend",
  "ops_spend",
  "marketing_revenue",
  "rnd_revenue",
  "ops_revenue",
] as const;

function stripBOM(s: string) {
  return s.replace(/^\uFEFF/, "");
}

function normalizeHeader(h: string) {
  const s = stripBOM(h).trim().replace(/^['"]|['"]$/g, "");
  return s
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
    qtr_no: "quarter",
    year: "year",
    budget: "budget",
    budget_idr: "budget",
    total_budget: "budget",
    marketing_spend: "marketing_spend",
    marketing_cost: "marketing_spend",
    marketing_expense: "marketing_spend",
    marketing_outlay: "marketing_spend",
    rnd_spend: "rnd_spend",
    rndd_spend: "rnd_spend",
    r_d_spend: "rnd_spend",
    r_d_cost: "rnd_spend",
    rnd_cost: "rnd_spend",
    rnd_expense: "rnd_spend",
    ops_spend: "ops_spend",
    operations_spend: "ops_spend",
    operations_cost: "ops_spend",
    operations_expense: "ops_spend",
    marketing_revenue: "marketing_revenue",
    marketing_rev: "marketing_revenue",
    marketing_income: "marketing_revenue",
    marketing_sales: "marketing_revenue",
    rnd_revenue: "rnd_revenue",
    rndd_revenue: "rnd_revenue",
    rndd_rev: "rnd_revenue",
    r_d_revenue: "rnd_revenue",
    rnd_rev: "rnd_revenue",
    rnd_income: "rnd_revenue",
    rnd_sales: "rnd_revenue",
    ops_revenue: "ops_revenue",
    operations_revenue: "ops_revenue",
    ops_rev: "ops_revenue",
    ops_income: "ops_revenue",
    ops_sales: "ops_revenue",
  };
  return map[n] ?? n;
}

function parseIDR(v: any) {
  if (typeof v === "number") return v;
  const s = String(v ?? "").trim();
  if (!s) return 0;
  const cleaned = s.replace(/[^\d.-]/g, "");
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

function rowToCanonical(obj: Record<string, any>): CanonicalRow {
  return {
    year: parseInt(String(obj["year"] ?? "0")) || 0,
    quarter: toQuarter(obj["quarter"]),
    budget: parseIDR(obj["budget"]),
    marketing_spend: parseIDR(obj["marketing_spend"]),
    rnd_spend: parseIDR(obj["rnd_spend"]),
    ops_spend: parseIDR(obj["ops_spend"]),
    marketing_revenue: parseIDR(obj["marketing_revenue"]),
    rnd_revenue: parseIDR(obj["rnd_revenue"]),
    ops_revenue: parseIDR(obj["ops_revenue"]),
  };
}

export function parseCsvFile(file: File): Promise<{ rows: CanonicalRow[]; headers: string[]; missing: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file as any, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (h: string) => canonicalKey(h),
      complete: (res: any) => {
        const headers = (res.meta?.fields ?? []).map((f: string) => canonicalKey(f));
        const missing = REQUIRED_FIELDS.filter((f) => !headers.includes(f));
        const rows = (res.data as Record<string, any>[])
          .filter((r) => Object.keys(r).length > 0)
          .map((r) => {
            const canonObj: Record<string, any> = {};
            Object.keys(r).forEach((k) => {
              const ck = canonicalKey(k);
              canonObj[ck] = r[k];
            });
            return rowToCanonical(canonObj);
          });
        resolve({ rows, headers, missing });
      },
      error: (err: any) => reject(err),
    });
  });
}

export function parseCsvText(text: string): { rows: CanonicalRow[]; headers: string[]; missing: string[] } {
  const res: any = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    transformHeader: (h: string) => canonicalKey(h),
  });
  const headers = (res.meta?.fields ?? []).map((f: string) => canonicalKey(f));
  const missing = REQUIRED_FIELDS.filter((f) => !headers.includes(f));
  const rows = (res.data as Record<string, any>[])
    .filter((r) => Object.keys(r).length > 0)
    .map((r) => {
      const canonObj: Record<string, any> = {};
      Object.keys(r).forEach((k) => {
        const ck = canonicalKey(k);
        canonObj[ck] = r[k];
      });
      return rowToCanonical(canonObj);
    });
  return { rows, headers, missing };
}
