from contextlib import asynccontextmanager
import os
import pickle
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.fault_route import router as fault_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Determine directory of this file
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "models", "fault_predictor.pkl")
    scaler_path = os.path.join(base_dir, "models", "scaler.pkl")

    model = None
    scaler = None

    if os.path.exists(model_path):
        try:
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            print("Model loaded successfully!")
        except Exception as e:
            print(f"Error loading model: {e}")
    else:
        print(f"Warning: Model file not found at {model_path}!")

    if os.path.exists(scaler_path):
        try:
            with open(scaler_path, 'rb') as f:
                scaler = pickle.load(f)
            print("Scaler loaded successfully!")
        except Exception as e:
            print(f"Error loading scaler: {e}")
    else:
        print(f"Warning: Scaler file not found at {scaler_path}!")

    # Set references in app state
    app.state.model = model
    app.state.scaler = scaler

    yield

    print("Shutting down")


app = FastAPI(lifespan=lifespan)

# Register routes
app.include_router(fault_router)

@app.get("/")
async def root():
    return {"message": "Welcome to my app!!!"}

@app.get("/health")
async def health():
    return {"status": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)