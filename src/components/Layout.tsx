import React, { useState } from "react";
import Sidebar from "./Sidebar";
import InputData from "../views/InputData";
import CompareQuartersCharts from "../views/CompareQuartersCharts";
import Analysis from "../views/Analysis";
import Strategy from "../views/Strategy";
import Visuals from "../views/Visuals";
import History from "../views/History";
import Export from "../views/Export";
import type { HistoryItem } from "../views/CompareQuartersCharts";
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
        {view === "Analysis" && <Analysis />}
        {view === "Strategy" && <Strategy />}
        {view === "Visuals" && <Visuals />}
        {view === "Compare Quarters" && <CompareQuartersCharts history={history} />}
        {view === "History" && <History />}
        {view === "Export" && <Export />}
        {view !== "Input Data" && view !== "Compare Quarters" && view !== "Analysis" && view !== "Strategy" && view !== "Visuals" && view !== "History" && view !== "Export" && (
          <div className="page">Coming soon</div>
        )}
      </div>
    </div>
  );
}
