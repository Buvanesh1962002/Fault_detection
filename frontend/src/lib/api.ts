import axios from "axios";

const envUrl = process.env.NEXT_PUBLIC_API_URL || "https://fault-detection-backend.onrender.com";
const API_BASE_URL = envUrl.endsWith("/api") ? envUrl : `${envUrl.replace(/\/$/, "")}/api`;

// ─────────────────────────────────────────────────────────────────────────────
// EXPERT MODE — Direct sensor telemetry
// ─────────────────────────────────────────────────────────────────────────────

export interface PredictionRequest {
  voltage: number;
  temperature: number;
  motor_speed: number;
  current: number;
  vibration: number;
  ambient_temperature: number;
  humidity: number;
}

export interface PredictionResponse {
  predicted_fault: "Normal" | "Warning" | "Worst Condition" | "Critical" | "Unknown";
  recommendation: string;
  confidence: number | null;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART MODE — User-friendly inputs with derived parameters
// ─────────────────────────────────────────────────────────────────────────────

export interface SmartPredictionRequest {
  vehicle_id: string;
  battery_soc: number;
  driving_mode: "eco" | "normal" | "sport";
  odometer_km: number;
  is_charging: boolean;
  latitude?: number | null;
  longitude?: number | null;
  ambient_temperature?: number | null;
  humidity?: number | null;
}

export interface DerivedParams {
  voltage: string;
  current: string;
  motor_speed: string;
  motor_temperature: string;
  vibration: string;
  ambient_temperature: string;
  humidity: string;
}

export interface DerivationNotes {
  vehicle: string;
  driving_mode: string;
  age_factor: string;
  soc_derating: string;
  data_source: string;
}

export interface SmartPredictionResponse extends PredictionResponse {
  derived_params?: DerivedParams;
  derivation_notes?: DerivationNotes;
  weather_source?: "auto" | "manual" | "default";
  mode?: "smart";
}

// ─────────────────────────────────────────────────────────────────────────────
// VEHICLE DATABASE
// ─────────────────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  display_name: string;
  category: "car" | "scooter" | "bike" | "bus";
  image_emoji: string;
  motor_type: string;
  max_power_kw: number;
}

export interface VehiclesResponse {
  vehicles: Vehicle[];
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API CLIENT
// ─────────────────────────────────────────────────────────────────────────────

export const api = {
  /** Expert Mode: Send raw sensor telemetry for prediction */
  predictFault: async (data: PredictionRequest): Promise<PredictionResponse> => {
    try {
      const response = await axios.post<PredictionResponse>(`${API_BASE_URL}/fault/predict`, data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error predicting fault:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        predicted_fault: "Unknown",
        recommendation: "Error occurred while fetching prediction.",
        confidence: null,
        error: errorMessage,
      };
    }
  },

  /** Smart Mode: Send user-friendly inputs for derived prediction */
  smartPredict: async (data: SmartPredictionRequest): Promise<SmartPredictionResponse> => {
    try {
      const response = await axios.post<SmartPredictionResponse>(
        `${API_BASE_URL}/fault/smart-predict`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error in smart prediction:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        predicted_fault: "Unknown",
        recommendation: "Error occurred while fetching prediction.",
        confidence: null,
        error: errorMessage,
      };
    }
  },

  /** Fetch list of supported EV vehicles */
  getVehicles: async (): Promise<Vehicle[]> => {
    try {
      const response = await axios.get<VehiclesResponse>(`${API_BASE_URL}/vehicles`);
      return response.data.vehicles;
    } catch (error: unknown) {
      console.error("Error fetching vehicles:", error);
      return [];
    }
  },
};
