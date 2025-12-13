import type { OptimizationRequest, OptimizationResponse } from "../types/api";
import { apiFetch } from "./client";

export function runOptimization(req: OptimizationRequest): Promise<OptimizationResponse> {
  return apiFetch<OptimizationResponse>("/optimization/run", {
    method: "POST",
    body: JSON.stringify(req),
  });
}
