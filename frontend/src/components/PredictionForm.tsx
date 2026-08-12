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
  voltage: z
    .union([z.string(), z.number()])
    .transform((val) => (val === "" ? NaN : Number(val)))
    .refine((val) => !isNaN(val), { message: "Please enter a valid Voltage reading" })
    .refine((val) => val >= 180 && val <= 260, { message: "Voltage must be in valid range (180 - 260 V)" }),
  current: z
    .union([z.string(), z.number()])
    .transform((val) => (val === "" ? NaN : Number(val)))
    .refine((val) => !isNaN(val), { message: "Please enter a valid Current reading" })
    .refine((val) => val >= 0 && val <= 30, { message: "Current must be in valid range (0 - 30 A)" }),
  motor_speed: z
    .union([z.string(), z.number()])
    .transform((val) => (val === "" ? NaN : Number(val)))
    .refine((val) => !isNaN(val), { message: "Please enter a valid Motor Speed reading" })
    .refine((val) => val >= 0 && val <= 3000, { message: "Motor Speed must be in valid range (0 - 3000 RPM)" }),
  temperature: z
    .union([z.string(), z.number()])
    .transform((val) => (val === "" ? NaN : Number(val)))
    .refine((val) => !isNaN(val), { message: "Please enter a valid Temperature reading" })
    .refine((val) => val >= 0 && val <= 120, { message: "Motor Temperature must be in valid range (0 - 120 °C)" }),
  ambient_temperature: z
    .union([z.string(), z.number()])
    .transform((val) => (val === "" ? NaN : Number(val)))
    .refine((val) => !isNaN(val), { message: "Please enter a valid Ambient Temperature reading" })
    .refine((val) => val >= -10 && val <= 60, { message: "Ambient Temperature must be in valid range (-10 - 60 °C)" }),
  vibration: z
    .union([z.string(), z.number()])
    .transform((val) => (val === "" ? NaN : Number(val)))
    .refine((val) => !isNaN(val), { message: "Please enter a valid Vibration reading" })
    .refine((val) => val >= 0 && val <= 5, { message: "Vibration must be in valid range (0 - 5 g)" }),
  humidity: z
    .union([z.string(), z.number()])
    .transform((val) => (val === "" ? NaN : Number(val)))
    .refine((val) => !isNaN(val), { message: "Please enter a valid Humidity reading" })
    .refine((val) => val >= 0 && val <= 100, { message: "Humidity must be in valid range (0 - 100 %)" }),
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
      voltage: "" as unknown as number,
      current: "" as unknown as number,
      motor_speed: "" as unknown as number,
      temperature: "" as unknown as number,
      ambient_temperature: "" as unknown as number,
      vibration: "" as unknown as number,
      humidity: "" as unknown as number,
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
                    <p className="text-[11px] text-muted-foreground/80">Range: 180 to 260 V</p>
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
                    <p className="text-[11px] text-muted-foreground/80">Range: 0 to 30 A</p>
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
                    <p className="text-[11px] text-muted-foreground/80">Range: 0 to 3000 RPM</p>
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
                    <p className="text-[11px] text-muted-foreground/80">Range: 0 to 5 g</p>
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
                    <p className="text-[11px] text-muted-foreground/80">Range: 0 to 120 °C</p>
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
                    <p className="text-[11px] text-muted-foreground/80">Range: -10 to 60 °C</p>
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
                    <p className="text-[11px] text-muted-foreground/80">Range: 0 to 100 %</p>
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
