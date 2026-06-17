# ⚙️ Backend Architecture Guide

This document provides a comprehensive technical overview of the backend service powering the **FaultDetect AI** platform.

---

## 🏛️ System Overview & Design Patterns

The backend is constructed as a lightweight microservice using **FastAPI**. It functions as an inference engine that loads a serialized Machine Learning (ML) model and standard feature scaler, exposes validation contracts, performs real-time feature alignment, and serves classification results.

### Core Architectural Patterns:
1. **Layered Structure (Router-Schema-Service)**: Separates routing, serialization, data validation, and business logic into isolated concerns.
2. **State Management via lifespan lifecycle**: Pre-loads models and scalers into the FastAPI application state during boot, eliminating runtime disk I/O overhead.
3. **Pydantic Validation**: Guarantees type and range validation of inbound HTTP payloads before passing them to the prediction pipeline.

---

## 🌐 Complete Request & Processing Flow

The diagram below details the sequence of events from receiving a payload to returning a fault prediction:

```mermaid
sequenceDiagram
    participant FE as Frontend Client
    participant Main as app/main.py (FastAPI)
    participant Route as app/routes/fault_route.py
    participant Model as app.state (In-Memory Classifier)
    
    FE->>Main: POST /api/fault/predict {telemetry}
    Main->>Main: Pydantic Validation (schemas/fault.py)
    alt Payload Invalid
        Main-->>FE: 422 Unprocessable Entity
    else Payload Valid
        Main->>Route: Route Handler (predict)
        Route->>Route: Convert payload to Pandas DataFrame
        alt Scaler exists
            Route->>Route: Transform data using scaler.pkl
        end
        Route->>Model: predict(input_features)
        Model-->>Route: class_id (0, 1, 2, or 3)
        Route->>Model: predict_proba(input_features)
        Model-->>Route: probability array
        Route->>Route: Map class_id to label & recommendation
        Route->>Route: Extract confidence score
        Route-->>FE: 200 OK {predicted_fault, recommendation, confidence}
    end
end
```

---

## 📂 Core Component Details

### 1. Application Lifespan & Startup Handler
* **File**: [main.py](file:///c:/Users/User/Documents/Projects/Fault_detection/backend/app/main.py)
* **Responsibilities**:
  * Initializes the `FastAPI` instance.
  * Registers CORS middleware (`allow_origins=["*"]`) to permit frontend request dispatching.
  * Employs an `asynccontextmanager` context lifespan function to find and read ML binaries:
    * `models/fault_predictor.pkl`: The serialized classifier model.
    * `models/scaler.pkl`: The serialization of the dataset's fitted `StandardScaler`.
  * Binds the instantiated classifier and scaler onto `app.state.model` and `app.state.scaler` for global, shared access across requests.

### 2. Serialization and Validation Layer
* **File**: [fault.py](file:///c:/Users/User/Documents/Projects/Fault_detection/backend/app/schemas/fault.py)
* **Responsibilities**:
  * Implements `PredictionRequest` inheriting from Pydantic's `BaseModel`.
  * Enforces static typing constraints on the 7 input features:
    * `voltage`: `float`
    * `temperature`: `float`
    * `motor_speed`: `float`
    * `current`: `float`
    * `vibration`: `float`
    * `ambient_temperature`: `float`
    * `humidity`: `float`

### 3. Route Handler & Inference Pipeline
* **File**: [fault_route.py](file:///c:/Users/User/Documents/Projects/Fault_detection/backend/app/routes/fault_route.py)
* **Responsibilities**:
  * Declares the endpoint prefix `/api/fault` and registers the `/predict` route handler.
  * Extracts the model and scaler dynamically from the runtime application state (`http_request.app.state`).
  * Converts the Pydantic telemetry schema into a Pandas `DataFrame` using the exact column feature names used during model training:
    * `voltage_v`, `current_a`, `motor_speed_rpm`, `temperature_c`, `vibration_g`, `ambient_temp_c`, `humidity`.
  * Checks for the scaler: if present, scales features using `scaler.transform(input_df)`. If not present, falls back to raw values.
  * Resolves classification via `model.predict()` and extracts confidence level using `model.predict_proba()` (takes the maximum class probability).
  * Performs categorical mapping:
    * `0` ➔ `Normal`
    * `1` ➔ `Warning`
    * `2` ➔ `Worst Condition`
    * `3` ➔ `Critical`
  * Correlates warning level to advice recommendations:
    * `Normal` ➔ *Continue monitoring*
    * `Warning` ➔ *Schedule maintenance soon*
    * `Worst Condition` ➔ *Immediate attention required*
    * `Critical` ➔ *Emergency shutdown required*

### 4. Extensions and Scalability Layers
* **Directories**:
  * [services/](file:///c:/Users/User/Documents/Projects/Fault_detection/backend/app/services/): Hosts [fault_service.py](file:///c:/Users/User/Documents/Projects/Fault_detection/backend/app/services/fault_service.py). This is a placeholder layer set aside for future business logic expansions, such as integrating notifications, emails, or complex alerts.
  * [repo/](file:///c:/Users/User/Documents/Projects/Fault_detection/backend/app/repo/): Reserved repository layer for future database interactions, such as logging telemetry history, tracking previous prediction records, and analyzing health trends over time.

---

## 🔒 Security & CORS Decisions
The backend configures CORS rules in [main.py](file:///c:/Users/User/Documents/Projects/Fault_detection/backend/app/main.py#L60-L66) to allow any external host (`"*"`) to interact with the prediction endpoint. 
> [!WARNING]
> While allowing `"*"` origins simplifies development and internal testing, it should be restricted to verified subdomains and specific origins before deploying to production environments.
