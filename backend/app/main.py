# backend/app/main.py
from app.routers import admin_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import predict
from app.services.classifier import get_classifier
import os

# --- CẬP NHẬT: IMPORT DATABASE & MODELS MỚI ---
from app.database import engine
from app import db_models # Sử dụng tên db_models để tránh lỗi trùng tên với folder models

app = FastAPI(
    title="Vietnamese Text Classifier API",
    description="Phan loai van ban tieng Viet su dung PhoBERT",
    version="1.0.0"
)

# --- CẬP NHẬT: TỰ ĐỘNG TẠO BẢNG TRONG POSTGRES ---
# Khi Duy bật server, lệnh này sẽ quét db_models và tạo bảng users, history nếu chưa có
db_models.Base.metadata.create_all(bind=engine)

# 1. Cấu hình CORS: Đảm bảo đóng ngoặc chuẩn xác
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Đăng ký các Router: Phải nằm ngoài middleware
# Chức năng Admin mới của Duy
app.include_router(admin_router.router)
# Chức năng Dự đoán (Predict) cũ giữ nguyên
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