"use client";

import { useState } from "react";
import { SmartPredictionResponse } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Info, XCircle, ChevronDown, ChevronUp, Brain, Wrench } from "lucide-react";

interface PredictionResultProps {
  result: SmartPredictionResponse | null;
  isLoading: boolean;
}

const detailedRecommendations: Record<string, string> = {
  "Normal": "• System parameters are operating within safe nominal limits.\n• Continue standard monitoring routines and maintain regular inspection schedules.\n• No immediate mechanical intervention required.",
  "Warning": "• Minor telemetry anomalies detected across operating features.\n• Schedule routine maintenance inspection soon to prevent potential component degradation.\n• Check motor temperature and vibration logs closely over the next 24 hours.",
  "Worst Condition": "• Severe operating deviations detected nearing component stress limits.\n• Immediate physical inspection and corrective maintenance required to avoid structural failure.\n• Reduce operating load immediately and inspect cooling/lubrication systems.",
  "Critical": "• Critical fault thresholds exceeded with immediate risk of motor burnout or mechanical failure.\n• Initiate emergency system shutdown immediately and perform complete diagnostic troubleshooting.\n• Do not restart machinery until hardware safety inspection is cleared by a certified engineer."
};

function getFormattedRecommendation(predictedFault: string, rawRecommendation?: string): string {
  if (rawRecommendation && rawRecommendation.includes('\n') && rawRecommendation.length > 50) {
    return rawRecommendation;
  }
  return detailedRecommendations[predictedFault] || rawRecommendation || "Perform thorough system inspection and review sensor logs.";
}

export function PredictionResult({ result, isLoading }: PredictionResultProps) {
  const [showDerived, setShowDerived] = useState(false);

  if (isLoading) {
    return (
      <Card className="w-full h-full border-border bg-card shadow-sm flex flex-col items-center justify-center min-h-[300px] animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
        <p className="text-muted-foreground font-medium">Analyzing telemetry data...</p>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="w-full h-full border-border bg-card shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center p-6">
        <Info className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <CardTitle className="text-xl mb-2 text-foreground/80">No Data Yet</CardTitle>
        <CardDescription className="text-base max-w-[250px] mx-auto">
          Enter machine parameters and run a prediction to view the health analysis here.
        </CardDescription>
      </Card>
    );
  }

  if (result.error) {
    return (
      <Card className="w-full border-destructive/50 bg-destructive/10">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <XCircle className="mr-2 h-5 w-5" />
            Prediction Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive/90">{result.error}</p>
        </CardContent>
      </Card>
    );
  }

  // Determine styling based on fault severity
  let severityColor = "text-foreground";
  let bgColor = "bg-card";
  let borderColor = "border-border";
  let Icon = Info;

  switch (result.predicted_fault) {
    case "Normal":
      severityColor = "text-emerald-500";
      bgColor = "bg-emerald-500/10";
      borderColor = "border-emerald-500/20";
      Icon = CheckCircle;
      break;
    case "Warning":
      severityColor = "text-amber-500";
      bgColor = "bg-amber-500/10";
      borderColor = "border-amber-500/20";
      Icon = AlertTriangle;
      break;
    case "Worst Condition":
      severityColor = "text-orange-600";
      bgColor = "bg-orange-600/10";
      borderColor = "border-orange-600/20";
      Icon = AlertTriangle;
      break;
    case "Critical":
      severityColor = "text-red-500";
      bgColor = "bg-red-500/10";
      borderColor = "border-red-500/20";
      Icon = XCircle;
      break;
  }

  const recommendationText = getFormattedRecommendation(result.predicted_fault, result.recommendation);
  const isSmartMode = result.mode === "smart";
  const derivedParams = result.derived_params;

  return (
    <Card className={`w-full h-full overflow-hidden transition-all duration-500 shadow-md ${borderColor}`}>
      <CardHeader className={`${bgColor} pb-8`}>
        <div className="flex justify-between items-start">
          <div>
            {/* Mode Badge */}
            <div className="mb-2">
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold px-2 py-0.5 ${
                  isSmartMode
                    ? "border-purple-500/30 bg-purple-500/10 text-purple-400"
                    : "border-blue-500/30 bg-blue-500/10 text-blue-400"
                }`}
              >
                {isSmartMode ? (
                  <><Brain className="h-3 w-3 mr-1" /> Smart Mode</>
                ) : (
                  <><Wrench className="h-3 w-3 mr-1" /> Expert Mode</>
                )}
              </Badge>
            </div>

            <CardDescription className="text-foreground/70 font-semibold mb-1 uppercase tracking-wider text-xs">
              Predicted Status
            </CardDescription>
            <CardTitle className={`text-3xl font-extrabold flex items-center ${severityColor}`}>
              <Icon className="mr-3 h-8 w-8" />
              {result.predicted_fault}
            </CardTitle>
          </div>
          {result.confidence !== null && (
            <div className="text-right">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Confidence
              </span>
              <span className="text-2xl font-bold bg-background/50 backdrop-blur-sm px-3 py-1 rounded-md border shadow-sm">
                {(result.confidence * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="space-y-5">
          {/* Recommendation */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Actionable Recommendation
            </h4>
            <div className="p-4 rounded-lg bg-secondary/50 border shadow-sm">
              <p className="text-base font-medium leading-relaxed whitespace-pre-line text-foreground/90">
                {recommendationText}
              </p>
            </div>
          </div>

          {/* Derived Parameters (Smart Mode only) */}
          {isSmartMode && derivedParams && (
            <div>
              <button
                type="button"
                onClick={() => setShowDerived(!showDerived)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors text-sm"
              >
                <span className="font-semibold text-muted-foreground flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-400" />
                  Derived Parameters
                </span>
                <span className="flex items-center gap-1 text-muted-foreground/70 text-xs">
                  {showDerived ? "Hide" : "Show"}
                  {showDerived ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </span>
              </button>

              {showDerived && (
                <div className="mt-2 p-4 rounded-lg bg-muted/20 border border-border/30 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-[11px] text-muted-foreground/60 mb-3">
                    These values were computed from your vehicle profile and fed into the ML model:
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {Object.entries(derivedParams).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-1 border-b border-border/20">
                        <span className="text-xs text-muted-foreground capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs font-mono font-semibold text-foreground/80">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Weather source indicator */}
                  {result.weather_source && (
                    <div className="mt-3 pt-2 border-t border-border/20">
                      <span className="text-[10px] text-muted-foreground/50">
                        Weather source:{" "}
                        {result.weather_source === "auto"
                          ? "🌐 Auto-detected via location"
                          : result.weather_source === "manual"
                          ? "✏️ Manually entered"
                          : "📊 System defaults"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
