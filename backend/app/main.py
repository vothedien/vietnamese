# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import predict
from app.services.classifier import get_classifier
import os

app = FastAPI(
    title="Vietnamese Text Classifier API",
    description="Phan loai van ban tieng Viet su dung PhoBERT",
    version="1.0.0"
)

# CORS cho phep frontend goi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",   # React dev
                   "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load routes
app.include_router(predict.router)

@app.on_event("startup")
async def startup():
    """Load model khi khoi dong server"""
    print("Dang load model...")
    get_classifier()
    print("Server san sang!")

@app.get("/")
def root():
    return {"message": "Welcome to Vietnamese Text Classifier API!", 
            "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": True}