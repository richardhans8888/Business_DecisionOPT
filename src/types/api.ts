export interface ProjectInput {
  id: string;
  expected_return: number;
  cost: number;
  risk: number;
}

export interface OptimizationRequest {
  periods: number;
  budgets: number[];
  projects: ProjectInput[];
  risk_aversion: number;
}

export interface OptimizationResponse {
  policy: any[];
  value: number;
}

export interface SimulationRequest {
  periods: number;
  budgets: number[];
  num_simulations: number;
  mean_profit: number;
  profit_std: number;
  var_confidence?: number;
}

export interface SimulationResponse {
  expected_profit: number;
  variance: number;
  metrics: Record<string, number>;
}

export interface EvaluationRequest {
  expected_profit: number;
  variance: number;
  risk_aversion: number;
}

export interface EvaluationResponse {
  score: number;
}

export interface BatchItem {
  period_label: string;
  expected_profit: number;
  variance: number;
  metrics: Record<string, number>;
  policy: any[];
  value: number;
  explain?: Record<string, any>;
}

export interface BatchUploadResponse {
  items: BatchItem[];
}

export interface BestChoiceRequest {
  Marketing_Revenue: number;
  RnD_Revenue: number;
  Ops_Revenue: number;
  Marketing_Spend: number;
  RnD_Spend: number;
  Ops_Spend: number;
  Budget: number;
}

export interface BestChoiceResponse {
  policy: number[];
  value: number;
  expected_profit: number;
  variance: number;
  explain?: Record<string, any>;
}
