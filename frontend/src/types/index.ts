export interface DemandRequest {
  entity_id: string;
  target_date: string; // YYYY-MM-DD
  capacity: number;
  base_price: number;
  is_holiday?: boolean;
  context?: Record<string, any>;
}

export interface PricingResponse {
  target_date: string;
  predicted_demand: number;
  occupancy_ratio: number;
  recommended_price: number;
  confidence: "high" | "medium" | "low";
  explanation: string[];
}

export interface PricingLog {
  id: number;
  target_date: string;
  base_price: number;
  capacity: number;
  predicted_demand: number;
  occupancy_ratio: number;
  recommended_price: number;
  confidence: "high" | "medium" | "low";
  explanation: string[];
  timestamp: string;
}

export interface DashboardStats {
  status: string;
  message: string;
}
