import type { OptimizationRequest, OptimizationResponse, BestChoiceRequest, BestChoiceResponse } from "../types/api";
import { apiFetch } from "./client";

export function runOptimization(req: OptimizationRequest): Promise<OptimizationResponse> {
  return apiFetch<OptimizationResponse>("/optimization/run", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export function bestChoice(req: BestChoiceRequest): Promise<BestChoiceResponse> {
  return apiFetch<BestChoiceResponse>("/optimization/best_choice", {
    method: "POST",
    body: JSON.stringify(req),
  });
}
