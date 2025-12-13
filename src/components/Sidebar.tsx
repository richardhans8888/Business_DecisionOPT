import React from "react";

type View =
  | "Input Data"
  | "Analysis"
  | "Strategy"
  | "Visuals"
  | "Compare Quarters"
  | "History"
  | "Export";

export default function Sidebar({
  current,
  onSelect,
}: {
  current: View;
  onSelect: (v: View) => void;
}) {
  const items: { view: View; icon: string }[] = [
    { view: "Input Data", icon: "📥" },
    { view: "Analysis", icon: "📊" },
    { view: "Strategy", icon: "🧠" },
    { view: "Visuals", icon: "📈" },
    { view: "Compare Quarters", icon: "↔️" },
    { view: "History", icon: "🕒" },
    { view: "Export", icon: "📁" },
  ];
  return (
    <div className="sidebar">
      <div className="brand"><span>Decision</span><span className="blue">Opt</span></div>
      <div className="sidebar-subtitle">IDR Enterprise Edition</div>
      <div className="sidebar-section">FUNCTIONS</div>
      {items.slice(0, 5).map((item) => (
        <button
          key={item.view}
          onClick={() => onSelect(item.view)}
          className={`sidebar-item ${current === item.view ? "active" : ""}`}
        >
          <span className="dot" />
          <span className="icon">{item.icon}</span>
          {item.view}
        </button>
      ))}
      <div className="sidebar-section">SYSTEM</div>
      {items.slice(5).map((item) => (
        <button
          key={item.view}
          onClick={() => onSelect(item.view)}
          className={`sidebar-item ${current === item.view ? "active" : ""}`}
        >
          <span className="dot" />
          <span className="icon">{item.icon}</span>
          {item.view}
        </button>
      ))}
    </div>
  );
}
