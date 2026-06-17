import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle } from "lucide-react";

export function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 bg-background">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10 text-center">
        <div className="flex flex-col items-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              AI-Powered <br className="hidden sm:block" /> Predictive Maintenance
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-medium">
              Detect faults before they cause downtime. Enter your machine&apos;s telemetry data to get instant, AI-driven health predictions and recommendations.
            </p>
          </div>
          <div className="w-full max-w-sm space-y-2">
            <Link href="#predict" passHref>
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                Start Prediction
                <ArrowDownCircle className="ml-2 h-5 w-5 animate-bounce" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
