"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Battery,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Zap,
  Leaf,
  Gauge,
  LocateFixed,
  Thermometer,
  Droplets,
  RotateCcw,
  Loader2,
  CheckCircle,
  Bike,
  Search,
  PlugZap,
} from "lucide-react";
import { api, Vehicle, SmartPredictionRequest } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type DrivingMode = "eco" | "normal" | "sport";

interface SmartFormData {
  vehicle_id: string;
  battery_soc: number;
  driving_mode: DrivingMode;
  odometer_km: number;
  is_charging: boolean;
  latitude: number | null;
  longitude: number | null;
  ambient_temperature: number | null;
  humidity: number | null;
  location_status: "idle" | "loading" | "success" | "error";
  location_label: string;
}

interface SmartPredictionFormProps {
  onSubmit: (data: SmartPredictionRequest) => void;
  isLoading: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Vehicle", icon: Car },
  { id: 2, label: "Status", icon: Battery },
  { id: 3, label: "Location", icon: MapPin },
  { id: 4, label: "Predict", icon: Zap },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  car: <Car className="h-4 w-4" />,
  scooter: <Bike className="h-4 w-4" />,
  bike: <Bike className="h-4 w-4" />,
};

const DRIVING_MODES: { id: DrivingMode; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
  { id: "eco", label: "Eco", icon: <Leaf className="h-5 w-5" />, desc: "Energy saving mode", color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
  { id: "normal", label: "Normal", icon: <Gauge className="h-5 w-5" />, desc: "Balanced performance", color: "text-blue-400 border-blue-500/40 bg-blue-500/10" },
  { id: "sport", label: "Sport", icon: <Zap className="h-5 w-5" />, desc: "Maximum performance", color: "text-orange-400 border-orange-500/40 bg-orange-500/10" },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function SmartPredictionForm({ onSubmit, isLoading }: SmartPredictionFormProps) {
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [formData, setFormData] = useState<SmartFormData>({
    vehicle_id: "",
    battery_soc: 75,
    driving_mode: "normal",
    odometer_km: 10000,
    is_charging: false,
    latitude: null,
    longitude: null,
    ambient_temperature: null,
    humidity: null,
    location_status: "idle",
    location_label: "",
  });

  // ── FETCH VEHICLES ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchVehicles = async () => {
      setVehiclesLoading(true);
      const data = await api.getVehicles();
      setVehicles(data);
      setVehiclesLoading(false);
    };
    fetchVehicles();
  }, []);

  // ── HELPERS ─────────────────────────────────────────────────────────────
  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicle_id);

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = v.display_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(vehicles.map((v) => v.category)))];

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 1: return formData.vehicle_id !== "";
      case 2: return formData.battery_soc >= 0 && formData.battery_soc <= 100;
      case 3: return true; // Location is optional (defaults will be used)
      case 4: return true;
      default: return false;
    }
  }, [step, formData.vehicle_id, formData.battery_soc]);

  const handleAutoLocation = async () => {
    setFormData((prev) => ({ ...prev, location_status: "loading" }));

    if (!navigator.geolocation) {
      setFormData((prev) => ({
        ...prev,
        location_status: "error",
        location_label: "Geolocation not supported by your browser",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          location_status: "success",
          location_label: `📍 ${position.coords.latitude.toFixed(4)}°N, ${position.coords.longitude.toFixed(4)}°E`,
        }));
      },
      (error) => {
        setFormData((prev) => ({
          ...prev,
          location_status: "error",
          location_label: `Location access denied: ${error.message}`,
        }));
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const handleSubmit = () => {
    const req: SmartPredictionRequest = {
      vehicle_id: formData.vehicle_id,
      battery_soc: formData.battery_soc,
      driving_mode: formData.driving_mode,
      odometer_km: formData.odometer_km,
      is_charging: formData.is_charging,
      latitude: formData.latitude,
      longitude: formData.longitude,
      ambient_temperature: formData.ambient_temperature,
      humidity: formData.humidity,
    };
    onSubmit(req);
  };

  // ── STEP PROGRESS BAR ──────────────────────────────────────────────────
  const renderStepProgress = () => (
    <div className="flex items-center justify-between mb-8 px-2">
      {STEPS.map((s, index) => {
        const StepIcon = s.icon;
        const isActive = step === s.id;
        const isCompleted = step > s.id;
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => {
                if (isCompleted) setStep(s.id);
              }}
              className={`flex flex-col items-center transition-all duration-300 ${
                isCompleted ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive
                    ? "border-primary bg-primary/20 text-primary scale-110 shadow-lg shadow-primary/20"
                    : isCompleted
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : "border-muted-foreground/30 bg-muted/20 text-muted-foreground/50"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium transition-colors ${
                  isActive ? "text-primary" : isCompleted ? "text-emerald-400" : "text-muted-foreground/50"
                }`}
              >
                {s.label}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <div className="flex-1 mx-3 mt-[-16px]">
                <div
                  className={`h-0.5 rounded-full transition-all duration-500 ${
                    step > s.id ? "bg-emerald-500" : "bg-muted-foreground/15"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ── STEP 1: VEHICLE PICKER ─────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-1">Select Your EV</h3>
        <p className="text-sm text-muted-foreground">Choose your vehicle model from our supported list</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input
          placeholder="Search vehicles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background/50"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              categoryFilter === cat
                ? "border-primary bg-primary/15 text-primary"
                : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {cat !== "all" && CATEGORY_ICONS[cat]}
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1) + "s"}
            </span>
          </button>
        ))}
      </div>

      {/* Vehicle Grid */}
      {vehiclesLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading vehicles...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredVehicles.map((vehicle) => (
            <button
              key={vehicle.id}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, vehicle_id: vehicle.id }))}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                formData.vehicle_id === vehicle.id
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                  : "border-border/50 bg-card/50 hover:border-primary/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <span className="text-2xl mr-2">{vehicle.image_emoji}</span>
                  <span className="font-semibold text-sm text-foreground">{vehicle.display_name}</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {vehicle.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{vehicle.max_power_kw} kW</span>
                  </div>
                </div>
                {formData.vehicle_id === vehicle.id && (
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
          {filteredVehicles.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-2 text-center py-8">
              No vehicles found matching &quot;{searchQuery}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );

  // ── STEP 2: BATTERY & DRIVING MODE ─────────────────────────────────────
  const renderStep2 = () => (
    <div className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-1">Vehicle Status</h3>
        <p className="text-sm text-muted-foreground">Tell us about your current driving conditions</p>
      </div>

      {/* Battery SOC Slider */}
      <div className="space-y-3">
        <Label className="flex items-center text-foreground/80 font-medium">
          <Battery className="mr-2 h-4 w-4 text-green-400" />
          Battery Level
        </Label>
        <div className="relative pt-2">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={formData.battery_soc}
            onChange={(e) => setFormData((prev) => ({ ...prev, battery_soc: Number(e.target.value) }))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-muted"
            style={{
              background: `linear-gradient(to right, 
                ${formData.battery_soc < 20 ? '#ef4444' : formData.battery_soc < 50 ? '#f59e0b' : '#22c55e'} 0%, 
                ${formData.battery_soc < 20 ? '#ef4444' : formData.battery_soc < 50 ? '#f59e0b' : '#22c55e'} ${formData.battery_soc}%, 
                hsl(var(--muted)) ${formData.battery_soc}%, 
                hsl(var(--muted)) 100%)`,
            }}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">0%</span>
            <span
              className={`text-2xl font-bold ${
                formData.battery_soc < 20
                  ? "text-red-400"
                  : formData.battery_soc < 50
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {formData.battery_soc}%
            </span>
            <span className="text-xs text-muted-foreground">100%</span>
          </div>
        </div>
      </div>

      {/* Driving Mode */}
      <div className="space-y-3">
        <Label className="flex items-center text-foreground/80 font-medium">
          <Gauge className="mr-2 h-4 w-4 text-blue-400" />
          Driving Mode
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {DRIVING_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, driving_mode: mode.id }))}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                formData.driving_mode === mode.id
                  ? `${mode.color} border-current shadow-md`
                  : "border-border/50 text-muted-foreground hover:border-muted-foreground/40"
              }`}
            >
              <div className="flex flex-col items-center gap-1.5">
                {mode.icon}
                <span className="font-semibold text-sm">{mode.label}</span>
                <span className="text-[10px] opacity-70">{mode.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Odometer */}
      <div className="space-y-2">
        <Label className="flex items-center text-foreground/80 font-medium">
          <RotateCcw className="mr-2 h-4 w-4 text-purple-400" />
          Odometer Reading (km)
        </Label>
        <Input
          type="number"
          step="500"
          min="0"
          placeholder="e.g. 15000"
          value={formData.odometer_km}
          onChange={(e) => setFormData((prev) => ({ ...prev, odometer_km: Number(e.target.value) || 0 }))}
          className="bg-background/50"
        />
        <p className="text-[11px] text-muted-foreground/70">
          Approximate total km driven — used to estimate component wear
        </p>
      </div>

      {/* Charging State */}
      <div className="space-y-2">
        <Label className="flex items-center text-foreground/80 font-medium">
          <PlugZap className="mr-2 h-4 w-4 text-yellow-400" />
          Charging Status
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {[false, true].map((charging) => (
            <button
              key={String(charging)}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, is_charging: charging }))}
              className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                formData.is_charging === charging
                  ? charging
                    ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                    : "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/50 text-muted-foreground hover:border-muted-foreground/40"
              }`}
            >
              <span className="font-semibold text-sm">
                {charging ? "⚡ Charging" : "🚗 Not Charging"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── STEP 3: LOCATION & WEATHER ──────────────────────────────────────────
  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-1">Location & Environment</h3>
        <p className="text-sm text-muted-foreground">
          We&apos;ll auto-fetch weather data to determine ambient conditions
        </p>
      </div>

      {/* Auto-detect Location */}
      <div className="p-5 rounded-xl border border-border/50 bg-card/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <LocateFixed className="h-4 w-4 text-blue-400" />
              Auto-Detect Location
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Uses your browser&apos;s geolocation to fetch local weather
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoLocation}
            disabled={formData.location_status === "loading"}
            className="shrink-0"
          >
            {formData.location_status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : formData.location_status === "success" ? (
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            ) : (
              <LocateFixed className="h-4 w-4" />
            )}
            <span className="ml-1.5">
              {formData.location_status === "loading"
                ? "Detecting..."
                : formData.location_status === "success"
                ? "Detected"
                : "Detect"}
            </span>
          </Button>
        </div>

        {formData.location_label && (
          <div
            className={`text-sm px-3 py-2 rounded-lg ${
              formData.location_status === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {formData.location_label}
          </div>
        )}
      </div>

      {/* Manual Override */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border/50" />
          <span className="text-xs text-muted-foreground font-medium px-2">OR ENTER MANUALLY</span>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="flex items-center text-foreground/70 text-xs">
              <Thermometer className="mr-1.5 h-3.5 w-3.5 text-red-400" />
              Temperature (°C)
            </Label>
            <Input
              type="number"
              step="0.5"
              placeholder="e.g. 30"
              value={formData.ambient_temperature ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  ambient_temperature: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className="bg-background/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center text-foreground/70 text-xs">
              <Droplets className="mr-1.5 h-3.5 w-3.5 text-teal-400" />
              Humidity (%)
            </Label>
            <Input
              type="number"
              step="1"
              placeholder="e.g. 65"
              value={formData.humidity ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  humidity: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className="bg-background/50"
            />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground/60">
          If skipped, sensible defaults will be used (30°C, 65% humidity)
        </p>
      </div>
    </div>
  );

  // ── STEP 4: REVIEW & PREDICT ─────────────────────────────────────────────
  const renderStep4 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-1">Review & Analyze</h3>
        <p className="text-sm text-muted-foreground">Confirm your inputs before running the health analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Vehicle */}
        <div className="p-4 rounded-xl border border-border/50 bg-card/30 space-y-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Vehicle</span>
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedVehicle?.image_emoji}</span>
            <span className="font-semibold text-sm">{selectedVehicle?.display_name || "Not selected"}</span>
          </div>
        </div>

        {/* Battery */}
        <div className="p-4 rounded-xl border border-border/50 bg-card/30 space-y-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Battery</span>
          <p className={`text-xl font-bold ${formData.battery_soc < 20 ? "text-red-400" : formData.battery_soc < 50 ? "text-amber-400" : "text-emerald-400"}`}>
            {formData.battery_soc}%
          </p>
        </div>

        {/* Driving Mode */}
        <div className="p-4 rounded-xl border border-border/50 bg-card/30 space-y-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Mode</span>
          <p className="font-semibold text-sm capitalize flex items-center gap-1.5">
            {DRIVING_MODES.find((m) => m.id === formData.driving_mode)?.icon}
            {formData.driving_mode}
            {formData.is_charging && <Badge variant="outline" className="ml-1 text-[10px]">Charging</Badge>}
          </p>
        </div>

        {/* Location */}
        <div className="p-4 rounded-xl border border-border/50 bg-card/30 space-y-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Environment</span>
          <p className="font-semibold text-sm">
            {formData.location_status === "success"
              ? formData.location_label
              : formData.ambient_temperature !== null
              ? `🌡️ ${formData.ambient_temperature}°C, 💧 ${formData.humidity ?? "auto"}%`
              : "📍 Auto-defaults"}
          </p>
        </div>
      </div>

      {/* Info Badge */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/15 text-sm text-primary/80">
        <p className="flex items-start gap-2">
          <Zap className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Our engine will derive <strong>7 telemetry parameters</strong> from your inputs
            and run them through our ML fault detection model. You&apos;ll see the derived values
            alongside the prediction.
          </span>
        </p>
      </div>
    </div>
  );

  // ── MAIN RENDER ────────────────────────────────────────────────────────
  return (
    <Card className="w-full shadow-lg border-border/60">
      <CardHeader className="bg-secondary/20 border-b pb-6">
        <CardTitle className="text-2xl font-bold flex items-center">
          <Zap className="mr-2 h-6 w-6 text-primary" />
          Smart Diagnosis
        </CardTitle>
        <CardDescription className="text-base">
          Just tell us about your vehicle — we&apos;ll handle the technical parameters.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {renderStepProgress()}

        {/* Step Content */}
        <div className="min-h-[360px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border/30">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {step < 4 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              disabled={!canProceed()}
              className="gap-1 px-6"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !selectedVehicle}
              className="gap-2 px-8 py-6 text-lg rounded-xl shadow-md transition-all hover:shadow-primary/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Analyze Health
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
