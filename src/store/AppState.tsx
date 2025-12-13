import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { BatchItem } from "../types/api";
import type { HistoryItem } from "../views/CompareQuarters";

type FormState = {
  year: number;
  quarter: string;
  marketingRevenue: number;
  marketingSpend: number;
  rndRevenue: number;
  rndSpend: number;
  opsRevenue: number;
  opsSpend: number;
  budget: number;
  riskAversion: number;
};

type AppState = {
  csvText: string | null;
  setCsvText: (t: string | null) => void;
  form: FormState;
  setForm: (patch: Partial<FormState>) => void;
  history: HistoryItem[];
  addHistory: (item: HistoryItem) => void;
  setHistory: (items: HistoryItem[]) => void;
};

const defaultForm: FormState = {
  year: 2024,
  quarter: "Q1",
  marketingRevenue: 0,
  marketingSpend: 0,
  rndRevenue: 0,
  rndSpend: 0,
  opsRevenue: 0,
  opsSpend: 0,
  budget: 0,
  riskAversion: 0.5,
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [csvText, setCsvTextRaw] = useState<string | null>(null);
  const [form, setFormRaw] = useState<FormState>(defaultForm);
  const [history, setHistoryRaw] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const f = localStorage.getItem("app.form");
      const c = localStorage.getItem("app.csvText");
      const h = localStorage.getItem("app.history");
      if (f) setFormRaw(JSON.parse(f));
      if (c) setCsvTextRaw(c);
      if (h) setHistoryRaw(JSON.parse(h));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("app.form", JSON.stringify(form));
    } catch {}
  }, [form]);

  useEffect(() => {
    try {
      localStorage.setItem("app.csvText", csvText ?? "");
    } catch {}
  }, [csvText]);

  useEffect(() => {
    try {
      localStorage.setItem("app.history", JSON.stringify(history));
    } catch {}
  }, [history]);

  const setForm = (patch: Partial<FormState>) => setFormRaw((prev) => ({ ...prev, ...patch }));
  const setCsvText = (t: string | null) => setCsvTextRaw(t);
  const addHistory = (item: HistoryItem) => setHistoryRaw((prev) => [...prev, item]);
  const setHistory = (items: HistoryItem[]) => setHistoryRaw(items);

  const value = useMemo<AppState>(
    () => ({ csvText, setCsvText, form, setForm, history, addHistory, setHistory }),
    [csvText, form, history]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("AppStateProvider missing");
  return ctx;
}

