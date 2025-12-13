import React from "react";
import Layout from "./components/Layout";
import "./index.css";
import { AppStateProvider } from "./store/AppState";

export default function App() {
  return (
    <AppStateProvider>
      <Layout />
    </AppStateProvider>
  );
}
