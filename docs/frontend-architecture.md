# 💻 Frontend Architecture Guide

This document outlines the frontend client application structure, user interface design decisions, state management, and component architecture for the **FaultDetect AI** dashboard.

---

## 🏛️ Architecture & Core Technologies

The client-side UI is engineered as a modern Single Page Application (SPA) utilizing:
* **Next.js 15 (App Router)**: Organized under the `src/app` directory for file-based routing and layout nesting.
* **Tailwind CSS v4**: Utility styles with modular theme configurations and dark-mode-first styling.
* **React 19**: Employs client-side hooks (`useState`, dynamic client-side compilation via `"use client"` directives) for interactive state.
* **React Hook Form & Zod**: Form management and field-level validation schemas.
* **Axios**: Promised-based API service client layer.

---

## 📊 Component Structure & Hierarchy

The entry page acts as the central orchestrator, passing telemetry states between the submission forms and prediction readouts.

```
          [ Root Layout (layout.tsx) ]
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
[ Navbar.tsx ]   [ page.tsx ]    [ Footer.tsx ]
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
[ PredictionForm.tsx ]     [ PredictionResult.tsx ]
         │                           │
         ▼                           ▼
  [ ui/form, input ]         [ ui/card, badge ]
```

---

## 📂 Core Component Details

### 1. Central Layout & Orchestrator
* **Layout**: [layout.tsx](file:///c:/Users/User/Documents/Projects/Fault_detection/frontend/src/app/layout.tsx)
  * Acts as the structural template wrapper.
  * Injects global stylesheets, registers font faces (Inter), and embeds the sticky [Navbar.tsx](file:///c:/Users/User/Documents/Projects/Fault_detection/frontend/src/components/Navbar.tsx) and responsive [Footer.tsx](file:///c:/Users/User/Documents/Projects/Fault_detection/frontend/src/components/Footer.tsx).
* **Main Dashboard**: [page.tsx](file:///c:/Users/User/Documents/Projects/Fault_detection/frontend/src/app/page.tsx)
  * Serves as the central state hub.
  * Manages `result` (`PredictionResponse | null`) and `isLoading` (`boolean`) states.
  * Declares `handlePredict` to dispatch inputs to the service client. Incorporates a 800ms artificial UX delay to allow loading animations to play out smoothly.
  * Handles mobile-device usability by auto-scrolling users to the results container upon successful classification.

### 2. Live Telemetry Submission Form
* **File**: [PredictionForm.tsx](file:///c:/Users/User/Documents/Projects/Fault_detection/frontend/src/components/PredictionForm.tsx)
* **Responsibilities**:
  * Leverages `@hookform/resolvers/zod` to bind a Zod schema to HTML input elements.
  * Enforces the following validations at the browser level:
    * All 7 telemetry inputs are marked required.
    * Values must be valid floating-point numbers.
    * Injects user-friendly error strings next to inputs if invalid types are typed.
  * Renders description tips below inputs to guide operators (e.g., standard ranges for voltage, motor speed, vibration).

### 3. Real-Time Diagnostic Result Card
* **File**: [PredictionResult.tsx](file:///c:/Users/User/Documents/Projects/Fault_detection/frontend/src/components/PredictionResult.tsx)
* **Responsibilities**:
  * Displays states based on API response: **Idle/Placeholder**, **Loading Skeleton**, **Error Card**, or **Inference Success**.
  * Dynamically computes CSS classes matching prediction severity:
    * `Normal` ➔ Emerald glow border, green badge, `Continue monitoring`.
    * `Warning` ➔ Amber glow border, amber badge, `Schedule maintenance soon`.
    * `Worst Condition` ➔ Orange glow border, orange badge, `Immediate attention required`.
    * `Critical` ➔ Red pulse border, red badge, `Emergency shutdown required`.
  * Visualizes confidence scores using a radial or linear gauge bar.

### 4. Shared Site Config & API Client
* **Config**: [site.ts](file:///c:/Users/User/Documents/Projects/Fault_detection/frontend/src/config/site.ts)
  * Central site metadata (name, description, external social links).
  * Used by [Footer.tsx](file:///c:/Users/User/Documents/Projects/Fault_detection/frontend/src/components/Footer.tsx) to resolve social media destinations dynamically.
* **API Client**: [api.ts](file:///c:/Users/User/Documents/Projects/Fault_detection/frontend/src/lib/api.ts)
  * Establishes TypeScript interfaces mapping directly to FastAPI request and response payloads.
  * Dispatches requests to `http://127.0.0.1:8000/api/fault/predict` using Axios.
  * Catch-blocks wrap server connections: if the backend is down, it returns a clean fallback payload outlining a connectivity error.

---

## 🎨 Theme & Stylings Design System

The application features a sleek dark mode design using **Tailwind CSS v4**'s custom color mapping variables:
* **Styles Entry**: [globals.css](file:///c:/Users/User/Documents/Projects/Fault_detection/frontend/src/app/globals.css)
  * Employs the `@theme` directive to declare palette overrides in HSL coordinates.
  * Utilizes background grid layouts with `bg-grid` styles.
  * Registers keyframes for complex micro-animations:
    * `pulse-glow`: Used to highlight Critical diagnostic states.
    * `fade-in-up`: Smooth entry animation for forms and landing sections.
* **Component Styling standard**:
  * All UI components are structured with [cn](file:///c:/Users/User/Documents/Projects/Fault_detection/frontend/src/lib/utils.ts) (which combines `clsx` and `tailwind-merge`) to easily override base styles with conditional classes.
