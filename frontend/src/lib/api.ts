import axios from "axios";

const envUrl = process.env.NEXT_PUBLIC_API_URL || "https://fault-detection-backend.onrender.com";
const API_BASE_URL = envUrl.endsWith("/api") ? envUrl : `${envUrl.replace(/\/$/, "")}/api`;

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

export const api = {
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
};
