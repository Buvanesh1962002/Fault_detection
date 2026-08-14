"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-lg border border-border/60 bg-card/50 flex items-center justify-center transition-all duration-300 hover:bg-accent hover:border-primary/30 hover:shadow-md hover:shadow-primary/10"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <Sun
        className={`h-[1.1rem] w-[1.1rem] text-amber-500 transition-all duration-300 absolute ${
          theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        }`}
      />
      <Moon
        className={`h-[1.1rem] w-[1.1rem] text-blue-400 transition-all duration-300 absolute ${
          theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
        }`}
      />
    </button>
  );
}
