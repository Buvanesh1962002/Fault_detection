"use client";

import { useState } from "react";
import { Hero } from "@/components/Hero";
import { PredictionForm } from "@/components/PredictionForm";
import { PredictionResult } from "@/components/PredictionResult";
import { api, PredictionRequest, PredictionResponse } from "@/lib/api";

export default function Home() {
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async (data: PredictionRequest) => {
    setIsLoading(true);
    // Add an artificial delay to show loading state nicely
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const response = await api.predictFault(data);
    setResult(response);
    setIsLoading(false);
    
    // Auto scroll to results if on mobile
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
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Live Health Analysis
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Enter your machine&apos;s current operational parameters to instantly diagnose potential faults.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 xl:col-span-8">
              <PredictionForm onSubmit={handlePredict} isLoading={isLoading} />
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
