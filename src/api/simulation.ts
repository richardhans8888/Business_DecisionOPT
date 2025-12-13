import type { SimulationRequest, SimulationResponse, EvaluationRequest, EvaluationResponse } from "../types/api";
import { apiFetch } from "./client";

export function runSimulation(req: SimulationRequest): Promise<SimulationResponse> {
  return apiFetch<SimulationResponse>("/simulation/run", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export function evaluateRisk(req: EvaluationRequest): Promise<EvaluationResponse> {
  return apiFetch<EvaluationResponse>("/evaluation/score", {
    method: "POST",
    body: JSON.stringify(req),
  });
}
