"use client";

import { useState } from "react";
import { Hero } from "@/components/Hero";
import { PredictionForm } from "@/components/PredictionForm";
import { SmartPredictionForm } from "@/components/SmartPredictionForm";
import { PredictionResult } from "@/components/PredictionResult";
import {
  api,
  PredictionRequest,
  SmartPredictionRequest,
  SmartPredictionResponse,
} from "@/lib/api";
import { Brain, Wrench } from "lucide-react";

type Mode = "smart" | "expert";

export default function Home() {
  const [mode, setMode] = useState<Mode>("smart");
  const [result, setResult] = useState<SmartPredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExpertPredict = async (data: PredictionRequest) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const response = await api.predictFault(data);
    setResult(response);
    setIsLoading(false);

    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById("prediction-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleSmartPredict = async (data: SmartPredictionRequest) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const response = await api.smartPredict(data);
    setResult(response);
    setIsLoading(false);

    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById("prediction-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      <section id="predict" className="w-full py-12 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Section Header */}
          <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Live Health Analysis
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              {mode === "smart"
                ? "Select your vehicle and driving conditions — we'll compute the technical parameters for you."
                : "Enter your machine\u0027s current operational parameters to instantly diagnose potential faults."}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-xl border border-border/60 bg-card/50 p-1 shadow-sm backdrop-blur-sm">
              <button
                type="button"
                onClick={() => { setMode("smart"); setResult(null); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === "smart"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Brain className="h-4 w-4" />
                Smart Mode
              </button>
              <button
                type="button"
                onClick={() => { setMode("expert"); setResult(null); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === "expert"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wrench className="h-4 w-4" />
                Expert Mode
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 xl:col-span-8">
              {mode === "smart" ? (
                <SmartPredictionForm onSubmit={handleSmartPredict} isLoading={isLoading} />
              ) : (
                <PredictionForm onSubmit={handleExpertPredict} isLoading={isLoading} />
              )}
            </div>
            <div id="prediction-result" className="lg:col-span-5 xl:col-span-4 h-full lg:sticky lg:top-24">
              <PredictionResult result={result} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
