import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

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
