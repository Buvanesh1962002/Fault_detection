import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Wrench,
  Zap,
  ShieldCheck,
  Cpu,
  CloudSun,
  ArrowRight,
  Sparkles,
  Gauge,
  CheckCircle2,
} from "lucide-react";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── HERO SECTION ──────────────────────────────────────────── */}
      <section className="relative w-full py-16 md:py-28 lg:py-36 overflow-hidden border-b border-border/40 bg-gradient-to-b from-background via-background/95 to-muted/20">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          <div className="flex flex-col items-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">
                Engineered by {siteConfig.developer.name} ({siteConfig.developer.degree})
              </span>
            </div>

            <div className="space-y-4 max-w-4xl">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70">
                AI-Powered <br className="hidden sm:inline" />
                Predictive EV Maintenance
              </h1>
              <p className="mx-auto max-w-[750px] text-muted-foreground text-base sm:text-lg md:text-xl font-medium leading-relaxed">
                Detect electric vehicle component faults before failure occurs. Powered by machine learning classifiers, physics-based parameter derivation, and live telemetry.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
              <Link href="/smart" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 gap-2">
                  <Brain className="h-5 w-5" />
                  Launch Smart Mode
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/expert" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full text-base px-8 py-6 rounded-xl border-border/80 hover:bg-card transition-all duration-300 gap-2">
                  <Wrench className="h-5 w-5 text-blue-400" />
                  Expert Mode
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-3xl w-full">
              {[
                { label: "Supported EVs", val: "20+ Models" },
                { label: "Derivation Parameters", val: "7 Telemetry Inputs" },
                { label: "ML Classification", val: "Random Forest" },
                { label: "Weather API", val: "Open-Meteo" },
              ].map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-card/40 border border-border/40 backdrop-blur-sm">
                  <p className="text-xs text-muted-foreground font-medium">{m.label}</p>
                  <p className="text-sm sm:text-base font-bold text-foreground mt-0.5">{m.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MODE LAUNCHER CARDS ──────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Choose Diagnosis Mode</h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Select the mode that fits your data availability — zero technical knowledge needed for Smart Mode.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Smart Mode Card */}
            <Card className="relative overflow-hidden border-2 border-purple-500/30 bg-card/60 hover:border-purple-500/60 transition-all duration-300 shadow-md hover:shadow-purple-500/10 flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4">
                <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-400 font-semibold text-xs">
                  Recommended for Users
                </Badge>
              </div>
              <CardHeader className="pt-8 pb-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                  <Brain className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold">🧠 Smart Mode</CardTitle>
                <CardDescription className="text-base pt-1">
                  Input vehicle model, battery level &amp; driving mode. Our engine computes the 7 ML features automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /><span>20+ EV spec sheet database (Tata, MG, Ather, Ola, Tesla)</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /><span>Auto-fetches weather data via Geolocation</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /><span>Derives voltage, current, RPM, motor temp &amp; vibration</span></li>
                </ul>
                <div className="pt-4">
                  <Link href="/smart" className="w-full">
                    <Button className="w-full py-5 rounded-xl text-base bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-md">
                      Start Smart Diagnosis <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Expert Mode Card */}
            <Card className="relative overflow-hidden border-2 border-blue-500/30 bg-card/60 hover:border-blue-500/60 transition-all duration-300 shadow-md hover:shadow-blue-500/10 flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4">
                <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400 font-semibold text-xs">
                  For Engineers &amp; OBD-II
                </Badge>
              </div>
              <CardHeader className="pt-8 pb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
                  <Wrench className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold">🔧 Expert Mode</CardTitle>
                <CardDescription className="text-base pt-1">
                  Direct telemetry input for engineers who have exact sensor readings from OBD-II or BMS logs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /><span>Direct input for Voltage, Current, RPM &amp; Temperature</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /><span>Vibration level input in G-force (g)</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /><span>Supports pre-scaled operational inputs [0.0 - 1.0]</span></li>
                </ul>
                <div className="pt-4">
                  <Link href="/expert" className="w-full">
                    <Button variant="outline" className="w-full py-5 rounded-xl text-base border-blue-500/40 text-blue-400 hover:bg-blue-500/10 gap-2 shadow-md">
                      Open Expert Mode <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── ARCHITECTURE FEATURES ─────────────────────────────────── */}
      <section className="py-16 border-t border-border/40 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">System Architecture Highlights</h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              How Scrutor transforms high-level user input into real-time machine learning inference.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Cpu, title: "ML Inference Engine", desc: "Pre-trained Random Forest classifier evaluating normalized feature vectors with confidence probability scoring.", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
              { icon: Gauge, title: "Physics Parameter Engine", desc: "Translates battery SOC, driving mode profiles, and odometer wear into 7 calibrated electrical/mechanical features.", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
              { icon: CloudSun, title: "Weather Service", desc: "Integrates Open-Meteo API to fetch ambient temperature and humidity via browser geolocation.", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
              { icon: ShieldCheck, title: "Operational Bounds", desc: "Validates sensor parameters against physical safety ranges before standard scaling and classification.", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
            ].map((f, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-border/50 bg-card/40 hover:border-primary/30 transition-all duration-300 space-y-3">
                <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
