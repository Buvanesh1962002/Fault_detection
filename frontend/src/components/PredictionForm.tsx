"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivitySquare, Zap, Thermometer, Wind, Droplets, RotateCcw } from "lucide-react";

const formSchema = z.object({
  voltage: z.coerce
    .number({ required_error: "Voltage is required" })
    .min(180, "Voltage must be between 180 and 260 V")
    .max(260, "Voltage must be between 180 and 260 V"),
  current: z.coerce
    .number({ required_error: "Current is required" })
    .min(0, "Current must be between 0 and 30 A")
    .max(30, "Current must be between 0 and 30 A"),
  motor_speed: z.coerce
    .number({ required_error: "Motor Speed is required" })
    .min(0, "Motor Speed must be between 0 and 3000 RPM")
    .max(3000, "Motor Speed must be between 0 and 3000 RPM"),
  temperature: z.coerce
    .number({ required_error: "Temperature is required" })
    .min(0, "Temperature must be between 0 and 120 °C")
    .max(120, "Temperature must be between 0 and 120 °C"),
  ambient_temperature: z.coerce
    .number({ required_error: "Ambient Temp is required" })
    .min(-10, "Ambient Temp must be between -10 and 60 °C")
    .max(60, "Ambient Temp must be between -10 and 60 °C"),
  vibration: z.coerce
    .number({ required_error: "Vibration is required" })
    .min(0, "Vibration must be between 0 and 5 g")
    .max(5, "Vibration must be between 0 and 5 g"),
  humidity: z.coerce
    .number({ required_error: "Humidity is required" })
    .min(0, "Humidity must be between 0 and 100 %")
    .max(100, "Humidity must be between 0 and 100 %"),
});

type FormValues = z.infer<typeof formSchema>;

interface PredictionFormProps {
  onSubmit: (data: FormValues) => void;
  isLoading: boolean;
}

export function PredictionForm({ onSubmit, isLoading }: PredictionFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voltage: 220,
      current: 12,
      motor_speed: 1500,
      temperature: 50,
      ambient_temperature: 25,
      vibration: 0.1,
      humidity: 45,
    },
  });

  return (
    <Card className="w-full shadow-lg border-border/60">
      <CardHeader className="bg-secondary/20 border-b pb-6">
        <CardTitle className="text-2xl font-bold flex items-center">
          <ActivitySquare className="mr-2 h-6 w-6 text-primary" />
          Telemetry Data
        </CardTitle>
        <CardDescription className="text-base">
          Input the current sensor readings of your machinery for an instant health check.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormField
                control={form.control}
                name="voltage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-foreground/80">
                      <Zap className="mr-2 h-4 w-4 text-amber-500" />
                      Voltage (V)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g. 220.5" className="bg-background/50 focus-visible:ring-primary/50 transition-all" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-foreground/80">
                      <Zap className="mr-2 h-4 w-4 text-blue-500" />
                      Current (A)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g. 15.2" className="bg-background/50 focus-visible:ring-primary/50 transition-all" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motor_speed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-foreground/80">
                      <RotateCcw className="mr-2 h-4 w-4 text-green-500" />
                      Motor Speed (RPM)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g. 1450" className="bg-background/50 focus-visible:ring-primary/50 transition-all" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vibration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-foreground/80">
                      <ActivitySquare className="mr-2 h-4 w-4 text-purple-500" />
                      Vibration (g)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g. 0.05" className="bg-background/50 focus-visible:ring-primary/50 transition-all" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-foreground/80">
                      <Thermometer className="mr-2 h-4 w-4 text-red-500" />
                      Motor Temperature (°C)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g. 65.0" className="bg-background/50 focus-visible:ring-primary/50 transition-all" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ambient_temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-foreground/80">
                      <Wind className="mr-2 h-4 w-4 text-cyan-500" />
                      Ambient Temperature (°C)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g. 25.0" className="bg-background/50 focus-visible:ring-primary/50 transition-all" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="humidity"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 lg:col-span-1">
                    <FormLabel className="flex items-center text-foreground/80">
                      <Droplets className="mr-2 h-4 w-4 text-teal-500" />
                      Humidity (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="e.g. 45.5" className="bg-background/50 focus-visible:ring-primary/50 transition-all" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            <Button 
              type="submit" 
              className="w-full mt-8 py-6 text-lg rounded-xl shadow-md transition-all hover:shadow-primary/25" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  Processing Analysis...
                </>
              ) : (
                "Run Prediction"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
