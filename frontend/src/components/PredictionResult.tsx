import { PredictionResponse } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface PredictionResultProps {
  result: PredictionResponse | null;
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

  return (
    <Card className={`w-full h-full overflow-hidden transition-all duration-500 shadow-md ${borderColor}`}>
      <CardHeader className={`${bgColor} pb-8`}>
        <div className="flex justify-between items-start">
          <div>
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
        <div className="space-y-4">
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
        </div>
      </CardContent>
    </Card>
  );
}
