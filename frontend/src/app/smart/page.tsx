"use client";

import { useState } from "react";
import { SmartPredictionForm } from "@/components/features/smart/SmartPredictionForm";
import { PredictionResult } from "@/components/features/results/PredictionResult";
import { api, SmartPredictionRequest, SmartPredictionResponse } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Brain, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SmartPage() {
  const [result, setResult] = useState<SmartPredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSmartPredict = async (data: SmartPredictionRequest) => {
    setIsLoading(true);
    toast.info("Analyzing EV Health", "Deriving technical features & evaluating ML classifier...");

    const response = await api.smartPredict(data);
    setResult(response);
    setIsLoading(false);

    if (response.error) {
      toast.error("Prediction Failed", response.error);
    } else {
      toast.success(
        `Health Analysis Complete: ${response.predicted_fault}`,
        `Model confidence: ${( (response.confidence || 0) * 100).toFixed(1)}%`
      );
    }

    // Smooth scroll on mobile screens
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById("smart-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen py-10 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header Breadcrumb & Title */}
        <div className="mb-8 space-y-3">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Smart Mode Diagnosis</h1>
              <p className="text-sm text-muted-foreground">
                No complex telemetry required — select your vehicle profile and driving state to derive ML parameters.
              </p>
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            <SmartPredictionForm onSubmit={handleSmartPredict} isLoading={isLoading} />
          </div>
          <div id="smart-result" className="lg:col-span-5 xl:col-span-4 h-full lg:sticky lg:top-24">
            <PredictionResult result={result} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
