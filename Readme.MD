# 🔍 FaultDetect AI

> **AI-Powered Predictive Maintenance and Real-Time Fault Detection**

FaultDetect AI is a full-stack, state-of-the-art predictive maintenance application designed to monitor industrial machinery health and detect system anomalies. By leveraging a machine learning classifier on the backend and a premium, responsive user interface on the frontend, operators can input live operational telemetry parameters and receive instant fault diagnostics and actionable maintenance recommendations.

---

## 🛠️ Tech Stack

### Backend
* **FastAPI**: Modern, high-performance web framework for building APIs with Python.
* **Scikit-Learn**: Machine learning library used to train/load the classifier model and data scaler.
* **Pandas & NumPy**: Data processing and transformation utilities.
* **Pydantic**: Data validation and settings management using python type annotations.
* **Uvicorn**: Lightning-fast ASGI server implementation.

### Frontend
* **Next.js 15 (App Router)**: React framework for production-grade web applications.
* **Tailwind CSS v4**: Ultra-fast utility-first CSS framework with dynamic design variables.
* **TypeScript**: Type safety for data interfaces and components.
* **React Hook Form & Zod**: Lightweight form management and robust runtime validation schemas.
* **Axios**: Promised-based HTTP client for browser and node.js.
* **Lucide React**: Premium icon set for consistent visual communication.

---

## 📁 Repository Structure

```
Fault_detection/
├── backend/                             # Python FastAPI Backend
│   ├── app/
│   │   ├── models/                      # ML Models & Scalers (Pickled)
│   │   │   ├── fault_predictor.pkl      # Pre-trained ML classifier
│   │   │   └── scaler.pkl               # Standard scaler for input features
│   │   ├── repo/                        # Repository layer (Database queries)
│   │   ├── routes/                      # API Endpoint definition
│   │   │   └── fault_route.py           # Prediction router
│   │   ├── schemas/                     # Pydantic schemas (Request/Response validation)
│   │   │   └── fault.py                 # Telemetry input schema
│   │   ├── services/                    # Business logic / Service layer
│   │   └── main.py                      # FastAPI App initialization & lifecycle management
│   ├── requirements.txt                 # Backend Python package list
│   └── server.py                        # Uvicorn runner script
│
├── docs/                                # Architecture & System Guides
│   ├── backend-architecture.md          # Detailed backend design document
│   └── frontend-architecture.md         # Detailed frontend design document
│
└── frontend/                            # Next.js Frontend
    ├── public/                          # Static assets
    └── src/
        ├── app/                         # App Router layout, pages, global styles
        │   ├── globals.css              # Custom Tailwind CSS v4 global theme
        │   ├── layout.tsx               # Base layout template
        │   └── page.tsx                 # Main application dashboard
        ├── components/                  # UI components
        │   ├── ui/                      # Base Shadcn UI custom elements
        │   ├── Footer.tsx               # Responsive Footer with social placeholders
        │   ├── Hero.tsx                 # Animated visual introduction section
        │   ├── Navbar.tsx               # Navigation bar with activity status
        │   ├── PredictionForm.tsx       # Live telemetry parameter input form
        │   └── PredictionResult.tsx     # Diagnostic display card
        ├── config/
        │   └── site.ts                  # Site configuration and social URLs
        └── lib/
            ├── api.ts                   # Axios service client and API interfaces
            └── utils.ts                 # Class merger helper function (cn)
```

---

## ⚡ Setup & Run Instructions

### 📥 1. Clone the Project
Ensure you are in the workspace root directory:
```bash
cd Fault_detection
```

### 🐍 2. Run the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   * **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **Windows (Command Prompt):**
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   * **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```
4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the backend server:
   ```bash
   python server.py
   ```
   *The FastAPI server will boot up and listen on [http://127.0.0.1:8000](http://127.0.0.1:8000).*

### 💻 3. Run the Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
   *The Next.js application will start and run on [http://localhost:3000](http://localhost:3000).*

---

## 🔌 API Interface

### **Fault Diagnosis Prediction**
Predicts machine status based on live parameters.

* **Endpoint**: `/api/fault/predict`
* **Method**: `POST`
* **Content-Type**: `application/json`

#### **Request Body Schema**
Defined in Pydantic schema [fault.py](file:///c:/Users/User/Documents/Projects/Fault_detection/backend/app/schemas/fault.py):
```json
{
  "voltage": 220.5,
  "temperature": 75.2,
  "motor_speed": 1500.0,
  "current": 12.8,
  "vibration": 1.45,
  "ambient_temperature": 25.0,
  "humidity": 65.0
}
```

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `voltage` | `float` | Operating voltage in Volts (V) |
| `temperature` | `float` | Core machine temperature in Celsius (°C) |
| `motor_speed` | `float` | Motor rotation speed in RPM |
| `current` | `float` | Operating current consumption in Amperes (A) |
| `vibration` | `float` | Mechanical vibration level in G-force (g) |
| `ambient_temperature` | `float` | Surrounding ambient temperature in Celsius (°C) |
| `humidity` | `float` | Surrounding relative humidity percentage (%) |

#### **Response Body Schema**
Returned by endpoint router [fault_route.py](file:///c:/Users/User/Documents/Projects/Fault_detection/backend/app/routes/fault_route.py):
```json
{
  "predicted_fault": "Normal",
  "recommendation": "Continue monitoring",
  "confidence": 0.942
}
```

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `predicted_fault` | `string` | Diagnostic category: `Normal`, `Warning`, `Worst Condition`, or `Critical` |
| `recommendation` | `string` | Human-readable maintenance advice matching the severity level |
| `confidence` | `float` | Probability score representing model prediction certainty (range: `0.0` to `1.0`) |

---

## 📐 Architecture Detail

For full detailed design specifications and component mappings, please refer to the documents in the `docs` folder:
* **Backend Architecture**: Detailed view of model loading, API routing, and validation. [docs/backend-architecture.md](file:///c:/Users/User/Documents/Projects/Fault_detection/docs/backend-architecture.md)
* **Frontend Architecture**: Breakdown of the Next.js components, form validation, and responsive design systems. [docs/frontend-architecture.md](file:///c:/Users/User/Documents/Projects/Fault_detection/docs/frontend-architecture.md)
