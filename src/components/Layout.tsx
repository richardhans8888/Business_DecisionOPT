import React, { useState } from "react";
import Sidebar from "./Sidebar";
import InputData from "../views/InputData";
import CompareQuarters from "../views/CompareQuarters";
import CompareQuartersCharts from "../views/CompareQuartersCharts";
import type { HistoryItem } from "../views/CompareQuarters";
import { useAppState } from "../store/AppState";

type View =
  | "Input Data"
  | "Analysis"
  | "Strategy"
  | "Visuals"
  | "Compare Quarters"
  | "History"
  | "Export";

export default function Layout() {
  const [view, setView] = useState<View>("Input Data");
  const { history, addHistory } = useAppState();

  function addResult(r: HistoryItem) {
    addHistory(r);
  }

  return (
    <div className="layout">
      <Sidebar current={view} onSelect={setView} />
      <div className="content">
        {view === "Input Data" && <InputData onResult={addResult} />}
        {view === "Compare Quarters" && <CompareQuartersCharts history={history} />}
        {view !== "Input Data" && view !== "Compare Quarters" && (
          <div className="page">Coming soon</div>
        )}
      </div>
    </div>
  );
}
